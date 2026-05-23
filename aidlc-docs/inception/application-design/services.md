# Service Layer Design

## Overview

The service layer sits between ViewSets and Models, encapsulating all business logic. ViewSets handle HTTP concerns (request parsing, response formatting, permissions). Services handle domain logic (validation rules, atomic operations, state transitions).

## Service Architecture

```
+-------------------+     +-------------------+     +-------------------+
|   ViewSets        | --> |   Services        | --> |   Models (ORM)    |
|   (HTTP layer)    |     |   (Business logic)|     |   (Data access)   |
+-------------------+     +-------------------+     +-------------------+
        |                         |
        v                         v
  Authentication           Django transactions
  Permissions              Atomic operations
  Serialization            Validation rules
  Rate limiting            Orchestration
```

## Service Definitions

### CheckoutService
**File**: `core/services/checkout_service.py`
**Responsibility**: Orchestrate the entire checkout workflow — cart lifecycle, balance validation, atomic checkout processing.

**Key Design Decisions**:
- Cart is persisted server-side (DB-backed) for session recovery
- Checkout is a single atomic database transaction (balance deduct + stock decrement + transaction creation)
- If any step fails (insufficient balance, stock unavailable), entire operation rolls back

**Interactions**:
- Reads/writes Cart, CartItem models
- Reads Client.balance for validation
- Writes Transaction, TransactionItem on success
- Decrements Item.stock_count on success
- Updates Client.balance on success

### InventoryService
**File**: `core/services/inventory_service.py`
**Responsibility**: Item CRUD, stock management, low-stock detection.

**Key Design Decisions**:
- Stock updates are atomic (F expressions for concurrency safety)
- Low-stock threshold is per-item configurable
- Deletion preserves referential integrity with transactions

**Interactions**:
- Reads/writes Item, Category models
- Referenced by CheckoutService for stock validation

### ClientService
**File**: `core/services/client_service.py`
**Responsibility**: Client registration, balance management, card lookup.

**Key Design Decisions**:
- Balance additions are logged (BalanceLog) for audit trail
- Card ID uniqueness enforced at DB level
- Balance is a decimal field (CAD currency, 2 decimal places)

**Interactions**:
- Reads/writes Client model
- Writes BalanceLog for balance additions
- Referenced by CheckoutService for balance validation

### AuthService
**File**: `core/services/auth_service.py`
**Responsibility**: Authentication, session management, brute-force protection.

**Key Design Decisions**:
- Uses Django's built-in session framework
- Failed login attempts tracked per username
- Account lockout after 5 failures (15-minute window)
- Session timeout at 30 minutes of inactivity

**Interactions**:
- Reads/writes Django User model (admin accounts)
- Manages Django sessions
- Tracks login attempts (in-memory or model-backed)

## Service Communication Rules

1. **ViewSets call Services** — never access models directly for business operations
2. **Services call Models** — via Django ORM
3. **Services may call other Services** — CheckoutService calls ClientService and InventoryService internally
4. **No circular dependencies** — dependency flows one direction
5. **Transactions at service level** — Django `@transaction.atomic` decorators on service methods that need atomicity
