import logging
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from core.models import BalanceLog, Neighbour

logger = logging.getLogger("core.security")

MAX_BALANCE_ADDITION = Decimal("2000.00")


def register_neighbour(name, card_id, num_adults=1, num_children=0, catchment_area=True):
    from core.services.points_service import calculate_starting_balance

    balance = calculate_starting_balance(num_adults, num_children, catchment_area)
    return Neighbour.objects.create(
        name=name,
        card_id=card_id,
        num_adults=num_adults,
        num_children=num_children,
        catchment_area=catchment_area,
        balance=balance,
    )


def get_by_card_id(card_id):
    try:
        return Neighbour.objects.get(card_id=card_id)
    except Neighbour.DoesNotExist:
        return None


def update_neighbour(neighbour, **fields):
    for key, value in fields.items():
        setattr(neighbour, key, value)
    neighbour.save(update_fields=list(fields.keys()) + ["updated_at"])
    return neighbour


@transaction.atomic
def add_balance(neighbour_id, amount, admin):
    amount = Decimal(str(amount))
    if amount <= 0:
        raise ValueError("Amount must be positive")
    if amount > MAX_BALANCE_ADDITION:
        raise ValueError(f"Amount cannot exceed ${MAX_BALANCE_ADDITION}")

    neighbour = Neighbour.objects.select_for_update().get(id=neighbour_id)
    balance_before = neighbour.balance
    balance_after = balance_before + amount

    Neighbour.objects.filter(id=neighbour.id).update(balance=F("balance") + amount)

    BalanceLog.objects.create(
        neighbour=neighbour,
        admin=admin,
        amount=amount,
        balance_before=balance_before,
        balance_after=balance_after,
    )

    neighbour.refresh_from_db()
    logger.info(
        "Balance added",
        extra={
            "neighbour_id": neighbour.id,
            "amount": str(amount),
            "balance_after": str(neighbour.balance),
            "admin": admin.username,
        },
    )
    return neighbour
