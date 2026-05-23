# Frontend NFR Design Patterns

## 1. Error Handling Patterns

### Pattern: Dual Notification Strategy
- **Toast notifications** for transient success messages (auto-dismiss after 5 seconds)
- **Inline alerts** for errors that require user action (persist until dismissed or resolved)

| Scenario | Notification Type | Behavior |
|---|---|---|
| Item created successfully | Toast (success) | Auto-dismiss 5s |
| Balance added | Toast (success) | Auto-dismiss 5s |
| Checkout completed | Toast (success) | Auto-dismiss 5s |
| Form validation error | Inline (field-level) | Persist until field corrected |
| API 400 (business error) | Inline alert (error) | Persist until dismissed |
| API 401 (session expired) | Redirect + inline on login page | "Session expired" message |
| API 404 (not found) | Inline alert (warning) | Persist, offer navigation back |
| API 500 (server error) | Toast (error) | "Something went wrong. Please try again." |
| Network failure | Inline alert (error) | "Unable to connect to server" |
| Checkout insufficient balance | Inline alert (error) | Persist — cart stays intact for adjustment |

### Pattern: Form Error Mapping
```
API returns 400:
{
  "field_name": ["error message 1", "error message 2"],
  "non_field_errors": ["general error"]
}

→ Map to React Hook Form:
  - field_name errors → setError("field_name", { message })
  - non_field_errors → display as inline alert above form
```

### Pattern: Error Boundary (React)
- App-level ErrorBoundary catches uncaught render errors
- Displays fallback UI: "Something went wrong" with "Refresh Page" button
- Logs error to console (no external error tracking for MVP)

---

## 2. Security Patterns

### Pattern: Credential Isolation
- **No tokens in client storage** — auth relies entirely on httpOnly session cookie
- `credentials: 'include'` on all fetch requests to send cookie
- No sensitive data in localStorage, sessionStorage, or JS-accessible cookies

### Pattern: CSRF Token Handling
```
1. On login response, Django sets csrftoken cookie (readable by JS)
2. API client reads csrftoken from document.cookie
3. All mutating requests (POST/PUT/PATCH/DELETE) include X-CSRFToken header
4. GET requests do not need CSRF token
```

### Pattern: XSS Prevention
- React's JSX auto-escaping for all rendered content
- **Never** use `dangerouslySetInnerHTML`
- User-provided strings rendered as text nodes only
- No `eval()`, `new Function()`, or inline event handlers in strings

### Pattern: Session Expiry Detection
```
1. API client intercepts all responses
2. IF status === 401:
   a. Check if user was previously authenticated (AuthContext state)
   b. IF yes → dispatch SESSION_EXPIRED, navigate to /login
   c. IF no → normal login flow (user wasn't logged in)
3. Periodic session check every 60s (heartbeat to /api/auth/session/)
4. On SESSION_EXPIRED: show "Your session has expired" on login page
```

### Pattern: Input Sanitization (Defense-in-Depth)
- Client-side validation via React Hook Form (immediate UX feedback)
- Server is authoritative — client validation is UX only, not security
- Numeric fields: `type="number"` with `step`, `min`, `max` attributes
- Text fields: `maxLength` attribute enforced

---

## 3. Performance Patterns

### Pattern: Search Debouncing
```
- SearchInput component uses 300ms debounce before triggering API call
- Prevents excessive requests during typing
- Shows subtle loading indicator in search field during debounce
- Cancels in-flight request if new search initiated (AbortController)
```

### Pattern: Request Deduplication
```
- Concurrent identical GET requests are deduplicated
- If a request is in-flight and the same URL is requested again, return the same Promise
- Prevents duplicate calls from React StrictMode double-mount or rapid re-renders
```

### Pattern: Optimistic UI (Cart Only)
```
- Cart quantity changes update UI immediately (optimistic)
- API call fires in background
- On success: no action needed (UI already correct)
- On failure: revert to previous value, show error toast
- Only applied to cart quantity updates (low-risk, easily reversible)
```

### Pattern: Memoization
```
- useMemo for expensive computed values (cart totals, filtered lists)
- useCallback for event handlers passed to child components
- React.memo on list item components (ItemCard, CartItemRow) to prevent re-render on parent state change
```

---

## 4. Resilience Patterns

### Pattern: Request Timeout + Retry
```
Configuration:
  - Timeout: 30 seconds per request
  - Retry: 1 automatic retry on network failure only
  - Retry delay: 1 second
  - Retry conditions: network error, timeout, 502/503/504
  - No retry on: 400, 401, 403, 404, 409, 422, 500

Implementation:
  async function fetchWithRetry(url, options, retries = 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (retries > 0 && isRetryable(error)) {
        await delay(1000);
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  }
```

### Pattern: Graceful Degradation
- If dashboard stats API fails → show "Unable to load" per stat card, don't block page
- If categories API fails → show items without category filter, show warning
- If low-stock count fails → hide badge (don't show stale data)

---

## 5. Loading State Pattern

### Pattern: Spinner Overlay
```
Structure:
  <div class="relative">
    {content}
    {loading && (
      <div class="absolute inset-0 bg-white/60 flex items-center justify-center">
        <Spinner />
      </div>
    )}
  </div>

Behavior:
  - Content area dims (60% white overlay)
  - Centered spinner on top
  - Content remains visible but non-interactive
  - Pointer events disabled on overlay
  - No layout shift when loading starts/ends
```

| Context | Loading Trigger | Loading Clears |
|---|---|---|
| Page data | Component mount / filter change | Data received or error |
| Form submit | Submit button click | Response received |
| Modal action | Action button click | Response received |
| Cart mutation | Add/remove/update click | Cart refetch complete |

### Pattern: Button Loading State
```
- On click: disable button, replace text with spinner + "Saving..." / "Processing..."
- Prevents double-submission
- Button remains disabled until response
- On error: re-enable button for retry
```

---

## 6. Testing Patterns

### Pattern: MSW API Mocking
```
- Define request handlers matching backend API contracts
- Handlers return realistic response shapes from backend serializers
- Tests run against mocked API (no network, deterministic)
- Separate handler sets: success scenarios, error scenarios
```

### Pattern: Component Test Structure
```
1. Render component with necessary providers (Router, AuthContext)
2. Assert initial state (loading → loaded)
3. Simulate user interaction (type, click, select)
4. Assert expected outcome (API called, UI updated, navigation occurred)
```

### Pattern: Test Utilities
```
- renderWithProviders(component) — wraps in Router + AuthContext + NotificationContext
- createMockServer() — MSW server with default handlers
- screen queries prefer: getByRole > getByLabelText > getByText > getByTestId
```
