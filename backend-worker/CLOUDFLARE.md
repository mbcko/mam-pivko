# Cloudflare Worker Deployment

The Cloudflare deployment target is a TypeScript Worker that keeps the existing backend HTTP API and stores production data in Cloudflare D1.

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

## GitHub Actions configuration

Add these in GitHub under repository `Settings` -> `Secrets and variables` -> `Actions` -> `Secrets`:

- `CLOUDFLARE_API_TOKEN`: an API token scoped to deploy Workers and edit/manage D1 for this account.

Add these under `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`:

- `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID.
- `MAM_GOOGLE_CLIENT_ID`: the Google OAuth client ID used by the frontend.
- `MAM_ALLOWED_EMAILS`: comma-separated allowed member emails.
- `MAM_CORS_ORIGINS`: comma-separated frontend origins. Use origins only, not paths, for example `https://mbcko.github.io`.

The deploy workflow runs `npm ci`, typechecks the Worker, applies D1 migrations, and deploys with only plaintext Worker variables.

## Frontend switch

After the Worker is deployed, set the frontend build variable `VITE_API_BASE_URL` to the Worker URL, for example:

```txt
https://mam-pivko-api.<your-subdomain>.workers.dev
```

The Worker uses an HttpOnly session cookie after Google login. Because the GitHub Pages frontend and Workers API are on different sites, production cookies are sent as `SameSite=None; Secure`; local HTTP development uses `SameSite=Lax`.
