# Frontend Components — Functional Design

## Tech Stack Summary
- **UI Framework**: React 18 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **Routing**: React Router v6
- **State Management**: React Context + useReducer
- **HTTP Client**: fetch (native)

---

## Page Hierarchy & Routing

```
/login                        → LoginPage
/                             → DashboardPage (redirect target after login)
/inventory                    → InventoryListPage
/inventory/new                → InventoryFormPage (create)
/inventory/:id/edit           → InventoryFormPage (edit)
/inventory/categories         → CategoryManagementPage
/clients                      → ClientListPage
/clients/new                  → ClientFormPage (create)
/clients/:id                  → ClientDetailPage
/clients/:id/edit             → ClientFormPage (edit)
/checkout                     → CheckoutPage
/transactions                 → TransactionListPage
/transactions/:id             → TransactionDetailPage
```

### Route Protection
- All routes except `/login` are wrapped in `<ProtectedRoute>`
- `ProtectedRoute` checks `AuthContext.isAuthenticated`
- Unauthenticated users redirect to `/login`
- Authenticated users on `/login` redirect to `/`

---

## Component Tree by Feature

### App Shell

```
<App>
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryListPage />} />
            <Route path="/inventory/new" element={<InventoryFormPage />} />
            <Route path="/inventory/:id/edit" element={<InventoryFormPage />} />
            <Route path="/inventory/categories" element={<CategoryManagementPage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/clients/new" element={<ClientFormPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/clients/:id/edit" element={<ClientFormPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/transactions" element={<TransactionListPage />} />
            <Route path="/transactions/:id" element={<TransactionDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
</App>
```

### Shared / Layout Components

| Component | Props | Purpose |
|---|---|---|
| `AppLayout` | — | Sidebar nav + top bar + `<Outlet />` content area |
| `Sidebar` | — | Navigation links with active state, low-stock badge |
| `TopBar` | — | Admin name display, logout button |
| `ProtectedRoute` | — | Auth gate, renders `<Outlet />` if authenticated |
| `PageHeader` | `title`, `actions?` | Page title bar with optional action buttons |
| `DataTable` | `columns`, `data`, `loading`, `emptyMessage` | Reusable table with loading state |
| `SearchInput` | `value`, `onChange`, `placeholder` | Debounced search input |
| `ConfirmModal` | `open`, `title`, `message`, `onConfirm`, `onCancel` | Confirmation dialog |
| `AlertBanner` | `type`, `message`, `onDismiss?` | Success/error/warning notifications |
| `LoadingSpinner` | `size?` | Loading indicator |
| `Badge` | `count`, `variant` | Numeric badge (e.g., low-stock count) |
| `FormField` | `label`, `error?`, `children` | Form field wrapper with label and error |
| `Button` | `variant`, `size`, `loading?`, `disabled?`, `onClick`, `children` | Styled button |
| `CurrencyDisplay` | `amount` | Formats number as CAD (e.g., "$12.50") |

---

### FE-01: Auth Feature

#### LoginPage
```
<LoginPage>
  <LoginForm>
    <FormField label="Username">
      <input type="text" />
    </FormField>
    <FormField label="Password">
      <input type="password" />
    </FormField>
    <Button type="submit">Log In</Button>
    <AlertBanner /> (error display)
  </LoginForm>
</LoginPage>
```

| Component | State | API Calls |
|---|---|---|
| `LoginPage` | — | — |
| `LoginForm` | `useForm({ username, password })`, `error`, `loading` | `POST /api/auth/login/` |

---

### FE-02: Inventory Feature

#### InventoryListPage
```
<InventoryListPage>
  <PageHeader title="Inventory" actions={[AddItemButton, ManageCategoriesButton]} />
  <div (filters row)>
    <SearchInput />
    <CategoryFilter />
  </div>
  <DataTable columns={[name, category, cost, stock, threshold, actions]}>
    <LowStockIndicator /> (per row, conditional)
    <ActionButtons (edit, stock, delete) />
  </DataTable>
</InventoryListPage>
```

| Component | State | API Calls |
|---|---|---|
| `InventoryListPage` | `items[]`, `categories[]`, `search`, `categoryFilter`, `loading` | `GET /api/items/?search=&category=`, `GET /api/categories/` |
| `CategoryFilter` | `selected` | — (uses categories from parent) |
| `LowStockIndicator` | — | — (derives from item.stock_count <= item.low_stock_threshold) |

