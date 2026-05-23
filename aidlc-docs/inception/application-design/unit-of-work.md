# Units of Work

## Unit 1: Backend API

**Name**: `backend`
**Type**: Service (independently deployable)
**Technology**: Django 5.x + Django REST Framework
**Database**: SQLite (migration-ready for PostgreSQL)

### Responsibilities
- All REST API endpoints (auth, items, categories, clients, carts, transactions)
- Business logic via service layer (CheckoutService, InventoryService, ClientService, AuthService)
- Data models and ORM layer
- Input validation via serializers
- Authentication and session management
- Database migrations and seed data (initial admin user, default categories)
- Structured logging

### Code Organization
```
backend/
+-- manage.py
+-- config/
|   +-- __init__.py
|   +-- settings.py
|   +-- urls.py
|   +-- wsgi.py
+-- core/
|   +-- __init__.py
|   +-- models.py
|   +-- serializers.py
|   +-- views.py
|   +-- urls.py
|   +-- permissions.py
|   +-- services/
|   |   +-- __init__.py
|   |   +-- checkout_service.py
|   |   +-- inventory_service.py
|   |   +-- client_service.py
|   |   +-- auth_service.py
|   +-- management/
|   |   +-- commands/
|   |       +-- seed_data.py
|   +-- tests/
|   |   +-- __init__.py
|   |   +-- test_models.py
|   |   +-- test_services.py
|   |   +-- test_views.py
|   |   +-- test_properties.py
|   +-- migrations/
+-- requirements.txt
```

### Build Order: 1 (No dependencies on other units)

---

## Unit 2: Frontend SPA

**Name**: `frontend`
**Type**: Service (independently deployable)
**Technology**: React 18 + TypeScript + Vite

### Responsibilities
- Admin UI for all system operations
- Authentication flow (login/logout)
- Inventory management pages
- Client management pages
- Checkout workflow with RFID simulation
- Transaction history viewing
- Low-stock visual indicators
- API communication with backend

### Code Organization
```
frontend/
+-- package.json
+-- tsconfig.json
+-- vite.config.ts
+-- index.html
+-- src/
|   +-- main.tsx
|   +-- App.tsx
|   +-- auth/
|   |   +-- LoginPage.tsx
|   |   +-- AuthContext.tsx
|   |   +-- ProtectedRoute.tsx
|   +-- inventory/
|   |   +-- InventoryListPage.tsx
|   |   +-- ItemForm.tsx
|   |   +-- CategoryManager.tsx
|   |   +-- StockUpdater.tsx
|   +-- clients/
|   |   +-- ClientListPage.tsx
|   |   +-- ClientForm.tsx
|   |   +-- ClientDetail.tsx
|   |   +-- AddBalance.tsx
|   +-- checkout/
|   |   +-- CheckoutPage.tsx
|   |   +-- CardSimulator.tsx
|   |   +-- ItemBrowser.tsx
|   |   +-- Cart.tsx
|   |   +-- CheckoutContext.tsx
|   +-- transactions/
|   |   +-- TransactionListPage.tsx
|   |   +-- TransactionDetail.tsx
|   +-- shared/
|       +-- api.ts
|       +-- types.ts
|       +-- Layout.tsx
|       +-- Navigation.tsx
|       +-- components/
```

### Build Order: 2 (Depends on Backend API being defined/stable)

---

## Unit 3: Docker / Orchestration

**Name**: `docker`
**Type**: Infrastructure configuration
**Technology**: Docker, Docker Compose

### Responsibilities
- Dockerfile for backend (Python/Django)
- Dockerfile for frontend (Node build + nginx serve)
- docker-compose.yml orchestrating both services
- Environment variable configuration
- Volume mounts for SQLite persistence
- Network configuration between containers

### Code Organization
```
(project root)
+-- docker-compose.yml
+-- backend/
|   +-- Dockerfile
+-- frontend/
|   +-- Dockerfile
|   +-- nginx.conf
+-- .env.example
```

### Build Order: 3 (Depends on both Backend and Frontend being complete)

---

## Execution Sequence

| Order | Unit | Depends On | Construction Stages |
|---|---|---|---|
| 1 | Backend API | None | Functional Design, NFR Requirements, NFR Design, Code Generation |
| 2 | Frontend SPA | Backend API (contract) | Functional Design, NFR Requirements, NFR Design, Code Generation |
| 3 | Docker | Backend + Frontend | Code Generation only |
