from datetime import timedelta
from decimal import Decimal

import pytest
from django.utils import timezone

from core.exceptions import (
    AccountLockedError,
    CartNotFoundError,
    InsufficientBalanceError,
    InsufficientStockError,
    ItemLimitExceededError,
    TransactionUndoError,
)
from core.models import BalanceLog, Transaction
from core.services import checkout_service, inventory_service, neighbour_service, report_service, transaction_service
from core.tests.factories import (
    CartFactory,
    CartItemFactory,
    CategoryFactory,
    ItemFactory,
    NeighbourFactory,
    TransactionFactory,
    TransactionItemFactory,
    UserFactory,
)


@pytest.mark.django_db
class TestInventoryService:
    def test_create_item(self):
        category = CategoryFactory()
        item = inventory_service.create_item(
            name="Bread", category=category, cost=Decimal("2.50"), stock_count=10
        )
        assert item.name == "Bread"
        assert item.stock_count == 10

    def test_update_stock_set(self):
        item = ItemFactory(stock_count=10)
        result = inventory_service.update_stock(item, quantity=25, operation="set")
        assert result.stock_count == 25

    def test_update_stock_add(self):
        item = ItemFactory(stock_count=10)
        result = inventory_service.update_stock(item, quantity=5, operation="add")
        assert result.stock_count == 15

    def test_update_stock_subtract(self):
        item = ItemFactory(stock_count=10)
        result = inventory_service.update_stock(item, quantity=3, operation="subtract")
        assert result.stock_count == 7

    def test_update_stock_subtract_floor_zero(self):
        item = ItemFactory(stock_count=3)
        result = inventory_service.update_stock(item, quantity=10, operation="subtract")
        assert result.stock_count == 0

    def test_get_low_stock_items(self):
        ItemFactory(stock_count=5, low_stock_threshold=10)
        ItemFactory(stock_count=20, low_stock_threshold=10)
        low = inventory_service.get_low_stock_items()
        assert low.count() == 1

    def test_get_low_stock_count(self):
        ItemFactory(stock_count=3, low_stock_threshold=5)
        ItemFactory(stock_count=3, low_stock_threshold=5)
        ItemFactory(stock_count=50, low_stock_threshold=5)
        assert inventory_service.get_low_stock_count() == 2