#### InventoryFormPage
```
<InventoryFormPage>
  <PageHeader title="Add Item | Edit Item" />
  <ItemForm>
    <FormField label="Name"><input /></FormField>
    <FormField label="Category"><select /></FormField>
    <FormField label="Cost (CAD)"><input type="number" /></FormField>
    <FormField label="Initial Stock"><input type="number" /></FormField>
    <FormField label="Low Stock Threshold"><input type="number" /></FormField>
    <Button>Save</Button>
    <Button variant="secondary">Cancel</Button>
  </ItemForm>
</InventoryFormPage>
```

| Component | State | API Calls |
|---|---|---|
| `InventoryFormPage` | `isEdit` (from route param), `item?` (prefill if edit) | `GET /api/items/:id/` (edit), `POST /api/items/` (create), `PUT /api/items/:id/` (update) |
| `ItemForm` | `useForm({ name, category, cost, stock_count, low_stock_threshold })`, `errors` | — |

#### StockUpdateModal
```
<StockUpdateModal>
  <FormField label="Operation"><select (set/add/subtract) /></FormField>
  <FormField label="Quantity"><input type="number" /></FormField>
  <Button>Update Stock</Button>
</StockUpdateModal>
```

| Component | State | API Calls |
|---|---|---|
| `StockUpdateModal` | `useForm({ operation, quantity })`, `open` | `PATCH /api/items/:id/stock/` |

#### CategoryManagementPage
```
<CategoryManagementPage>
  <PageHeader title="Categories" />
  <CategoryForm (inline add) />
  <DataTable columns={[name, item_count, actions]}>
    <InlineEditField /> (rename)
    <DeleteButton /> (only if item_count === 0)
  </DataTable>
</CategoryManagementPage>
```

| Component | State | API Calls |
|---|---|---|
| `CategoryManagementPage` | `categories[]`, `loading` | `GET /api/categories/`, `POST /api/categories/`, `PUT /api/categories/:id/`, `DELETE /api/categories/:id/` |

---

### FE-03: Clients Feature

#### ClientListPage
```
<ClientListPage>
  <PageHeader title="Clients" actions={[RegisterClientButton]} />
  <SearchInput />
  <DataTable columns={[name, card_id, balance, actions]}>
    <CurrencyDisplay /> (balance column)
    <ActionButtons (view, edit) />
  </DataTable>
</ClientListPage>
```

| Component | State | API Calls |
|---|---|---|
| `ClientListPage` | `clients[]`, `search`, `loading` | `GET /api/clients/?search=` |

#### ClientFormPage
```
<ClientFormPage>
  <PageHeader title="Register Client | Edit Client" />
  <ClientForm>
    <FormField label="Name"><input /></FormField>
    <FormField label="Card ID"><input /></FormField>
    <Button>Save</Button>
  </ClientForm>
</ClientFormPage>
```

| Component | State | API Calls |
|---|---|---|
| `ClientFormPage` | `isEdit`, `client?` | `GET /api/clients/:id/` (edit), `POST /api/clients/` (create), `PUT /api/clients/:id/` (update) |

#### ClientDetailPage
```
<ClientDetailPage>
  <PageHeader title="Client: {name}" actions={[EditButton, AddBalanceButton]} />
  <ClientInfoCard (name, card_id, balance) />
  <AddBalanceModal />
  <RecentTransactions>
    <DataTable columns={[date, total, items_count]} />
  </RecentTransactions>
</ClientDetailPage>
```

| Component | State | API Calls |
|---|---|---|
| `ClientDetailPage` | `client`, `transactions[]`, `loading` | `GET /api/clients/:id/`, `GET /api/transactions/?client=:id` |
| `AddBalanceModal` | `useForm({ amount })`, `open` | `POST /api/clients/:id/balance/` |

---

### FE-04: Checkout Feature

