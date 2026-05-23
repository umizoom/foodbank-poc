from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from core.models import Category

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
        self._create_admin(options["admin-password"])
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
