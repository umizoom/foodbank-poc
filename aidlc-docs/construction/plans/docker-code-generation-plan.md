# Docker Code Generation Plan

## Unit Context
- **Unit**: Docker / Orchestration
- **Technology**: Docker, Docker Compose, Nginx
- **Workspace Root**: /workshop/foodbank-site
- **Code Location**: /workshop/foodbank-site/ (root level)
- **Stories**: Supports all 23 stories (infrastructure layer)
- **Dependencies**: Backend (Unit 1, complete), Frontend (Unit 2, complete)

## Generation Sequence

### Step 1: Backend Dockerfile
- [x] Create `backend/Dockerfile` (Python 3.13, pip install, gunicorn, expose 8000)

### Step 2: Frontend Dockerfile
- [x] Create `frontend/Dockerfile` (Node 20 build stage + nginx serve stage)
- [x] Create `frontend/nginx.conf` (SPA routing, API proxy to backend)

### Step 3: Docker Compose
- [x] Create `docker-compose.yml` (backend + frontend services, networking, volumes, env vars)

### Step 4: Environment Configuration
- [x] Create `.env.example` (all required environment variables with defaults)

### Step 5: Documentation Summary
- [x] Create `aidlc-docs/construction/docker/code/code-summary.md`
