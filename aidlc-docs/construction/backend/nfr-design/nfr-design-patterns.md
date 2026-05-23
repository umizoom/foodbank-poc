# NFR Design Patterns — Backend

## 1. Security Patterns

### 1.1 Authentication & Session Management
- **Pattern**: Django session framework with database-backed storage
- **Session config**:
  - `SESSION_COOKIE_AGE = 1800` (30 minutes)
  - `SESSION_COOKIE_HTTPONLY = True`
  - `SESSION_COOKIE_SECURE = True` (in production)
  - `SESSION_COOKIE_SAMESITE = 'Lax'`
  - `SESSION_SAVE_EVERY_REQUEST = True` (resets timeout on activity)
- **Login flow**: Validate credentials → check lockout → create session → return user info
- **Logout flow**: Call `request.session.flush()` → return 200

### 1.2 Permission System
- **Pattern**: DRF custom permission class (`IsAdminAuthenticated`)
- **Default**: All views require authentication (set in `DEFAULT_PERMISSION_CLASSES`)
- **Exception**: Login endpoint and health check are public
- **Implementation**: Single permission class checks `request.user.is_authenticated`

### 1.3 Rate Limiting
- **Pattern**: `django-ratelimit` decorator on login view
- **Configuration**: 5 requests per minute per IP on login endpoint
- **Response**: HTTP 429 Too Many Requests with `Retry-After` header
- **Separate from lockout**: Rate limiting is per-IP; lockout is per-username (both apply)

### 1.4 Brute-Force Protection (Account Lockout)
- **Pattern**: Database model tracking failed attempts per username
- **Implementation**: `LoginAttempt` model (username, timestamp, success)
- **Logic**: Count failed attempts in last 15 minutes; if >= 5, reject login
- **Reset**: Successful login clears the failed attempt count
- **Design**: Fail-closed — if attempt tracking fails, deny login

### 1.5 Input Validation
- **Pattern**: DRF serializer validation as the single validation gateway
- **All endpoints**: Request data passes through serializer before reaching service layer
- **Types validated**: Field types, required fields, max lengths, format (regex for card_id)
- **Parameterized queries**: Django ORM only (no raw SQL) — injection-safe by design
- **Request body size**: Django `DATA_UPLOAD_MAX_MEMORY_SIZE = 2621440` (2.5MB)

### 1.6 CORS
- **Pattern**: `django-cors-headers` middleware
- **Configuration**: `CORS_ALLOWED_ORIGINS` from environment variable (required)
- **No wildcard**: Never use `CORS_ALLOW_ALL_ORIGINS = True` in production
- **Credentials**: `CORS_ALLOW_CREDENTIALS = True` (for session cookie)

---

## 2. Resilience Patterns

### 2.1 Global Exception Handler
- **Pattern**: DRF custom exception handler
- **Implementation**: Override `EXCEPTION_HANDLER` in DRF settings
- **Behavior**:
  - Catch all unhandled exceptions
  - Log full traceback at ERROR level (server-side only)
  - Return generic JSON error to client: `{"error": "Internal server error"}`
  - Never expose stack traces, paths, or internal details to client
  - Return appropriate HTTP status codes (400, 401, 403, 404, 500)

### 2.2 Transaction Management
- **Pattern**: `@transaction.atomic` on service methods that modify multiple models
- **Applied to**: `CheckoutService.process_checkout()`, `ClientService.add_balance()`
- **Row locking**: `select_for_update()` on Client and Item rows during checkout
- **Fail-closed**: Any exception within atomic block triggers full rollback

### 2.3 Resource Cleanup
- **Pattern**: Django ORM connection management (automatic)
- **DB connections**: Django handles connection lifecycle per-request
- **Transactions**: Atomic decorator ensures rollback on exception
- **No manual resource management needed** for SQLite + Django ORM

### 2.4 Idempotency
- **Pattern**: Cart-based checkout prevents double-processing
- **Mechanism**: Cart is deleted on successful checkout; re-submitting the same cart_id returns 404
- **Balance additions**: Logged in BalanceLog — admin can review for accidental duplicates

---

## 3. Observability Patterns

### 3.1 Structured Logging
- **Pattern**: Python `logging` + `python-json-logger`
- **Format**: JSON with fields: `timestamp`, `level`, `logger`, `message`, `request_id`
- **Output**: stdout (Docker logs collect from stdout)
- **Levels**:
  - INFO: Requests, security events, business events
  - WARNING: Validation failures, lockout triggers
  - ERROR: Unhandled exceptions, service failures
  - DEBUG: ORM queries, service method entry/exit (verbose mode)
- **Configuration**: `LOG_LEVEL` env var switches between INFO (default) and DEBUG

### 3.2 Request ID Tracing
- **Pattern**: Middleware generates UUID per request, attaches to all log entries
- **Implementation**: Custom middleware adds `request_id` to request object and logging context
- **Propagation**: All service-layer logs include the request_id for correlation

### 3.3 Security Event Logging
- **Events logged at INFO level**:
  - Login success (username, IP)
  - Login failure (username, IP, attempt count)
  - Account lockout triggered (username, IP)
  - Checkout processed (client_id, total, admin)
  - Balance added (client_id, amount, admin)
- **Never logged**: Passwords, session tokens, full card IDs (mask to last 4 chars)

### 3.4 Health Check
- **Pattern**: Unauthenticated endpoint at `/api/health/`
- **Response**: `{"status": "healthy", "database": "ok"}` with HTTP 200
- **Check**: Executes a simple DB query to verify database connectivity
- **Use**: Docker HEALTHCHECK and monitoring

---

## 4. Performance Patterns

### 4.1 Database Query Optimization
- **Pattern**: `select_related()` and `prefetch_related()` for related objects
- **Applied to**: Cart with items (prefetch CartItems + Item), Transaction with items
- **Avoid N+1**: All list endpoints use appropriate prefetch strategies

### 4.2 Pagination
- **Pattern**: DRF `PageNumberPagination`
- **Default page size**: 20 items
- **Max page size**: 100 items
- **Applied to**: Items list, clients list, transactions list

### 4.3 Filtering & Search
- **Pattern**: DRF `django-filter` for filtering, `SearchFilter` for text search
- **Items**: Filter by category, search by name
- **Clients**: Search by name or card_id
- **Transactions**: Filter by client, date range