#### CheckoutPage
```
<CheckoutPage>
  <PageHeader title="Checkout" />
  <!-- Phase 1: Client Identification -->
  <CardSimulator (if no client identified)>
    <FormField label="Card ID"><input /></FormField>
    <Button>Simulate Card Tap</Button>
  </CardSimulator>

  <!-- Phase 2: Cart Building (after client identified) -->
  <CheckoutWorkspace (if client identified)>
    <ClientBanner (name, balance, cart total, remaining) />
    <div (two-column layout)>
      <ItemBrowser>
        <SearchInput />
        <CategoryFilter />
        <ItemGrid>
          <ItemCard (name, cost, stock, add button) /> ...
        </ItemGrid>
      </ItemBrowser>
      <CartPanel>
        <CartItemList>
          <CartItemRow (name, qty control, unit cost, line total, remove) /> ...
        </CartItemList>
        <CartSummary (total, balance comparison) />
        <div (action buttons)>
          <Button variant="primary">Process Checkout</Button>
          <Button variant="danger">Cancel</Button>
        </div>
      </CartPanel>
    </div>
  </CheckoutWorkspace>

  <!-- Phase 3: Result -->
  <CheckoutResult (success/failure modal) />
</CheckoutPage>
```

| Component | State | API Calls |
|---|---|---|
| `CheckoutPage` | `phase: 'identify' | 'cart' | 'result'`, `client`, `cart` | — (delegates to children) |
| `CardSimulator` | `useForm({ cardId })`, `error` | `GET /api/clients/lookup/?card_id=`, `POST /api/carts/` |
| `ClientBanner` | — | — (props from parent) |
| `ItemBrowser` | `items[]`, `search`, `categoryFilter` | `GET /api/items/?search=&category=` |
| `ItemCard` | — | — |
| `CartPanel` | — | — (uses cart from context/parent) |
| `CartItemRow` | `quantity` (local for optimistic UI) | `PATCH /api/carts/:id/items/:item_id/`, `DELETE /api/carts/:id/items/:item_id/` |
| `CartSummary` | — | — (computed from cart items) |
| `CheckoutResult` | `success`, `transaction?`, `error?` | — |

**Checkout Flow State Machine:**
1. `identify` → Admin enters card ID → API lookup → success → create cart → transition to `cart`
2. `cart` → Admin adds/removes items → updates server cart → can proceed to checkout
3. `cart` → Process Checkout → API call → success → transition to `result` (success)
4. `cart` → Process Checkout → API call → failure (insufficient balance) → show error, stay in `cart`
5. `cart` → Cancel → API cancel cart → transition back to `identify`
6. `result` → "New Checkout" button → transition back to `identify`

---

### FE-05: Transactions Feature

#### TransactionListPage
```
<TransactionListPage>
  <PageHeader title="Transactions" />
  <div (filters)>
    <DateRangeFilter />
    <ClientFilter />
  </div>
  <DataTable columns={[date, client_name, total, admin, actions]}>
    <CurrencyDisplay /> (total column)
    <ViewDetailButton />
  </DataTable>
</TransactionListPage>
```

| Component | State | API Calls |
|---|---|---|
| `TransactionListPage` | `transactions[]`, `dateFrom`, `dateTo`, `clientFilter`, `loading` | `GET /api/transactions/?date_from=&date_to=&client=` |

#### TransactionDetailPage
```
<TransactionDetailPage>
  <PageHeader title="Transaction #{id}" />
  <TransactionInfoCard (client, date, admin) />
  <DataTable columns={[item_name, quantity, unit_cost, line_total]}>
    <CurrencyDisplay />
  </DataTable>
  <TransactionTotal />
</TransactionDetailPage>
```

| Component | State | API Calls |
|---|---|---|
| `TransactionDetailPage` | `transaction`, `loading` | `GET /api/transactions/:id/` |

---

### FE-06: Dashboard

#### DashboardPage
```
<DashboardPage>
  <PageHeader title="Dashboard" />
  <StatsGrid>
    <StatCard label="Total Items" value={count} />
    <StatCard label="Low Stock Items" value={count} variant="warning" />
    <StatCard label="Total Clients" value={count} />
    <StatCard label="Today's Transactions" value={count} />
  </StatsGrid>
  <RecentActivity>
    <DataTable (recent transactions, limited to 5) />
  </RecentActivity>
</DashboardPage>
```

| Component | State | API Calls |
|---|---|---|
| `DashboardPage` | `stats`, `recentTransactions[]`, `loading` | `GET /api/items/` (count), `GET /api/items/?low_stock=true` (count), `GET /api/clients/` (count), `GET /api/transactions/?today=true` |

---

## State Management

