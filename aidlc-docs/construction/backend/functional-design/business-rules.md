# Business Rules — Backend

## BR-01: Balance Management

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-01.1 | Balance is stored as CAD with 2 decimal places | DecimalField(10,2) |
| BR-01.2 | Balance cannot go negative | Check constraint: balance >= 0 |
| BR-01.3 | Single balance addition cannot exceed $2,000.00 | Serializer validation |
| BR-01.4 | Balance addition must be > $0.00 | Serializer validation |
| BR-01.5 | Every balance addition is logged with before/after values | BalanceLog created in same transaction |
| BR-01.6 | Balance deduction only occurs via successful checkout | No direct "subtract balance" endpoint |

---

## BR-02: Checkout Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-02.1 | Checkout requires cart total <= client balance | Service validates before processing |
| BR-02.2 | If balance insufficient, entire transaction is rejected | Atomic transaction — all or nothing |
| BR-02.3 | On successful checkout: deduct balance, decrement stock, create transaction | Single atomic DB transaction |
| BR-02.4 | On checkout failure: no balance change, no stock change, cart remains intact | Transaction rollback |
| BR-02.5 | Cart items with quantity exceeding available stock are rejected at add-time | Validate stock_count >= requested quantity |
| BR-02.6 | Stock is checked again at checkout time (may have changed since cart creation) | Re-validate all items in checkout |
| BR-02.7 | Items with zero stock cannot be added to cart | Validate stock_count > 0 on add |
| BR-02.8 | TransactionItems store snapshot of item name and cost at purchase time | Copy values, not references |

---

## BR-03: Inventory Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-03.1 | Item cost must be > $0.00 | Serializer validation |
| BR-03.2 | Stock count cannot go below 0 | Check constraint + F() expression safety |
| BR-03.3 | Low-stock threshold must be >= 0 | Serializer validation |
| BR-03.4 | An item is "low stock" when stock_count <= low_stock_threshold | Query filter |
| BR-03.5 | Item name is required and cannot be blank | Serializer validation |
| BR-03.6 | Items with existing transaction history can be deleted (TransactionItem retains snapshot) | item FK set NULL on delete |
| BR-03.7 | Stock updates use F() expressions for atomic concurrent-safe operations | Service implementation |

---

## BR-04: Category Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-04.1 | Category name must be unique | DB unique constraint |
| BR-04.2 | Categories with assigned items cannot be deleted | ON_DELETE=PROTECT on Item.category |
| BR-04.3 | Category name is required and cannot be blank | Serializer validation |

---

## BR-05: Client Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-05.1 | Card ID must be unique across all clients | DB unique constraint |
| BR-05.2 | Client name is required and cannot be blank | Serializer validation |
| BR-05.3 | New clients are created with $0.00 balance | Model default |
| BR-05.4 | Changing card ID must maintain uniqueness | Serializer validation |
| BR-05.5 | Clients with transaction history cannot be deleted | ON_DELETE=PROTECT on Transaction.client |

---

## BR-06: Cart Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-06.1 | Multiple active carts per client are allowed | No unique constraint on (client, active) |
| BR-06.2 | Admin can manage multiple carts simultaneously | Cart.admin tracks who created it |
| BR-06.3 | Adding same item to cart increases quantity (no duplicate CartItems) | Unique constraint on (cart, item) |
| BR-06.4 | Quantity in cart must be > 0 | Serializer validation |
| BR-06.5 | Setting quantity to 0 is equivalent to removing the item | Service logic |
| BR-06.6 | Cancelling a cart deletes it and all CartItems | CASCADE delete |
| BR-06.7 | After successful checkout, the cart is deleted | Service deletes cart post-transaction |

---

## BR-07: Authentication Rules

| Rule ID | Rule | Enforcement |
|---|---|---|
| BR-07.1 | All API endpoints (except login) require authenticated admin session | DRF permission classes |
| BR-07.2 | After 5 failed login attempts, account is locked for 15 minutes | AuthService lockout logic |
| BR-07.3 | Session expires after 30 minutes of inactivity | Django SESSION_COOKIE_AGE + middleware |
| BR-07.4 | Session is invalidated server-side on logout | Session.delete() |
| BR-07.5 | Passwords stored using Django's default PBKDF2 hasher (adaptive) | Django auth framework |
| BR-07.6 | Login endpoint is rate-limited (prevent brute force even before lockout) | Rate limiting middleware |
