# Frontend Code Generation Plan

## Unit Context
- **Unit**: Frontend SPA
- **Technology**: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, React Router 6, React Hook Form 7
- **Workspace Root**: /workshop/foodbank-site
- **Code Location**: /workshop/foodbank-site/frontend/
- **Stories**: All 23 user stories (frontend implementation)
- **Dependencies**: Backend API (Unit 1, complete)

## Generation Sequence

### Step 1: Project Structure Setup
- [x] Create `frontend/` directory structure
- [x] Create `frontend/package.json` (dependencies + scripts)
- [x] Create `frontend/tsconfig.json` (strict mode, path aliases)
- [x] Create `frontend/vite.config.ts` (path aliases, dev proxy, test config)
- [x] Create `frontend/tailwind.config.js` (content paths, theme)
- [x] Create `frontend/postcss.config.js` (tailwindcss, autoprefixer)
- [x] Create `frontend/.eslintrc.cjs` (TypeScript + React rules)
- [x] Create `frontend/.prettierrc` (formatting config)
- [x] Create `frontend/index.html` (Vite entry point)
- [x] Create `frontend/src/index.css` (Tailwind directives)
- [x] Create `frontend/src/main.tsx` (React root render)

### Step 2: Shared — Types & API Client
- [x] Create `frontend/src/shared/api/types.ts` (all TypeScript interfaces: Item, Category, Client, Cart, CartItem, Transaction, etc.)
- [x] Create `frontend/src/shared/api/errors.ts` (ApiError, UnauthorizedError, NetworkError classes)
- [x] Create `frontend/src/shared/api/csrf.ts` (getCsrfToken helper)
- [x] Create `frontend/src/shared/api/client.ts` (ApiClient with timeout, retry, CSRF, 401 interception)
- **Stories**: All (API foundation)

### Step 3: Shared — Context Providers
- [x] Create `frontend/src/features/auth/AuthContext.tsx` (AuthState, AuthAction, useReducer, login/logout/session check, heartbeat)
- [x] Create `frontend/src/shared/context/NotificationContext.tsx` (Toast state, addToast, dismissToast)
- **Stories**: US-1.1, US-1.2, US-1.3

### Step 4: Shared — UI Components
- [x] Create `frontend/src/shared/components/Button.tsx` (variants, sizes, loading state, data-testid)
- [x] Create `frontend/src/shared/components/FormField.tsx` (label, error, aria-describedby)
- [x] Create `frontend/src/shared/components/DataTable.tsx` (columns, data, loading, empty message)
- [x] Create `frontend/src/shared/components/SearchInput.tsx` (debounced, clear button)
- [x] Create `frontend/src/shared/components/ConfirmModal.tsx` (focus trap, escape key, loading)
- [x] Create `frontend/src/shared/components/AlertBanner.tsx` (type variants, dismiss)
- [x] Create `frontend/src/shared/components/ToastContainer.tsx` (fixed position, auto-dismiss)
- [x] Create `frontend/src/shared/components/SpinnerOverlay.tsx` (dimmed overlay + spinner)
- [x] Create `frontend/src/shared/components/LoadingSpinner.tsx` (size variants)
- [x] Create `frontend/src/shared/components/Badge.tsx` (count, variant)
- [x] Create `frontend/src/shared/components/CurrencyDisplay.tsx` (CAD format)
- [x] Create `frontend/src/shared/components/PageHeader.tsx` (title, action buttons)

### Step 5: Shared — Layout Components
- [x] Create `frontend/src/shared/components/AppLayout.tsx` (sidebar + topbar + Outlet)
- [x] Create `frontend/src/shared/components/Sidebar.tsx` (nav links, active state, low-stock badge)
- [x] Create `frontend/src/shared/components/TopBar.tsx` (admin name, logout button)
- [x] Create `frontend/src/features/auth/ProtectedRoute.tsx` (auth gate, redirect)

### Step 6: Shared — Custom Hooks
- [x] Create `frontend/src/shared/hooks/useItems.ts` (GET /api/items/ with search/category params)
- [x] Create `frontend/src/shared/hooks/useCategories.ts` (GET /api/categories/)
- [x] Create `frontend/src/shared/hooks/useClients.ts` (GET /api/clients/ with search)
- [x] Create `frontend/src/shared/hooks/useTransactions.ts` (GET /api/transactions/ with filters)
- [x] Create `frontend/src/shared/hooks/useFormApiError.ts` (maps API 400 → React Hook Form errors)
- **Stories**: All (data fetching)

### Step 7: App Shell & Routing
- [x] Create `frontend/src/App.tsx` (BrowserRouter, AuthProvider, NotificationProvider, Routes)
- **Stories**: All (navigation)

### Step 8: Auth Feature — Login Page
- [x] Create `frontend/src/features/auth/LoginPage.tsx` (page container)
- [x] Create `frontend/src/features/auth/LoginForm.tsx` (React Hook Form, API call, error display)
- **Stories**: US-1.1

### Step 9: Dashboard Feature
- [x] Create `frontend/src/features/dashboard/DashboardPage.tsx` (stats grid, recent transactions)
- **Stories**: US-6.1 (low-stock count display)

