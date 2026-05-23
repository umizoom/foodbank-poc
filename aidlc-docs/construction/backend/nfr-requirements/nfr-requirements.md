# NFR Requirements — Backend

## Performance Requirements

| Metric | Target | Context |
|---|---|---|
| Standard API response (CRUD) | < 500ms | List, create, update, delete operations |
| Checkout operation | < 2 seconds | Atomic transaction with row locks |
| Login operation | < 500ms | Including lockout check |
| Concurrent admins | 3-5 simultaneous | Peak operating hours |
| Daily transactions | Up to 50 | Client checkouts per day |
| Database size | < 1GB for first year | SQLite is sufficient |

## Security Requirements (SECURITY Extension Mapping)

| SECURITY Rule | Applicability | Implementation |
|---|---|---|
| SECURITY-01 | Partial — SQLite file encryption not needed for local dev; TLS for production | Defer TLS to Docker/reverse proxy layer |
| SECURITY-02 | N/A — No load balancer/API gateway for MVP | Mark N/A |
| SECURITY-03 | Applicable | Python `logging` module with structured JSON output, configurable levels |
| SECURITY-04 | N/A — Backend is API-only (no HTML serving) | Frontend handles headers |
| SECURITY-05 | Applicable | DRF serializer validation on all endpoints, parameterized ORM queries |
| SECURITY-06 | Applicable | DRF permission classes, admin-only access |
| SECURITY-07 | N/A — No cloud networking for MVP | Mark N/A |
| SECURITY-08 | Applicable | Session auth on all endpoints, admin role check, CORS restricted |
| SECURITY-09 | Applicable | No default credentials, generic error responses, no debug in production |
| SECURITY-10 | Applicable | requirements.txt with pinned versions, no unused dependencies |
| SECURITY-11 | Applicable | Services layer isolation, rate limiting on login |
| SECURITY-12 | Applicable | PBKDF2 hashing, session management, brute-force lockout |
| SECURITY-13 | Partial | Lock file committed, no unsafe deserialization, audit trail on data changes |
| SECURITY-14 | Partial | Logging for auth failures and checkout events, configurable retention |
| SECURITY-15 | Applicable | Global exception handler, fail-closed on errors, resource cleanup |

## Reliability Requirements

| Requirement | Implementation |
|---|---|
| Atomic transactions | `@transaction.atomic` with `select_for_update()` for checkout and balance ops |
| Data integrity | DB constraints (unique, check, FK), application-level validation |
| Error recovery | Global exception handler returns safe 500 responses |
| No data loss | SQLite WAL mode for write reliability |
| Idempotency | Cart-based checkout prevents double-processing (cart deleted on success) |

## Logging Requirements

| Aspect | Specification |
|---|---|
| Framework | Python `logging` module |
| Format | Structured JSON (timestamp, level, logger, message, request_id) |
| Default level | INFO (configurable to DEBUG for verbose mode) |
| Configuration | Environment variable `LOG_LEVEL` controls verbosity |
| Security events | Login attempts (success/fail), checkout processing, balance additions |
| Sensitive data | Never log passwords, session tokens, or full card IDs |
| Output | stdout (Docker-friendly) |

## Testing Requirements

| Aspect | Specification |
|---|---|
| Framework | pytest + pytest-django |
| Unit tests | Service layer business logic, model validation |
| Integration tests | API endpoint testing via DRF test client |
| Property-based tests | Hypothesis library for pure functions (balance calculations, cart totals) |
| Coverage target | > 80% line coverage on service layer |
| Test database | SQLite in-memory for fast test execution |

## Availability Requirements

| Aspect | Specification |
|---|---|
| Uptime target | Best-effort (not mission-critical for MVP) |
| Recovery | Restart container; SQLite file persists via Docker volume |
| Backup | Manual SQLite file backup (automated backup is future enhancement) |
| Monitoring | Health check endpoint (`/api/health/`) for Docker |