@pytest.mark.django_db
class TestNeighbourService:
    def test_register_neighbour(self):
        neighbour = neighbour_service.register_neighbour(name="John", card_id="CARD-999")
        assert neighbour.name == "John"
        assert neighbour.num_adults == 1
        assert neighbour.num_children == 0
        assert neighbour.balance == Decimal("58")

    def test_register_neighbour_with_family_size(self):
        neighbour = neighbour_service.register_neighbour(
            name="Jane", card_id="CARD-998", num_adults=2, num_children=3, catchment_area=True
        )
        assert neighbour.num_adults == 2
        assert neighbour.num_children == 3
        assert neighbour.balance == Decimal("191")

    def test_register_neighbour_out_of_catchment(self):
        neighbour = neighbour_service.register_neighbour(
            name="Bob", card_id="CARD-997", num_adults=1, num_children=0, catchment_area=False
        )
        assert neighbour.balance == Decimal("41")

    def test_get_by_card_id_found(self):
        NeighbourFactory(card_id="RFID-ABC")
        neighbour = neighbour_service.get_by_card_id("RFID-ABC")
        assert neighbour is not None
        assert neighbour.card_id == "RFID-ABC"

    def test_get_by_card_id_not_found(self):
        result = neighbour_service.get_by_card_id("NONEXISTENT")
        assert result is None

    def test_add_balance(self):
        neighbour = NeighbourFactory(balance="50.00")
        admin = UserFactory()
        updated = neighbour_service.add_balance(neighbour.id, Decimal("25.00"), admin)
        assert updated.balance == Decimal("75.00")

    def test_add_balance_exceeds_max(self):
        neighbour = NeighbourFactory()
        admin = UserFactory()
        with pytest.raises(ValueError, match="cannot exceed"):
            neighbour_service.add_balance(neighbour.id, Decimal("2500.00"), admin)

    def test_add_balance_zero(self):
        neighbour = NeighbourFactory()
        admin = UserFactory()
        with pytest.raises(ValueError, match="must be positive"):
            neighbour_service.add_balance(neighbour.id, Decimal("0"), admin)

    def test_reset_all_balances_recalculates(self):
        admin = UserFactory()
        n1 = NeighbourFactory(
            num_adults=1, num_children=0, catchment_area=True, balance="10.00"
        )
        n2 = NeighbourFactory(
            num_adults=2, num_children=1, catchment_area=False, balance="5.00"
        )
        count = neighbour_service.reset_all_balances(admin)
        assert count == 2
        n1.refresh_from_db()
        n2.refresh_from_db()
        assert n1.balance == Decimal("58")
        assert n2.balance == Decimal("96")

    def test_reset_all_balances_only_logs_changes(self):
        admin = UserFactory()
        NeighbourFactory(
            num_adults=1, num_children=0, catchment_area=True, balance="58.00"
        )
        NeighbourFactory(
            num_adults=2, num_children=1, catchment_area=False, balance="5.00"
        )
        neighbour_service.reset_all_balances(admin)
        assert BalanceLog.objects.filter(reason=BalanceLog.REASON_RESET).count() == 1

    def test_reset_all_balances_empty_db(self):
        admin = UserFactory()
        count = neighbour_service.reset_all_balances(admin)
        assert count == 0

    def test_bulk_edit_allergies(self):
        admin = UserFactory()
        n1 = NeighbourFactory(allergies=[])
        n2 = NeighbourFactory(allergies=["Gluten free"])
        neighbour_service.bulk_edit_neighbours(
            [n1.id, n2.id], "allergies", ["Lactose free", "Gluten free"], admin
        )
        n1.refresh_from_db()
        n2.refresh_from_db()
        assert n1.allergies == ["Lactose free", "Gluten free"]
        assert n2.allergies == ["Lactose free", "Gluten free"]

    def test_bulk_edit_catchment_area(self):
        admin = UserFactory()
        n1 = NeighbourFactory(catchment_area=True)
        n2 = NeighbourFactory(catchment_area=True)
        neighbour_service.bulk_edit_neighbours(
            [n1.id, n2.id], "catchment_area", False, admin
        )
        n1.refresh_from_db()
        n2.refresh_from_db()
        assert n1.catchment_area is False
        assert n2.catchment_area is False

    def test_bulk_edit_num_adults_valid(self):
        admin = UserFactory()
        n1 = NeighbourFactory(num_adults=1)
        neighbour_service.bulk_edit_neighbours([n1.id], "num_adults", 4, admin)
        n1.refresh_from_db()
        assert n1.num_adults == 4

    def test_bulk_edit_num_adults_invalid(self):
        admin = UserFactory()
        n1 = NeighbourFactory(num_adults=1)
        with pytest.raises(ValueError, match="between 1 and 7"):
            neighbour_service.bulk_edit_neighbours([n1.id], "num_adults", 0, admin)

    def test_bulk_edit_reset_balance(self):
        admin = UserFactory()
        n1 = NeighbourFactory(
            num_adults=1, num_children=0, catchment_area=True, balance="10.00"
        )
        n2 = NeighbourFactory(
            num_adults=2, num_children=1, catchment_area=False, balance="5.00"
        )
        count = neighbour_service.bulk_edit_neighbours(
            [n1.id, n2.id], "reset_balance", None, admin
        )
        assert count == 2
        n1.refresh_from_db()
        n2.refresh_from_db()
        assert n1.balance == Decimal("58")
        assert n2.balance == Decimal("96")
        assert BalanceLog.objects.filter(reason=BalanceLog.REASON_RESET).count() == 2

    def test_bulk_edit_reset_balance_no_change_no_log(self):
        admin = UserFactory()
        NeighbourFactory(
            num_adults=1, num_children=0, catchment_area=True, balance="58.00"
        )
        neighbour_service.bulk_edit_neighbours(
            [1], "reset_balance", None, admin
        )
        assert BalanceLog.objects.filter(reason=BalanceLog.REASON_RESET).count() == 0


