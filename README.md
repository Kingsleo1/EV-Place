# EV Place Limited

React/Vite electric-mobility marketplace with storefront, admin workspace, server-side authentication endpoints and Astra Data API integration.

## Included in this branch

- Responsive storefront with dark/light themes and looping hero video with static image fallback.
- Seed catalogue: eight variants per manufacturer in a 52-brand directory (416 vehicle variants), plus 10 EV parts and 10 energy-storage products.
- Product administration, active/draft/archive states, order/enquiry and technician-request workspaces, brand directory and JSON export.
- Customer sign-in/sign-up, HttpOnly signed session cookies, password hashing using Node.js scrypt, admin bootstrap login and password change.
- Astra Data API connection test, collection creation and manual sync for catalogue, enquiries and service requests.
- CQL schema at `database/evplace-schema.cql`.

## Required Vercel environment variables

Set these in **Vercel → Project → Settings → Environment Variables** for the appropriate environments:

- `SESSION_SECRET`: a long random secret (at least 32 random bytes; do not reuse an account password).
- `ADMIN_EMAIL`: `evplace@gmail.com` (optional; this is the default).
- `ADMIN_BOOTSTRAP_PASSWORD`: set this to the initial administrator password you selected. It is intentionally not committed to GitHub.
- `ASTRA_DB_API_ENDPOINT`: HTTPS Astra Data API endpoint.
- `ASTRA_DB_APPLICATION_TOKEN`: Astra application token with minimum required permissions.
- `ASTRA_DB_KEYSPACE`: existing keyspace, e.g. `evplace`.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `APP_BASE_URL`: required for one-hour, single-use password reset emails. Configure a verified sender in Resend.

Redeploy Vercel after setting environment variables so serverless functions receive them.

## Astra setup

1. Create an Astra DB database and a keyspace named `evplace` (or configure a different keyspace).
2. Create an application token with least privilege.
3. Add the server environment variables above and redeploy.
4. Sign in as the initial administrator.
5. Open **Admin → Database & sync**; use **Test connection**, then **Create required tables** (creates Data API collections), then **Sync live catalogue**.
6. Sync replaces only documents tagged as owned by the EV Place storefront sync, leaving other documents in those collections alone.
7. Run `database/evplace-schema.cql` in Astra's CQL console if you also need the separate native-CQL schema.

### CQL and Data API are distinct

The application currently uses Astra's **Data API** and creates collections named `products`, `orders`, `service_requests`, `users`, `admin_settings`, and `audit_logs`. The CQL file defines separate tables for a future native CQL/driver integration. Running CQL does not automatically create Data API collections, and creating collections does not create the CQL tables.

## Security and production limitations

- Never commit secrets. The initial admin password is provisioned through Vercel, not frontend code. Browser state does not persist Astra credentials; settings credentials are sent only for the requested HTTPS action. Prefer server environment variables in production.
- Auth uses signed HttpOnly cookies and server-side scrypt hashes. `SESSION_SECRET` is mandatory. User registration requires a working Astra connection. Admin password changes are stored in `admin_settings`; after changing it, the bootstrap password no longer authenticates.
- Password-reset requests return a privacy-preserving acknowledgement, but actual reset emails and links require an email provider.
- Catalogue, cart, favourites, garage, and admin edits currently begin in browser memory. The manual sync button persists the current catalogue and session's orders/services. Automatic persistence after every mutation and full data hydration on login remain to be implemented.
- Customer directory, role administration, payment processing, image uploads and live AI diagnostics require production integrations.
- Vehicle variants, photos, prices, range, battery health and fitment data are sample content; verify before commercial publication.
- The hero video is externally hosted. For production, use a licensed, locally hosted clip.
- Complete build, security, accessibility and end-to-end testing before launch.

## Build and deploy

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`

The feature is on `feature/full-platform`. Review and verify it, then merge into `main` or configure Vercel's production branch to deploy it.
