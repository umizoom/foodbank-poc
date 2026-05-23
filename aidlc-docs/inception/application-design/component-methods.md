# Component Methods

## Backend — Services Layer Methods

### CheckoutService

| Method | Input | Output | Purpose |
|---|---|---|---|
| `create_cart(client_id)` | client ID | Cart instance | Create a new cart session for a client |
| `add_to_cart(cart_id, item_id, quantity)` | cart ID, item ID, qty | Updated CartItem | Add item to cart (validates stock > 0) |
| `remove_from_cart(cart_id, item_id)` | cart ID, item ID | None | Remove item from cart |
| `update_cart_quantity(cart_id, item_id, quantity)` | cart ID, item ID, qty | Updated CartItem | Change item quantity in cart |
| `get_cart_summary(cart_id)` | cart ID | Cart with items, total, client balance | Get current cart state |
| `process_checkout(cart_id)` | cart ID | Transaction | Atomically: validate balance, deduct, decrement stock, create transaction |
| `cancel_cart(cart_id)` | cart ID | None | Clear and delete the cart |

### InventoryService

| Method | Input | Output | Purpose |
|---|---|---|---|
| `create_item(data)` | item fields | Item instance | Create new inventory item |
| `update_item(item_id, data)` | item ID, fields | Updated Item | Update item details |
| `delete_item(item_id)` | item ID | None | Soft/hard delete item |
| `update_stock(item_id, quantity, operation)` | item ID, qty, set/add/subtract | Updated Item | Adjust stock count |
| `get_low_stock_items()` | None | List of Items | Items at or below threshold |
| `get_low_stock_count()` | None | int | Count of low-stock items |

### ClientService

| Method | Input | Output | Purpose |
|---|---|---|---|
| `register_client(name, card_id)` | name, card ID | Client instance | Register new client |
| `add_balance(client_id, amount, admin_id)` | client ID, amount, admin | Updated Client | Add balance with audit log |
| `get_by_card_id(card_id)` | card ID string | Client or None | Look up client by RFID card |
| `update_client(client_id, data)` | client ID, fields | Updated Client | Update client info |

### AuthService

| Method | Input | Output | Purpose |
|---|---|---|---|
| `authenticate(username, password)` | credentials | Session token or error | Validate credentials, check lockout |
| `logout(session_id)` | session ID | None | Invalidate session |
| `check_lockout(username)` | username | bool | Check if account is locked |
| `record_failed_attempt(username)` | username | None | Increment failed attempt counter |

---

## Backend — ViewSets / API Views

### ItemViewSet (ModelViewSet)
- `list` — GET /api/items/
- `create` — POST /api/items/
- `retrieve` — GET /api/items/{id}/
- `update` — PUT /api/items/{id}/
- `partial_update` — PATCH /api/items/{id}/
- `destroy` — DELETE /api/items/{id}/
- `update_stock` — PATCH /api/items/{id}/stock/

### CategoryViewSet (ModelViewSet)
- `list` — GET /api/categories/
- `create` — POST /api/categories/
- `retrieve` — GET /api/categories/{id}/
- `update` — PUT /api/categories/{id}/
- `destroy` — DELETE /api/categories/{id}/

### ClientViewSet (ModelViewSet)
- `list` — GET /api/clients/
- `create` — POST /api/clients/
- `retrieve` — GET /api/clients/{id}/
- `update` — PUT /api/clients/{id}/
- `partial_update` — PATCH /api/clients/{id}/
- `lookup_by_card` — GET /api/clients/lookup/?card_id={id}
- `add_balance` — POST /api/clients/{id}/balance/

### CartViewSet
- `create` — POST /api/carts/ (create cart for client)
- `retrieve` — GET /api/carts/{id}/
- `add_item` — POST /api/carts/{id}/items/
- `update_item` — PATCH /api/carts/{id}/items/{item_id}/
- `remove_item` — DELETE /api/carts/{id}/items/{item_id}/
- `checkout` — POST /api/carts/{id}/checkout/
- `cancel` — DELETE /api/carts/{id}/

### TransactionViewSet (ReadOnly)
- `list` — GET /api/transactions/
- `retrieve` — GET /api/transactions/{id}/

### AuthViews
- `login` — POST /api/auth/login/
- `logout` — POST /api/auth/logout/
- `session` — GET /api/auth/session/ (check current session)

---

## Frontend — Key Component Methods

### Auth Context
- `login(username, password)` — call auth API, store session
- `logout()` — call logout API, clear state
- `isAuthenticated` — boolean state
- `currentUser` — admin user info

### Checkout Context (Cart State)
- `scanCard(cardId)` — identify client, create server-side cart
- `addItem(itemId, quantity)` — add to server-side cart
- `removeItem(itemId)` — remove from server-side cart
- `updateQuantity(itemId, quantity)` — update quantity on server
- `processCheckout()` — finalize checkout via API
- `cancelCheckout()` — clear cart via API
- `cart` — current cart state (items, total)
- `client` — identified client (name, balance)

### API Client
- `get(url, params)` — GET request with auth
- `post(url, data)` — POST request with auth
- `put(url, data)` — PUT request with auth
- `patch(url, data)` — PATCH request with auth
- `delete(url)` — DELETE request with auth
