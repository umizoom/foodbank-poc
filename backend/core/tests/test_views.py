from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.utils import timezone

from core.models import Cart, CartItem, Category, Neighbour, Transaction
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
        assert len(response.data) >= 3

    def test_create_category(self, api_client):
        response = api_client.post("/api/categories/", {"name": "Produce"})
        assert response.status_code == 201
        assert response.data["name"] == "Produce"

    def test_delete_category(self, api_client):
        cat = CategoryFactory()
        response = api_client.delete(f"/api/categories/{cat.id}/")
        assert response.status_code == 204

    def test_rename_extras_category_rejected(self, api_client):
        cat, _ = Category.objects.get_or_create(name="Extras")
        response = api_client.put(f"/api/categories/{cat.id}/", {"name": "Misc"})
        assert response.status_code == 400
        assert "cannot be modified" in response.data["error"].lower()

    def test_delete_extras_category_rejected(self, api_client):
        cat, _ = Category.objects.get_or_create(name="Extras")
        response = api_client.delete(f"/api/categories/{cat.id}/")
        assert response.status_code == 400
        assert "cannot be deleted" in response.data["error"].lower()


@pytest.mark.django_db
class TestItemViews:
    def test_list_items(self, api_client):
        ItemFactory.create_batch(3)
        response = api_client.get("/api/items/")
        assert response.status_code == 200
        assert len(response.data) >= 3

    def test_create_item(self, api_client):
        cat = CategoryFactory()
        response = api_client.post(
            "/api/items/",
            {"name": "Eggs", "category": cat.id, "cost": "4.50", "stock_count": 30, "low_stock_threshold": 5},
        )
        assert response.status_code == 201
        assert response.data["name"] == "Eggs"

    def test_create_item_in_extras_category_rejected(self, api_client):
        extras_cat, _ = Category.objects.get_or_create(name="Extras")
        response = api_client.post(
            "/api/items/",
            {"name": "Gift Card", "category": extras_cat.id, "cost": "5.00", "stock_count": 10, "low_stock_threshold": 2},
        )
        assert response.status_code == 400
        assert "category" in response.data

    def test_update_extras_item_rejected(self, api_client):
        extras_cat, _ = Category.objects.get_or_create(name="Extras")
        item = ItemFactory(category=extras_cat, track_stock=False, name="Extras")
        response = api_client.put(
            f"/api/items/{item.id}/",
            {"name": "Renamed", "category": extras_cat.id, "cost": "2.00", "stock_count": 0, "low_stock_threshold": 0},
        )
        assert response.status_code == 400
        assert "extras config" in response.data["error"].lower()

    def test_patch_extras_item_rejected(self, api_client):
        extras_cat, _ = Category.objects.get_or_create(name="Extras")
        item = ItemFactory(category=extras_cat, track_stock=False, name="Extras")
        response = api_client.patch(
            f"/api/items/{item.id}/",
            {"name": "Renamed"},
        )
        assert response.status_code == 400

    def test_delete_extras_item_rejected(self, api_client):
        extras_cat, _ = Category.objects.get_or_create(name="Extras")
        item = ItemFactory(category=extras_cat, track_stock=False, name="Extras")
        response = api_client.delete(f"/api/items/{item.id}/")
        assert response.status_code == 400

    def test_update_stock(self, api_client):
        item = ItemFactory(stock_count=10)
        response = api_client.patch(
            f"/api/items/{item.id}/stock/",
            {"quantity": 25, "operation": "set"},
        )
        assert response.status_code == 200
        assert response.data["stock_count"] == 25


