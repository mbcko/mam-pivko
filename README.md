# mam-pivko

Pub crawl planner for MAM Pivko events. The app stores an archive of events, pub routes, and a wishlist of pubs to visit.

## Stack

- Frontend: React 19 + Vite
- API: Cloudflare Worker, TypeScript
- Database: Cloudflare D1
- Deployment: GitHub Pages for frontend, Cloudflare Workers for API

## Project Structure

```text
backend-worker/   Cloudflare Worker API and D1 migrations
frontend/         React app
.github/workflows GitHub Actions for Worker and Pages deploys
```

## Local Development

Install and run the Worker:

```sh
cd backend-worker
npm install
npx wrangler d1 migrations apply mam-pivko --local
npm run dev
```

Install and run the frontend:

```sh
cd frontend
npm install
npm run dev
```

Set frontend environment variables as needed:

- `VITE_API_BASE_URL` - Worker API URL
- `VITE_MAPY_API_KEY` - Mapy.cz API key
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

## Checks

```sh
cd backend-worker
npm run typecheck

cd ../frontend
npm run build
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/events` | List events, sorted by date descending |
| POST | `/api/v1/events` | Create event |
| GET | `/api/v1/events/:id` | Get event |
| PUT | `/api/v1/events/:id` | Update event |
| DELETE | `/api/v1/events/:id` | Delete event |
| GET | `/api/v1/wishlist` | List wishlist items |
| POST | `/api/v1/wishlist` | Create wishlist item |
| GET | `/api/v1/wishlist/:id` | Get wishlist item |
| PUT | `/api/v1/wishlist/:id` | Update wishlist item |
| DELETE | `/api/v1/wishlist/:id` | Delete wishlist item |
| POST | `/api/v1/auth/google` | Create a session from a Google credential |
| GET | `/api/v1/auth/me` | Get the current session user |
| POST | `/api/v1/auth/logout` | Delete the current session |
| GET | `/api/v1/members` | List allowed members for authenticated users |

Write endpoints require a session cookie for an email listed in `MAM_ALLOWED_EMAILS`.
The frontend obtains that session by sending the Google login credential to `/api/v1/auth/google`.

## Deployment

The Worker deploy workflow runs on pushes to `main` that touch `backend-worker/` or `.github/workflows/backend.yml`. It installs dependencies, runs the Worker typecheck, applies D1 migrations, and deploys the Worker.

Required GitHub Actions variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `MAM_GOOGLE_CLIENT_ID`
- `MAM_ALLOWED_EMAILS`
- `MAM_CORS_ORIGINS`

For the current production frontend, `MAM_CORS_ORIGINS` should include the origin only:

```txt
https://mbcko.github.io
```

Required GitHub Actions secrets:

- `CLOUDFLARE_API_TOKEN`

The frontend deploy workflow builds `frontend/` and publishes to GitHub Pages. Set `VITE_API_BASE_URL`, `VITE_MAPY_API_KEY`, and `VITE_GOOGLE_CLIENT_ID` as GitHub Actions variables for the frontend build.

See [backend-worker/CLOUDFLARE.md](backend-worker/CLOUDFLARE.md) for Cloudflare-specific setup.
