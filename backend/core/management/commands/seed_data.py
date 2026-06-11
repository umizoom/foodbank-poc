from datetime import timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Category, Client, Item, Transaction, TransactionItem

User = get_user_model()

DEFAULT_CATEGORIES = [
    "Dairy",
    "Bakery",
    "Produce",
    "Proteins",
    "Pantry",
    "Beverages",
    "Frozen",
    "Snacks",
]


class Command(BaseCommand):
    help = "Seed the database with default categories and admin user"

    def add_arguments(self, parser):
        parser.add_argument(
            "--admin-password",
            type=str,
            default="admin123",
            help="Password for the default admin user",
        )

    def handle(self, *args, **options):
        self._create_categories()
        self._create_items()
        self._create_admin(options["admin_password"])
        self._create_clients()
        self._create_transactions()
        self.stdout.write(self.style.SUCCESS("Seed data created successfully"))

    def _create_categories(self):
        created_count = 0
        for name in DEFAULT_CATEGORIES:
            _, created = Category.objects.get_or_create(name=name)
            if created:
                created_count += 1
        self.stdout.write(f"Categories: {created_count} created, {len(DEFAULT_CATEGORIES) - created_count} already existed")

    def _create_items(self):
        items_by_category = {
            "Dairy": [
                {"name": "Whole Milk", "cost": Decimal("4.49"), "stock_count": 40},
                {"name": "Cheddar Cheese", "cost": Decimal("5.99"), "stock_count": 30},
                {"name": "Greek Yogurt", "cost": Decimal("3.49"), "stock_count": 45},
                {"name": "Butter", "cost": Decimal("4.99"), "stock_count": 35},
            ],
            "Bakery": [
                {"name": "White Bread", "cost": Decimal("2.99"), "stock_count": 50},
                {"name": "Whole Wheat Bread", "cost": Decimal("3.49"), "stock_count": 40},
                {"name": "Bagels", "cost": Decimal("4.29"), "stock_count": 30},
                {"name": "Croissants", "cost": Decimal("3.99"), "stock_count": 25},
            ],
            "Produce": [
                {"name": "Bananas", "cost": Decimal("1.29"), "stock_count": 50},
                {"name": "Apples", "cost": Decimal("2.49"), "stock_count": 45},
                {"name": "Carrots", "cost": Decimal("1.99"), "stock_count": 40},
                {"name": "Spinach", "cost": Decimal("3.49"), "stock_count": 30},
            ],
            "Proteins": [
                {"name": "Chicken Breast", "cost": Decimal("8.99"), "stock_count": 25},
                {"name": "Ground Beef", "cost": Decimal("7.49"), "stock_count": 20},
                {"name": "Canned Tuna", "cost": Decimal("2.49"), "stock_count": 50},
                {"name": "Eggs", "cost": Decimal("4.99"), "stock_count": 40},
            ],
            "Pantry": [
                {"name": "Rice", "cost": Decimal("3.99"), "stock_count": 45},
                {"name": "Pasta", "cost": Decimal("1.99"), "stock_count": 50},
                {"name": "Canned Beans", "cost": Decimal("1.49"), "stock_count": 50},
                {"name": "Peanut Butter", "cost": Decimal("4.49"), "stock_count": 35},
            ],
            "Beverages": [
                {"name": "Orange Juice", "cost": Decimal("4.99"), "stock_count": 30},
                {"name": "Coffee", "cost": Decimal("8.99"), "stock_count": 25},
                {"name": "Tea", "cost": Decimal("3.99"), "stock_count": 40},
                {"name": "Apple Juice", "cost": Decimal("3.49"), "stock_count": 35},
            ],
            "Frozen": [
                {"name": "Frozen Peas", "cost": Decimal("2.49"), "stock_count": 40},
                {"name": "Frozen Pizza", "cost": Decimal("5.99"), "stock_count": 25},
                {"name": "Ice Cream", "cost": Decimal("5.49"), "stock_count": 30},
                {"name": "Frozen Berries", "cost": Decimal("4.99"), "stock_count": 35},
            ],
            "Snacks": [
                {"name": "Granola Bars", "cost": Decimal("4.49"), "stock_count": 40},
                {"name": "Crackers", "cost": Decimal("3.29"), "stock_count": 45},
                {"name": "Trail Mix", "cost": Decimal("5.99"), "stock_count": 30},
                {"name": "Popcorn", "cost": Decimal("2.99"), "stock_count": 50},
            ],
        }
        created_count = 0
        total_count = 0
        for category_name, items in items_by_category.items():
            category = Category.objects.get(name=category_name)
            for item_data in items:
                total_count += 1
                _, created = Item.objects.get_or_create(
                    name=item_data["name"],
                    category=category,
                    defaults={
                        "cost": item_data["cost"],
                        "stock_count": item_data["stock_count"],
                        "low_stock_threshold": 10,
                    },
                )
                if created:
                    created_count += 1
        self.stdout.write(f"Items: {created_count} created, {total_count - created_count} already existed")

    def _create_admin(self, password):
        if User.objects.filter(username="admin").exists():
            self.stdout.write("Admin user already exists")
            return
        User.objects.create_superuser(
            username="admin",
            email="admin@foodbank.local",
            password=password,
        )
        self.stdout.write("Admin user created (username: admin)")

    def _create_clients(self):
        default_clients = [
            {
                "name": "Maria Garcia",
                "card_id": "CARD-001",
                "balance": Decimal("150.00"),
                "allergies": ["Lactose free"],
                "notes": "Family of 5. Prefers halal options when available.",
            },
            {
                "name": "James Wilson",
                "card_id": "CARD-002",
                "balance": Decimal("75.00"),
                "diaper_size": "Size 3",
                "notes": "New baby expected July 2026. May need extra formula.",
            },
            {
                "name": "Sarah Johnson",
                "card_id": "CARD-003",
                "balance": Decimal("200.00"),
                "allergies": ["Gluten free", "Lactose free"],
                "notes": "Elderly - needs help carrying bags to car.",
            },
            {
                "name": "David Lee",
                "card_id": "CARD-004",
                "balance": Decimal("50.00"),
            },
            {
                "name": "Emma Brown",
                "card_id": "CARD-005",
                "balance": Decimal("120.00"),
                "diaper_size": "Size 5",
                "notes": "Vegetarian household. Twin toddlers.",
            },
        ]
        created_count = 0
        for client_data in default_clients:
            defaults = {"name": client_data["name"], "balance": client_data["balance"]}
            if "allergies" in client_data:
                defaults["allergies"] = client_data["allergies"]
            if "diaper_size" in client_data:
                defaults["diaper_size"] = client_data["diaper_size"]
            if "notes" in client_data:
                defaults["notes"] = client_data["notes"]
            _, created = Client.objects.update_or_create(
                card_id=client_data["card_id"],
                defaults=defaults,
            )
            if created:
                created_count += 1
        self.stdout.write(f"Clients: {created_count} created, {len(default_clients) - created_count} updated")

    def _create_transactions(self):
        admin = User.objects.filter(username="admin").first()
        if not admin:
            self.stdout.write("Admin user not found, skipping transactions")
            return

        clients = list(Client.objects.all()[:5])
        items = list(Item.objects.all())
        if not clients or not items:
            self.stdout.write("No clients or items found, skipping transactions")
            return

        now = timezone.now()
        transaction_data = [
            {"client_idx": 0, "days_ago": 0, "item_indices": [0, 1, 4], "quantities": [2, 1, 3]},
            {"client_idx": 1, "days_ago": 0, "item_indices": [2, 5], "quantities": [1, 2]},
            {"client_idx": 2, "days_ago": 1, "item_indices": [3, 7, 10], "quantities": [1, 2, 1]},
            {"client_idx": 3, "days_ago": 2, "item_indices": [1, 8], "quantities": [3, 1]},
            {"client_idx": 4, "days_ago": 3, "item_indices": [0, 6, 11], "quantities": [1, 1, 2]},
            {"client_idx": 0, "days_ago": 5, "item_indices": [9, 12], "quantities": [2, 1]},
            {"client_idx": 1, "days_ago": 7, "item_indices": [4, 5, 13], "quantities": [1, 3, 2]},
            {"client_idx": 2, "days_ago": 10, "item_indices": [0, 2, 8], "quantities": [2, 1, 1]},
            {"client_idx": 3, "days_ago": 14, "item_indices": [6, 15], "quantities": [1, 2]},
            {"client_idx": 4, "days_ago": 18, "item_indices": [3, 7, 14], "quantities": [2, 1, 3]},
            {"client_idx": 0, "days_ago": 22, "item_indices": [10, 11, 1], "quantities": [1, 2, 1]},
            {"client_idx": 1, "days_ago": 25, "item_indices": [9, 12, 16], "quantities": [3, 1, 2]},
            {"client_idx": 2, "days_ago": 28, "item_indices": [5, 13], "quantities": [2, 1]},
        ]

        created_count = 0
        for td in transaction_data:
            client = clients[td["client_idx"]]
            txn_items = []
            total = Decimal("0.00")

            for i, item_idx in enumerate(td["item_indices"]):
                if item_idx >= len(items):
                    continue
                item = items[item_idx]
                qty = td["quantities"][i]
                line_total = item.cost * qty
                total += line_total
                txn_items.append((item, qty, line_total))

            if not txn_items:
                continue

            txn = Transaction.objects.create(
                client=client,
                admin=admin,
                total=total,
            )
            Transaction.objects.filter(id=txn.id).update(
                created_at=now - timedelta(days=td["days_ago"])
            )

            for item, qty, line_total in txn_items:
                TransactionItem.objects.create(
                    transaction=txn,
                    item=item,
                    item_name=item.name,
                    unit_cost=item.cost,
                    quantity=qty,
                    line_total=line_total,
                )
            created_count += 1

        self.stdout.write(f"Transactions: {created_count} created")
