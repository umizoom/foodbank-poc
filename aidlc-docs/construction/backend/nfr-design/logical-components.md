# Logical Components — Backend

## Middleware Stack (Django request/response pipeline)

Order matters — listed in execution order:

```
Request →
  1. SecurityMiddleware (Django built-in: HSTS, etc.)
  2. CorsMiddleware (django-cors-headers: CORS handling)
  3. SessionMiddleware (Django: session loading)
  4. RequestIDMiddleware (Custom: generate/attach request UUID)
  5. RequestLoggingMiddleware (Custom: log request start/end)
  6. AuthenticationMiddleware (Django: attach user to request)
  7. RatelimitMiddleware (django-ratelimit: enforce rate limits)
→ View → Response
```

## Component: RequestIDMiddleware

**Purpose**: Generate unique request ID for log correlation
**Location**: `core/middleware.py`

```
- On request: Generate UUID4, attach as request.request_id
- On request: Add request_id to logging context (thread-local)
- On response: Add X-Request-ID header to response
```

## Component: RequestLoggingMiddleware

**Purpose**: Log all incoming requests and response status
**Location**: `core/middleware.py`

```
- On request: Log at INFO: method, path, request_id
- On response: Log at INFO: status_code, duration_ms, request_id
- Exclude: Health check endpoint (avoid log noise)
```

## Component: Global Exception Handler

**Purpose**: Catch unhandled exceptions, return safe responses
**Location**: `core/exceptions.py`

```
- Input: Exception from view/service layer
- If DRF exception (ValidationError, NotFound, etc.): Format standard DRF response
- If InsufficientBalanceError: Return 400 with message
- If InsufficientStockError: Return 400 with message
- If AccountLockedError: Return 403 with message
- If any other exception: Log full traceback at ERROR, return generic 500
- Never: Expose internal details to client
```

## Component: Custom Business Exceptions

**Purpose**: Typed exceptions for business rule violations
**Location**: `core/exceptions.py`

```python
class InsufficientBalanceError(Exception):
    """Client balance is less than cart total"""

class InsufficientStockError(Exception):
    """Item stock is less than requested quantity"""

class AccountLockedError(Exception):
    """Admin account is locked due to failed login attempts"""

class CartNotFoundError(Exception):
    """Cart does not exist or was already checked out"""
```

## Component: Permission Classes

**Purpose**: Enforce admin-only access
**Location**: `core/permissions.py`

```
- IsAdminAuthenticated: Check request.user.is_authenticated
- Applied globally via DEFAULT_PERMISSION_CLASSES
- Login and health check views override with AllowAny
```

## Component: Logging Configuration

**Purpose**: Structured JSON logging with configurable levels
**Location**: `config/settings/base.py` (LOGGING dict)

```
Loggers:
  - "core": Application logger (service/view logs)
  - "core.security": Security events (login, lockout, checkout)
  - "django.request": Django request processing
  - "django.db.backends": SQL queries (DEBUG level only)

Handlers:
  - "console": StreamHandler → stdout
  - Formatter: python-json-logger (JSON format)

Filter:
  - RequestIDFilter: Injects request_id into all log records
```

## Component: LoginAttempt Model

**Purpose**: Track failed login attempts for lockout logic
**Location**: `core/models.py`

```
Fields:
  - username: CharField
  - ip_address: GenericIPAddressField
  - attempted_at: DateTimeField (auto_now_add)
  - successful: BooleanField

Indexes:
  - (username, attempted_at) for lockout queries
```

## Component: Health Check View

**Purpose**: Docker/monitoring health verification
**Location**: `core/views.py`

```
- GET /api/health/
- Permission: AllowAny (unauthenticated)
- Checks: Execute SELECT 1 on database
- Response: {"status": "healthy", "database": "ok"} or 503 on failure
```

## Component: Pagination Configuration

**Purpose**: Consistent API pagination
**Location**: `config/settings/base.py`

```
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}
```

## Component: Filter Configuration

**Purpose**: Query parameter filtering on list endpoints
**Location**: Per-viewset `filterset_fields` and `search_fields`

```
Items: filter by category_id, search by name
Clients: search by name, card_id
Transactions: filter by client_id, date range (created_at__gte, created_at__lte)
```

## Django Settings Structure

### base.py (shared)
- INSTALLED_APPS, MIDDLEWARE stack
- REST_FRAMEWORK config (pagination, permissions, exception handler)
- LOGGING configuration (JSON, configurable level)
- SESSION configuration (DB backend, 30-min timeout, secure cookies)
- AUTH settings (password hashers: PBKDF2)
- CORS settings (from env var)

### dev.py (development)
- DEBUG = True
- ALLOWED_HOSTS = ['*']
- SESSION_COOKIE_SECURE = False (no HTTPS in dev)
- SQLite database file path
- CORS_ALLOWED_ORIGINS = ['http://localhost:5173']

### prod.py (production/Docker)
- DEBUG = False
- ALLOWED_HOSTS from env var
- SESSION_COOKIE_SECURE = True
- SECRET_KEY from env var (required)
- DATABASE from env var
- CORS_ALLOWED_ORIGINS from env var (required)

## Security Compliance Summary

| SECURITY Rule | Compliance | Component |
|---|---|---|
| SECURITY-03 | Compliant | Logging configuration (structured JSON, no PII) |
| SECURITY-05 | Compliant | DRF serializers + ORM (parameterized) |
| SECURITY-06 | Compliant | Permission classes (admin-only) |
| SECURITY-08 | Compliant | Session auth + permission classes + CORS |
| SECURITY-09 | Compliant | Global exception handler (generic errors), no DEBUG in prod |
| SECURITY-10 | Compliant | Pinned requirements, pip-tools |
| SECURITY-11 | Compliant | Services layer isolation, rate limiting |
| SECURITY-12 | Compliant | PBKDF2, secure sessions, lockout |
| SECURITY-13 | Compliant | Audit trail (BalanceLog, Transactions), no unsafe deserialization |
| SECURITY-14 | Compliant | Security event logging, append-only design |
| SECURITY-15 | Compliant | Global exception handler, fail-closed, atomic transactions |