### Step 10: Inventory Feature — List & Categories
- [x] Create `frontend/src/features/inventory/InventoryListPage.tsx` (table, search, category filter, low-stock indicators)
- [x] Create `frontend/src/features/inventory/CategoryFilter.tsx` (dropdown from categories)
- [x] Create `frontend/src/features/inventory/LowStockIndicator.tsx` (warning/critical icons)
- [x] Create `frontend/src/features/inventory/CategoryManagementPage.tsx` (inline CRUD, delete restriction)
- **Stories**: US-2.4, US-2.6, US-6.1

### Step 11: Inventory Feature — Forms & Modals
- [x] Create `frontend/src/features/inventory/InventoryFormPage.tsx` (create/edit form, validation, API calls)
- [x] Create `frontend/src/features/inventory/StockUpdateModal.tsx` (operation select, quantity, PATCH)
- **Stories**: US-2.1, US-2.2, US-2.3, US-2.5, US-6.2

### Step 12: Clients Feature — List & Detail
- [x] Create `frontend/src/features/clients/ClientListPage.tsx` (table, search, balance display)
- [x] Create `frontend/src/features/clients/ClientDetailPage.tsx` (info card, balance, recent transactions)
- [x] Create `frontend/src/features/clients/AddBalanceModal.tsx` (amount validation, max $2000)
- **Stories**: US-3.2, US-3.3, US-3.4

### Step 13: Clients Feature — Forms
- [x] Create `frontend/src/features/clients/ClientFormPage.tsx` (create/edit, card_id uniqueness)
- **Stories**: US-3.1, US-3.5

### Step 14: Checkout Feature — Card Simulator & Client Banner
- [x] Create `frontend/src/features/checkout/CheckoutPage.tsx` (phase state machine: identify → cart → result)
- [x] Create `frontend/src/features/checkout/CardSimulator.tsx` (card_id input, lookup API)
- [x] Create `frontend/src/features/checkout/ClientBanner.tsx` (name, balance, cart total, remaining)
- **Stories**: US-4.1

### Step 15: Checkout Feature — Item Browser & Cart
- [x] Create `frontend/src/features/checkout/ItemBrowser.tsx` (search, category filter, item grid)
- [x] Create `frontend/src/features/checkout/ItemCard.tsx` (name, cost, stock, add button)
- [x] Create `frontend/src/features/checkout/CartPanel.tsx` (cart items list, summary, action buttons)
- [x] Create `frontend/src/features/checkout/CartItemRow.tsx` (qty control, line total, remove)
- [x] Create `frontend/src/features/checkout/CartSummary.tsx` (total, balance comparison)
- [x] Create `frontend/src/features/checkout/CheckoutResult.tsx` (success/failure display)
- **Stories**: US-4.2, US-4.3, US-4.4, US-4.5

### Step 16: Transactions Feature
- [x] Create `frontend/src/features/transactions/TransactionListPage.tsx` (table, date/client filters)
- [x] Create `frontend/src/features/transactions/TransactionDetailPage.tsx` (info card, line items table)
- **Stories**: US-5.1, US-5.2

### Step 17: Test Setup & Mocks
- [x] Create `frontend/src/test/setup.ts` (vitest global setup, MSW server start/stop)
- [x] Create `frontend/src/test/mocks/server.ts` (MSW setupServer)
- [x] Create `frontend/src/test/mocks/handlers.ts` (default handlers for all API endpoints)
- [x] Create `frontend/src/test/mocks/data.ts` (mock data factories)
- [x] Create `frontend/src/test/utils/render.tsx` (renderWithProviders helper)

### Step 18: Component Tests — Shared & Auth
- [x] Create `frontend/src/shared/components/__tests__/Button.test.tsx`
- [x] Create `frontend/src/shared/components/__tests__/SearchInput.test.tsx`
- [x] Create `frontend/src/shared/components/__tests__/ConfirmModal.test.tsx`
- [x] Create `frontend/src/features/auth/__tests__/LoginForm.test.tsx`
- [x] Create `frontend/src/features/auth/__tests__/AuthContext.test.tsx`

### Step 19: Component Tests — Features
- [x] Create `frontend/src/features/inventory/__tests__/InventoryListPage.test.tsx`
- [x] Create `frontend/src/features/inventory/__tests__/InventoryFormPage.test.tsx`
- [x] Create `frontend/src/features/clients/__tests__/ClientListPage.test.tsx`
- [x] Create `frontend/src/features/clients/__tests__/AddBalanceModal.test.tsx`
- [x] Create `frontend/src/features/checkout/__tests__/CheckoutPage.test.tsx`
- [x] Create `frontend/src/features/transactions/__tests__/TransactionListPage.test.tsx`

### Step 20: Hook Tests
- [x] Create `frontend/src/shared/hooks/__tests__/useItems.test.ts`
- [x] Create `frontend/src/shared/hooks/__tests__/useClients.test.ts`
- [x] Create `frontend/src/shared/api/__tests__/client.test.ts` (timeout, retry, CSRF, 401 handling)

### Step 21: Documentation Summary
- [x] Create `aidlc-docs/construction/frontend/code/code-summary.md` (files created, structure, how to run)
