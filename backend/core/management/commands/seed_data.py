from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from core.models import Category, Client, Item

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
            {"name": "Maria Garcia", "card_id": "CARD-001", "balance": Decimal("150.00")},
            {"name": "James Wilson", "card_id": "CARD-002", "balance": Decimal("75.00")},
            {"name": "Sarah Johnson", "card_id": "CARD-003", "balance": Decimal("200.00")},
            {"name": "David Lee", "card_id": "CARD-004", "balance": Decimal("50.00")},
            {"name": "Emma Brown", "card_id": "CARD-005", "balance": Decimal("120.00")},
        ]
        created_count = 0
        for client_data in default_clients:
            _, created = Client.objects.get_or_create(
                card_id=client_data["card_id"],
                defaults={"name": client_data["name"], "balance": client_data["balance"]},
            )
            if created:
                created_count += 1
        self.stdout.write(f"Clients: {created_count} created, {len(default_clients) - created_count} already existed")
