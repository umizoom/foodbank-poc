import logging

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger("core")


class InsufficientBalanceError(Exception):
    def __init__(self, balance, total):
        self.balance = balance
        self.total = total
        super().__init__(f"Insufficient balance: {balance} < {total}")


class InsufficientStockError(Exception):
    def __init__(self, item_name):
        self.item_name = item_name
        super().__init__(f"Insufficient stock for item: {item_name}")


class AccountLockedError(Exception):
    def __init__(self, username):
        self.username = username
        super().__init__(f"Account locked: {username}")


class CartNotFoundError(Exception):
    def __init__(self, cart_id):
        self.cart_id = cart_id
        super().__init__(f"Cart not found: {cart_id}")


def global_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        return response

    if isinstance(exc, InsufficientBalanceError):
        return Response(
            {"error": "Insufficient balance", "detail": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, InsufficientStockError):
        return Response(
            {"error": "Insufficient stock", "detail": str(exc)},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if isinstance(exc, AccountLockedError):
        return Response(
            {"error": "Account locked", "detail": "Too many failed login attempts. Try again later."},
            status=status.HTTP_403_FORBIDDEN,
        )

    if isinstance(exc, CartNotFoundError):
        return Response(
            {"error": "Cart not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    logger.exception("Unhandled exception", exc_info=exc)
    return Response(
        {"error": "Internal server error"},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
