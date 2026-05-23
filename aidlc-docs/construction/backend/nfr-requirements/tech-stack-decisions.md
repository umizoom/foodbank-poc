# Tech Stack Decisions — Backend

## Runtime & Framework

| Component | Choice | Version | Rationale |
|---|---|---|---|
| Language | Python | 3.13 | Newest stable, user preference |
| Framework | Django | 5.x (latest) | User requirement, mature ecosystem |
| API Framework | Django REST Framework | 3.x (latest) | Standard for Django REST APIs |
| WSGI Server | Gunicorn | latest | Production-grade, multi-worker |
| Database | SQLite | Built-in | MVP simplicity, migration-ready |

## Libraries & Dependencies

| Library | Purpose | Pinned Version Strategy |
|---|---|---|
| django | Web framework | Pin major.minor (e.g., ==5.1.*) |
| djangorestframework | REST API | Pin major.minor |
| gunicorn | Production WSGI server | Pin major.minor |
| django-cors-headers | CORS configuration | Pin major.minor |
| python-json-logger | Structured JSON logging | Pin exact |

## Testing Libraries

| Library | Purpose |
|---|---|
| pytest | Test runner |
| pytest-django | Django integration for pytest |
| hypothesis | Property-based testing |
| factory-boy | Test data factories |
| pytest-cov | Coverage reporting |

## Development Tools

| Tool | Purpose |
|---|---|
| ruff | Linting and formatting (replaces flake8 + black + isort) |
| pip-tools | Dependency pinning (pip-compile) |

## Configuration Strategy

| Aspect | Approach |
|---|---|
| Settings | Django settings with environment variable overrides |
| Secrets | Environment variables (no hardcoded values) |
| Log level | `LOG_LEVEL` env var (default: INFO, set DEBUG for verbose) |
| Database | `DATABASE_URL` env var (default: SQLite file path) |
| CORS origins | `CORS_ALLOWED_ORIGINS` env var |
| Debug mode | `DJANGO_DEBUG` env var (default: False in production) |
| Secret key | `DJANGO_SECRET_KEY` env var (required) |

## Migration Path (SQLite → PostgreSQL)

| Aspect | Current (MVP) | Future |
|---|---|---|
| Database | SQLite (file-based) | PostgreSQL |
| ORM | Django ORM | Django ORM (no change) |
| Migrations | Django migrations | Same migration files work |
| Connection | Direct file | DATABASE_URL with psycopg2 |
| Changes needed | None | Add psycopg2 dep, update env var |

**Design principle**: Use only Django ORM features compatible with both SQLite and PostgreSQL. Avoid SQLite-specific pragmas or raw SQL.

## Project Structure (Final)

```
backend/
+-- manage.py
+-- requirements/
|   +-- base.txt          (shared dependencies)
|   +-- dev.txt           (dev/test dependencies)
|   +-- prod.txt          (production dependencies)
+-- config/
|   +-- __init__.py
|   +-- settings/
|   |   +-- __init__.py
|   |   +-- base.py       (shared settings)
|   |   +-- dev.py        (development overrides)
|   |   +-- prod.py       (production overrides)
|   +-- urls.py
|   +-- wsgi.py
+-- core/
|   +-- __init__.py
|   +-- models.py
|   +-- serializers.py
|   +-- views.py
|   +-- urls.py
|   +-- permissions.py
|   +-- middleware.py      (logging, rate limiting)
|   +-- exceptions.py     (global error handler)
|   +-- services/
|   |   +-- __init__.py
|   |   +-- checkout_service.py
|   |   +-- inventory_service.py
|   |   +-- client_service.py
|   |   +-- auth_service.py
|   +-- management/
|   |   +-- commands/
|   |       +-- seed_data.py
|   +-- tests/
|   |   +-- __init__.py
|   |   +-- conftest.py
|   |   +-- factories.py
|   |   +-- test_models.py
|   |   +-- test_services.py
|   |   +-- test_views.py
|   |   +-- test_properties.py
|   +-- migrations/
+-- pytest.ini
```
