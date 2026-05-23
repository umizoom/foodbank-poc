# User Stories

## Epic 1: Authentication & Session Management

### US-1.1: Admin Login
**As an** Admin, **I want** to log in with my username and password, **so that** I can securely access the system.

**Acceptance Criteria:**
- Given valid credentials, when I submit the login form, then I am redirected to the dashboard
- Given invalid credentials, when I submit the login form, then I see an error message and remain on the login page
- Given I am not authenticated, when I try to access any protected page, then I am redirected to login
- Brute-force protection: after 5 failed attempts, account is temporarily locked for 15 minutes

### US-1.2: Admin Logout
**As an** Admin, **I want** to log out of the system, **so that** my session is terminated and the station is secure.

**Acceptance Criteria:**
- Session is invalidated server-side on logout
- User is redirected to login page
- Subsequent requests with the old session are rejected

### US-1.3: Session Timeout
**As an** Admin, **I want** my session to expire after inactivity, **so that** unattended stations are protected.

**Acceptance Criteria:**
- Session expires after 30 minutes of inactivity
- User is redirected to login with an informative message
- Active use resets the timeout counter

---

## Epic 2: Inventory Management

### US-2.1: Add Inventory Item
**As an** Admin, **I want** to add a new item to the inventory, **so that** it becomes available for checkout.

**Acceptance Criteria:**
- I can specify: name, category, cost (CAD), initial stock count, and low-stock threshold
- Item is saved and appears in the inventory list
- Name is required and must not be empty
- Cost must be a positive number
- Stock count must be a non-negative integer

### US-2.2: Edit Inventory Item
**As an** Admin, **I want** to edit an existing inventory item, **so that** I can correct information or update pricing.

**Acceptance Criteria:**
- I can modify: name, category, cost, and low-stock threshold
- Changes are saved and reflected immediately in the inventory list
- Validation rules same as creation

### US-2.3: Delete Inventory Item
**As an** Admin, **I want** to remove an item from the inventory, **so that** discontinued items no longer appear.

**Acceptance Criteria:**
- I am prompted to confirm before deletion
- Deleted items no longer appear in the inventory list or checkout
- Existing transaction history referencing the item is preserved

### US-2.4: View Inventory List
**As an** Admin, **I want** to view all inventory items with their current stock and cost, **so that** I can monitor what's available.

**Acceptance Criteria:**
- Items are displayed with: name, category, cost, stock count, low-stock indicator
- I can filter items by category
- I can search items by name
- Items at or below low-stock threshold are visually highlighted

### US-2.5: Update Stock Count
**As an** Admin, **I want** to update the stock count for an item, **so that** I can record restocking or corrections.

**Acceptance Criteria:**
- I can set a new stock count or add/subtract from current count
- Stock count cannot go below zero
- Update is reflected immediately in the inventory view

### US-2.6: Manage Categories
**As an** Admin, **I want** to create and manage item categories, **so that** inventory is organized for easy browsing.

**Acceptance Criteria:**
- I can create new categories with a name
- I can rename existing categories
- I can delete categories only if no items are assigned to them
- Categories appear as filter options in the inventory list

---

## Epic 3: Client Management

### US-3.1: Register New Client
**As an** Admin, **I want** to register a new client with their RFID card, **so that** they can use the food bank system.

**Acceptance Criteria:**
- I can enter: client name, and RFID card ID
- Card ID must be unique across all clients
- Client is created with a zero balance
- Client appears in the client list after registration

### US-3.2: View Client List
**As an** Admin, **I want** to view all registered clients, **so that** I can find and manage client accounts.

**Acceptance Criteria:**
- Clients are displayed with: name, card ID, current balance
- I can search clients by name or card ID
- List is sorted alphabetically by default

### US-3.3: View Client Details
**As an** Admin, **I want** to view a specific client's details, **so that** I can see their balance and information.

**Acceptance Criteria:**
- Shows client name, card ID, current balance
- Shows recent transactions for this client (if any)

### US-3.4: Add Balance to Client
**As an** Admin, **I want** to add balance ( CAD) to a client's account, **so that** they can purchase items.

**Acceptance Criteria:**
- Given a valid positive amount, when I submit, then the client's balance increases by that amount
- Given zero or negative amount, when I submit, then the request is rejected with an error
- Balance update is reflected immediately
- A record of the balance addition is stored (who, when, amount)

### US-3.5: Edit Client Information
**As an** Admin, **I want** to edit a client's name or card ID, **so that** I can correct errors or issue replacement cards.

**Acceptance Criteria:**
- I can update client name and card ID
- New card ID must still be unique
- Existing transaction history is preserved

