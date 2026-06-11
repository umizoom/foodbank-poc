import factory
from django.contrib.auth import get_user_model

from core.models import Cart, CartItem, Category, Item, Neighbour, Transaction, TransactionItem

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"admin{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@test.com")
    password = factory.PostGenerationMethodCall("set_password", "testpass123")


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f"Category {n}")


class ItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Item

    name = factory.Sequence(lambda n: f"Item {n}")
    category = factory.SubFactory(CategoryFactory)
    cost = factory.Faker("pydecimal", left_digits=2, right_digits=2, positive=True)
    stock_count = 50
    low_stock_threshold = 10


class NeighbourFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Neighbour

    name = factory.Faker("name")
    card_id = factory.Sequence(lambda n: f"CARD-{n:04d}")
    balance = "100.00"


class CartFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Cart

    neighbour = factory.SubFactory(NeighbourFactory)
    admin = factory.SubFactory(UserFactory)


class CartItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = CartItem

    cart = factory.SubFactory(CartFactory)
    item = factory.SubFactory(ItemFactory)
    quantity = 1


class TransactionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Transaction

    neighbour = factory.SubFactory(NeighbourFactory)
    admin = factory.SubFactory(UserFactory)
    total = "10.00"


class TransactionItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TransactionItem

    transaction = factory.SubFactory(TransactionFactory)
    item = factory.SubFactory(ItemFactory)
    item_name = factory.LazyAttribute(lambda obj: obj.item.name)
    unit_cost = factory.LazyAttribute(lambda obj: obj.item.cost)
    quantity = 1
    line_total = factory.LazyAttribute(lambda obj: obj.unit_cost * obj.quantity)
