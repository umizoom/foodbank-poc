# Docker Code Summary

## Files Created

- `backend/Dockerfile` — Python 3.13 slim, pip install, gunicorn server
- `frontend/Dockerfile` — Multi-stage: Node 20 build + nginx production serve
- `frontend/nginx.conf` — SPA routing, API proxy to backend service, static asset caching
- `docker-compose.yml` — Orchestrates backend + frontend services with health checks
- `.env.example` — Environment variable documentation with defaults

## Architecture

```
┌─────────────┐         ┌─────────────┐
│  Frontend   │  /api/  │   Backend   │
│   (nginx)   │────────>│  (gunicorn) │
│   :80       │         │   :8000     │
└─────────────┘         └─────────────┘
                              │
                        ┌─────┴─────┐
                        │  SQLite   │
                        │  (volume) │
                        └───────────┘
```

## How to Run

```bash
# Copy environment file
cp .env.example .env
# Edit .env with real values (at minimum: SECRET_KEY, ADMIN_PASSWORD)

# Build and start
docker compose up --build

# Access
# Frontend: http://localhost
# Backend API: http://localhost:8000/api/
# Health check: http://localhost:8000/api/health/
```

## How to Stop

```bash
docker compose down
# To also remove the SQLite data volume:
docker compose down -v
```

## Key Design Decisions

- **SQLite volume**: Database persisted in named Docker volume (`sqlite-data`) so data survives container restarts
- **Health check**: Backend health check on `/api/health/` ensures frontend only starts when API is ready
- **Single compose file**: Suitable for development and small-scale production
- **Nginx proxy**: Frontend container proxies `/api/` requests to backend, avoiding CORS in production
- **Startup command**: Backend runs migrations + seed data on every start (idempotent operations)
