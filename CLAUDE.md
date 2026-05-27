# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MAM Pivko is a pub crawl planner for a group of friends. The group organizes regular evenings called "MAM Pivko", usually a route through several pubs. The app maintains an editable archive of past events and a wishlist of pubs to visit.

**Repository:** [github.com/mbcko/mam-pivko](https://github.com/mbcko/mam-pivko)

## Stack

- **API:** Cloudflare Worker, TypeScript
- **Database:** Cloudflare D1
- **Frontend:** React 19 + Vite, deployed as GitHub Pages
- **Package manager:** npm

## Repository Layout

```text
mam-pivko/
├── backend-worker/
│   ├── src/index.ts             # Worker API entry point
│   ├── migrations/              # D1 schema migrations
│   ├── wrangler.jsonc           # Worker and D1 binding config
│   ├── CLOUDFLARE.md            # Deployment notes
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── components/
│   └── package.json
└── .github/workflows/
    ├── backend.yml              # Worker typecheck and deploy
    └── pages.yml                # Frontend build and GitHub Pages deploy
```

## Worker Commands

```sh
cd backend-worker
npm install
npm run typecheck
npm run dev
npm run deploy
```

Apply D1 migrations:

```sh
cd backend-worker
npx wrangler d1 migrations apply mam-pivko --local
npx wrangler d1 migrations apply mam-pivko --remote
```

## Frontend Commands

```sh
cd frontend
npm install
npm run dev
npm run build
npm run preview
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
| GET | `/api/v1/wishlist` | List wishlist items |
| POST | `/api/v1/wishlist` | Create wishlist item |
| GET | `/api/v1/wishlist/{id}` | Get wishlist item |
| PUT | `/api/v1/wishlist/{id}` | Full update wishlist item |
| DELETE | `/api/v1/wishlist/{id}` | Delete wishlist item |
| GET | `/api/v1/members` | List allowed members for authenticated users |

## Configuration

**Worker variables:**

- `MAM_CORS_ORIGINS` - allowed CORS origins, comma-separated
- `MAM_GOOGLE_CLIENT_ID` - Google OAuth client ID
- `MAM_ALLOWED_EMAILS` - comma-separated allowed member emails

**Frontend variables:**

- `VITE_API_BASE_URL` - Worker API URL
- `VITE_MAPY_API_KEY` - Mapy.cz API key
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Language Note

- Code, comments, and documentation are in English
- User-facing UI text is in Czech

## Deployment

The Worker deploy is handled by `.github/workflows/backend.yml` on pushes to `main` that touch `backend-worker/` or the workflow. The workflow installs dependencies, runs the Worker typecheck, applies D1 migrations, and deploys the Worker.

The frontend deploy is handled by `.github/workflows/pages.yml` and publishes to GitHub Pages.
