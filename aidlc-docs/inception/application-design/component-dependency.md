# Component Dependencies

## Backend Dependency Matrix

| Component | Depends On | Depended By |
|---|---|---|
| Models | Django ORM | All services, serializers |
| Serializers | Models | ViewSets |
| ViewSets | Serializers, Services, Permissions | URL Router |
| AuthService | User model, Session framework | ViewSets (login/logout) |
| InventoryService | Item model, Category model | ViewSets, CheckoutService |
| ClientService | Client model, BalanceLog model | ViewSets, CheckoutService |
| CheckoutService | Cart/CartItem models, ClientService, InventoryService, Transaction models | ViewSets |
| Permissions | AuthService (session validation) | ViewSets |

## Dependency Flow Diagram

```
+------------------+
|    URL Router    |
+--------+---------+
         |
         v
+------------------+     +------------------+
|    ViewSets      | --> |   Permissions    |
+--------+---------+     +--------+---------+
         |                        |
         v                        v
+------------------+     +------------------+
|   Serializers    |     |   AuthService    |
+--------+---------+     +------------------+
         |
         v
+------------------+
|    Services      |
+--------+---------+
         |
    +----+----+----+
    |         |    |
    v         v    v
+-------+ +------+ +--------+
|Checkout| |Inven | |Client  |
|Service | |tory  | |Service |
+---+---+  |Svc   | +---+----+
    |      +------+     |
    |         |         |
    v         v         v
+------------------+
|     Models       |
|  (Django ORM)    |
+------------------+
         |
         v
+------------------+
|     SQLite       |
+------------------+
```

## Frontend Dependency Matrix

| Component | Depends On | Depended By |
|---|---|---|
| API Client (shared) | Auth Context (for tokens) | All feature modules |
| Auth Context | API Client | App root, Protected routes |
| Auth Feature | Auth Context, API Client, Shared UI | App router |
| Inventory Feature | API Client, Shared UI | App router |
| Clients Feature | API Client, Shared UI | App router |
| Checkout Feature | API Client, Checkout Context, Shared UI | App router |
| Transactions Feature | API Client, Shared UI | App router |
| Shared UI | None | All features |

## Frontend Data Flow

```
+------------------+
|   App Router     |
+--------+---------+
         |
    +----+----+----+----+----+
    |    |    |    |    |    |
    v    v    v    v    v    v
+----+ +---+ +---+ +----+ +----+
|Auth| |Inv| |Cli| |Chk | |Txn |
+----+ +---+ +---+ +--+-+ +----+
    |    |    |       |       |
    v    v    v       v       v
+----------------------------------+
|         API Client (shared)      |
+----------------------------------+
                |
                v (HTTP/REST)
+----------------------------------+
|       Django Backend API         |
+----------------------------------+
```

## Communication Patterns

### Frontend to Backend
- **Protocol**: REST over HTTP (JSON)
- **Authentication**: Session cookie (HttpOnly, Secure, SameSite)
- **Error handling**: Standard HTTP status codes (400, 401, 403, 404, 500)
- **CORS**: Restricted to frontend origin only

### Backend Internal
- **Service-to-Service**: Direct Python method calls (same process)
- **Data access**: Django ORM queries
- **Transactions**: Django `@transaction.atomic` for multi-model operations
- **Concurrency**: F() expressions for atomic field updates (stock counts, balances)

## Data Flow: Checkout (Critical Path)

```
Frontend                Backend
   |                      |
   |-- POST /carts/ ---->|  (create cart for client)
   |<-- 201 cart --------|
   |                      |
   |-- POST /carts/      |
   |   {id}/items/ ----->|  (add item to cart)
   |<-- 200 cart item ---|  (validates stock > 0)
   |                      |
   |-- POST /carts/      |
   |   {id}/checkout/ -->|  (process checkout)
   |                      |--- BEGIN TRANSACTION
   |                      |--- Check balance >= total
   |                      |--- Deduct client balance
   |                      |--- Decrement stock per item
   |                      |--- Create Transaction record
   |                      |--- Delete cart
   |                      |--- COMMIT
   |<-- 200 transaction -|
   |                      |
```
