# Backend Code Generation Plan

## Unit Context
- **Unit**: Backend API
- **Technology**: Python 3.13, Django 5.x, DRF, SQLite
- **Workspace Root**: /workshop/foodbank-site
- **Code Location**: /workshop/foodbank-site/backend/
- **Stories**: All 23 user stories (backend implementation)
- **Dependencies**: None (first unit)

## Generation Sequence

### Step 1: Project Structure Setup
- [x] Create `backend/` directory structure
- [x] Create `manage.py`
- [x] Create `config/` package (settings, urls, wsgi)
- [x] Create `config/settings/` (base.py, dev.py, prod.py)
- [x] Create `core/` app package structure
- [x] Create `requirements/` (base.txt, dev.txt, prod.txt)
- [x] Create `pytest.ini`

### Step 2: Django Settings & Configuration
- [x] Implement `config/settings/base.py` (INSTALLED_APPS, MIDDLEWARE, REST_FRAMEWORK, LOGGING, SESSION, AUTH, CORS)
- [x] Implement `config/settings/dev.py` (DEBUG, SQLite path, dev CORS)
- [x] Implement `config/settings/prod.py` (env vars, security settings)
- [x] Implement `config/urls.py` (root URL config)
- [x] Implement `config/wsgi.py`

### Step 3: Models
- [x] Implement `core/models.py` (Category, Item, Client, BalanceLog, Cart, CartItem, Transaction, TransactionItem, LoginAttempt)
- [x] Define all fields, constraints, indexes, and relationships per domain-entities.md
- **Stories**: US-2.1, US-2.6, US-3.1, US-4.2, US-5.1, US-6.2

### Step 4: Custom Exceptions
- [x] Implement `core/exceptions.py` (InsufficientBalanceError, InsufficientStockError, AccountLockedError, CartNotFoundError, global exception handler)
- **Stories**: US-4.4 (checkout errors)

### Step 5: Middleware
- [x] Implement `core/middleware.py` (RequestIDMiddleware, RequestLoggingMiddleware)
- **Stories**: US-1.3 (session timeout support)

### Step 6: Permissions
- [x] Implement `core/permissions.py` (IsAdminAuthenticated permission class)
- **Stories**: US-1.1 (auth required)

### Step 7: Services — AuthService
- [x] Implement `core/services/auth_service.py` (authenticate, logout, check_lockout, record_failed_attempt)
- **Stories**: US-1.1, US-1.2, US-1.3

### Step 8: Services — InventoryService
- [x] Implement `core/services/inventory_service.py` (create_item, update_item, delete_item, update_stock, get_low_stock_items, get_low_stock_count)
- **Stories**: US-2.1, US-2.2, US-2.3, US-2.5, US-6.1

### Step 9: Services — ClientService
- [x] Implement `core/services/client_service.py` (register_client, add_balance, get_by_card_id, update_client)
- **Stories**: US-3.1, US-3.4, US-3.5, US-4.1

### Step 10: Services — CheckoutService
- [x] Implement `core/services/checkout_service.py` (create_cart, add_to_cart, remove_from_cart, update_cart_quantity, get_cart_summary, process_checkout, cancel_cart)
- **Stories**: US-4.1, US-4.2, US-4.3, US-4.4, US-4.5

### Step 11: Serializers
- [x] Implement `core/serializers.py` (CategorySerializer, ItemSerializer, ClientSerializer, BalanceAddSerializer, CartSerializer, CartItemSerializer, TransactionSerializer, TransactionItemSerializer, LoginSerializer)
- **Stories**: All (input validation)

### Step 12: Views
- [x] Implement `core/views.py` (CategoryViewSet, ItemViewSet, ClientViewSet, CartViewSet, TransactionViewSet, LoginView, LogoutView, SessionView, HealthCheckView)
- **Stories**: All

### Step 13: URL Configuration
- [x] Implement `core/urls.py` (DRF router registration, custom URL patterns)
- **Stories**: All (API routing)

### Step 14: Database Migrations
- [x] Generate initial migration via Django makemigrations
- **Stories**: All (data model foundation)

### Step 15: Seed Data Command
- [x] Implement `core/management/commands/seed_data.py` (create default admin, default categories)
- **Stories**: US-1.1 (default admin), US-2.6 (default categories)

### Step 16: Unit Tests — Models
- [x] Implement `core/tests/conftest.py` (pytest fixtures, factory setup)
- [x] Implement `core/tests/factories.py` (model factories using factory-boy)
- [x] Implement `core/tests/test_models.py` (model validation, constraints, relationships)

### Step 17: Unit Tests — Services
- [x] Implement `core/tests/test_services.py` (CheckoutService, InventoryService, ClientService, AuthService)
- [x] Test business rules: balance deduction, stock decrement, lockout logic, cart management

### Step 18: Unit Tests — Views (API Integration)
- [x] Implement `core/tests/test_views.py` (endpoint tests via DRF APIClient)
- [x] Test auth flows, CRUD operations, checkout workflow, error responses

### Step 19: Property-Based Tests
- [x] Implement `core/tests/test_properties.py` (Hypothesis tests for balance calculations, cart total computation)
- **Extension**: Property-based testing (partial — pure functions)

### Step 20: Documentation Summary
- [x] Create `aidlc-docs/construction/backend/code/code-summary.md` (files created, structure, how to run)
