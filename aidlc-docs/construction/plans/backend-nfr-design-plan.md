# Backend NFR Design Plan

## Objective
Incorporate NFR requirements into concrete design patterns and logical components for the Backend API unit.

## Context
- Local/Docker deployment (no cloud infrastructure)
- SQLite database (single-writer, no connection pooling needed)
- Medium scale (3-5 admins, 50 transactions/day)
- Security extension fully enabled
- Structured logging with configurable levels

---

## Questions

### Question 1
For rate limiting on the login endpoint, what approach do you prefer?

A) Django middleware-based (e.g., django-ratelimit) — simple decorator on views
B) Custom in-memory tracking in AuthService (already tracking failed attempts for lockout, extend to rate limiting)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 2
For the CORS configuration, should the frontend origin be configurable via environment variable or hardcoded for development?

A) Environment variable (`CORS_ALLOWED_ORIGINS`) — production-ready from the start
B) Default to `http://localhost:5173` (Vite dev server) with env var override — convenient for development
X) Other (please describe after [Answer]: tag below)

[Answer]: A

### Question 3
For session storage, which approach?

A) Django's default database-backed sessions (stored in SQLite alongside app data)
B) Django's signed cookie sessions (no server-side storage, but limited session data size)
X) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Execution Steps

- [x] Step 1: Design security patterns (auth middleware, permission system, rate limiting, session config)
- [x] Step 2: Design resilience patterns (global error handler, transaction management, fail-closed)
- [x] Step 3: Design observability patterns (structured logging, health check, request tracing)
- [x] Step 4: Design logical components (middleware stack, exception handler, logging config)
- [x] Step 5: Generate nfr-design-patterns.md
- [x] Step 6: Generate logical-components.md
- [x] Step 7: Validate compliance with all applicable SECURITY rules
