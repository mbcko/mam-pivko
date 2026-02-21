# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MAM Pivko is a pub crawl planner for a group of friends. The group organizes regular evenings called "MAM Pivko" — typically a "tour de beer" through a neighborhood, starting with dinner at one pub and moving through several more during the evening. The organizer (rotating responsibility) plans the evening by selecting a starting pub and a route of subsequent pubs. The app also maintains an editable archive of past events.

**Repository:** [github.com/mbcko/mam-pivko](https://github.com/mbcko/mam-pivko)

## Stack

- **Backend:** Python 3.12 + FastAPI + Motor (async MongoDB driver) + Pydantic v2
- **Database:** MongoDB Atlas
- **Frontend:** React 19 + Vite, deployed as GitHub Pages
- **Hosting:** Backend on Koyeb (app: `mam-pivko`, service: `mam-pivko`)
- **Package manager:** uv (recommended) or pip

## Repository Layout

```
mam-pivko/
├── backend/
│   ├── src/mam_pivko/
│   │   ├── main.py               # uvicorn entry point
│   │   ├── config.py             # Settings (pydantic-settings, env prefix MAM_)
│   │   ├── db.py                 # Motor client, lifespan hook
│   │   ├── api/
│   │   │   ├── app.py            # create_app() factory, CORS, lifespan
│   │   │   ├── events.py         # /api/v1/events — CRUD endpoints
│   │   │   └── health.py         # GET /health
│   │   ├── models/
│   │   │   └── event.py          # Pydantic: Pub, Event, EventCreate, EventUpdate
│   │   └── services/
│   │       └── event_service.py  # Motor DB operations
│   ├── tests/
│   │   ├── conftest.py           # pytest fixtures, local MongoDB test DB
│   │   └── test_events.py        # CRUD endpoint tests (httpx AsyncClient)
│   ├── pyproject.toml
│   ├── Makefile
│   ├── Procfile                  # For Koyeb: web: uvicorn ... --port $PORT
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── vite.config.js            # base: '/mam-pivko/'
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx               # React Router routes
│   │   ├── api.js                # fetch wrapper (VITE_API_BASE_URL)
│   │   └── components/
│   │       ├── EventList.jsx     # Homepage — list of events
│   │       ├── EventDetail.jsx   # Event detail + delete
│   │       └── EventForm.jsx     # Create / edit form with pub ordering
│   └── package.json
└── .github/
    └── workflows/
        ├── backend.yml           # lint → type-check → test (on push to main)
        └── pages.yml             # npm build → deploy GitHub Pages (on push to main)
```

## Backend Commands

```bash
# Install dependencies
cd backend
uv sync

# Install in development mode (alternative)
pip install -e ".[dev]"

# Run tests
pytest

# Run single test file
pytest tests/test_events.py

# Run with coverage
pytest --cov=mam_pivko

# Linting
ruff check src/

# Type checking
mypy src/

# Makefile shortcuts
make run        # Start server locally with hot reload on :8000
make test-cov   # Run tests with coverage
make lint       # Run ruff
```

## Frontend Commands

```bash
cd frontend
npm install
npm run dev      # Vite dev server
npm run build    # Production build → dist/
npm run preview  # Preview production build
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/events` | List all events, sorted by date desc |
| POST | `/api/v1/events` | Create event |
| GET | `/api/v1/events/{id}` | Get single event |
| PUT | `/api/v1/events/{id}` | Full update event |
| DELETE | `/api/v1/events/{id}` | Delete event |

## Configuration

**Backend env vars (`backend/.env.example`):**
- `MAM_MONGODB_URI` — MongoDB Atlas connection string (required)
- `MAM_MONGODB_DB` — Database name (default: `mam_pivko`)
- `MAM_CORS_ORIGINS` — Allowed CORS origins, comma-separated (include GitHub Pages URL)
- `MAM_ENV` — `development` | `production` (default: `development`)

**Frontend env vars:**
- `VITE_API_BASE_URL` — Backend URL (default: `http://localhost:8000`)
  - Set as a GitHub Actions variable `VITE_API_BASE_URL` for Pages deploy

## Language Note

- Code, comments, and documentation are in English
- User-facing UI text is in Czech

## Deployment

### Backend — Koyeb

**App:** `mam-pivko` | **Service:** `mam-pivko`
**Deploy trigger:** Push to `main` via Koyeb GitHub integration
**Start command:** `uvicorn mam_pivko.main:app --host 0.0.0.0 --port $PORT`

Required Koyeb environment variables:
- `MAM_MONGODB_URI`, `MAM_MONGODB_DB`, `MAM_CORS_ORIGINS`, `MAM_ENV=production`

### Frontend — GitHub Pages

**URL:** `https://mbcko.github.io/mam-pivko/`
**Workflow:** `.github/workflows/pages.yml` — builds on push to `main`, deploys via `actions/deploy-pages`
**Required GitHub Actions variable:** `VITE_API_BASE_URL` (set in repo Settings → Variables → Actions)

### GitHub Actions — Backend CI

`.github/workflows/backend.yml` — runs on push to `main` and PRs touching `backend/`:
- Spins up local MongoDB service container
- Runs: ruff lint → mypy → pytest with coverage
