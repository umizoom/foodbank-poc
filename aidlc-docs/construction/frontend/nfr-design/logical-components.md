# Frontend Logical Components

## 1. API Layer

### ApiClient (`shared/api/client.ts`)
Central HTTP client wrapping native fetch with NFR patterns.

**Responsibilities:**
- Base URL configuration (from env var `VITE_API_URL`)
- Credential inclusion (`credentials: 'include'`)
- CSRF token extraction and header injection
- Request timeout (30s via AbortController)
- Automatic retry (1 retry on network/5xx errors, 1s delay)
- Response parsing (JSON)
- 401 interception → throw UnauthorizedError
- Request deduplication for concurrent identical GETs

**Interface:**
```typescript
interface ApiClient {
  get<T>(url: string, params?: Record<string, string>): Promise<T>;
  post<T>(url: string, data?: unknown): Promise<T>;
  put<T>(url: string, data?: unknown): Promise<T>;
  patch<T>(url: string, data?: unknown): Promise<T>;
  delete<T>(url: string): Promise<T>;
}
```

### ApiError (`shared/api/errors.ts`)
Typed error classes for structured error handling.

```typescript
class ApiError extends Error {
  status: number;
  data: Record<string, string[]>;  // field-level errors
}

class UnauthorizedError extends ApiError {
  // status always 401
}

class NetworkError extends Error {
  // fetch failed entirely (timeout, DNS, offline)
}
```

---

## 2. Notification System

### Toast Container (`shared/components/ToastContainer.tsx`)
Fixed-position container at top-right rendering active toasts.

**Behavior:**
- Stacks vertically (newest on top)
- Auto-dismiss after 5 seconds (success) or 8 seconds (error)
- Manual dismiss via close button
- Max 3 visible toasts (older ones dismissed)
- Slide-in animation (Tailwind transition)

### NotificationContext (`shared/context/NotificationContext.tsx`)
Provides `addToast(type, message)` and `dismissToast(id)` to entire app.

**State:**
```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  createdAt: number;
}
```

---

## 3. Auth Infrastructure

### AuthContext (`features/auth/AuthContext.tsx`)
Global authentication state and session management.

**State & Actions:**
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: { username: string } | null;
  loading: boolean;
  sessionExpired: boolean;
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { username: string } }
  | { type: 'LOGOUT' }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'SET_LOADING'; payload: boolean };
