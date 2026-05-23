# Application Design — Consolidated

## System Overview

The Food Bank Inventory Management System is a two-tier web application:
- **Backend**: Django + Django REST Framework (single `core` app), SQLite database
- **Frontend**: React + TypeScript (feature-based structure), communicates via REST API

## Architecture Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Backend structure | Single Django app (`core`) | Appropriate for project scale; avoids over-engineering |
| API style | Resource-based REST | Standard conventions, predictable URLs |
| Frontend state | React Context + useReducer | Lightweight, no extra dependencies |
| Frontend structure | Feature-based folders | Clear separation of concerns per domain |
| Cart persistence | Backend-managed (DB) | Supports session recovery, single source of truth |

## Component Summary

### Backend (Django `core` app)

| Layer | Components | Responsibility |
|---|---|---|
| Models | Category, Item, Client, Cart, CartItem, Transaction, TransactionItem, BalanceLog | Data schema and access |
| Serializers | Per-model serializers | Request validation, response formatting |
| ViewSets | ItemViewSet, CategoryViewSet, ClientViewSet, CartViewSet, TransactionViewSet, AuthViews | HTTP handling, permissions |
| Services | CheckoutService, InventoryService, ClientService, AuthService | Business logic orchestration |
| Auth | Session middleware, permission classes, lockout tracking | Security |

### Frontend (React TypeScript)

| Feature | Pages / Components | Responsibility |
|---|---|---|
| Auth (`/auth`) | LoginPage, AuthContext, ProtectedRoute | Authentication flow |
| Inventory (`/inventory`) | InventoryListPage, ItemForm, CategoryManager, StockUpdater | Inventory CRUD |
| Clients (`/clients`) | ClientListPage, ClientForm, ClientDetail, AddBalance | Client management |
| Checkout (`/checkout`) | CheckoutPage, CardSimulator, ItemBrowser, Cart, CheckoutConfirm | Checkout workflow |
| Transactions (`/transactions`) | TransactionListPage, TransactionDetail | History viewing |
| Shared (`/shared`) | APIClient, Layout, Navigation, FormComponents, AlertComponents | Common utilities |

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/login/ | Admin login |
| POST | /api/auth/logout/ | Admin logout |
| GET | /api/auth/session/ | Check session |
| GET/POST | /api/categories/ | List/create categories |
| GET/PUT/DELETE | /api/categories/{id}/ | Retrieve/update/delete category |
| GET/POST | /api/items/ | List/create items |
| GET/PUT/PATCH/DELETE | /api/items/{id}/ | Retrieve/update/delete item |
| PATCH | /api/items/{id}/stock/ | Update stock count |
| GET/POST | /api/clients/ | List/create clients |
| GET/PUT/PATCH | /api/clients/{id}/ | Retrieve/update client |
| GET | /api/clients/lookup/ | Look up client by card_id |
| POST | /api/clients/{id}/balance/ | Add balance |
| POST | /api/carts/ | Create cart for client |
| GET | /api/carts/{id}/ | Get cart with items |
| POST | /api/carts/{id}/items/ | Add item to cart |
| PATCH | /api/carts/{id}/items/{item_id}/ | Update cart item quantity |
| DELETE | /api/carts/{id}/items/{item_id}/ | Remove item from cart |
| POST | /api/carts/{id}/checkout/ | Process checkout |
| DELETE | /api/carts/{id}/ | Cancel cart |
| GET | /api/transactions/ | List transactions |
| GET | /api/transactions/{id}/ | Transaction detail |

## Key Design Patterns

1. **Service Layer Pattern**: Business logic isolated in service classes, not in views
2. **Atomic Transactions**: Checkout uses `@transaction.atomic` for data consistency
3. **Context Pattern (Frontend)**: Auth and Checkout state managed via React Context
4. **Protected Routes**: All routes require auth; unauthenticated users redirected to login
5. **Resource-Based REST**: Standard CRUD verbs for predictable API surface
6. **Server-Side Cart**: Cart persisted in DB for reliability and session recovery

## Data Model (High-Level)

```
Category 1---* Item
Client 1---* Cart (active: 0 or 1)
Cart 1---* CartItem *---1 Item
Client 1---* Transaction
Transaction 1---* TransactionItem *---1 Item
Client 1---* BalanceLog
AdminUser 1---* Transaction (processed_by)
AdminUser 1---* BalanceLog (added_by)
```

## Security Design Summary

- All endpoints require authenticated admin session (except login)
- Session cookies: HttpOnly, Secure, SameSite=Lax
- CORS restricted to frontend origin
- Input validation via DRF serializers on all endpoints
- Brute-force protection on login (5 attempts, 15-min lockout)
- Atomic operations prevent partial state corruption
- Balance/stock operations use F() expressions for concurrency safety
