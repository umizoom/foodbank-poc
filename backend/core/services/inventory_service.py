from django.db.models import F

from core.models import Item


def create_item(name, category, cost, stock_count=0, low_stock_threshold=10):
    return Item.objects.create(
        name=name,
        category=category,
        cost=cost,
        stock_count=stock_count,
        low_stock_threshold=low_stock_threshold,
    )


def update_item(item, **fields):
    for key, value in fields.items():
        setattr(item, key, value)
    item.save(update_fields=list(fields.keys()) + ["updated_at"])
    return item


def delete_item(item):
    item.delete()


def update_stock(item, quantity, operation="set"):
    if operation == "set":
        item.stock_count = max(0, quantity)
        item.save(update_fields=["stock_count", "updated_at"])
    elif operation == "add":
        Item.objects.filter(id=item.id).update(stock_count=F("stock_count") + quantity)
        item.refresh_from_db()
    elif operation == "subtract":
        Item.objects.filter(id=item.id).update(
            stock_count=F("stock_count") - quantity
        )
        item.refresh_from_db()
        if item.stock_count < 0:
            item.stock_count = 0
            item.save(update_fields=["stock_count", "updated_at"])
    return item


def get_low_stock_items():
    return Item.objects.filter(stock_count__lte=F("low_stock_threshold"))


def get_low_stock_count():
    return get_low_stock_items().count()
