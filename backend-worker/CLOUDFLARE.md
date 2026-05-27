# Cloudflare Worker Deployment

The Cloudflare deployment target is a TypeScript Worker that keeps the existing backend HTTP API and stores production data in Cloudflare D1.

The Python backend remains in `backend/` as the legacy/reference implementation and test suite. Production traffic should use the Worker.

## D1 setup

Create the production database once:

```sh
cd backend-worker
npx wrangler d1 create mam-pivko
```

Paste the returned `database_id` into `wrangler.jsonc` under the `DB` binding.

Apply migrations:

```sh
npx wrangler d1 migrations apply mam-pivko --remote
```

For local development, Wrangler creates and uses a local D1 database automatically:

```sh
cd backend-worker
npm install
npx wrangler d1 migrations apply mam-pivko --local
npm run dev
```

## Migrating Atlas data

The one-time export helper reads the old Atlas `events` and `wishlist` collections and writes a SQL import file for D1. It intentionally creates new UUID primary keys while preserving the API response field name `_id`.

Run it before deleting the Atlas secret:

```sh
cd backend-worker
MAM_MONGODB_URI="mongodb+srv://..." MAM_MONGODB_DB="mam_pivko" \
  npx -p mongodb node scripts/export-atlas-to-d1-sql.mjs d1-import.sql
```

Inspect `d1-import.sql`, import it locally first, then import remotely:

```sh
npx wrangler d1 execute mam-pivko --local --file d1-import.sql
npx wrangler d1 execute mam-pivko --remote --file d1-import.sql
```

Existing bookmarked Mongo ObjectId URLs will not resolve after cutover because D1 records receive new UUIDs.

## GitHub Actions configuration

Add these in GitHub under repository `Settings` -> `Secrets and variables` -> `Actions` -> `Secrets`:

- `CLOUDFLARE_API_TOKEN`: an API token scoped to deploy Workers and edit/manage D1 for this account.

Add these under `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`:

- `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID.
- `MAM_GOOGLE_CLIENT_ID`: the Google OAuth client ID used by the frontend.
- `MAM_ALLOWED_EMAILS`: comma-separated allowed member emails.
- `MAM_CORS_ORIGINS`: comma-separated frontend origins.

The deploy workflow runs `npm ci`, typechecks the Worker, applies D1 migrations, and deploys with only plaintext Worker variables.

After cutover, remove the old MongoDB configuration:

- GitHub secret `MAM_MONGODB_URI`
- Cloudflare Worker secret `MAM_MONGODB_URI`
- GitHub/Cloudflare variable `MAM_MONGODB_DB`

## Frontend switch

After the Worker is deployed, set the frontend build variable `VITE_API_BASE_URL` to the Worker URL, for example:

```txt
https://mam-pivko-api.<your-subdomain>.workers.dev
```
