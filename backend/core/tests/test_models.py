from decimal import Decimal

import pytest
from django.db import IntegrityError

from core.models import Category, Item, Neighbour
from core.tests.factories import CategoryFactory, ItemFactory, NeighbourFactory


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
        item.refresh_from_db()
        assert item.name == "Eggs"
        assert item.cost == Decimal("4.00")
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
class TestNeighbour:
    def test_create_neighbour(self):
        neighbour = NeighbourFactory(name="Maria", card_id="RFID-123")
        neighbour.refresh_from_db()
        assert neighbour.name == "Maria"
        assert neighbour.card_id == "RFID-123"
        assert neighbour.balance == Decimal("100.00")

    def test_unique_card_id(self):
        NeighbourFactory(card_id="CARD-001")
        with pytest.raises(IntegrityError):
            NeighbourFactory(card_id="CARD-001")

    def test_default_balance(self):
        neighbour = Neighbour.objects.create(name="New Neighbour", card_id="NEW-001")
        assert neighbour.balance == 0
