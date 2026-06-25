import logging
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from django.db.models import Sum

from core.exceptions import (
    CartNotFoundError,
    InsufficientBalanceError,
    InsufficientStockError,
    ItemLimitExceededError,
)
from core.models import Cart, CartItem, Item, Neighbour, Transaction, TransactionItem

logger = logging.getLogger("core.security")


def create_onetime_neighbour(num_adults, num_children, balance):
    count = Neighbour.objects.filter(is_onetime=True).count() + 1
    neighbour = Neighbour.objects.create(
        name=f"Courtesy Checkout #{count}",
        card_id=None,
        is_onetime=True,
        num_adults=num_adults,
        num_children=num_children,
        balance=balance,
        catchment_area=False,
    )
    return neighbour


def create_cart(neighbour_id, admin):
    neighbour = Neighbour.objects.get(id=neighbour_id)
    return Cart.objects.create(neighbour=neighbour, admin=admin)


def get_cart(cart_id):
    try:
        return Cart.objects.prefetch_related("items__item").get(id=cart_id)
    except Cart.DoesNotExist:
        raise CartNotFoundError(cart_id)


def add_to_cart(cart_id, item_id, quantity, unit_cost_override=None):
    cart = _get_cart_or_raise(cart_id)
    item = Item.objects.get(id=item_id)

    if item.track_stock and item.stock_count <= 0:
        raise InsufficientStockError(item.name)

    if item.limit_per_checkout is not None:
        existing_qty = (
            CartItem.objects.filter(cart=cart, item=item).aggregate(
                total=Sum("quantity")
            )["total"]
            or 0
        )
        if existing_qty + quantity > item.limit_per_checkout:
            raise ItemLimitExceededError(item.name, item.limit_per_checkout)

    if unit_cost_override is not None:
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            item=item,
            unit_cost_override=unit_cost_override,
            defaults={"quantity": quantity},
        )
    else:
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            item=item,
            unit_cost_override__isnull=True,
            defaults={"quantity": quantity},
        )

    if not created:
        cart_item.quantity += quantity
        cart_item.save(update_fields=["quantity"])

    return cart_item


def remove_from_cart(cart_id, cart_item_id):
    cart = _get_cart_or_raise(cart_id)
    CartItem.objects.filter(cart=cart, id=cart_item_id).delete()


def update_cart_quantity(cart_id, cart_item_id, quantity):
    cart = _get_cart_or_raise(cart_id)

    if quantity <= 0:
        CartItem.objects.filter(cart=cart, id=cart_item_id).delete()
        return None

    cart_item = CartItem.objects.select_related("item").get(cart=cart, id=cart_item_id)

    if cart_item.item.limit_per_checkout is not None:
        other_qty = (
            CartItem.objects.filter(cart=cart, item=cart_item.item)
            .exclude(id=cart_item_id)
            .aggregate(total=Sum("quantity"))["total"]
            or 0
        )
        if other_qty + quantity > cart_item.item.limit_per_checkout:
            raise ItemLimitExceededError(
                cart_item.item.name, cart_item.item.limit_per_checkout
            )

    cart_item.quantity = quantity
    cart_item.save(update_fields=["quantity"])
    return cart_item


def get_cart_summary(cart_id):
    cart = Cart.objects.prefetch_related("items__item").get(id=cart_id)
    cart_items = cart.items.select_related("item").all()
    total = sum(ci.line_total for ci in cart_items)
    return {
        "cart": cart,
        "items": cart_items,
        "total": total,
        "neighbour_balance": cart.neighbour.balance,
    }


@transaction.atomic
def process_checkout(cart_id):
    try:
        cart = Cart.objects.select_for_update().get(id=cart_id)
    except Cart.DoesNotExist:
        raise CartNotFoundError(cart_id)

    cart_items = CartItem.objects.select_related("item").filter(cart=cart)

    if not cart_items.exists():
        raise ValueError("Cart is empty")

    # Re-validate stock (only for items that track it)
    for cart_item in cart_items:
        if cart_item.item.track_stock:
            item = Item.objects.select_for_update().get(id=cart_item.item_id)
            if item.stock_count < cart_item.quantity:
                raise InsufficientStockError(item.name)

    # Calculate total
    total = sum((ci.line_total for ci in cart_items), Decimal("0.00"))

    # Validate balance
    neighbour = Neighbour.objects.select_for_update().get(id=cart.neighbour_id)
    if neighbour.balance < total:
        raise InsufficientBalanceError(neighbour.balance, total)

    # Deduct balance
    Neighbour.objects.filter(id=neighbour.id).update(balance=F("balance") - total)

    # Decrement stock (only for items that track it)
    for cart_item in cart_items:
        if cart_item.item.track_stock:
            Item.objects.filter(id=cart_item.item_id).update(
                stock_count=F("stock_count") - cart_item.quantity
            )

    # Create transaction record with snapshots
    txn = Transaction.objects.create(
        neighbour=neighbour,
        admin=cart.admin,
        total=total,
    )

    for cart_item in cart_items:
        unit_cost = cart_item.unit_cost_override if cart_item.unit_cost_override is not None else cart_item.item.cost
        TransactionItem.objects.create(
            transaction=txn,
            item=cart_item.item,
            item_name=cart_item.item.name,
            unit_cost=unit_cost,
            quantity=cart_item.quantity,
            line_total=unit_cost * cart_item.quantity,
        )

    # Delete cart
    cart.delete()

    logger.info(
        "Checkout processed",
        extra={
            "transaction_id": txn.id,
            "neighbour_id": neighbour.id,
            "total": str(total),
            "admin": cart.admin.username,
        },
    )

    return txn


def cancel_cart(cart_id):
    cart = _get_cart_or_raise(cart_id)
    cart.delete()


def _get_cart_or_raise(cart_id):
    try:
        return Cart.objects.get(id=cart_id)
    except Cart.DoesNotExist:
        raise CartNotFoundError(cart_id)
