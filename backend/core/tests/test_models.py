import pytest
from django.db import IntegrityError

from core.models import Category, Client, Item
from core.tests.factories import CategoryFactory, ClientFactory, ItemFactory


@pytest.mark.django_db
class TestCategory:
    def test_create_category(self):
        category = CategoryFactory(name="Produce")
        assert category.name == "Produce"
        assert category.id is not None

    def test_unique_name(self):
        CategoryFactory(name="Dairy")
        with pytest.raises(IntegrityError):
            CategoryFactory(name="Dairy")

    def test_str(self):
        category = CategoryFactory(name="Bakery")
        assert str(category) == "Bakery"


@pytest.mark.django_db
class TestItem:
    def test_create_item(self):
        item = ItemFactory(name="Eggs", cost="4.00", stock_count=30)
        assert item.name == "Eggs"
        assert item.cost == 4.00
        assert item.stock_count == 30

    def test_is_low_stock_true(self):
        item = ItemFactory(stock_count=5, low_stock_threshold=10)
        assert item.is_low_stock is True

    def test_is_low_stock_false(self):
        item = ItemFactory(stock_count=15, low_stock_threshold=10)
        assert item.is_low_stock is False

    def test_is_low_stock_equal(self):
        item = ItemFactory(stock_count=10, low_stock_threshold=10)
        assert item.is_low_stock is True

    def test_category_protect_on_delete(self):
        item = ItemFactory()
        with pytest.raises(Exception):
            item.category.delete()


@pytest.mark.django_db
class TestClient:
    def test_create_client(self):
        client = ClientFactory(name="Maria", card_id="RFID-123")
        assert client.name == "Maria"
        assert client.card_id == "RFID-123"
        assert client.balance == 100.00

    def test_unique_card_id(self):
        ClientFactory(card_id="CARD-001")
        with pytest.raises(IntegrityError):
            ClientFactory(card_id="CARD-001")

    def test_default_balance(self):
        client = Client.objects.create(name="New Client", card_id="NEW-001")
        assert client.balance == 0
