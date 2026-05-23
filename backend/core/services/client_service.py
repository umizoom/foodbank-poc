import logging
from decimal import Decimal

from django.db import transaction
from django.db.models import F

from core.models import BalanceLog, Client

logger = logging.getLogger("core.security")

MAX_BALANCE_ADDITION = Decimal("2000.00")


def register_client(name, card_id):
    return Client.objects.create(name=name, card_id=card_id)


def get_by_card_id(card_id):
    try:
        return Client.objects.get(card_id=card_id)
    except Client.DoesNotExist:
        return None


def update_client(client, **fields):
    for key, value in fields.items():
        setattr(client, key, value)
    client.save(update_fields=list(fields.keys()) + ["updated_at"])
    return client


@transaction.atomic
def add_balance(client_id, amount, admin):
    amount = Decimal(str(amount))
    if amount <= 0:
        raise ValueError("Amount must be positive")
    if amount > MAX_BALANCE_ADDITION:
        raise ValueError(f"Amount cannot exceed ${MAX_BALANCE_ADDITION}")

    client = Client.objects.select_for_update().get(id=client_id)
    balance_before = client.balance
    balance_after = balance_before + amount

    Client.objects.filter(id=client.id).update(balance=F("balance") + amount)

    BalanceLog.objects.create(
        client=client,
        admin=admin,
        amount=amount,
        balance_before=balance_before,
        balance_after=balance_after,
    )

    client.refresh_from_db()
    logger.info(
        "Balance added",
        extra={
            "client_id": client.id,
            "amount": str(amount),
            "balance_after": str(client.balance),
            "admin": admin.username,
        },
    )
    return client
