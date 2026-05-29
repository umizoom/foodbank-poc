import pytest
from django.contrib.auth import get_user_model

from core.models import Cart, CartItem, Client, Transaction
from core.tests.factories import (
    CartFactory,
    CartItemFactory,
    CategoryFactory,
    ClientFactory,
    ItemFactory,
    UserFactory,
)

User = get_user_model()


@pytest.mark.django_db
class TestAuthViews:
    def test_login_success(self, unauthenticated_client):
        User.objects.create_user(username="admin", password="pass123")
        response = unauthenticated_client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "pass123"},
        )
        assert response.status_code == 200
        assert "user" in response.data

    def test_login_invalid_credentials(self, unauthenticated_client):
        User.objects.create_user(username="admin", password="pass123")
        response = unauthenticated_client.post(
            "/api/auth/login/",
            {"username": "admin", "password": "wrong"},
        )
        assert response.status_code == 401

    def test_logout(self, api_client):
        response = api_client.post("/api/auth/logout/")
        assert response.status_code == 200

    def test_session_authenticated(self, api_client):
        response = api_client.get("/api/auth/session/")
        assert response.status_code == 200
        assert "user" in response.data

    def test_session_unauthenticated(self, unauthenticated_client):
        response = unauthenticated_client.get("/api/auth/session/")
        assert response.status_code == 403


@pytest.mark.django_db
class TestCategoryViews:
    def test_list_categories(self, api_client):
        CategoryFactory.create_batch(3)
        response = api_client.get("/api/categories/")
        assert response.status_code == 200
        assert len(response.data["results"]) == 3

    def test_create_category(self, api_client):
        response = api_client.post("/api/categories/", {"name": "Produce"})
        assert response.status_code == 201
        assert response.data["name"] == "Produce"

    def test_delete_category(self, api_client):
        cat = CategoryFactory()
        response = api_client.delete(f"/api/categories/{cat.id}/")
        assert response.status_code == 204


@pytest.mark.django_db
class TestItemViews:
    def test_list_items(self, api_client):
        ItemFactory.create_batch(3)
        response = api_client.get("/api/items/")
        assert response.status_code == 200
        assert len(response.data["results"]) == 3

    def test_create_item(self, api_client):
        cat = CategoryFactory()
        response = api_client.post(
            "/api/items/",
            {"name": "Eggs", "category": cat.id, "cost": "4.50", "stock_count": 30, "low_stock_threshold": 5},
        )
        assert response.status_code == 201
        assert response.data["name"] == "Eggs"

    def test_update_stock(self, api_client):
        item = ItemFactory(stock_count=10)
        response = api_client.patch(
            f"/api/items/{item.id}/stock/",
            {"quantity": 25, "operation": "set"},
        )
        assert response.status_code == 200
        assert response.data["stock_count"] == 25


@pytest.mark.django_db
class TestClientViews:
    def test_list_clients(self, api_client):
        ClientFactory.create_batch(3)
        response = api_client.get("/api/clients/")
        assert response.status_code == 200
        assert len(response.data["results"]) == 3

    def test_create_client(self, api_client):
        response = api_client.post(
            "/api/clients/", {"name": "Maria", "card_id": "CARD-NEW"}
        )
        assert response.status_code == 201
        assert response.data["balance"] == "0.00"

    def test_lookup_by_card(self, api_client):
        ClientFactory(card_id="RFID-LOOKUP")
        response = api_client.get("/api/clients/lookup/?card_id=RFID-LOOKUP")
        assert response.status_code == 200
        assert response.data["card_id"] == "RFID-LOOKUP"

    def test_lookup_by_card_not_found(self, api_client):
        response = api_client.get("/api/clients/lookup/?card_id=NONEXISTENT")
        assert response.status_code == 404

    def test_add_balance(self, api_client):
        client = ClientFactory(balance="50.00")
        response = api_client.post(
            f"/api/clients/{client.id}/balance/", {"amount": "25.00"}
        )
        assert response.status_code == 200
        assert response.data["balance"] == "75.00"


@pytest.mark.django_db
class TestCartViews:
    def test_create_cart(self, api_client):
        client = ClientFactory()
        response = api_client.post("/api/carts/", {"client_id": client.id})
        assert response.status_code == 201
        assert response.data["client"] == client.id

    def test_add_item_to_cart(self, api_client, admin_user):
        client = ClientFactory()
        cart = CartFactory(client=client, admin=admin_user)
        item = ItemFactory(stock_count=10)
        response = api_client.post(
            f"/api/carts/{cart.id}/items/",
            {"item_id": item.id, "quantity": 2},
        )
        assert response.status_code == 200
        assert len(response.data["items"]) == 1

    def test_checkout(self, api_client, admin_user):
        client = ClientFactory(balance="100.00")
        cart = CartFactory(client=client, admin=admin_user)
        item = ItemFactory(cost="10.00", stock_count=20)
        CartItemFactory(cart=cart, item=item, quantity=2)

        response = api_client.post(f"/api/carts/{cart.id}/checkout/")
        assert response.status_code == 200
        assert response.data["total_amount"] == "20.00"

    def test_cancel_cart(self, api_client, admin_user):
        client = ClientFactory()
        cart = CartFactory(client=client, admin=admin_user)
        response = api_client.delete(f"/api/carts/{cart.id}/")
        assert response.status_code == 204


@pytest.mark.django_db
class TestTransactionViews:
    def test_list_transactions(self, api_client, admin_user):
        client = ClientFactory(balance="100.00")
        cart = CartFactory(client=client, admin=admin_user)
        item = ItemFactory(cost="5.00", stock_count=10)
        CartItemFactory(cart=cart, item=item, quantity=1)
        from core.services import checkout_service
        checkout_service.process_checkout(cart.id)

        response = api_client.get("/api/transactions/")
        assert response.status_code == 200
        assert len(response.data["results"]) == 1


@pytest.mark.django_db
class TestHealthCheck:
    def test_health_check(self, unauthenticated_client):
        response = unauthenticated_client.get("/api/health/")
        assert response.status_code == 200
        assert response.data["status"] == "healthy"
