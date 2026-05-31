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

from core.models import Cart, Category, Client, Item, Transaction
from core.serializers import (
    BalanceAddSerializer,
    CartCreateSerializer,
    CartItemAddSerializer,
    CartItemUpdateSerializer,
    CartSerializer,
    CategorySerializer,
    ClientSerializer,
    ItemSerializer,
    LoginSerializer,
    StockUpdateSerializer,
    TransactionListSerializer,
    TransactionSerializer,
)
from core.services import auth_service, checkout_service, client_service, inventory_service


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    search_fields = ["name"]
    pagination_class = None

    def get_queryset(self):
        return Category.objects.annotate(
            item_count=models.Count("items")
        )


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.select_related("category").all()
    serializer_class = ItemSerializer
    filterset_fields = ["category"]
    search_fields = ["name"]
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get("low_stock") == "true":
            qs = qs.filter(stock_count__lte=F("low_stock_threshold"))
        return qs

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


class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    search_fields = ["name", "card_id"]
    http_method_names = ["get", "post", "put", "patch", "head", "options"]
    pagination_class = None

    @action(detail=False, methods=["get"], url_path="lookup")
    def lookup_by_card(self, request):
        card_id = request.query_params.get("card_id")
        if not card_id:
            return Response(
                {"error": "card_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        client = client_service.get_by_card_id(card_id)
        if client is None:
            return Response(
                {"error": "Card not registered"},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(ClientSerializer(client).data)

    @action(detail=True, methods=["post"], url_path="balance")
    def add_balance(self, request, pk=None):
        client = self.get_object()
        serializer = BalanceAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_client = client_service.add_balance(
            client_id=client.id,
            amount=serializer.validated_data["amount"],
            admin=request.user,
        )
        return Response(ClientSerializer(updated_client).data)


class CartViewSet(viewsets.GenericViewSet):
    queryset = Cart.objects.prefetch_related("items__item").all()
    serializer_class = CartSerializer

    def create(self, request):
        serializer = CartCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = checkout_service.create_cart(
            client_id=serializer.validated_data["client_id"],
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
        checkout_service.add_to_cart(
            cart_id=pk,
            item_id=serializer.validated_data["item_id"],
            quantity=serializer.validated_data["quantity"],
        )
        cart = checkout_service.get_cart(pk)
        return Response(CartSerializer(cart).data)

    @action(
        detail=True,
        methods=["patch", "delete"],
        url_path=r"items/(?P<item_id>\d+)",
    )
    def manage_item(self, request, pk=None, item_id=None):
        if request.method == "DELETE":
            checkout_service.remove_from_cart(cart_id=pk, item_id=item_id)
            return Response(status=status.HTTP_204_NO_CONTENT)

        serializer = CartItemUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        checkout_service.update_cart_quantity(
            cart_id=pk,
            item_id=item_id,
            quantity=serializer.validated_data["quantity"],
        )
        cart = checkout_service.get_cart(pk)
        return Response(CartSerializer(cart).data)

    @action(detail=True, methods=["post"], url_path="checkout")
    def checkout(self, request, pk=None):
        txn = checkout_service.process_checkout(cart_id=pk)
        return Response(TransactionSerializer(txn).data)


class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Transaction.objects.select_related("client", "admin").prefetch_related(
        "items"
    )
    filterset_fields = ["client"]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ["created_at", "total"]
    pagination_class = None

    def get_serializer_class(self):
        if self.action == "list":
            return TransactionListSerializer
        return TransactionSerializer


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
