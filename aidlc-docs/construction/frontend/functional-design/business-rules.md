# Frontend Business Rules

## Form Validation Rules

### Login Form (LoginForm)

| Field | Rules | Error Message |
|---|---|---|
| `username` | Required, min 1 char | "Username is required" |
| `password` | Required, min 1 char | "Password is required" |

**Submit behavior:**
- Disable button while loading
- Display API error (Invalid Credentials / account locked) in AlertBanner
- On success, redirect to `/` (or originally requested URL)

---

### Item Form (InventoryFormPage)

| Field | Rules | Error Message |
|---|---|---|
| `name` | Required, max 200 chars | "Item name is required" / "Name must be under 200 characters" |
| `category` | Required (select from list) | "Category is required" |
| `cost` | Required, number > 0, max 2 decimal places | "Cost is required" / "Cost must be a positive number" / "Cost cannot exceed 2 decimal places" |
| `stock_count` | Required (create only), integer >= 0 | "Stock count is required" / "Stock must be 0 or greater" |
| `low_stock_threshold` | Required, integer >= 0, default 10 | "Threshold must be 0 or greater" |

**Submit behavior:**
- POST (create) or PUT (edit)
- On success: redirect to `/inventory` with success notification
- On error: display field-level errors from API response

---

### Stock Update Form (StockUpdateModal)

| Field | Rules | Error Message |
|---|---|---|
| `operation` | Required, one of: "set", "add", "subtract" | "Select an operation" |
| `quantity` | Required, integer >= 0 | "Quantity must be 0 or greater" |

**Submit behavior:**
- PATCH `/api/items/:id/stock/`
- On success: close modal, refresh item list
- On error (stock would go below 0): display error from API

---

### Category Form (CategoryManagementPage — inline)

| Field | Rules | Error Message |
|---|---|---|
| `name` | Required, max 100 chars, unique | "Category name is required" / "Name must be under 100 characters" |

**Delete behavior:**
- Only enabled if category has 0 assigned items
- Show ConfirmModal before deletion
- On API error (items still assigned): display error

---

### Client Form (ClientFormPage)

| Field | Rules | Error Message |
|---|---|---|
| `name` | Required, max 200 chars | "Client name is required" / "Name must be under 200 characters" |
| `card_id` | Required, max 100 chars, unique | "Card ID is required" / "Card ID must be under 100 characters" |

**Submit behavior:**
- POST (create) or PUT (edit)
- On success: redirect to `/clients` (create) or `/clients/:id` (edit) with success notification
- On 409 conflict (duplicate card_id): display "This card ID is already registered to another client"

---

### Add Balance Form (AddBalanceModal)

| Field | Rules | Error Message |
|---|---|---|
| `amount` | Required, number > 0, max 2 decimal places, max 2000.00 | "Amount is required" / "Amount must be greater than zero" / "Amount cannot exceed $2,000.00" / "Amount cannot exceed 2 decimal places" |

**Submit behavior:**
- POST `/api/clients/:id/balance/`
- On success: close modal, refresh client detail, show success notification
- On error: display API error

---

### Card Simulator (CheckoutPage — CardSimulator)

| Field | Rules | Error Message |
|---|---|---|
| `card_id` | Required | "Please enter a card ID" |

**Submit behavior:**
- GET `/api/clients/lookup/?card_id=`
- On success (client found): create cart via POST `/api/carts/`, transition to cart phase
- On 404 (not found): display "No client found with this card ID"

---

### Cart Item Addition (ItemBrowser)

| Validation | Rule |
|---|---|
| Stock check | Item must have stock_count > 0 (disable add button if 0) |
| Duplicate check | If item already in cart, increment quantity instead of adding new row |
| Quantity limit | Cannot exceed available stock |

---

### Cart Quantity Update (CartItemRow)

| Field | Rules | Error Message |
|---|---|---|
| `quantity` | Required, integer >= 1 | Reducing to 0 triggers remove |

**Behavior:**
- Quantity < 1: prompt to remove item from cart
- Quantity > available stock: show warning "Only {n} available"
- PATCH to update server, optimistic UI update

---

## Display Rules

### Currency Formatting
- All monetary values displayed as CAD: `$X.XX`
- Always show 2 decimal places
- Use Intl.NumberFormat with `en-CA` locale, `currency: 'CAD'`

### Low Stock Indicator
- Show warning indicator (orange/amber) when `stock_count <= low_stock_threshold`
- Show critical indicator (red) when `stock_count === 0`
- Badge in sidebar shows total count of items where `stock_count <= low_stock_threshold`

### Cart Total vs Balance
- Display cart total prominently
- Display client balance alongside
- If `cart_total > client_balance`: show warning styling on balance display
- Remaining balance = `client_balance - cart_total` (show when positive)

### Empty States
- Empty inventory list: "No items in inventory. Add your first item to get started."
- Empty client list: "No clients registered. Register a new client."
- Empty transaction list: "No transactions found."
- Empty cart: "Cart is empty. Browse items to add to the cart."
- No search results: "No results found for '{query}'."

### Loading States
- Page-level loading: full-page LoadingSpinner centered
- Table loading: skeleton rows or spinner overlay
- Button loading: disable button, show spinner inside button
- Modal actions: disable form, show spinner on submit button

---

## Navigation Rules

### Sidebar Navigation Items
1. Dashboard (`/`)
2. Inventory (`/inventory`) — with low-stock badge
3. Clients (`/clients`)
4. Checkout (`/checkout`)
5. Transactions (`/transactions`)

### Active State
- Current page's nav item is highlighted
- Parent item highlighted when on child route (e.g., `/inventory/new` highlights Inventory)

### Unsaved Changes Protection
- Forms track dirty state via React Hook Form's `isDirty`
- If user navigates away with unsaved changes: show browser's native `beforeunload` prompt
- Checkout page: warn if cart has items and user navigates away

---

## Checkout Workflow Rules

### Phase Transitions
| Current Phase | Action | Next Phase | Condition |
|---|---|---|---|
| `identify` | Card scan success | `cart` | Client found + cart created |
| `cart` | Checkout success | `result` | API returns transaction |
| `cart` | Checkout failure | `cart` (stay) | Insufficient balance — show error |
| `cart` | Cancel | `identify` | Cart cancelled on server |
| `result` | New Checkout | `identify` | Reset all state |

### Cart Refresh
- After any cart mutation (add/remove/update), refetch cart from `GET /api/carts/:id/`
- This ensures server-side totals and stock validation are reflected

### Checkout Confirmation
- Before processing: show ConfirmModal with summary (client name, total, item count)
- On success: show CheckoutResult with transaction details
- On failure: show error in AlertBanner, keep cart intact for adjustment
