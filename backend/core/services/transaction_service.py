import logging

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from core.exceptions import TransactionUndoError
from core.models import BalanceLog, Item, Neighbour, Transaction

logger = logging.getLogger("core.security")


@transaction.atomic
def undo_transaction(transaction_id, admin):
    txn = Transaction.objects.select_for_update().get(id=transaction_id)

    if txn.status == Transaction.STATUS_UNDONE:
        raise TransactionUndoError("Transaction has already been undone.")

    neighbour = Neighbour.objects.select_for_update().get(id=txn.neighbour_id)
    balance_before = neighbour.balance
    balance_after = balance_before + txn.total

    Neighbour.objects.filter(id=neighbour.id).update(balance=F("balance") + txn.total)

    BalanceLog.objects.create(
        neighbour=neighbour,
        admin=admin,
        amount=txn.total,
        balance_before=balance_before,
        balance_after=balance_after,
        reason=BalanceLog.REASON_UNDO,
    )

    for txn_item in txn.items.all():
        if txn_item.item_id is not None:
            Item.objects.filter(id=txn_item.item_id).update(
                stock_count=F("stock_count") + txn_item.quantity
            )
        else:
            logger.warning(
                "Cannot restore stock for deleted item: %s (transaction %s)",
                txn_item.item_name,
                txn.id,
            )

    txn.status = Transaction.STATUS_UNDONE
    txn.undone_at = timezone.now()
    txn.undone_by = admin
    txn.save(update_fields=["status", "undone_at", "undone_by"])

    logger.info(
        "Transaction undone",
        extra={
            "transaction_id": txn.id,
            "neighbour_id": neighbour.id,
            "amount_refunded": str(txn.total),
            "admin": admin.username,
        },
    )

    return txn