@pytest.mark.django_db
class TestCheckoutService:
    def test_create_cart(self):
        neighbour = NeighbourFactory()
        admin = UserFactory()
        cart = checkout_service.create_cart(neighbour.id, admin)
        assert cart.neighbour == neighbour
        assert cart.admin == admin

    def test_add_to_cart(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=10)
        cart_item = checkout_service.add_to_cart(cart.id, item.id, 2)
        assert cart_item.quantity == 2

    def test_add_to_cart_existing_item_increments(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=10)
        checkout_service.add_to_cart(cart.id, item.id, 2)
        cart_item = checkout_service.add_to_cart(cart.id, item.id, 3)
        assert cart_item.quantity == 5

    def test_add_to_cart_zero_stock(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=0)
        with pytest.raises(InsufficientStockError):
            checkout_service.add_to_cart(cart.id, item.id, 1)

    def test_remove_from_cart(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=10)
        cart_item = checkout_service.add_to_cart(cart.id, item.id, 2)
        checkout_service.remove_from_cart(cart.id, cart_item.id)
        summary = checkout_service.get_cart_summary(cart.id)
        assert len(summary["items"]) == 0

    def test_process_checkout_success(self):
        neighbour = NeighbourFactory(balance="100.00")
        admin = UserFactory()
        cart = CartFactory(neighbour=neighbour, admin=admin)
        item = ItemFactory(cost="10.00", stock_count=20)
        CartItemFactory(cart=cart, item=item, quantity=3)

        txn = checkout_service.process_checkout(cart.id)

        assert txn.total == Decimal("30.00")
        neighbour.refresh_from_db()
        assert neighbour.balance == Decimal("70.00")
        item.refresh_from_db()
        assert item.stock_count == 17

    def test_process_checkout_insufficient_balance(self):
        neighbour = NeighbourFactory(balance="10.00")
        admin = UserFactory()
        cart = CartFactory(neighbour=neighbour, admin=admin)
        item = ItemFactory(cost="20.00", stock_count=10)
        CartItemFactory(cart=cart, item=item, quantity=1)

        with pytest.raises(InsufficientBalanceError):
            checkout_service.process_checkout(cart.id)

        neighbour.refresh_from_db()
        assert neighbour.balance == Decimal("10.00")

    def test_process_checkout_insufficient_stock(self):
        neighbour = NeighbourFactory(balance="100.00")
        admin = UserFactory()
        cart = CartFactory(neighbour=neighbour, admin=admin)
        item = ItemFactory(cost="5.00", stock_count=2)
        CartItemFactory(cart=cart, item=item, quantity=5)

        with pytest.raises(InsufficientStockError):
            checkout_service.process_checkout(cart.id)

    def test_cancel_cart(self):
        cart = CartFactory()
        checkout_service.cancel_cart(cart.id)
        with pytest.raises(CartNotFoundError):
            checkout_service.get_cart(cart.id)

    def test_add_to_cart_within_limit(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=10, limit_per_checkout=3)
        cart_item = checkout_service.add_to_cart(cart.id, item.id, 2)
        assert cart_item.quantity == 2

    def test_add_to_cart_at_exact_limit(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=10, limit_per_checkout=3)
        checkout_service.add_to_cart(cart.id, item.id, 2)
        cart_item = checkout_service.add_to_cart(cart.id, item.id, 1)
        assert cart_item.quantity == 3

    def test_add_to_cart_exceeds_limit(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=10, limit_per_checkout=2)
        checkout_service.add_to_cart(cart.id, item.id, 2)
        with pytest.raises(ItemLimitExceededError):
            checkout_service.add_to_cart(cart.id, item.id, 1)

    def test_add_to_cart_no_limit(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=50, limit_per_checkout=None)
        checkout_service.add_to_cart(cart.id, item.id, 10)
        cart_item = checkout_service.add_to_cart(cart.id, item.id, 10)
        assert cart_item.quantity == 20

    def test_update_cart_quantity_within_limit(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=10, limit_per_checkout=5)
        cart_item = checkout_service.add_to_cart(cart.id, item.id, 2)
        result = checkout_service.update_cart_quantity(cart.id, cart_item.id, 4)
        assert result.quantity == 4

    def test_update_cart_quantity_exceeds_limit(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=10, limit_per_checkout=3)
        cart_item = checkout_service.add_to_cart(cart.id, item.id, 2)
        with pytest.raises(ItemLimitExceededError):
            checkout_service.update_cart_quantity(cart.id, cart_item.id, 4)

    def test_limit_aggregates_across_extras_rows(self):
        cart = CartFactory()
        item = ItemFactory(stock_count=10, limit_per_checkout=3, track_stock=False)
        checkout_service.add_to_cart(cart.id, item.id, 1, unit_cost_override=Decimal("2.00"))
        checkout_service.add_to_cart(cart.id, item.id, 1, unit_cost_override=Decimal("3.00"))
        with pytest.raises(ItemLimitExceededError):
            checkout_service.add_to_cart(cart.id, item.id, 2, unit_cost_override=Decimal("4.00"))


