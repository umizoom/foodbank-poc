# Frontend Business Logic Model

## Flow 1: Authentication

### Login Flow
```
1. User enters username + password
2. Client-side validation (both fields required)
3. POST /api/auth/login/ { username, password }
4. IF 200 OK:
   a. Dispatch LOGIN_SUCCESS { username }
   b. Navigate to "/" or originally requested URL
5. IF 401/403:
   a. Display error message from API (invalid credentials or account locked)
   b. Clear password field, keep username
6. IF network error:
   a. Display "Unable to connect to server"
```

### Session Check Flow (on app mount)
```
1. AuthContext mounts → dispatch SET_LOADING(true)
2. GET /api/auth/session/
3. IF 200 OK:
   a. Dispatch LOGIN_SUCCESS { username from response }
4. IF 401:
   a. Dispatch LOGOUT (user is not authenticated)
5. Dispatch SET_LOADING(false)
```

### Session Timeout Detection
```
1. Set interval: every 60 seconds
2. GET /api/auth/session/
3. IF 401:
   a. Dispatch SESSION_EXPIRED
   b. Navigate to /login with message "Session expired"
4. Clear interval on unmount or logout
```

### Logout Flow
```
1. POST /api/auth/logout/
2. Dispatch LOGOUT
3. Navigate to /login
```

---

## Flow 2: Inventory Management

### Load Inventory List
```
1. On mount or filter change:
   a. Build query params: { search?, category? }
   b. GET /api/items/?search=&category=
   c. GET /api/categories/ (for filter dropdown, cached)
2. Set items state
3. Derive low-stock items: items.filter(i => i.stock_count <= i.low_stock_threshold)
```

### Create Item
```
1. User fills form → client-side validation (React Hook Form)
2. IF valid:
   a. POST /api/items/ { name, category, cost, stock_count, low_stock_threshold }
3. IF 201 Created:
   a. Navigate to /inventory
   b. Show success notification
4. IF 400 Bad Request:
   a. Map API field errors to form errors (setError per field)
```

### Edit Item
```
1. On mount: GET /api/items/:id/ → prefill form (reset with fetched data)
2. User modifies fields → client-side validation
3. IF valid:
   a. PUT /api/items/:id/ { name, category, cost, low_stock_threshold }
4. IF 200 OK:
   a. Navigate to /inventory
   b. Show success notification
5. IF 400/404:
   a. Handle errors
```

### Update Stock
```
1. User opens StockUpdateModal for item
2. Selects operation (set/add/subtract) and enters quantity
3. Client-side validation (quantity >= 0)
4. PATCH /api/items/:id/stock/ { operation, quantity }
5. IF 200 OK:
   a. Close modal
   b. Refresh item in list (or refetch list)
6. IF 400 (would go negative):
   a. Display error from API
```

### Delete Item
```
1. User clicks delete → show ConfirmModal
2. IF confirmed:
   a. DELETE /api/items/:id/
3. IF 204 No Content:
   a. Remove item from local list
   b. Show success notification
4. IF 400/409 (has transaction references):
   a. Display error
```

---

## Flow 3: Client Management

### Load Client List
```
1. On mount or search change:
   a. GET /api/clients/?search=
2. Set clients state
3. Sort alphabetically by name (API handles this)
```

### Register Client
```
1. User fills form → client-side validation
2. POST /api/clients/ { name, card_id }
3. IF 201: Navigate to /clients, success notification
4. IF 400: Map field errors
5. IF 409 (duplicate card_id): Show "Card ID already registered"
```

### View Client Detail
```
1. GET /api/clients/:id/
2. GET /api/transactions/?client=:id (recent transactions)
3. Display client info + transaction history
```

### Add Balance
```
1. User enters amount in AddBalanceModal
2. Client-side validation: amount > 0, amount <= 2000, max 2 decimals
3. POST /api/clients/:id/balance/ { amount }
4. IF 200 OK:
   a. Close modal
   b. Refresh client detail (updated balance)
   c. Success notification: "Added $X.XX to {client name}'s balance"
5. IF 400:
   a. Display error (e.g., exceeds max)
```

