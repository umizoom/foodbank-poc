# Backend Code Summary

## Files Created

### Project Configuration
- `backend/manage.py` — Django management entry point
- `backend/pytest.ini` — pytest configuration
- `backend/requirements/base.txt` — Production dependencies
- `backend/requirements/dev.txt` — Development/test dependencies
- `backend/requirements/prod.txt` — Production-only dependencies
- `backend/config/__init__.py`
- `backend/config/settings/__init__.py`
- `backend/config/settings/base.py` — Shared Django settings
- `backend/config/settings/dev.py` — Development overrides
- `backend/config/settings/prod.py` — Production overrides
- `backend/config/urls.py` — Root URL configuration
- `backend/config/wsgi.py` — WSGI entry point

### Application Code
- `backend/core/__init__.py`
- `backend/core/models.py` — 9 models (Category, Item, Client, BalanceLog, Cart, CartItem, Transaction, TransactionItem, LoginAttempt)
- `backend/core/serializers.py` — 14 serializers for API validation/response
- `backend/core/views.py` — 6 viewsets/views + health check
- `backend/core/urls.py` — DRF router + custom URL patterns
- `backend/core/permissions.py` — IsAdminAuthenticated permission
- `backend/core/middleware.py` — RequestID + RequestLogging middleware
- `backend/core/exceptions.py` — Business exceptions + global handler
- `backend/core/services/__init__.py`
- `backend/core/services/auth_service.py` — Login, logout, lockout
- `backend/core/services/inventory_service.py` — Item CRUD, stock management
- `backend/core/services/client_service.py` — Client registration, balance
- `backend/core/services/checkout_service.py` — Cart + checkout workflow

### Management Commands
- `backend/core/management/commands/seed_data.py` — Create default admin + categories

### Tests
- `backend/core/tests/conftest.py` — Shared fixtures
- `backend/core/tests/factories.py` — factory-boy model factories
- `backend/core/tests/test_models.py` — Model constraint tests
- `backend/core/tests/test_services.py` — Service layer business logic tests
- `backend/core/tests/test_views.py` — API integration tests
- `backend/core/tests/test_properties.py` — Hypothesis property-based tests

## How to Run

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py seed_data --admin-password changeme
python manage.py runserver
```

## How to Test

```bash
cd backend
pytest
pytest --cov=core
```

## API Base URL
- Development: http://localhost:8000/api/
- Health check: http://localhost:8000/api/health/
