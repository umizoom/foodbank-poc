from datetime import date
from decimal import Decimal

from django.db.models import DecimalField, IntegerField, Sum, Value
from django.db.models.functions import Coalesce

from core.models import TransactionItem


def get_items_sold_report(start_date: date, end_date: date):
    qs = (
        TransactionItem.objects.filter(
            transaction__created_at__date__gte=start_date,
            transaction__created_at__date__lte=end_date,
        )
        .values("item", "item_name")
        .annotate(
            total_quantity_sold=Coalesce(
                Sum("quantity"), Value(0), output_field=IntegerField()
            ),
            total_amount=Coalesce(
                Sum("line_total"), Value(Decimal("0.00")), output_field=DecimalField()
            ),
        )
        .order_by("-total_quantity_sold")
    )

    items = []
    for row in qs:
        item_obj = None
        if row["item"]:
            from core.models import Item

            item_obj = Item.objects.select_related("category").filter(id=row["item"]).first()

        items.append(
            {
                "item_id": row["item"],
                "item_name": row["item_name"],
                "category_name": item_obj.category.name if item_obj else "Unknown",
                "total_quantity_sold": row["total_quantity_sold"],
                "total_amount": row["total_amount"],
                "current_stock": item_obj.stock_count if item_obj else None,
            }
        )

    total_items_sold = sum(i["total_quantity_sold"] for i in items)
    total_revenue = sum(i["total_amount"] for i in items)

    return {
        "period": {"start_date": str(start_date), "end_date": str(end_date)},
        "items": items,
        "totals": {
            "total_items_sold": total_items_sold,
            "total_revenue": total_revenue,
        },
    }
