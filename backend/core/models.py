from django.conf import settings
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Item(models.Model):
    name = models.CharField(max_length=200)
    category = models.ForeignKey(
        Category, on_delete=models.PROTECT, related_name="items"
    )
    cost = models.DecimalField(max_digits=8, decimal_places=2)
    stock_count = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(cost__gt=0), name="item_cost_positive"
            ),
            models.CheckConstraint(
                check=models.Q(stock_count__gte=0), name="item_stock_non_negative"
            ),
            models.CheckConstraint(
                check=models.Q(low_stock_threshold__gte=0),
                name="item_threshold_non_negative",
            ),
        ]

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        return self.stock_count <= self.low_stock_threshold


class Client(models.Model):
    name = models.CharField(max_length=200)
    card_id = models.CharField(max_length=100, unique=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(balance__gte=0), name="client_balance_non_negative"
            ),
        ]

    def __str__(self):
        return self.name


class BalanceLog(models.Model):
    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name="balance_logs"
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="balance_logs"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance_before = models.DecimalField(max_digits=10, decimal_places=2)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.client.name}: +${self.amount}"


class Cart(models.Model):
    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name="carts"
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="carts"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.client.name}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    item = models.ForeignKey(Item, on_delete=models.PROTECT, related_name="cart_items")
    quantity = models.IntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "item"], name="unique_cart_item"
            ),
            models.CheckConstraint(
                check=models.Q(quantity__gt=0), name="cart_item_quantity_positive"
            ),
        ]

    def __str__(self):
        return f"{self.item.name} x{self.quantity}"

    @property
    def line_total(self):
        return self.item.cost * self.quantity


class Transaction(models.Model):
    client = models.ForeignKey(
        Client, on_delete=models.PROTECT, related_name="transactions"
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="transactions"
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Transaction #{self.id} - {self.client.name}"


class TransactionItem(models.Model):
    transaction = models.ForeignKey(
        Transaction, on_delete=models.CASCADE, related_name="items"
    )
    item = models.ForeignKey(
        Item, on_delete=models.SET_NULL, null=True, related_name="transaction_items"
    )
    item_name = models.CharField(max_length=200)
    unit_cost = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.IntegerField()
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.item_name} x{self.quantity}"


class LoginAttempt(models.Model):
    username = models.CharField(max_length=150)
    ip_address = models.GenericIPAddressField()
    attempted_at = models.DateTimeField(auto_now_add=True)
    successful = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(
                fields=["username", "attempted_at"], name="login_attempt_lookup"
            ),
        ]
