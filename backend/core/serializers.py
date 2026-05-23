from decimal import Decimal

from rest_framework import serializers

from core.models import (
    BalanceLog,
    Cart,
    CartItem,
    Category,
    Client,
    Item,
    Transaction,
    TransactionItem,
)


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


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


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ["id", "name", "card_id", "balance", "created_at", "updated_at"]
        read_only_fields = ["id", "balance", "created_at", "updated_at"]


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
    client_name = serializers.CharField(source="client.name", read_only=True)
    client_balance = serializers.DecimalField(
        source="client.balance", max_digits=10, decimal_places=2, read_only=True
    )
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "client",
            "client_name",
            "client_balance",
            "items",
            "total",
            "created_at",
        ]
        read_only_fields = ["id", "client_name", "client_balance", "items", "total", "created_at"]

    def get_total(self, obj):
        return sum(item.line_total for item in obj.items.all())


class CartCreateSerializer(serializers.Serializer):
    client_id = serializers.IntegerField()


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
    client_name = serializers.CharField(source="client.name", read_only=True)
    admin_username = serializers.CharField(source="admin.username", read_only=True)

    class Meta:
        model = Transaction
        fields = [
            "id",
            "client",
            "client_name",
            "admin_username",
            "total",
            "items",
            "created_at",
        ]


class TransactionListSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True)
    admin_username = serializers.CharField(source="admin.username", read_only=True)

    class Meta:
        model = Transaction
        fields = ["id", "client", "client_name", "admin_username", "total", "created_at"]


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=128)