---

## Flow 4: Checkout Workflow

### Phase 1: Identify Client
```
1. Admin enters card_id in CardSimulator
2. GET /api/clients/lookup/?card_id={card_id}
3. IF 200 (client found):
   a. Store client in local state
   b. POST /api/carts/ { client: client.id }
   c. IF 201 (cart created):
      - Store cart in local state
      - Transition phase → 'cart'
4. IF 404 (not found):
   a. Display "No client found with this card ID"
5. IF network error:
   a. Display connection error
```

### Phase 2: Build Cart
```
ADD ITEM:
1. Admin clicks add on an item from ItemBrowser
2. POST /api/carts/:cart_id/items/ { item: item_id, quantity: 1 }
3. IF 201:
   a. Refetch cart: GET /api/carts/:cart_id/
   b. Update cart display
4. IF 400 (out of stock):
   a. Display "Item is out of stock"

UPDATE QUANTITY:
1. Admin changes quantity on CartItemRow
2. Debounce 300ms
3. PATCH /api/carts/:cart_id/items/:item_id/ { quantity }
4. Refetch cart on success
5. IF 400 (exceeds stock): revert to previous quantity, show error

REMOVE ITEM:
1. Admin clicks remove (or sets quantity to 0)
2. DELETE /api/carts/:cart_id/items/:item_id/
3. Refetch cart on success
```

### Phase 3: Process Checkout
```
1. Admin clicks "Process Checkout"
2. Show ConfirmModal: "Complete checkout for {client_name}? Total: $X.XX"
3. IF confirmed:
   a. POST /api/carts/:cart_id/checkout/
4. IF 200 (success):
   a. Store transaction result
   b. Transition phase → 'result'
   c. Display CheckoutResult (success)
5. IF 400 (insufficient balance):
   a. Display error: "Insufficient balance. Client has $X.XX but cart total is $Y.YY"
   b. Stay in 'cart' phase — admin can remove items and retry
6. IF 400 (insufficient stock):
   a. Display error with specific items that are out of stock
   b. Stay in 'cart' phase
```

### Cancel Checkout
```
1. Admin clicks "Cancel"
2. Show ConfirmModal: "Cancel this checkout? Cart will be cleared."
3. IF confirmed:
   a. DELETE /api/carts/:cart_id/
   b. Clear local state (client, cart)
   c. Transition phase → 'identify'
```

---

## Flow 5: Transaction History

### Load Transaction List
```
1. On mount or filter change:
   a. Build query: { date_from?, date_to?, client? }
   b. GET /api/transactions/?date_from=&date_to=&client=
2. Set transactions state
3. Display in table (most recent first — API handles ordering)
```

### View Transaction Detail
```
1. GET /api/transactions/:id/
2. Display: client, date, admin, line items with totals
```

---

## Flow 6: Dashboard

### Load Dashboard Data
```
1. On mount (parallel requests):
   a. GET /api/items/ → count total items
   b. GET /api/items/?low_stock=true → count low-stock items
   c. GET /api/clients/ → count total clients
   d. GET /api/transactions/?today=true → count today's transactions, get recent 5
2. Display stats cards and recent activity table
```

---

## Cross-Cutting: Error Boundary

```
1. Wrap App in React ErrorBoundary
2. On uncaught render error:
   a. Display fallback UI: "Something went wrong. Please refresh the page."
   b. Log error to console
3. Does NOT catch async/API errors (those are handled per-component)
```

## Cross-Cutting: 401 Interceptor

```
1. API client checks every response
2. IF status === 401 AND user was previously authenticated:
   a. Throw UnauthorizedError
3. AuthContext catches UnauthorizedError globally (or via response interceptor pattern)
4. Dispatch SESSION_EXPIRED
5. Navigate to /login with expired message
```