@pytest.mark.django_db
class TestNeighbourViews:
    def test_list_neighbours(self, api_client):
        NeighbourFactory.create_batch(3)
        response = api_client.get("/api/neighbours/")
        assert response.status_code == 200
        assert len(response.data) == 3

    def test_create_neighbour(self, api_client):
        response = api_client.post(
            "/api/neighbours/",
            {"name": "Maria", "card_id": "CARD-NEW", "num_adults": 1, "num_children": 0, "catchment_area": True},
        )
        assert response.status_code == 201
        assert response.data["balance"] == "58.00"
        assert response.data["num_adults"] == 1
        assert response.data["num_children"] == 0

    def test_create_neighbour_out_of_catchment(self, api_client):
        response = api_client.post(
            "/api/neighbours/",
            {"name": "Bob", "card_id": "CARD-OOC", "num_adults": 2, "num_children": 1, "catchment_area": False},
        )
        assert response.status_code == 201
        assert response.data["balance"] == "96.00"

    def test_create_neighbour_large_family(self, api_client):
        response = api_client.post(
            "/api/neighbours/",
            {"name": "Large Family", "card_id": "CARD-LG", "num_adults": 4, "num_children": 5, "catchment_area": True},
        )
        assert response.status_code == 201
        assert response.data["balance"] == "312.00"

    def test_lookup_by_card(self, api_client):
        NeighbourFactory(card_id="RFID-LOOKUP")
        response = api_client.get("/api/neighbours/lookup/?card_id=RFID-LOOKUP")
        assert response.status_code == 200
        assert response.data["card_id"] == "RFID-LOOKUP"

    def test_lookup_by_card_not_found(self, api_client):
        response = api_client.get("/api/neighbours/lookup/?card_id=NONEXISTENT")
        assert response.status_code == 404

    def test_add_balance(self, api_client):
        neighbour = NeighbourFactory(balance="50.00")
        response = api_client.post(
            f"/api/neighbours/{neighbour.id}/balance/", {"amount": "25.00"}
        )
        assert response.status_code == 200
        assert response.data["balance"] == "75.00"


@pytest.mark.django_db
class TestCartViews:
    def test_create_cart(self, api_client):
        neighbour = NeighbourFactory()
        response = api_client.post("/api/carts/", {"neighbour_id": neighbour.id})
        assert response.status_code == 201
        assert response.data["neighbour"] == neighbour.id

    def test_add_item_to_cart(self, api_client, admin_user):
        neighbour = NeighbourFactory()
        cart = CartFactory(neighbour=neighbour, admin=admin_user)
        item = ItemFactory(stock_count=10)
        response = api_client.post(
            f"/api/carts/{cart.id}/items/",
            {"item_id": item.id, "quantity": 2},
        )
        assert response.status_code == 200
        assert len(response.data["items"]) == 1

    def test_checkout(self, api_client, admin_user):
        neighbour = NeighbourFactory(balance="100.00")
        cart = CartFactory(neighbour=neighbour, admin=admin_user)
        item = ItemFactory(cost="10.00", stock_count=20)
        CartItemFactory(cart=cart, item=item, quantity=2)

        response = api_client.post(f"/api/carts/{cart.id}/checkout/")
        assert response.status_code == 200
        assert response.data["total_amount"] == "20.00"

    def test_cancel_cart(self, api_client, admin_user):
        neighbour = NeighbourFactory()
        cart = CartFactory(neighbour=neighbour, admin=admin_user)
        response = api_client.delete(f"/api/carts/{cart.id}/")
        assert response.status_code == 204


@pytest.mark.django_db
class TestTransactionViews:
    def test_list_transactions(self, api_client, admin_user):
        neighbour = NeighbourFactory(balance="100.00")
        cart = CartFactory(neighbour=neighbour, admin=admin_user)
        item = ItemFactory(cost="5.00", stock_count=10)
        CartItemFactory(cart=cart, item=item, quantity=1)
        from core.services import checkout_service
        checkout_service.process_checkout(cart.id)

        response = api_client.get("/api/transactions/")
        assert response.status_code == 200
        assert len(response.data) == 1


