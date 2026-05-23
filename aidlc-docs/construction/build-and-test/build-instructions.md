# Build Instructions

## Prerequisites
- **Python**: 3.13+
- **Node.js**: 20.x LTS
- **npm**: 10.x
- **Docker**: 24.x+ (optional, for containerized deployment)
- **Docker Compose**: v2.x+ (optional)

## System Requirements
- OS: Linux, macOS, or Windows (WSL2 for Docker)
- Memory: 2GB minimum
- Disk: 1GB free space

---

## Option A: Local Development Build

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements/dev.txt

# Run migrations
python manage.py migrate

# Seed initial data (creates admin user + default categories)
python manage.py seed_data --admin-password changeme

# Verify backend starts
python manage.py runserver
# Expected: "Starting development server at http://127.0.0.1:8000/"
# Verify: http://localhost:8000/api/health/ returns {"status": "healthy"}
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Verify frontend starts (in separate terminal)
npm run dev
# Expected: "Local: http://localhost:5173/"
# API proxy configured: /api → http://localhost:8000

# Verify: Open http://localhost:5173 in browser — should show login page
```

### 3. Build Frontend for Production

```bash
cd frontend
npm run build
# Output: frontend/dist/ directory with index.html + assets/
```

---

## Option B: Docker Build

```bash
# From project root
cp .env.example .env
# Edit .env: set SECRET_KEY and ADMIN_PASSWORD

# Build all images
docker compose build

# Expected output:
# ✓ backend built successfully
# ✓ frontend built successfully
```

---

## Verify Build Success

### Backend
- `python manage.py check` — no issues found
- `python manage.py showmigrations` — all migrations applied
- `http://localhost:8000/api/health/` — returns `{"status": "healthy"}`

### Frontend
- `npm run build` — exits with code 0, no TypeScript errors
- `frontend/dist/index.html` exists
- `frontend/dist/assets/` contains .js and .css bundles

### Docker
- `docker compose up --build` — both services start
- `http://localhost` — frontend loads
- `http://localhost:8000/api/health/` — backend healthy

---

## Troubleshooting

### Python version mismatch
- **Cause**: System Python is < 3.13
- **Solution**: Install Python 3.13 via pyenv or deadsnakes PPA

### Node modules fail to install
- **Cause**: Node.js version incompatibility
- **Solution**: Use `nvm install 20 && nvm use 20`

### Backend migrations fail
- **Cause**: Database file locked or corrupted
- **Solution**: Delete `backend/db.sqlite3` and re-run `python manage.py migrate`

### Frontend TypeScript errors on build
- **Cause**: Type mismatch in API responses
- **Solution**: Ensure `shared/api/types.ts` matches backend serializer output

### Docker backend health check fails
- **Cause**: Migrations not yet complete
- **Solution**: Wait for `start_period` (10s) — health check has retry logic
