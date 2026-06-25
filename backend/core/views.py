from django.db import connection, models
from django.db.models import F
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from django_filters.rest_framework import DjangoFilterBackend
from django_ratelimit.decorators import ratelimit
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import Cart, Category, Item, Neighbour, Transaction
from core.serializers import (
    BalanceAddSerializer,
    BulkEditSerializer,
    CartCreateSerializer,
    CartItemAddSerializer,
    CartItemUpdateSerializer,
    CartSerializer,
    CategorySerializer,
    ItemSerializer,
    LoginSerializer,
    NeighbourSerializer,
    OnetimeCheckoutSerializer,
    StockUpdateSerializer,
    TransactionListSerializer,
    TransactionSerializer,
)
from core.services import auth_service, checkout_service, inventory_service, neighbour_service, report_service, transaction_service
from core.services.points_service import calculate_starting_balance


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    search_fields = ["name"]
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(
            item_count=models.Count("items")
        )

    def update(self, request, *args, **kwargs):
        category = self.get_object()
        if category.name == "Extras":
            return Response(
                {"error": "The Extras category cannot be modified."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        if category.name == "Extras":
            return Response(
                {"error": "The Extras category cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.select_related("category").all()
    serializer_class = ItemSerializer
    filterset_fields = ["category"]
    search_fields = ["name"]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("low_stock") == "true":
            qs = qs.filter(stock_count__lte=F("low_stock_threshold"), track_stock=True)
        return qs

    def update(self, request, *args, **kwargs):
        item = self.get_object()
        if not item.track_stock:
            return Response(
                {"error": "The Extras item can only be configured via the extras config page."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        item = self.get_object()
        if not item.track_stock:
            return Response(
                {"error": "The Extras item cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["patch"], url_path="stock")
    def update_stock(self, request, pk=None):
        item = self.get_object()
        serializer = StockUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_item = inventory_service.update_stock(
            item,
            quantity=serializer.validated_data["quantity"],
            operation=serializer.validated_data["operation"],
        )
        return Response(ItemSerializer(updated_item).data)


class NeighbourViewSet(viewsets.ModelViewSet):
    queryset = Neighbour.objects.all()
    serializer_class = NeighbourSerializer
    search_fields = ["name", "card_id"]
    http_method_names = ["get", "post", "put", "patch", "head", "options"]
    pagination_class = None

    def get_queryset(self):
        return Neighbour.objects.filter(is_onetime=False)

    def perform_create(self, serializer):
        instance = serializer.save()
        starting_balance = calculate_starting_balance(
            instance.num_adults, instance.num_children, instance.catchment_area
        )
        instance.balance = starting_balance
        instance.save(update_fields=["balance"])

    @action(detail=False, methods=["get"], url_path="lookup")
    def lookup_by_card(self, request):
        card_id = request.query_params.get("card_id")
        if not card_id:
            return Response(
                {"error": "card_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        neighbour = neighbour_service.get_by_card_id(card_id)
        if neighbour is None:
            return Response(
                {"error": "Card not registered"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(NeighbourSerializer(neighbour).data)

    @action(detail=True, methods=["post"], url_path="balance")
    def add_balance(self, request, pk=None):
        neighbour = self.get_object()
        serializer = BalanceAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_neighbour = neighbour_service.add_balance(
            neighbour_id=neighbour.id,
            amount=serializer.validated_data["amount"],
            admin=request.user,
        )
        return Response(NeighbourSerializer(updated_neighbour).data)

    @action(detail=False, methods=["post"], url_path="reset-balances")
    def reset_balances(self, request):
        reset_count = neighbour_service.reset_all_balances(admin=request.user)
        return Response({"reset_count": reset_count})

    @action(detail=False, methods=["post"], url_path="bulk-edit")
    def bulk_edit(self, request):
        serializer = BulkEditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            count = neighbour_service.bulk_edit_neighbours(
                ids=serializer.validated_data["ids"],
                action=serializer.validated_data["action"],
                value=serializer.validated_data["value"],
                admin=request.user,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"updated_count": count})

    @action(detail=False, methods=["post"], url_path="onetime-checkout")
    def onetime_checkout(self, request):
        serializer = OnetimeCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        neighbour = checkout_service.create_onetime_neighbour(
            num_adults=serializer.validated_data["num_adults"],
            num_children=serializer.validated_data["num_children"],
            balance=serializer.validated_data["balance"],
        )
        cart = checkout_service.create_cart(neighbour_id=neighbour.id, admin=request.user)
        return Response({
            "neighbour": NeighbourSerializer(neighbour).data,
            "cart": CartSerializer(cart).data,
        }, status=status.HTTP_201_CREATED)


class CartViewSet(viewsets.GenericViewSet):
    queryset = Cart.objects.prefetch_related("items__item").all()
    serializer_class = CartSerializer

    def create(self, request):
        serializer = CartCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = checkout_service.create_cart(
            neighbour_id=serializer.validated_data["neighbour_id"],
            admin=request.user,
        )
        return Response(
            CartSerializer(cart).data, status=status.HTTP_201_CREATED
        )

    def retrieve(self, request, pk=None):
        cart = checkout_service.get_cart(pk)
        return Response(CartSerializer(cart).data)

    def destroy(self, request, pk=None):
        checkout_service.cancel_cart(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="items")
    def add_item(self, request, pk=None):
        serializer = CartItemAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        unit_cost_override = serializer.validated_data.get("unit_cost_override")
        if unit_cost_override is not None:
            item = Item.objects.get(id=serializer.validated_data["item_id"])
            if unit_cost_override > item.max_cost:
                return Response(
                    {"unit_cost_override": [f"Cost cannot exceed ${item.max_cost}."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        checkout_service.add_to_cart(
            cart_id=pk,
            item_id=serializer.validated_data["item_id"],
            quantity=serializer.validated_data["quantity"],
            unit_cost_override=unit_cost_override,
        )
        cart = checkout_service.get_cart(pk)
        return Response(CartSerializer(cart).data)

    @action(
        detail=True,
        methods=["patch", "delete"],
        url_path=r"items/(?P<cart_item_id>\d+)",
    )
    def manage_item(self, request, pk=None, cart_item_id=None):
        if request.method == "DELETE":
            checkout_service.remove_from_cart(cart_id=pk, cart_item_id=cart_item_id)
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = CartItemUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        checkout_service.update_cart_quantity(
            cart_id=pk,
            cart_item_id=cart_item_id,
            quantity=serializer.validated_data["quantity"],
        )
        cart = checkout_service.get_cart(pk)
        return Response(CartSerializer(cart).data)

    @action(detail=True, methods=["post"], url_path="checkout")
    def checkout(self, request, pk=None):
        txn = checkout_service.process_checkout(cart_id=pk)
        return Response(TransactionSerializer(txn).data)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.select_related("neighbour", "admin", "undone_by").prefetch_related(
        "items"
    )
    filterset_fields = ["neighbour"]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ["created_at", "total"]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params
        if params.get("today") == "true":
            from django.utils import timezone
            qs = qs.filter(created_at__date=timezone.localdate())
        else:
            date_from = params.get("date_from")
            date_to = params.get("date_to")
            if date_from:
                qs = qs.filter(created_at__date__gte=date_from)
            if date_to:
                qs = qs.filter(created_at__date__lte=date_to)
        if params.get("onetime") == "true":
            qs = qs.filter(neighbour__is_onetime=True)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return TransactionListSerializer
        return TransactionSerializer

    @action(detail=True, methods=["post"], url_path="undo")
    def undo(self, request, pk=None):
        txn = transaction_service.undo_transaction(
            transaction_id=pk, admin=request.user
        )
        return Response(TransactionSerializer(txn).data)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class LoginView(APIView):
    permission_classes = [AllowAny]

    @method_decorator(ratelimit(key="ip", rate="5/m", method="POST", block=True))
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = auth_service.login(
            request,
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response(
                {"error": "Invalid Credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        return Response({
            "user": {"id": user.id, "username": user.username},
        })


class LogoutView(APIView):
    def post(self, request):
        auth_service.logout(request)
        return Response({"detail": "Logged out"})


@method_decorator(ensure_csrf_cookie, name="dispatch")
class SessionView(APIView):
    def get(self, request):
        return Response({
            "user": {"id": request.user.id, "username": request.user.username},
        })


class ItemsSoldReportView(APIView):
    def get(self, request):
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if not start_date or not end_date:
            return Response(
                {"error": "start_date and end_date query parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from datetime import date as date_type

        try:
            parsed_start = date_type.fromisoformat(start_date)
            parsed_end = date_type.fromisoformat(end_date)
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        report = report_service.get_items_sold_report(parsed_start, parsed_end)
        return Response(report)


class ExtrasConfigView(APIView):
    def get(self, request):
        item = Item.objects.filter(track_stock=False).first()
        if item is None:
            return Response({"max_cost": 5})
        return Response({"max_cost": item.max_cost})

    def patch(self, request):
        max_cost = request.data.get("max_cost")
        if max_cost is None or not isinstance(max_cost, int) or max_cost < 1:
            return Response(
                {"error": "max_cost must be a positive integer."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item = Item.objects.filter(track_stock=False).first()
        if item is None:
            return Response(
                {"error": "Extras item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        item.max_cost = max_cost
        item.save(update_fields=["max_cost", "updated_at"])
        return Response({"max_cost": item.max_cost})


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return Response({"status": "healthy", "database": "ok"})
    except Exception:
        return Response(
            {"status": "unhealthy", "database": "error"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
