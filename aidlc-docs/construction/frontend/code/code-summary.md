# Frontend Code Summary

## Files Created

### Project Configuration
- `frontend/package.json` — Dependencies and scripts
- `frontend/tsconfig.json` — TypeScript strict config with path aliases
- `frontend/vite.config.ts` — Vite config (proxy, path aliases, test setup)
- `frontend/tailwind.config.js` — Tailwind content paths
- `frontend/postcss.config.js` — PostCSS plugins
- `frontend/.eslintrc.cjs` — ESLint with TypeScript + React rules
- `frontend/.prettierrc` — Prettier formatting config
- `frontend/index.html` — Vite entry point
- `frontend/src/index.css` — Tailwind directives
- `frontend/src/main.tsx` — React root render
- `frontend/src/App.tsx` — Router, providers, route definitions

### Shared — API Layer
- `frontend/src/shared/api/types.ts` — All TypeScript interfaces (Item, Client, Cart, Transaction, etc.)
- `frontend/src/shared/api/errors.ts` — ApiError, UnauthorizedError, NetworkError classes
- `frontend/src/shared/api/csrf.ts` — CSRF token extraction from cookie
- `frontend/src/shared/api/client.ts` — API client (timeout, retry, CSRF, 401 interception)

### Shared — Context
- `frontend/src/features/auth/AuthContext.tsx` — Auth state, login/logout, session heartbeat
- `frontend/src/shared/context/NotificationContext.tsx` — Toast notifications state

### Shared — UI Components
- `frontend/src/shared/components/Button.tsx` — Variants, sizes, loading state
- `frontend/src/shared/components/FormField.tsx` — Label, error, accessibility attributes
- `frontend/src/shared/components/DataTable.tsx` — Generic table with columns, loading, empty states
- `frontend/src/shared/components/SearchInput.tsx` — Debounced search with clear
- `frontend/src/shared/components/ConfirmModal.tsx` — Confirmation dialog with focus trap
- `frontend/src/shared/components/AlertBanner.tsx` — Inline alert notifications
- `frontend/src/shared/components/ToastContainer.tsx` — Toast notification display
- `frontend/src/shared/components/SpinnerOverlay.tsx` — Loading overlay
- `frontend/src/shared/components/LoadingSpinner.tsx` — Animated spinner
- `frontend/src/shared/components/Badge.tsx` — Numeric badge
- `frontend/src/shared/components/CurrencyDisplay.tsx` — CAD currency formatting
- `frontend/src/shared/components/PageHeader.tsx` — Page title with actions

### Shared — Layout
- `frontend/src/shared/components/AppLayout.tsx` — Sidebar + TopBar + content
- `frontend/src/shared/components/Sidebar.tsx` — Navigation with low-stock badge
- `frontend/src/shared/components/TopBar.tsx` — Admin name + logout
- `frontend/src/features/auth/ProtectedRoute.tsx` — Auth gate

### Shared — Hooks
- `frontend/src/shared/hooks/useItems.ts` — Items data fetching
- `frontend/src/shared/hooks/useCategories.ts` — Categories data fetching
- `frontend/src/shared/hooks/useClients.ts` — Clients data fetching
- `frontend/src/shared/hooks/useTransactions.ts` — Transactions data fetching
- `frontend/src/shared/hooks/useFormApiError.ts` — API error → form error mapping

### Auth Feature
- `frontend/src/features/auth/LoginPage.tsx` — Login page container
- `frontend/src/features/auth/LoginForm.tsx` — Login form with validation

### Dashboard Feature
- `frontend/src/features/dashboard/DashboardPage.tsx` — Stats cards + recent transactions

### Inventory Feature
- `frontend/src/features/inventory/InventoryListPage.tsx` — Item table with filters
- `frontend/src/features/inventory/InventoryFormPage.tsx` — Create/edit item form
- `frontend/src/features/inventory/StockUpdateModal.tsx` — Stock adjustment modal
- `frontend/src/features/inventory/CategoryManagementPage.tsx` — Category CRUD
- `frontend/src/features/inventory/CategoryFilter.tsx` — Category dropdown filter
- `frontend/src/features/inventory/LowStockIndicator.tsx` — Low stock badge

### Clients Feature
- `frontend/src/features/clients/ClientListPage.tsx` — Client table with search
- `frontend/src/features/clients/ClientFormPage.tsx` — Register/edit client form
- `frontend/src/features/clients/ClientDetailPage.tsx` — Client detail + transactions
- `frontend/src/features/clients/AddBalanceModal.tsx` — Balance top-up modal

### Checkout Feature
- `frontend/src/features/checkout/CheckoutPage.tsx` — Phase state machine
- `frontend/src/features/checkout/CardSimulator.tsx` — RFID card simulation
- `frontend/src/features/checkout/ClientBanner.tsx` — Client info + balance display
- `frontend/src/features/checkout/ItemBrowser.tsx` — Item search/browse grid
- `frontend/src/features/checkout/ItemCard.tsx` — Item card with add button
- `frontend/src/features/checkout/CartPanel.tsx` — Cart items + checkout actions
- `frontend/src/features/checkout/CartItemRow.tsx` — Cart line item with qty controls
- `frontend/src/features/checkout/CartSummary.tsx` — Cart total vs balance
- `frontend/src/features/checkout/CheckoutResult.tsx` — Success/failure display

### Transactions Feature
- `frontend/src/features/transactions/TransactionListPage.tsx` — Transaction table with filters
- `frontend/src/features/transactions/TransactionDetailPage.tsx` — Transaction detail + items

### Test Infrastructure
- `frontend/src/test/setup.ts` — Vitest global setup (MSW server)
- `frontend/src/test/mocks/server.ts` — MSW server instance
- `frontend/src/test/mocks/handlers.ts` — API mock handlers for all endpoints
- `frontend/src/test/mocks/data.ts` — Mock data factories
- `frontend/src/test/utils/render.tsx` — renderWithProviders helper

### Tests
- `frontend/src/shared/components/__tests__/Button.test.tsx`
- `frontend/src/shared/components/__tests__/SearchInput.test.tsx`
- `frontend/src/shared/components/__tests__/ConfirmModal.test.tsx`
- `frontend/src/features/auth/__tests__/LoginForm.test.tsx`
- `frontend/src/features/auth/__tests__/AuthContext.test.tsx`
- `frontend/src/features/inventory/__tests__/InventoryListPage.test.tsx`
- `frontend/src/features/inventory/__tests__/InventoryFormPage.test.tsx`
- `frontend/src/features/clients/__tests__/ClientListPage.test.tsx`
- `frontend/src/features/clients/__tests__/AddBalanceModal.test.tsx`
- `frontend/src/features/checkout/__tests__/CheckoutPage.test.tsx`
- `frontend/src/features/transactions/__tests__/TransactionListPage.test.tsx`
- `frontend/src/shared/hooks/__tests__/useItems.test.ts`
- `frontend/src/shared/hooks/__tests__/useClients.test.ts`
- `frontend/src/shared/api/__tests__/client.test.ts`

## How to Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in a browser.

## How to Test

```bash
cd frontend
npm install
npm test
npm run test:coverage
```

## How to Build

```bash
cd frontend
npm run build
```

Output in `frontend/dist/`.

## Dev Server
- Frontend: http://localhost:5173
- API proxy: `/api` → http://localhost:8000 (backend must be running)
