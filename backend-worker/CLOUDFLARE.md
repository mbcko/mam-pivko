# Cloudflare Worker Deployment

The Cloudflare deployment target is a TypeScript Worker that keeps the existing backend HTTP API and talks directly to MongoDB Atlas with the MongoDB Node.js driver.

The Python backend remains in `backend/` as the reference implementation and test suite. It is not used by Cloudflare Workers because Python Workers cannot currently package `pymongo`.

## GitHub Actions secrets

Add these in GitHub under repository `Settings` -> `Secrets and variables` -> `Actions` -> `Secrets`:

- `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID.
- `CLOUDFLARE_API_TOKEN`: an API token scoped to deploy Workers for this account.
- `MAM_MONGODB_URI`: the Atlas connection string.
- `MAM_GOOGLE_CLIENT_ID`: the Google OAuth client ID used by the frontend.
- `MAM_ALLOWED_EMAILS`: comma-separated allowed member emails.
- `MAM_CORS_ORIGINS`: comma-separated frontend origins.

Create the token in Cloudflare Dashboard -> `Account API tokens` -> `Create Token` -> custom token with the `Edit Cloudflare Workers` policy, scoped to the account that owns this Worker.

## Cloudflare runtime variables and secrets

The GitHub Actions deploy job syncs these GitHub Secrets into Cloudflare Worker secrets after each deploy:

- `MAM_MONGODB_URI`
- `MAM_GOOGLE_CLIENT_ID`
- `MAM_ALLOWED_EMAILS`
- `MAM_CORS_ORIGINS`

You can also manage them manually in Cloudflare Dashboard -> `Workers & Pages` -> `mam-pivko-api` -> `Settings` -> `Variables and Secrets`.

`MAM_MONGODB_DB` is configured as a plaintext var in `wrangler.jsonc` because the database name is not sensitive. Change it there if production uses a different DB name.

## MongoDB Atlas network access

Atlas must allow inbound connections from Cloudflare Workers. If your Atlas cluster currently only allows Koyeb egress IPs, the Worker will fail to connect even with the correct connection string.

Cloudflare documents that outbound TCP socket connections are sourced from a prefix that is not part of the public Cloudflare IP range list. For Atlas, the practical options are to open Atlas Network Access broadly, or use a separate controlled egress/proxy architecture.

The same secrets can also be set locally with Wrangler:

```sh
cd backend-worker
npx wrangler secret put MAM_MONGODB_URI
npx wrangler secret put MAM_GOOGLE_CLIENT_ID
npx wrangler secret put MAM_ALLOWED_EMAILS
npx wrangler secret put MAM_CORS_ORIGINS
```

## Local development

Create `backend-worker/.dev.vars` from `.dev.vars.example`, then run:

```sh
cd backend-worker
npm install
npm run dev
```

## Frontend switch

After the Worker is deployed, set the frontend build variable `VITE_API_BASE_URL` to the Worker URL, for example:

```txt
https://mam-pivko-api.<your-subdomain>.workers.dev
```
