# Requirements Document: Food Bank Inventory Management System

## Intent Analysis

- **User Request**: Build an inventory management system for a food bank with item tracking, client balance management, RFID card simulation, and admin/client roles.
- **Request Type**: New Project (Greenfield)
- **Scope Estimate**: Multiple Components (Django backend + React frontend + SQLite database)
- **Complexity Estimate**: Moderate (multi-role system with real currency tracking, cart workflow, and REST API)

---

## Functional Requirements

### FR-01: Inventory Management
- Admins can add, edit, and remove inventory items
- Each item has: name, category, cost (real currency), and stock count
- Items are organized into categories (e.g., Dairy, Bakery, Produce, Proteins, Pantry)
- System alerts admins when stock falls below a configurable low-stock threshold
- Admins can update stock quantities (restock or adjust)

### FR-02: Client Management
- Admins can register new clients in the system
- Each client has a profile linked to a unique RFID card ID
- Client balance (real currency, e.g., CAD) is stored server-side in the system
- Admins can add balance to client accounts
- Admins can view client list and individual client details

### FR-03: Shopping / Checkout Workflow
- Admin operates the checkout station (no client self-service UI)
- Admin scans/simulates RFID card to identify client and load their profile
- Admin adds items to a cart for the client
- System displays running cart total and client's available balance
- On checkout: if balance is sufficient, deduct total from client balance and decrement inventory
- On checkout: if balance is insufficient, reject the entire transaction — admin can remove items and retry
- Successful checkout decrements stock count for each item purchased

### FR-04: RFID Card Simulation
- Each client is associated with a unique card ID
- For MVP: a "Simulate Card Tap" button allows admin to enter/select a card ID
- Balance is stored in the system (not on the card)
- Card tap identifies the client; no PIN required

### FR-05: Transaction History
- All successful checkouts are logged as transactions
- Transaction records include: client, items purchased, quantities, individual costs, total, timestamp
- Transaction history is viewable by admins only
- Clients do not have access to view their own history (future enhancement)

### FR-06: User Authentication and Roles
- Two roles: Admin and Client (client is a data record, not a system user)
- Admin authenticates via username and password
- Only authenticated admins can access the system UI
- SSO is a future enhancement (not in scope for MVP)

### FR-07: Low Stock Alerts
- Each item has a configurable low-stock threshold
- When stock falls at or below the threshold, the item is flagged/highlighted in the admin inventory view
- Dashboard or indicator showing items that need restocking

---

## Non-Functional Requirements

### NFR-01: Technology Stack
- **Backend**: Django (Python) with Django REST Framework
- **Frontend**: TypeScript + React (communicates with backend via REST API)
- **Database**: SQLite for development/MVP (designed for easy migration to PostgreSQL later)
- **Containerization**: Docker images for both frontend and backend to ease cloud deployment

### NFR-02: Scale and Performance
- Medium scale: 3-5 concurrent admin users, up to 50 client transactions per day
- Response times under 500ms for typical operations
- SQLite is acceptable at this scale

### NFR-03: Deployment
- Initial deployment: local machine (development/demo)
- Dockerized for future cloud deployment
- Design with environment-based configuration (dev/staging/production)

### NFR-04: Security (Extension Enabled)
- SECURITY rules enforced as blocking constraints
- Admin authentication with password hashing (adaptive algorithm)
- Session management with secure cookie attributes
- Input validation on all API endpoints
- No hardcoded credentials
- CORS restricted to allowed origins
- Rate limiting on login endpoints
- Structured logging (no PII in logs)

### NFR-05: Testing
- Property-based testing (partial): enforced for pure functions and serialization round-trips
- Unit tests for business logic (balance calculations, cart operations, stock management)
- Integration tests for API endpoints

### NFR-06: Data Integrity
- Balance operations must be atomic (no partial deductions)
- Stock decrements must be atomic with checkout
- Transaction records are immutable once created

---

## Architecture Overview

```
+-------------------+         REST API         +-------------------+
|                   | <-----------------------> |                   |
|   React Frontend  |         (JSON)           |   Django Backend  |
|   (TypeScript)    |                          |   (DRF)           |
|                   |                          |                   |
+-------------------+                          +--------+----------+
                                                        |
                                                        | ORM
                                                        v
                                               +-------------------+
                                               |     SQLite        |
                                               |   (MVP / Dev)     |
                                               +-------------------+
```

---

## Data Model Summary

| Entity | Key Fields |
|---|---|
| Category | id, name |
| Item | id, name, category_fk, cost, stock_count, low_stock_threshold |
| Client | id, name, card_id (unique), balance |
| Admin User | id, username, password_hash, email |
| Transaction | id, client_fk, admin_fk, total, timestamp |
| TransactionItem | id, transaction_fk, item_fk, quantity, unit_cost |

---

## Out of Scope (Future Enhancements)
- Client self-service portal (view balance, history)
- SSO / MFA authentication
- Real RFID hardware integration
- Cloud deployment infrastructure
- Reporting and analytics dashboards
- Multi-location food bank support
- Barcode scanning for items

---

## Extension Configuration

| Extension | Enabled | Decided At |
|---|---|---|
| Security Baseline | Yes | Requirements Analysis |
| Property-Based Testing | Partial (pure functions + serialization) | Requirements Analysis |
