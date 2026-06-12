from decimal import Decimal

from rest_framework import serializers

from core.models import (
    BalanceLog,
    Cart,
    CartItem,
    Category,
    Item,
    Neighbour,
    Transaction,
    TransactionItem,
)


class CategorySerializer(serializers.ModelSerializer):
    item_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Category
        fields = ["id", "name", "item_count", "created_at"]
        read_only_fields = ["id", "created_at", "item_count"]


class ItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Item
        fields = [
            "id",
            "name",
            "category",
            "category_name",
            "cost",
            "stock_count",
            "low_stock_threshold",
            "is_low_stock",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "is_low_stock"]

    def validate_cost(self, value):
        if value <= 0:
            raise serializers.ValidationError("Cost must be greater than zero.")
        return value

    def validate_stock_count(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock count cannot be negative.")
        return value

    def validate_low_stock_threshold(self, value):
        if value < 0:
            raise serializers.ValidationError("Threshold cannot be negative.")
        return value


class StockUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField()
    operation = serializers.ChoiceField(choices=["set", "add", "subtract"])

    def validate_quantity(self, value):
        if self.initial_data.get("operation") == "set" and value < 0:
            raise serializers.ValidationError("Stock count cannot be negative.")
        if self.initial_data.get("operation") in ("add", "subtract") and value <= 0:
            raise serializers.ValidationError("Quantity must be positive.")
        return value


class NeighbourSerializer(serializers.ModelSerializer):
    class Meta:
        model = Neighbour
        fields = [
            "id", "name", "card_id", "balance",
            "num_adults", "num_children",
            "allergies", "diaper_size", "catchment_area", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "balance", "created_at", "updated_at"]

    def validate_num_adults(self, value):
        if value < 1 or value > 7:
            raise serializers.ValidationError("Number of adults must be between 1 and 7.")
        return value

    def validate_num_children(self, value):
        if value < 0 or value > 7:
            raise serializers.ValidationError("Number of children must be between 0 and 7.")
        return value

    def validate_allergies(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Allergies must be a list.")
        if not all(isinstance(item, str) for item in value):
            raise serializers.ValidationError("Each allergy must be a string.")
        return [item.strip() for item in value if item.strip()]


class BalanceAddSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive.")
        if value > Decimal("2000.00"):
            raise serializers.ValidationError("Amount cannot exceed $2000.00.")
        return value


class BalanceLogSerializer(serializers.ModelSerializer):
    admin_username = serializers.CharField(source="admin.username", read_only=True)

    class Meta:
        model = BalanceLog
        fields = [
            "id",
            "amount",
            "balance_before",
            "balance_after",
            "admin_username",
            "created_at",
        ]


class CartItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source="item.name", read_only=True)
    item_cost = serializers.DecimalField(
        source="item.cost", max_digits=8, decimal_places=2, read_only=True
    )
    line_total = serializers.DecimalField(
        max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = CartItem
        fields = ["id", "item", "item_name", "item_cost", "quantity", "line_total"]
        read_only_fields = ["id", "item_name", "item_cost", "line_total"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be positive.")
        return value


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    neighbour_name = serializers.CharField(source="neighbour.name", read_only=True)
    neighbour_balance = serializers.DecimalField(
        source="neighbour.balance", max_digits=10, decimal_places=2, read_only=True
    )
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "neighbour",
            "neighbour_name",
            "neighbour_balance",
            "items",
            "total",
            "created_at",
        ]
        read_only_fields = ["id", "neighbour_name", "neighbour_balance", "items", "total", "created_at"]

    def get_total(self, obj):
        return sum(item.line_total for item in obj.items.all())


class CartCreateSerializer(serializers.Serializer):
    neighbour_id = serializers.IntegerField()


class CartItemAddSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=0)


class TransactionItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionItem
        fields = ["id", "item_name", "unit_cost", "quantity", "line_total"]


class TransactionSerializer(serializers.ModelSerializer):
    items = TransactionItemSerializer(many=True, read_only=True)
    neighbour_name = serializers.CharField(source="neighbour.name", read_only=True)
    admin_username = serializers.CharField(source="admin.username", read_only=True)
    total_amount = serializers.DecimalField(source="total", max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "neighbour",
            "neighbour_name",
            "admin_username",
            "total_amount",
            "items",
            "created_at",
        ]


class TransactionListSerializer(serializers.ModelSerializer):
    neighbour_name = serializers.CharField(source="neighbour.name", read_only=True)
    admin_username = serializers.CharField(source="admin.username", read_only=True)
    total_amount = serializers.DecimalField(source="total", max_digits=10, decimal_places=2, read_only=True)
    item_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = Transaction
        fields = ["id", "neighbour", "neighbour_name", "admin_username", "total_amount", "item_count", "created_at"]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128)
