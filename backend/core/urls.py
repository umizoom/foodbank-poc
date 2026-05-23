from django.urls import include, path
from rest_framework.routers import DefaultRouter

from core.views import (
    CartViewSet,
    CategoryViewSet,
    ClientViewSet,
    ItemViewSet,
    LoginView,
    LogoutView,
    SessionView,
    TransactionViewSet,
    health_check,
)

router = DefaultRouter()
router.register(r"categories", CategoryViewSet)
router.register(r"items", ItemViewSet)
router.register(r"clients", ClientViewSet)
router.register(r"carts", CartViewSet)
router.register(r"transactions", TransactionViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/session/", SessionView.as_view(), name="session"),
    path("health/", health_check, name="health-check"),
]
