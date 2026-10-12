# EV Place deployment and Astra DB setup

## 1. Secure administrator setup
In Vercel → Project → Settings → Environment Variables, configure:
- `ADMIN_EMAIL=evplace@gmail.com`
- `ADMIN_BOOTSTRAP_PASSWORD`: set the initial password privately in Vercel. Never put it in source code, commits, issues or screenshots.
- `SESSION_SECRET`: a long random secret used to sign HttpOnly session cookies.
- `ASTRA_DB_API_ENDPOINT`: the exact HTTPS Data API endpoint shown for your Astra database.
- `ASTRA_DB_APPLICATION_TOKEN`: a least-privilege Astra application token.
- `ASTRA_DB_KEYSPACE=evplace`
- `APP_BASE_URL`: your deployed public URL.

Redeploy after adding or changing environment variables. Sign in with the configured admin email and bootstrap password. Then create the Astra Data API collections and change the bootstrap password in Settings & security. Password-reset email delivery additionally requires `RESEND_API_KEY` and `RESEND_FROM_EMAIL` with a verified sender domain.

## 2. Astra setup
1. Create an Astra DB database and enable its Data API.
2. Copy the exact Data API endpoint and create an application token with access to the intended keyspace.
3. Set the environment variables above in Vercel. Do not commit tokens or paste them into public issue trackers.
4. Deploy the latest GitHub commit.
5. Sign in as admin → Database & sync → Test connection.
6. Click Create required tables. In the current implementation this creates Data API collections: `products`, `orders`, `service_requests`, `users`, `admin_settings`, `audit_logs`, and `password_resets`.
7. Click Sync live catalogue to seed the starter catalogue. Verify the counts in the preview and use Load from Astra to reload persisted records.

The dashboard supports one-time endpoint/token values for admin operations. They are sent to the server over HTTPS and are not stored in browser storage. For regular production usage, use Vercel server-side environment variables. The app cannot automatically edit Vercel project variables; GitHub commits trigger a deployment only if the repository is connected to your Vercel project.

## 3. CQL versus Astra Data API
`schema.cql` is a logical CQL schema reference for deployments that use the Cassandra/CQL interface. The current Vercel application uses Astra Data API JSON commands. CQL tables and Data API collections are different interfaces; running `schema.cql` alone will not create the collections the current app uses. Use the dashboard's collection-creation button for this application. Confirm keyspace and database compatibility before running any CQL DDL.

## 4. Catalogue seed data
The starter frontend generates eight sample vehicle variants per listed manufacturer and includes ten sample spare parts and ten sample energy-storage products. Sample pricing, imagery, stock, specifications and battery-health values are demonstration data. Verify each listing and its local availability before representing it as confirmed stock.

## 5. Operational boundaries
- Product edits, archive actions, order-status changes and service-status changes call protected admin API routes. If Astra is unavailable, the UI may retain a local-session change and display a warning; sync after configuring Astra.
- Enquiries and technician requests are stored in Astra only when server-side database configuration is available. A WhatsApp hand-off is not itself a confirmed order or payment.
- The current diagnosis is preliminary triage, not a live AI diagnosis or OBD scan.
- Online payments, delivery/fulfilment integrations, VIN decoding, image uploads, and full staff-role management require additional implementation and provider configuration.
