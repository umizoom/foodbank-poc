from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from core.models import Category, Client

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
