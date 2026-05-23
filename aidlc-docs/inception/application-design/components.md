# Application Components

## Backend Components (Django — Single App: `core`)

### BE-01: Models Layer
**Purpose**: Define database schema and data access
**Responsibilities**:
- Define all data models (Category, Item, Client, AdminUser, Cart, CartItem, Transaction, TransactionItem, BalanceLog)
- Provide model-level validation
- Define relationships and constraints

### BE-02: Serializers Layer
**Purpose**: API request/response serialization and validation
**Responsibilities**:
- Validate incoming request data (type, length, format)
- Serialize model instances to JSON responses
- Handle nested representations (e.g., transaction with items)

### BE-03: Views Layer (ViewSets)
**Purpose**: Handle HTTP requests and route to services
**Responsibilities**:
- Define REST endpoints via DRF ViewSets/APIViews
- Apply authentication and permission checks
- Delegate business logic to services layer
- Return appropriate HTTP responses

### BE-04: Services Layer
**Purpose**: Encapsulate business logic and orchestration
**Responsibilities**:
- Checkout processing (balance check, atomic deduction + stock decrement)
- Cart management (add/remove items, validate stock availability)
- Balance operations (add balance with audit logging)
- Stock management (restock, threshold checking)

### BE-05: Authentication & Permissions
**Purpose**: Secure all endpoints and manage sessions
**Responsibilities**:
- Admin login/logout with session management
- Session timeout handling
- Brute-force protection (account lockout)
- Permission classes for admin-only access

### BE-06: URL Configuration
**Purpose**: Map REST endpoints to views
**Responsibilities**:
- Register DRF router with resource-based URLs
- Define URL patterns for all API endpoints

---

## Frontend Components (React TypeScript — Feature-Based)

### FE-01: Auth Feature (`/auth`)
**Purpose**: Admin login/logout UI
**Responsibilities**:
- Login page with form validation
- Auth context provider (session state)
- Protected route wrapper
- Logout functionality

### FE-02: Inventory Feature (`/inventory`)
**Purpose**: Inventory CRUD and stock management UI
**Responsibilities**:
- Inventory list page with search and category filter
- Add/edit item forms
- Stock update interface
- Low-stock visual indicators
- Category management

### FE-03: Clients Feature (`/clients`)
**Purpose**: Client management UI
**Responsibilities**:
- Client list page with search
- Client registration form
- Client detail view (balance, recent transactions)
- Add balance interface
- Edit client form

### FE-04: Checkout Feature (`/checkout`)
**Purpose**: Cart-based checkout workflow UI
**Responsibilities**:
- RFID card simulation (input/button)
- Item browsing and cart building
- Cart display with running total and balance comparison
- Checkout confirmation/rejection handling
- Cancel checkout

### FE-05: Transactions Feature (`/transactions`)
**Purpose**: Transaction history viewing
**Responsibilities**:
- Transaction list with filters (date, client)
- Transaction detail view with line items

### FE-06: Shared (`/shared`)
**Purpose**: Common UI components and utilities
**Responsibilities**:
- API client (axios/fetch wrapper)
- Common UI components (buttons, forms, modals, alerts)
- Layout components (navigation, sidebar, page wrapper)
- Type definitions shared across features