@pytest.mark.django_db
class TestReportService:
    def test_empty_report(self):
        today = timezone.localdate()
        result = report_service.get_items_sold_report(today, today)
        assert result["items"] == []
        assert result["totals"]["total_items_sold"] == 0

    def test_aggregates_correctly(self):
        item = ItemFactory(cost="5.00", stock_count=30)
        txn1 = TransactionFactory(total="10.00")
        TransactionItemFactory(
            transaction=txn1, item=item, item_name=item.name,
            unit_cost=Decimal("5.00"), quantity=2, line_total=Decimal("10.00"),
        )
        txn2 = TransactionFactory(total="15.00")
        TransactionItemFactory(
            transaction=txn2, item=item, item_name=item.name,
            unit_cost=Decimal("5.00"), quantity=3, line_total=Decimal("15.00"),
        )

        today = timezone.localdate()
        result = report_service.get_items_sold_report(today, today)
        assert len(result["items"]) == 1
        assert result["items"][0]["total_quantity_sold"] == 5
        assert result["items"][0]["total_amount"] == Decimal("25.00")
        assert result["totals"]["total_items_sold"] == 5

    def test_includes_current_stock(self):
        item = ItemFactory(cost="3.00", stock_count=42)
        txn = TransactionFactory(total="3.00")
        TransactionItemFactory(
            transaction=txn, item=item, item_name=item.name,
            unit_cost=Decimal("3.00"), quantity=1, line_total=Decimal("3.00"),
        )

        today = timezone.localdate()
        result = report_service.get_items_sold_report(today, today)
        assert result["items"][0]["current_stock"] == 42

    def test_handles_deleted_items(self):
        item = ItemFactory(cost="4.00", stock_count=10)
        txn = TransactionFactory(total="8.00")
        TransactionItemFactory(
            transaction=txn, item=item, item_name=item.name,
            unit_cost=Decimal("4.00"), quantity=2, line_total=Decimal("8.00"),
        )
        item.delete()

        today = timezone.localdate()
        result = report_service.get_items_sold_report(today, today)
        assert len(result["items"]) == 1
        assert result["items"][0]["current_stock"] is None
        assert result["items"][0]["category_name"] == "Unknown"

    def test_filters_by_date_range(self):
        item = ItemFactory(cost="5.00", stock_count=20)
        txn = TransactionFactory(total="5.00")
        TransactionItemFactory(
            transaction=txn, item=item, item_name=item.name,
            unit_cost=Decimal("5.00"), quantity=1, line_total=Decimal("5.00"),
        )
        Transaction.objects.filter(id=txn.id).update(
            created_at=timezone.now() - timedelta(days=15)
        )

        today = timezone.localdate()
        result = report_service.get_items_sold_report(today, today)
        assert len(result["items"]) == 0


