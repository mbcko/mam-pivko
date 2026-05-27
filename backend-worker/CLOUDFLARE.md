# Cloudflare Worker Deployment

The Cloudflare deployment target is a TypeScript Worker that keeps the existing backend HTTP API and talks directly to MongoDB Atlas with the MongoDB Node.js driver.

The Python backend remains in `backend/` as the reference implementation and test suite. It is not used by Cloudflare Workers because Python Workers cannot currently package `pymongo`.

## GitHub Actions configuration

Add this in GitHub under repository `Settings` -> `Secrets and variables` -> `Actions` -> `Secrets`:

- `CLOUDFLARE_API_TOKEN`: an API token scoped to deploy Workers for this account.
- `MAM_MONGODB_URI`: the Atlas connection string, including the dedicated Worker database username and password.

Add these under `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`:

- `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID.
- `MAM_GOOGLE_CLIENT_ID`: the Google OAuth client ID used by the frontend.
- `MAM_ALLOWED_EMAILS`: comma-separated allowed member emails.
- `MAM_CORS_ORIGINS`: comma-separated frontend origins.

Create the token in Cloudflare Dashboard -> `Account API tokens` -> `Create Token` -> custom token with the `Edit Cloudflare Workers` policy, scoped to the account that owns this Worker.

## Cloudflare runtime config

The GitHub Actions deploy job passes `MAM_MONGODB_URI` to `wrangler deploy` as a Cloudflare Worker secret.

The deploy job passes these GitHub Actions variables to `wrangler deploy` as Cloudflare Worker plaintext variables:

- `MAM_GOOGLE_CLIENT_ID`
- `MAM_ALLOWED_EMAILS`
- `MAM_CORS_ORIGINS`

You can also manage them manually in Cloudflare Dashboard -> `Workers & Pages` -> `mam-pivko-api` -> `Settings` -> `Variables and Secrets`.

`MAM_MONGODB_DB` is configured as a plaintext var in `wrangler.jsonc` because the database name is not sensitive. Change it there if production uses a different DB name.

## MongoDB Atlas setup

Atlas must allow inbound connections from Cloudflare Workers. If your Atlas cluster currently only allows Koyeb egress IPs, the Worker will fail to connect even with the correct connection string.

Cloudflare documents that outbound TCP socket connections are sourced from a prefix that is not part of the public Cloudflare IP range list. For Atlas, the practical options are to open Atlas Network Access broadly, or use a separate controlled egress/proxy architecture.

If using `0.0.0.0/0` in Atlas Network Access, create a dedicated database user for this Worker:

- Go to Atlas `Database Access`.
- Add a new password user, for example `mam-pivko-worker`.
- Use a long generated password.
- Grant only `readWrite` on the `mam_pivko` database.
- Do not grant `Atlas admin`, `Project owner`, `readWriteAnyDatabase`, or admin database roles.
- Put that user and password in the `MAM_MONGODB_URI` GitHub Actions secret.

The URI should point at the existing Atlas cluster and database user, for example:

```txt
mongodb+srv://mam-pivko-worker:<password>@<cluster-host>/?retryWrites=true&w=majority&appName=mam-pivko
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