### AuthContext

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
  loading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { username: string } }
  | { type: 'LOGOUT' }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'SET_LOADING'; payload: boolean };
```

**Provider responsibilities:**
- On mount: call `GET /api/auth/session/` to check existing session
- Expose `login(username, password)`, `logout()` methods
- Handle session expiry (401 responses trigger `SESSION_EXPIRED`)
- Store auth state (no tokens — session cookie is httpOnly)

### Notification Context (optional, lightweight)

```typescript
interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

type NotificationAction =
  | { type: 'ADD'; payload: Notification }
  | { type: 'DISMISS'; payload: string };
```

**Note:** Checkout state is NOT global context. It lives locally in `CheckoutPage` since only one page uses it and it doesn't persist across navigation.

---

## API Integration Patterns

### API Client (`shared/api/client.ts`)

```typescript
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    credentials: 'include',  // send session cookie
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (response.status === 401) {
    // trigger session expired in AuthContext
    throw new UnauthorizedError();
  }

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(response.status, error);
  }

  return response.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data: unknown) => request<T>(url, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(url: string, data: unknown) => request<T>(url, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(url: string, data: unknown) => request<T>(url, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
```

### Custom Hooks Pattern

```typescript
// Example: useItems hook
function useItems(params?: { search?: string; category?: number }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', String(params.category));

    setLoading(true);
    api.get<Item[]>(`/items/?${query}`)
      .then(setItems)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [params?.search, params?.category]);

  return { items, loading, error };
}
```

### Error Handling Strategy
- **401 Unauthorized**: Triggers `SESSION_EXPIRED` action in AuthContext → redirect to login
- **400 Bad Request**: Display field-level validation errors from API response on the form
- **404 Not Found**: Display "not found" message or redirect to list page
- **409 Conflict**: Display conflict message (e.g., duplicate card ID)
- **422/Business Errors**: Display business error message (e.g., insufficient balance, insufficient stock)
- **500 Server Error**: Display generic "Something went wrong" alert

---

## Session Timeout Handling

- AuthContext sets up a periodic check (every 60 seconds) calling `GET /api/auth/session/`
- If 401 is returned, dispatch `SESSION_EXPIRED`
- Display "Your session has expired. Please log in again." on the login page
- Any API call returning 401 also triggers session expiry flow

---

## Folder Structure

```
frontend/src/
├── main.tsx
├── App.tsx
├── features/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── LoginForm.tsx
│   │   ├── AuthContext.tsx
│   │   └── ProtectedRoute.tsx
│   ├── inventory/
│   │   ├── InventoryListPage.tsx
│   │   ├── InventoryFormPage.tsx
│   │   ├── StockUpdateModal.tsx
│   │   ├── CategoryManagementPage.tsx
│   │   ├── CategoryFilter.tsx
│   │   └── LowStockIndicator.tsx
│   ├── clients/
│   │   ├── ClientListPage.tsx
│   │   ├── ClientFormPage.tsx
│   │   ├── ClientDetailPage.tsx
│   │   └── AddBalanceModal.tsx
│   ├── checkout/
│   │   ├── CheckoutPage.tsx
│   │   ├── CardSimulator.tsx
│   │   ├── ClientBanner.tsx
│   │   ├── ItemBrowser.tsx
│   │   ├── ItemCard.tsx
│   │   ├── CartPanel.tsx
│   │   ├── CartItemRow.tsx
│   │   ├── CartSummary.tsx
│   │   └── CheckoutResult.tsx
│   ├── transactions/
│   │   ├── TransactionListPage.tsx
│   │   └── TransactionDetailPage.tsx
│   └── dashboard/
│       └── DashboardPage.tsx
├── shared/
│   ├── api/
│   │   ├── client.ts
│   │   └── types.ts
│   ├── components/
│   │   ├── AppLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── PageHeader.tsx
│   │   ├── DataTable.tsx
│   │   ├── SearchInput.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── AlertBanner.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Badge.tsx
│   │   ├── FormField.tsx
│   │   ├── Button.tsx
│   │   └── CurrencyDisplay.tsx
│   ├── hooks/
│   │   ├── useItems.ts
│   │   ├── useClients.ts
│   │   ├── useTransactions.ts
│   │   └── useCategories.ts
│   └── context/
│       └── NotificationContext.tsx
└── index.css (Tailwind directives)
```
