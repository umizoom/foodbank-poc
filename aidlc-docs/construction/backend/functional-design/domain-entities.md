# Domain Entities — Backend

## Entity: Category

| Field | Type | Constraints |
|---|---|---|
| id | AutoField (PK) | Auto-generated |
| name | CharField(100) | Required, unique |
| created_at | DateTimeField | Auto-set on creation |

---

## Entity: Item

| Field | Type | Constraints |
|---|---|---|
| id | AutoField (PK) | Auto-generated |
| name | CharField(200) | Required, not blank |
| category | ForeignKey(Category) | Required, ON_DELETE=PROTECT |
| cost | DecimalField(8,2) | Required, > 0 |
| stock_count | IntegerField | Required, >= 0, default=0 |
| low_stock_threshold | IntegerField | Required, >= 0, default=10 |
| created_at | DateTimeField | Auto-set on creation |
| updated_at | DateTimeField | Auto-set on update |

---

## Entity: Client

| Field | Type | Constraints |
|---|---|---|
| id | AutoField (PK) | Auto-generated |
| name | CharField(200) | Required, not blank |
| card_id | CharField(100) | Required, unique |
| balance | DecimalField(10,2) | Required, >= 0, default=0.00 |
| created_at | DateTimeField | Auto-set on creation |
| updated_at | DateTimeField | Auto-set on update |

---

## Entity: BalanceLog

| Field | Type | Constraints |
|---|---|---|
| id | AutoField (PK) | Auto-generated |
| client | ForeignKey(Client) | Required, ON_DELETE=CASCADE |
| admin | ForeignKey(User) | Required, ON_DELETE=PROTECT |
| amount | DecimalField(10,2) | Required, > 0, <= 2000.00 |
| balance_before | DecimalField(10,2) | Required |
| balance_after | DecimalField(10,2) | Required |
| created_at | DateTimeField | Auto-set on creation |

---

## Entity: Cart

| Field | Type | Constraints |
|---|---|---|
| id | AutoField (PK) | Auto-generated |
| client | ForeignKey(Client) | Required, ON_DELETE=CASCADE |
| admin | ForeignKey(User) | Required, ON_DELETE=PROTECT |
| created_at | DateTimeField | Auto-set on creation |

**Note**: Multiple active carts per client are allowed (admin can switch between clients).

---

## Entity: CartItem

| Field | Type | Constraints |
|---|---|---|
| id | AutoField (PK) | Auto-generated |
| cart | ForeignKey(Cart) | Required, ON_DELETE=CASCADE |
| item | ForeignKey(Item) | Required, ON_DELETE=PROTECT |
| quantity | IntegerField | Required, > 0 |

**Unique constraint**: (cart, item) — one entry per item per cart, quantity adjusted.

---

## Entity: Transaction

| Field | Type | Constraints |
|---|---|---|
| id | AutoField (PK) | Auto-generated |
| client | ForeignKey(Client) | Required, ON_DELETE=PROTECT |
| admin | ForeignKey(User) | Required, ON_DELETE=PROTECT |
| total | DecimalField(10,2) | Required, >= 0 |
| created_at | DateTimeField | Auto-set on creation |

---

## Entity: TransactionItem (Snapshot)

| Field | Type | Constraints |
|---|---|---|
| id | AutoField (PK) | Auto-generated |
| transaction | ForeignKey(Transaction) | Required, ON_DELETE=CASCADE |
| item | ForeignKey(Item, null=True) | Optional, ON_DELETE=SET_NULL |
| item_name | CharField(200) | Required (snapshot) |
| unit_cost | DecimalField(8,2) | Required (snapshot) |
| quantity | IntegerField | Required, > 0 |
| line_total | DecimalField(10,2) | Required (quantity * unit_cost) |

**Design note**: `item_name` and `unit_cost` are snapshots at time of purchase. The `item` FK is kept for optional reference but may become NULL if item is deleted.

---

## Entity: AdminUser (Django User)

Uses Django's built-in `auth.User` model with:
- username
- password (hashed)
- email
- is_active

No custom user model needed — only admins log in.

---

## Entity Relationships

```
Category 1 ----* Item
Client   1 ----* Cart
Client   1 ----* Transaction
Client   1 ----* BalanceLog
User     1 ----* Cart (admin who created)
User     1 ----* Transaction (admin who processed)
User     1 ----* BalanceLog (admin who added)
Cart     1 ----* CartItem
CartItem *----1 Item
Transaction 1 --* TransactionItem
TransactionItem *--1 Item (nullable)
```
