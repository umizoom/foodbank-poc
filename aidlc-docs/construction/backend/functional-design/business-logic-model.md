# Business Logic Model — Backend

## Flow 1: Checkout Process

```
Admin initiates checkout
        |
        v
+------------------+
| get_cart_summary  | --> Retrieve cart + items + client balance
+------------------+
        |
        v
+------------------+
| process_checkout  |
+------------------+
        |
        v
+----------------------------+
| BEGIN ATOMIC TRANSACTION   |
+----------------------------+
        |
        v
+----------------------------+
| Re-validate stock for      |
| each CartItem              |
| (stock >= quantity?)       |
+---+------------------------+
    |           |
    | YES       | NO (any item)
    v           v
+----------+  +-------------------+
| Validate |  | ROLLBACK          |
| balance  |  | Return error:     |
| >= total |  | "Item X out of    |
+---+------+  |  stock"           |
    |    |     +-------------------+
    |YES | NO
    v    v
+------+ +-------------------+
|Deduct| | ROLLBACK          |
|balce | | Return error:     |
+---+--+ | "Insufficient     |
    |    |  balance"         |
    v    +-------------------+
+-------------------+
| Decrement stock   |
| for each item     |
| (F() expression)  |
+-------------------+
        |
        v
+-------------------+
| Create Transaction|
| + TransactionItems|
| (snapshot data)   |
+-------------------+
        |
        v
+-------------------+
| Delete Cart       |
+-------------------+
        |
        v
+-------------------+
| COMMIT            |
| Return Transaction|
+-------------------+
```

### Checkout Pseudocode

```
def process_checkout(cart_id):
    cart = get_cart_with_items(cart_id)
    client = cart.client
    
    with transaction.atomic():
        # Re-validate stock (may have changed since items were added)
        for cart_item in cart.items:
            item = Item.objects.select_for_update().get(id=cart_item.item_id)
            if item.stock_count < cart_item.quantity:
                raise InsufficientStockError(item.name)
        
        # Calculate total
        total = sum(ci.item.cost * ci.quantity for ci in cart.items)
        
        # Validate balance
        client = Client.objects.select_for_update().get(id=client.id)
        if client.balance < total:
            raise InsufficientBalanceError(client.balance, total)
        
        # Deduct balance
        client.balance = F('balance') - total
        client.save(update_fields=['balance'])
        
        # Decrement stock
        for cart_item in cart.items:
            Item.objects.filter(id=cart_item.item_id).update(
                stock_count=F('stock_count') - cart_item.quantity
            )
        
        # Create transaction record with snapshots
        txn = Transaction.objects.create(
            client=client, admin=cart.admin, total=total
        )
        for cart_item in cart.items:
            TransactionItem.objects.create(
                transaction=txn,
                item=cart_item.item,
                item_name=cart_item.item.name,
                unit_cost=cart_item.item.cost,
                quantity=cart_item.quantity,
                line_total=cart_item.item.cost * cart_item.quantity
            )
        
        # Delete cart
        cart.delete()
    
    return txn
```

---

## Flow 2: Add Balance to Client

```
Admin submits balance addition
        |
        v
+----------------------------+
| Validate amount:           |
| - Must be > 0             |
| - Must be <= $2,000.00    |
+---+------------------------+
    |           |
    | VALID     | INVALID
    v           v
+----------+ +------------------+
| BEGIN    | | Return 400 error |
| ATOMIC   | +------------------+
+----------+
    |
    v
+----------------------------+
| Lock client row            |
| (select_for_update)        |
+----------------------------+
    |
    v
+----------------------------+
| Record balance_before      |
| Calculate balance_after    |
+----------------------------+
    |
    v
+----------------------------+
| Update client.balance      |
| (F() + amount)             |
+----------------------------+
    |
    v
+----------------------------+
| Create BalanceLog entry    |
| (client, admin, amount,   |
|  balance_before,           |
|  balance_after)            |
+----------------------------+
    |
    v
+----------------------------+
| COMMIT                     |
| Return updated client      |
+----------------------------+
```

---

## Flow 3: Add Item to Cart

```
Admin adds item to cart
        |
        v
+----------------------------+
| Validate:                  |
| - Cart exists              |
| - Item exists              |
| - Quantity > 0             |
+---+------------------------+
    |           |
    | VALID     | INVALID
    v           v
+----------+ +------------------+
| Check    | | Return 400 error |
| stock    | +------------------+
+---+------+
    |           |
    | stock > 0 | stock = 0
    v           v
+----------+ +-------------------+
| Check if | | Return 400:       |
| item in  | | "Out of stock"    |
| cart     | +-------------------+
+---+------+
    |           |
    | EXISTS    | NEW
    v           v
+----------+ +-------------------+
| Increment| | Create CartItem   |
| quantity | | (cart, item, qty) |
+----------+ +-------------------+
    |           |
    v           v
+----------------------------+
| Return updated cart        |
+----------------------------+
```

---

## Flow 4: Stock Update

```
Admin updates stock count
        |
        v
+----------------------------+
| Validate:                  |
| - Item exists              |
| - New count >= 0           |
+---+------------------------+
    |
    v
+----------------------------+
| Update using F() or set:   |
| - "set": stock_count = N  |
| - "add": stock_count += N |
| - "subtract": stock -= N  |
|   (with floor at 0)       |
+----------------------------+
    |
    v
+----------------------------+
| Return updated item        |
+----------------------------+
```

---

## Flow 5: Admin Login

```
Admin submits credentials
        |
        v
+----------------------------+
| Check lockout status       |
| (5 failures in 15 min?)   |
+---+------------------------+
    |           |
    | NOT LOCKED| LOCKED
    v           v
+----------+ +-------------------+
| Validate | | Return 403:       |
| password | | "Account locked"  |
+---+------+ +-------------------+
    |           |
    | VALID     | INVALID
    v           v
+----------+ +-------------------+
| Clear    | | Increment failed  |
| failed   | | attempt counter   |
| attempts | +-------------------+
+----------+       |
    |              v
    v         +-------------------+
+----------+ | Return 401:       |
| Create   | | "Invalid creds"   |
| session  | +-------------------+
+----------+
    |
    v
+----------------------------+
| Return session + user info |
+----------------------------+
```

---

## Concurrency Safety

| Operation | Mechanism | Purpose |
|---|---|---|
| Balance deduction | `select_for_update()` + `F()` | Prevent double-spend |
| Stock decrement | `F()` expression | Prevent overselling |
| Balance addition | `select_for_update()` + `F()` | Prevent race conditions |
| Checkout (full) | `@transaction.atomic` + row locks | All-or-nothing consistency |