@pytest.mark.django_db
class TestReportViews:
    def test_items_sold_report_requires_auth(self, unauthenticated_client):
        response = unauthenticated_client.get(
            "/api/reports/items-sold/?start_date=2026-06-01&end_date=2026-06-10"
        )
        assert response.status_code == 403

    def test_items_sold_report_missing_dates(self, api_client):
        response = api_client.get("/api/reports/items-sold/")
        assert response.status_code == 400

    def test_items_sold_report_invalid_date_format(self, api_client):
        response = api_client.get(
            "/api/reports/items-sold/?start_date=invalid&end_date=2026-06-10"
        )
        assert response.status_code == 400

    def test_items_sold_report_returns_data(self, api_client, admin_user):
        item = ItemFactory(cost="5.00", stock_count=20)
        txn = TransactionFactory(admin=admin_user, total="10.00")
        TransactionItemFactory(
            transaction=txn, item=item, item_name=item.name,
            unit_cost=item.cost, quantity=2, line_total="10.00",
        )

        today = timezone.localdate().isoformat()
        response = api_client.get(
            f"/api/reports/items-sold/?start_date={today}&end_date={today}"
        )
        assert response.status_code == 200
        assert "items" in response.data
        assert "totals" in response.data
        assert len(response.data["items"]) == 1
        assert response.data["items"][0]["item_name"] == item.name
        assert response.data["items"][0]["total_quantity_sold"] == 2
        assert response.data["items"][0]["current_stock"] == 20

    def test_items_sold_report_filters_by_date(self, api_client, admin_user):
        item = ItemFactory(cost="5.00", stock_count=20)
        txn = TransactionFactory(admin=admin_user, total="5.00")
        TransactionItemFactory(
            transaction=txn, item=item, item_name=item.name,
            unit_cost=item.cost, quantity=1, line_total="5.00",
        )
        from core.models import Transaction as TxnModel
        TxnModel.objects.filter(id=txn.id).update(
            created_at=timezone.now() - timedelta(days=10)
        )

        today = timezone.localdate().isoformat()
        response = api_client.get(
            f"/api/reports/items-sold/?start_date={today}&end_date={today}"
        )
        assert response.status_code == 200
        assert len(response.data["items"]) == 0


@pytest.mark.django_db
class TestHealthCheck:
    def test_health_check(self, unauthenticated_client):
        response = unauthenticated_client.get("/api/health/")
        assert response.status_code == 200
        assert response.data["status"] == "healthy"


@pytest.mark.django_db
class TestTransactionUndoView:
    def test_undo_endpoint_success(self, api_client, admin_user):
        neighbour = NeighbourFactory(balance="50.00")
        txn = TransactionFactory(neighbour=neighbour, admin=admin_user, total="20.00")

        response = api_client.post(f"/api/transactions/{txn.id}/undo/")

        assert response.status_code == 200
        assert response.data["status"] == "undone"
        assert response.data["can_undo"] is False
        neighbour.refresh_from_db()
        assert neighbour.balance == 70

    def test_undo_already_undone_returns_400(self, api_client, admin_user):
        neighbour = NeighbourFactory(balance="50.00")
        txn = TransactionFactory(neighbour=neighbour, admin=admin_user, total="10.00")

        api_client.post(f"/api/transactions/{txn.id}/undo/")
        response = api_client.post(f"/api/transactions/{txn.id}/undo/")

        assert response.status_code == 400
        assert "already been undone" in response.data["detail"]

    def test_undo_unauthenticated_returns_403(self, unauthenticated_client):
        txn = TransactionFactory(total="10.00")

        response = unauthenticated_client.post(f"/api/transactions/{txn.id}/undo/")

        assert response.status_code == 403

    def test_transaction_list_includes_status(self, api_client, admin_user):
        TransactionFactory(admin=admin_user, total="10.00")

        response = api_client.get("/api/transactions/")

        assert response.status_code == 200
        assert "status" in response.data[0]
        assert response.data[0]["status"] == "completed"

    def test_transaction_detail_includes_can_undo(self, api_client, admin_user):
        txn = TransactionFactory(admin=admin_user, total="10.00")

        response = api_client.get(f"/api/transactions/{txn.id}/")

        assert response.status_code == 200
        assert "can_undo" in response.data
        assert response.data["can_undo"] is True
