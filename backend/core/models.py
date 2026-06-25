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
    track_stock = models.BooleanField(default=True)
    max_cost = models.PositiveIntegerField(default=5)
    limit_per_checkout = models.PositiveIntegerField(null=True, blank=True)
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
            models.CheckConstraint(
                check=models.Q(limit_per_checkout__isnull=True)
                | models.Q(limit_per_checkout__gte=1),
                name="item_limit_per_checkout_min_one",
            ),
        ]

    def __str__(self):
        return self.name

    @property
    def is_low_stock(self):
        return self.stock_count <= self.low_stock_threshold


class Neighbour(models.Model):
    name = models.CharField(max_length=200)
    card_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_onetime = models.BooleanField(default=False)
    num_adults = models.PositiveSmallIntegerField(default=1)
    num_children = models.PositiveSmallIntegerField(default=0)
    allergies = models.JSONField(default=list, blank=True)
    diaper_size = models.CharField(max_length=50, blank=True, default="")
    catchment_area = models.BooleanField(default=True)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.CheckConstraint(
                check=models.Q(balance__gte=0), name="neighbour_balance_non_negative"
            ),
            models.CheckConstraint(
                check=models.Q(num_adults__gte=1, num_adults__lte=7),
                name="neighbour_adults_range",
            ),
            models.CheckConstraint(
                check=models.Q(num_children__gte=0, num_children__lte=7),
                name="neighbour_children_range",
            ),
        ]

    def __str__(self):
        return self.name


class BalanceLog(models.Model):
    REASON_TOPUP = "topup"
    REASON_UNDO = "undo"
    REASON_RESET = "reset"
    REASON_CHOICES = [
        (REASON_TOPUP, "Top-up"),
        (REASON_UNDO, "Undo"),
        (REASON_RESET, "Monthly Reset"),
    ]

    neighbour = models.ForeignKey(
        Neighbour, on_delete=models.CASCADE, related_name="balance_logs"
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="balance_logs"
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    balance_before = models.DecimalField(max_digits=10, decimal_places=2)
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.CharField(
        max_length=20, choices=REASON_CHOICES, default=REASON_TOPUP
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.neighbour.name}: +${self.amount}"


class Cart(models.Model):
    neighbour = models.ForeignKey(
        Neighbour, on_delete=models.CASCADE, related_name="carts"
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="carts"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.neighbour.name}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    item = models.ForeignKey(Item, on_delete=models.PROTECT, related_name="cart_items")
    quantity = models.IntegerField()
    unit_cost_override = models.DecimalField(
        max_digits=8, decimal_places=2, null=True, blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["cart", "item"],
                condition=models.Q(unit_cost_override__isnull=True),
                name="unique_cart_item_standard",
            ),
            models.UniqueConstraint(
                fields=["cart", "item", "unit_cost_override"],
                condition=models.Q(unit_cost_override__isnull=False),
                name="unique_cart_item_with_override",
            ),
            models.CheckConstraint(
                check=models.Q(quantity__gt=0), name="cart_item_quantity_positive"
            ),
        ]

    def __str__(self):
        return f"{self.item.name} x{self.quantity}"

    @property
    def line_total(self):
        cost = self.unit_cost_override if self.unit_cost_override is not None else self.item.cost
        return cost * self.quantity


class Transaction(models.Model):
    STATUS_COMPLETED = "completed"
    STATUS_UNDONE = "undone"
    STATUS_CHOICES = [
        (STATUS_COMPLETED, "Completed"),
        (STATUS_UNDONE, "Undone"),
    ]

    neighbour = models.ForeignKey(
        Neighbour, on_delete=models.PROTECT, related_name="transactions"
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="transactions"
    )
    total = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_COMPLETED
    )
    undone_at = models.DateTimeField(null=True, blank=True)
    undone_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="undone_transactions",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Transaction #{self.id} - {self.neighbour.name}"


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
