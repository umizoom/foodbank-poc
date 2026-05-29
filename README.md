# Food Bank Inventory Management System

An inventory management system for food banks. Admins manage inventory and process checkouts for clients who pay using RFID card balances (simulated with a button). Built with Django REST Framework (backend) and React + TypeScript (frontend).

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.9+ | [python.org](https://www.python.org/downloads/) or `pyenv install 3.9` |
| Node.js | 20.x LTS | [nodejs.org](https://nodejs.org/) or `nvm install 20` |
| npm | 10.x | Comes with Node.js |
| Docker | 24.x+ | [docker.com](https://docs.docker.com/get-docker/) (optional, for containerized deployment) |

## Quick Start (Local Development)

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements/dev.txt

# Generate and run database migrations
python manage.py makemigrations core
python manage.py migrate

# Seed initial data
# Creates: admin user, 8 product categories, 32 sample items (4 per category),
#          and 5 sample clients with card balances
python manage.py seed_data --admin-password changeme

# Start the development server
python manage.py runserver
```

The backend API will be available at http://localhost:8000. Verify with:

```bash
curl http://localhost:8000/api/health/
# {"status": "healthy"}
```

### 2. Frontend

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server (proxies /api to backend on port 8000)
npm run dev
```

The frontend will be available at http://localhost:5173. Log in with:
- Username: `admin`
- Password: `changeme`

## Quick Start (Docker)

If you prefer to run everything in containers:

```bash
# Copy and configure environment variables
cp .env.example .env
# Edit .env — at minimum set SECRET_KEY and ADMIN_PASSWORD

# Build and start both services
docker compose up --build
```

The app will be available at http://localhost (port 80). The backend API is proxied through nginx at `/api/`.

To stop:

```bash
docker compose down        # stop containers
docker compose down -v     # stop and remove database volume
```

## Project Structure

```
foodbank-site/
├── backend/               # Django REST API
│   ├── config/            # Django project settings (base, dev, prod)
│   ├── core/              # Main app (models, views, services, serializers)
│   │   ├── models/        # Item, Category, Client, Cart, Transaction
│   │   ├── services/      # Business logic (checkout, balance, inventory)
│   │   ├── serializers/   # DRF serializers
│   │   ├── views/         # API viewsets and views
│   │   └── tests/         # pytest test suite
│   ├── requirements/      # Pip requirements (base.txt, dev.txt)
│   └── Dockerfile
├── frontend/              # React SPA
│   ├── src/
│   │   ├── features/      # Feature modules (auth, inventory, clients, checkout, transactions, dashboard)
│   │   ├── shared/        # Shared components, hooks, API client, context
│   │   └── test/          # Test infrastructure (MSW mocks, render utils)
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

## Running Tests

### Backend

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage report
pytest --cov=core --cov-report=term-missing

# Run specific test modules
pytest core/tests/test_models.py
pytest core/tests/test_services.py
pytest core/tests/test_views.py
pytest core/tests/test_properties.py
```

### Frontend

```bash
cd frontend

# Run all tests (watch mode)
npm test

# Run once with coverage
npm run test:coverage

# Run specific test files
npx vitest run src/features/auth/__tests__/LoginForm.test.tsx
```

## Linting & Formatting

### Backend

```bash
cd backend
source venv/bin/activate
ruff check .          # lint
ruff format .         # format
```

### Frontend

```bash
cd frontend
npm run lint          # ESLint
npm run format        # Prettier
```

## Key Concepts

- **Currency**: All monetary values are in CAD, stored to 2 decimal places.
- **Roles**: Admin users manage inventory and process checkouts. Client users have an RFID card with a balance.
- **Checkout flow**: Admin identifies a client (card tap simulation), builds a cart, then processes checkout. The full amount is deducted atomically — if balance is insufficient, the entire transaction is rejected.
- **Balance**: Admins can add up to $2,000 CAD per top-up to a client's balance.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `changeme-...` |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins | `http://localhost` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `ADMIN_PASSWORD` | Password for seeded admin user | `admin123` |

## Troubleshooting

**Python version too old**: Django 4.2 requires Python 3.8+. Use `pyenv` or your OS package manager to install a supported version.

**Node modules fail to install**: Ensure you're on Node.js 20.x. Use `nvm install 20 && nvm use 20` if needed.

**Backend migrations fail**: Delete `backend/db.sqlite3` and re-run `python manage.py migrate`.

**Frontend can't reach backend API**: Make sure the backend is running on port 8000. The Vite dev server proxies `/api` requests there automatically.

**Docker health check fails**: The backend needs a few seconds to run migrations on first start. Wait for the health check `start_period` (10s) to pass.
