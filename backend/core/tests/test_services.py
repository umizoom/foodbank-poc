from decimal import Decimal

import pytest

from core.exceptions import (
    AccountLockedError,
    CartNotFoundError,
    InsufficientBalanceError,
    InsufficientStockError,
)
from core.services import checkout_service, client_service, inventory_service
from core.tests.factories import (
    CartFactory,
    CartItemFactory,
    CategoryFactory,
    ClientFactory,
    ItemFactory,
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
class TestClientService:
    def test_register_client(self):
        client = client_service.register_client(name="John", card_id="CARD-999")
        assert client.name == "John"
        assert client.balance == 0

    def test_get_by_card_id_found(self):
        ClientFactory(card_id="RFID-ABC")
        client = client_service.get_by_card_id("RFID-ABC")
        assert client is not None
        assert client.card_id == "RFID-ABC"

    def test_get_by_card_id_not_found(self):
        result = client_service.get_by_card_id("NONEXISTENT")
        assert result is None

    def test_add_balance(self):
        client = ClientFactory(balance="50.00")
        admin = UserFactory()
        updated = client_service.add_balance(client.id, Decimal("25.00"), admin)
        assert updated.balance == Decimal("75.00")

    def test_add_balance_exceeds_max(self):
        client = ClientFactory()
        admin = UserFactory()
        with pytest.raises(ValueError, match="cannot exceed"):
            client_service.add_balance(client.id, Decimal("2500.00"), admin)

    def test_add_balance_zero(self):
        client = ClientFactory()
        admin = UserFactory()
        with pytest.raises(ValueError, match="must be positive"):
            client_service.add_balance(client.id, Decimal("0"), admin)


@pytest.mark.django_db
class TestCheckoutService:
    def test_create_cart(self):
        client = ClientFactory()
        admin = UserFactory()
        cart = checkout_service.create_cart(client.id, admin)
        assert cart.client == client
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
        checkout_service.add_to_cart(cart.id, item.id, 2)
        checkout_service.remove_from_cart(cart.id, item.id)
        summary = checkout_service.get_cart_summary(cart.id)
        assert len(summary["items"]) == 0

    def test_process_checkout_success(self):
        client = ClientFactory(balance="100.00")
        admin = UserFactory()
        cart = CartFactory(client=client, admin=admin)
        item = ItemFactory(cost="10.00", stock_count=20)
        CartItemFactory(cart=cart, item=item, quantity=3)

        txn = checkout_service.process_checkout(cart.id)

        assert txn.total == Decimal("30.00")
        client.refresh_from_db()
        assert client.balance == Decimal("70.00")
        item.refresh_from_db()
        assert item.stock_count == 17

    def test_process_checkout_insufficient_balance(self):
        client = ClientFactory(balance="10.00")
        admin = UserFactory()
        cart = CartFactory(client=client, admin=admin)
        item = ItemFactory(cost="20.00", stock_count=10)
        CartItemFactory(cart=cart, item=item, quantity=1)

        with pytest.raises(InsufficientBalanceError):
            checkout_service.process_checkout(cart.id)

        client.refresh_from_db()
        assert client.balance == Decimal("10.00")

    def test_process_checkout_insufficient_stock(self):
        client = ClientFactory(balance="100.00")
        admin = UserFactory()
        cart = CartFactory(client=client, admin=admin)
        item = ItemFactory(cost="5.00", stock_count=2)
        CartItemFactory(cart=cart, item=item, quantity=5)

        with pytest.raises(InsufficientStockError):
            checkout_service.process_checkout(cart.id)

    def test_cancel_cart(self):
        cart = CartFactory()
        checkout_service.cancel_cart(cart.id)
        with pytest.raises(CartNotFoundError):
            checkout_service.get_cart(cart.id)