---

## Epic 4: Checkout Workflow

### US-4.1: Identify Client via RFID
**As an** Admin, **I want** to simulate an RFID card tap to identify a client, **so that** I can begin a checkout session.

**Acceptance Criteria:**
- Given a valid card ID, when I simulate the tap, then the client's name and balance are displayed
- Given an unrecognized card ID, when I simulate the tap, then an error message indicates the card is not registered
- A "Simulate Card Tap" button or input field is available on the checkout screen

### US-4.2: Add Items to Cart
**As an** Admin, **I want** to add inventory items to the client's cart, **so that** I can build up their order.

**Acceptance Criteria:**
- I can browse/search available items and add them to the cart
- I can specify quantity for each item
- Cart displays: item name, quantity, unit cost, line total
- Running cart total is displayed
- Client's available balance is shown alongside the cart total
- Items with zero stock cannot be added to the cart

### US-4.3: Remove Items from Cart
**As an** Admin, **I want** to remove items from the cart or adjust quantities, **so that** I can correct the order before checkout.

**Acceptance Criteria:**
- I can remove individual items from the cart
- I can change the quantity of items in the cart
- Cart total updates immediately on any change
- Reducing quantity to zero removes the item from the cart

### US-4.4: Process Checkout
**As an** Admin, **I want** to complete the checkout, **so that** items are dispensed and balance is deducted.

**Acceptance Criteria:**
- Given cart total is less than or equal to client balance, when I confirm checkout, then:
  - Client balance is reduced by cart total
  - Stock count is decremented for each item by the quantity purchased
  - A transaction record is created
  - Cart is cleared
  - Success message is displayed
- Given cart total exceeds client balance, when I confirm checkout, then:
  - Transaction is rejected entirely
  - No balance is deducted
  - No stock is decremented
  - Error message indicates insufficient balance
  - Cart remains intact so admin can remove items and retry

### US-4.5: Cancel Checkout
**As an** Admin, **I want** to cancel a checkout session, **so that** I can start over or dismiss a client without purchasing.

**Acceptance Criteria:**
- Cart is cleared
- No balance is deducted
- No stock is decremented
- System returns to ready state for next client

---

## Epic 5: Transaction History

### US-5.1: View Transaction List
**As an** Admin, **I want** to view a list of all transactions, **so that** I can review past checkouts.

**Acceptance Criteria:**
- Transactions displayed with: date/time, client name, total amount, admin who processed
- Most recent transactions shown first
- I can filter by date range
- I can filter by client

### US-5.2: View Transaction Details
**As an** Admin, **I want** to view the details of a specific transaction, **so that** I can see exactly what was purchased.

**Acceptance Criteria:**
- Shows: client name, date/time, processing admin
- Lists all items: name, quantity, unit cost, line total
- Shows transaction total

---

## Epic 6: Low Stock Alerts

### US-6.1: Low Stock Visual Indicator
**As an** Admin, **I want** to see which items are running low, **so that** I know what needs restocking.

**Acceptance Criteria:**
- Items at or below their low-stock threshold are visually highlighted (e.g., red/orange indicator)
- A count of low-stock items is visible on the dashboard/navigation
- Low-stock items are easily identifiable in the inventory list

### US-6.2: Configure Low Stock Threshold
**As an** Admin, **I want** to set the low-stock threshold per item, **so that** alerts are meaningful for each item type.

**Acceptance Criteria:**
- Threshold is set during item creation and can be edited later
- Threshold must be a non-negative integer
- Default threshold value is provided for new items (e.g., 10)

---

## Story Priority (Implementation Order)

| Priority | Stories | Rationale |
|---|---|---|
| P1 - Foundation | US-1.1, US-1.2, US-2.1, US-2.4, US-2.6 | Auth + basic inventory (core data) |
| P2 - Client Setup | US-3.1, US-3.2, US-3.3, US-3.4 | Client registration and balance |
| P3 - Checkout | US-4.1, US-4.2, US-4.3, US-4.4, US-4.5 | Core business workflow |
| P4 - Completeness | US-1.3, US-2.2, US-2.3, US-2.5, US-3.5, US-5.1, US-5.2, US-6.1, US-6.2 | Full feature set |

---

## INVEST Compliance Summary

| Criterion | Status |
|---|---|
| **Independent** | Each story can be implemented and tested independently |
| **Negotiable** | Stories describe intent, not implementation details |
| **Valuable** | Each story delivers user-visible value |
| **Estimable** | Stories are scoped to 1-3 days of effort |
| **Small** | No story spans more than one feature area |
| **Testable** | All stories have concrete acceptance criteria |
