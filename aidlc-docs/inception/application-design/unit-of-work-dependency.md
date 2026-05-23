# Unit of Work — Dependency Matrix

## Dependency Matrix

| Unit | Depends On | Depended By | Dependency Type |
|---|---|---|---|
| Backend API | None | Frontend, Docker | API contract (REST), Dockerfile target |
| Frontend SPA | Backend API | Docker | Runtime (HTTP calls to API) |
| Docker | Backend, Frontend | None | Build artifact (Dockerfiles wrap each unit) |

## Dependency Details

### Backend API → (no upstream dependencies)
- Self-contained Django application
- SQLite database is embedded (no external DB service)
- Can be developed, tested, and run independently

### Frontend SPA → Backend API
- **Dependency type**: Runtime API contract
- **What's needed**: Stable API endpoint definitions (URLs, request/response schemas)
- **When needed**: Before frontend implementation begins
- **How satisfied**: API contract defined in application-design.md (already complete)
- **Risk**: API changes during backend development require frontend updates

### Docker → Backend + Frontend
- **Dependency type**: Build artifacts
- **What's needed**: Complete, buildable source code for both units
- **When needed**: After both units have passing code generation
- **How satisfied**: Dockerfiles reference the source directories
- **Risk**: Low — Docker wraps existing code, doesn't modify it

## Integration Points

```
+-------------------+          +-------------------+
|   Frontend SPA    |  HTTP    |   Backend API     |
|   (nginx:80)      | -------> |   (django:8000)   |
+-------------------+          +-------------------+
         |                              |
         |   docker-compose network     |
         +------------------------------+
                      |
              +-------+-------+
              | Docker Compose |
              | (orchestrator) |
              +---------------+
```

## Build Order Rationale

1. **Backend first**: Establishes the API surface. All business logic, data models, and validation live here. Frontend cannot be meaningfully tested without a working backend.
2. **Frontend second**: Consumes the backend API. With a stable backend, frontend development can proceed with real API responses rather than mocks.
3. **Docker last**: Purely infrastructure wrapping. Requires both units to be code-complete so Dockerfiles can build them.

## Cross-Unit Communication

| From | To | Protocol | Authentication |
|---|---|---|---|
| Frontend | Backend | HTTP/REST (JSON) | Session cookie |
| Docker Compose | Backend | Container networking (port 8000) | N/A |
| Docker Compose | Frontend | Container networking (port 80) | N/A |
