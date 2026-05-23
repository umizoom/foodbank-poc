import logging
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from core.exceptions import (
    CartNotFoundError,
    InsufficientBalanceError,
    InsufficientStockError,
)
from core.models import Cart, CartItem, Client, Item, Transaction, TransactionItem

logger = logging.getLogger("core.security")


def create_cart(client_id, admin):
    client = Client.objects.get(id=client_id)
    return Cart.objects.create(client=client, admin=admin)


def get_cart(cart_id):
    try:
        return Cart.objects.prefetch_related("items__item").get(id=cart_id)
    except Cart.DoesNotExist:
        raise CartNotFoundError(cart_id)


def add_to_cart(cart_id, item_id, quantity):
    cart = _get_cart_or_raise(cart_id)
    item = Item.objects.get(id=item_id)

    if item.stock_count <= 0:
        raise InsufficientStockError(item.name)

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        item=item,
        defaults={"quantity": quantity},
    )

    if not created:
        cart_item.quantity += quantity
        cart_item.save(update_fields=["quantity"])

    return cart_item


def remove_from_cart(cart_id, item_id):
    cart = _get_cart_or_raise(cart_id)
    CartItem.objects.filter(cart=cart, item_id=item_id).delete()


def update_cart_quantity(cart_id, item_id, quantity):
    cart = _get_cart_or_raise(cart_id)

    if quantity <= 0:
        CartItem.objects.filter(cart=cart, item_id=item_id).delete()
        return None

    cart_item = CartItem.objects.get(cart=cart, item_id=item_id)
    cart_item.quantity = quantity
    cart_item.save(update_fields=["quantity"])
    return cart_item


def get_cart_summary(cart_id):
    cart = Cart.objects.prefetch_related("items__item").get(id=cart_id)
    cart_items = cart.items.select_related("item").all()
    total = sum(ci.item.cost * ci.quantity for ci in cart_items)
    return {
        "cart": cart,
        "items": cart_items,
        "total": total,
        "client_balance": cart.client.balance,
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

    # Re-validate stock
    for cart_item in cart_items:
        item = Item.objects.select_for_update().get(id=cart_item.item_id)
        if item.stock_count < cart_item.quantity:
            raise InsufficientStockError(item.name)

    # Calculate total
    total = Decimal("0.00")
    for cart_item in cart_items:
        total += cart_item.item.cost * cart_item.quantity

    # Validate balance
    client = Client.objects.select_for_update().get(id=cart.client_id)
    if client.balance < total:
        raise InsufficientBalanceError(client.balance, total)

    # Deduct balance
    Client.objects.filter(id=client.id).update(balance=F("balance") - total)

    # Decrement stock
    for cart_item in cart_items:
        Item.objects.filter(id=cart_item.item_id).update(
            stock_count=F("stock_count") - cart_item.quantity
        )

    # Create transaction record with snapshots
    txn = Transaction.objects.create(
        client=client,
        admin=cart.admin,
        total=total,
    )

    for cart_item in cart_items:
        TransactionItem.objects.create(
            transaction=txn,
            item=cart_item.item,
            item_name=cart_item.item.name,
            unit_cost=cart_item.item.cost,
            quantity=cart_item.quantity,
            line_total=cart_item.item.cost * cart_item.quantity,
        )

    # Delete cart
    cart.delete()

    logger.info(
        "Checkout processed",
        extra={
            "transaction_id": txn.id,
            "client_id": client.id,
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
