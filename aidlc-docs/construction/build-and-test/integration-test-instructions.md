# Integration Test Instructions

## Purpose
Test interactions between the Backend API and Frontend SPA to ensure end-to-end workflows function correctly when both services are running together.

---

## Setup Integration Test Environment

### 1. Start Backend

```bash
cd backend
source venv/bin/activate
python manage.py migrate
python manage.py seed_data --admin-password testpass
python manage.py runserver 0.0.0.0:8000
```

### 2. Start Frontend (dev mode with proxy)

```bash
cd frontend
npm run dev
```

### 3. Verify Connectivity

```bash
# Backend health
curl http://localhost:8000/api/health/
# Expected: {"status": "healthy"}

# Frontend serves
curl -s http://localhost:5173 | head -5
# Expected: HTML with <div id="root">
```

---

## Integration Test Scenarios

### Scenario 1: Authentication Flow (Frontend → Backend)

**Description**: Verify login form submits to backend, session is created, and protected routes work.

**Test Steps**:
1. Open http://localhost:5173/login
2. Enter username: `admin`, password: `testpass`
3. Click "Log In"
4. Verify redirect to dashboard (`/`)
5. Verify TopBar shows "Logged in as admin"
6. Click "Log Out"
7. Verify redirect back to login page
8. Try navigating to `/inventory` — should redirect to login

**Expected**: Session cookie set on login, cleared on logout. Protected routes enforce auth.

---

### Scenario 2: Inventory CRUD (Frontend → Backend → Database)

**Description**: Create, read, update, and delete an item through the UI.

**Test Steps**:
1. Login as admin
2. Navigate to Inventory → Click "Add Item"
3. Fill form: Name="Test Milk", Category="Dairy", Cost="4.99", Stock=50, Threshold=10
4. Submit — verify redirect to inventory list
5. Verify "Test Milk" appears in the list with correct values
6. Click "Edit" on "Test Milk" — change cost to "5.49"
7. Submit — verify cost updated in list
8. Click "Stock" on "Test Milk" — add 10
9. Verify stock shows 60
10. Click "Delete" on "Test Milk" — confirm
11. Verify item removed from list

**Expected**: All CRUD operations persist to database and reflect in UI immediately.

---

### Scenario 3: Client Management & Balance (Frontend → Backend)

**Description**: Register client, add balance, verify balance updates.

**Test Steps**:
1. Navigate to Clients → "Register Client"
2. Fill: Name="Test Client", Card ID="TEST-001"
3. Submit — verify client appears in list with $0.00 balance
4. Click "View" → Click "Add Balance"
5. Enter amount: 100.00 → Submit
6. Verify balance now shows $100.00

**Expected**: Client created with zero balance, balance addition reflected immediately.

---

### Scenario 4: Complete Checkout Workflow (Full Integration)

**Description**: End-to-end checkout: identify client → build cart → process payment.

**Test Steps**:
1. Ensure test client exists with balance ($100.00) and items in inventory
2. Navigate to Checkout
3. Enter card ID "TEST-001" → "Simulate Card Tap"
4. Verify client name and balance displayed
5. Add "Milk" (qty 2) to cart
6. Add "Bread" (qty 1) to cart
7. Verify cart total updates correctly
8. Click "Process Checkout" → Confirm
9. Verify success message with transaction details
10. Navigate to Clients → view test client
11. Verify balance reduced by cart total
12. Navigate to Transactions → verify transaction appears

**Expected**: Atomic checkout — balance deducted, stock decremented, transaction created.

---

### Scenario 5: Error Handling (Insufficient Balance)

**Description**: Verify checkout rejection when balance is insufficient.

**Test Steps**:
1. Ensure client has low balance ($5.00)
2. Start checkout, add items totaling > $5.00
3. Click "Process Checkout" → Confirm
4. Verify error message: "Insufficient balance"
5. Verify cart remains intact (not cleared)
6. Verify client balance unchanged
7. Verify stock unchanged

**Expected**: Transaction rejected entirely, no partial changes.

---

### Scenario 6: Docker Compose Integration

**Description**: Verify the full stack works when deployed via Docker.

**Test Steps**:
1. `docker compose up --build`
2. Wait for health check to pass
3. Open http://localhost
4. Login with admin credentials
5. Perform basic operations (view inventory, view clients)
6. `docker compose down`

**Expected**: All services start, communicate, and function correctly in containers.

---

## Cleanup

```bash
# Stop backend
# Ctrl+C in backend terminal

# Stop frontend
# Ctrl+C in frontend terminal

# Remove test database (optional)
rm backend/db.sqlite3

# Docker cleanup
docker compose down -v
```