```

**Session Heartbeat:**
- `setInterval` every 60 seconds → `GET /api/auth/session/`
- On 401 → dispatch `SESSION_EXPIRED`
- Clear interval on logout or unmount

### ProtectedRoute (`features/auth/ProtectedRoute.tsx`)
Route guard component.

**Logic:**
```
IF loading → show full-page spinner
IF !isAuthenticated → Navigate to /login (preserve attempted URL in state)
IF authenticated → render <Outlet />
```

### CSRF Token Helper (`shared/api/csrf.ts`)
Reads CSRF token from Django's `csrftoken` cookie.

```typescript
function getCsrfToken(): string | null {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}
```

---

## 4. Loading Infrastructure

### SpinnerOverlay (`shared/components/SpinnerOverlay.tsx`)
Reusable loading overlay for content areas.

**Props:**
```typescript
interface SpinnerOverlayProps {
  loading: boolean;
  children: React.ReactNode;
}
```

**Render:**
- Wraps children in `relative` container
- When `loading=true`: absolute overlay with centered spinner, dimmed background
- Children remain mounted (no unmount/remount on load toggle)

### LoadingSpinner (`shared/components/LoadingSpinner.tsx`)
Standalone animated spinner.

**Props:** `size?: 'sm' | 'md' | 'lg'`

---

## 5. Form Infrastructure

### Form Error Display (`shared/components/FormField.tsx`)
Wraps input with label and error message display.

**Props:**
```typescript
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
```

**Accessibility:**
- `<label htmlFor={id}>` with generated ID
- Error linked via `aria-describedby`
- `aria-invalid="true"` on errored fields

### useFormApiError (custom hook)
Maps API 400 responses to React Hook Form errors.

```typescript
function useFormApiError(form: UseFormReturn) {
  return (error: ApiError) => {
    if (error.status === 400 && error.data) {
      Object.entries(error.data).forEach(([field, messages]) => {
        if (field === 'non_field_errors') {
          // Set form-level error (displayed as inline alert)
        } else {
          form.setError(field, { message: messages[0] });
        }
      });
    }
  };
}
```

---

## 6. Data Fetching Hooks

### Hook Pattern (`shared/hooks/`)
Each data domain has a custom hook encapsulating fetch + state.

**Shared interface:**
```typescript
interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```

**Hooks:**
| Hook | Endpoint | Params |
|---|---|---|
| `useItems` | `GET /api/items/` | `search?`, `category?`, `low_stock?` |
| `useItem` | `GET /api/items/:id/` | `id` |
| `useCategories` | `GET /api/categories/` | — |
| `useClients` | `GET /api/clients/` | `search?` |
| `useClient` | `GET /api/clients/:id/` | `id` |
| `useTransactions` | `GET /api/transactions/` | `date_from?`, `date_to?`, `client?` |
| `useTransaction` | `GET /api/transactions/:id/` | `id` |
| `useCart` | `GET /api/carts/:id/` | `id` |

**Behavior:**
- Fetch on mount and when params change
- AbortController cancels in-flight request on unmount or param change
- Expose `refetch()` for manual refresh after mutations

---

## 7. Search & Filter Infrastructure

### SearchInput (`shared/components/SearchInput.tsx`)
Debounced search input with clear button.

**Internals:**
- Internal state for immediate display
- `useEffect` with 300ms timeout → call `onChange` with debounced value
- AbortController pattern: new search cancels previous in-flight API request
- Clear button resets to empty string

### CategoryFilter (`features/inventory/CategoryFilter.tsx`)
Dropdown select populated from `useCategories` hook.

---

## 8. Confirmation Modal

### ConfirmModal (`shared/components/ConfirmModal.tsx`)
Reusable confirmation dialog for destructive actions.

**Props:**
```typescript
interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;   // default "Confirm"
  cancelLabel?: string;    // default "Cancel"
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}
```

**Behavior:**
- Focus trapped inside modal when open
- Escape key closes modal
- Click outside closes modal
- Confirm button shows loading state during async action
- `aria-modal="true"`, `role="dialog"`, `aria-labelledby`

---

## 9. Testing Infrastructure

### MSW Setup (`src/test/mocks/`)

**Structure:**
```
src/test/
├── mocks/
│   ├── handlers.ts         (default success handlers for all endpoints)
│   ├── server.ts           (MSW setupServer)
│   └── data.ts             (mock data factories)
├── utils/
│   └── render.tsx          (renderWithProviders helper)
└── setup.ts                (vitest global setup — start MSW server)
```

**Handler pattern:**
```typescript
// handlers.ts
export const handlers = [
  http.get('/api/items/', () => HttpResponse.json(mockItems)),
  http.post('/api/auth/login/', async ({ request }) => {
    const body = await request.json();
    if (body.username === 'admin') return HttpResponse.json({ username: 'admin' });
    return HttpResponse.json({ non_field_errors: ['Invalid Credentials'] }, { status: 401 });
  }),
  // ... all endpoints
];
```

**Test utility:**
```typescript
// render.tsx
function renderWithProviders(ui: React.ReactElement, options?: {
  authenticated?: boolean;
  route?: string;
}) {
  return render(
    <AuthProvider initialState={options?.authenticated ? authenticatedState : null}>
      <NotificationProvider>
        <MemoryRouter initialEntries={[options?.route || '/']}>
          {ui}
        </MemoryRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
```

---

## 10. Environment Configuration

### Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | Backend API base URL |

### Vite Dev Proxy (alternative to CORS in dev)
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

When using Vite proxy, `VITE_API_URL` is set to empty string (requests go to same origin).

---

## Security Rule Compliance

| Rule | Status | Implementation |
|---|---|---|
| SEC-003 (XSS) | Compliant | React JSX escaping, no dangerouslySetInnerHTML |
| SEC-004 (CSRF) | Compliant | CSRF token from cookie, X-CSRFToken header on mutations |
| SEC-005 (Input Validation) | Compliant | React Hook Form validation (client-side defense-in-depth) |
| SEC-007 (Sensitive Storage) | Compliant | No tokens in localStorage; httpOnly session cookie only |
| SEC-009 (Error Disclosure) | Compliant | Friendly messages only; raw API errors not exposed to user |
| SEC-010 (Dependencies) | Compliant | npm audit; no known-vulnerable packages |
| SEC-011 (CSP) | Compliant | No inline scripts; external bundles only |
| SEC-001 (Auth) | N/A | Backend responsibility |
| SEC-002 (Authorization) | N/A | Backend responsibility |
| SEC-006 (SQL Injection) | N/A | No direct DB access from frontend |
| SEC-008 (Logging) | N/A | Backend responsibility |
| SEC-012 (Rate Limiting) | N/A | Backend responsibility |
| SEC-013 (Session) | N/A | Backend manages session lifecycle |
| SEC-014 (Encryption) | N/A | HTTPS configured at infrastructure level |
| SEC-015 (Secrets) | N/A | No secrets in frontend code |