@pytest.mark.django_db
class TestTransactionService:
    def test_undo_restores_balance(self):
        neighbour = NeighbourFactory(balance="70.00")
        admin = UserFactory()
        txn = TransactionFactory(neighbour=neighbour, admin=admin, total="30.00")
        ItemFactory(stock_count=10)

        transaction_service.undo_transaction(txn.id, admin)

        neighbour.refresh_from_db()
        assert neighbour.balance == Decimal("100.00")

    def test_undo_restores_stock(self):
        neighbour = NeighbourFactory(balance="50.00")
        admin = UserFactory()
        item = ItemFactory(stock_count=17)
        txn = TransactionFactory(neighbour=neighbour, admin=admin, total="30.00")
        TransactionItemFactory(
            transaction=txn, item=item, item_name=item.name,
            unit_cost=Decimal("10.00"), quantity=3, line_total=Decimal("30.00"),
        )

        transaction_service.undo_transaction(txn.id, admin)

        item.refresh_from_db()
        assert item.stock_count == 20

    def test_undo_marks_transaction_undone(self):
        neighbour = NeighbourFactory(balance="50.00")
        admin = UserFactory()
        txn = TransactionFactory(neighbour=neighbour, admin=admin, total="10.00")

        result = transaction_service.undo_transaction(txn.id, admin)

        assert result.status == Transaction.STATUS_UNDONE
        assert result.undone_at is not None
        assert result.undone_by == admin

    def test_undo_creates_balance_log(self):
        neighbour = NeighbourFactory(balance="50.00")
        admin = UserFactory()
        txn = TransactionFactory(neighbour=neighbour, admin=admin, total="25.00")

        transaction_service.undo_transaction(txn.id, admin)

        log = BalanceLog.objects.get(neighbour=neighbour)
        assert log.amount == Decimal("25.00")
        assert log.balance_before == Decimal("50.00")
        assert log.balance_after == Decimal("75.00")
        assert log.reason == BalanceLog.REASON_UNDO
        assert log.admin == admin

    def test_undo_already_undone_raises(self):
        neighbour = NeighbourFactory(balance="50.00")
        admin = UserFactory()
        txn = TransactionFactory(neighbour=neighbour, admin=admin, total="10.00")

        transaction_service.undo_transaction(txn.id, admin)

        with pytest.raises(TransactionUndoError, match="already been undone"):
            transaction_service.undo_transaction(txn.id, admin)

    def test_undo_with_deleted_item_still_refunds(self):
        neighbour = NeighbourFactory(balance="50.00")
        admin = UserFactory()
        item = ItemFactory(stock_count=10)
        txn = TransactionFactory(neighbour=neighbour, admin=admin, total="20.00")
        TransactionItemFactory(
            transaction=txn, item=item, item_name=item.name,
            unit_cost=Decimal("10.00"), quantity=2, line_total=Decimal("20.00"),
        )
        # Simulate item deletion (SET_NULL behavior)
        from core.models import TransactionItem
        TransactionItem.objects.filter(transaction=txn).update(item=None)

        transaction_service.undo_transaction(txn.id, admin)

        neighbour.refresh_from_db()
        assert neighbour.balance == Decimal("70.00")
        # Stock should not change since item FK is null
        item.refresh_from_db()
        assert item.stock_count == 10
