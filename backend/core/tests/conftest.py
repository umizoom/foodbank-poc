import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from core.models import Category, Client, Item

User = get_user_model()


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="testadmin", password="testpass123", email="admin@test.com"
    )


@pytest.fixture
def api_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.fixture
def unauthenticated_client():
    return APIClient()


@pytest.fixture
def category(db):
    return Category.objects.create(name="Dairy")


@pytest.fixture
def item(category):
    return Item.objects.create(
        name="Milk",
        category=category,
        cost="3.50",
        stock_count=20,
        low_stock_threshold=5,
    )


@pytest.fixture
def client_record(db):
    return Client.objects.create(
        name="Test Client",
        card_id="CARD-001",
        balance="50.00",
    )
