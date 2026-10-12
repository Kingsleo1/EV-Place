-- EV Place Limited — Astra DB CQL schema
-- IMPORTANT:
-- 1. Create the "evplace" keyspace in Astra DB first (or change the keyspace name below).
-- 2. Run this file in Astra DB CQL Console.
-- 3. The app's current serverless integration uses the Astra Data API collections
--    (products, orders, service_requests, users, admin_settings, audit_logs).
--    These CQL tables are the relational/driver schema for a future native CQL
--    integration; CQL tables and Data API collections are distinct resources.
-- 4. Never put Astra tokens, passwords or secure-connect bundles in this file or GitHub.

CREATE TABLE IF NOT EXISTS evplace.profiles (
  email text PRIMARY KEY,
  full_name text,
  role text,
  status text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS evplace.garages (
  garage_id text PRIMARY KEY,
  owner_email text,
  make text,
  model text,
  model_year int,
  trim text,
  vin text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS evplace.vehicles (
  product_id text PRIMARY KEY,
  make text,
  model text,
  model_year int,
  condition text,
  price_ngn decimal,
  battery_kwh decimal,
  range_km int,
  dc_charge_kw decimal,
  battery_soh_percent decimal,
  stock_count int,
  status text,
  sku text,
  image_url text,
  payload_json text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS evplace.parts (
  product_id text PRIMARY KEY,
  name text,
  category text,
  oem_part_number text,
  sku text,
  price_ngn decimal,
  stock_count int,
  compatibility_text text,
  status text,
  image_url text,
  payload_json text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS evplace.energy_products (
  product_id text PRIMARY KEY,
  name text,
  capacity_kwh decimal,
  chemistry text,
  continuous_output_kw decimal,
  price_ngn decimal,
  stock_count int,
  status text,
  image_url text,
  payload_json text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS evplace.favourites_by_user (
  owner_email text,
  product_id text,
  created_at timestamp,
  PRIMARY KEY ((owner_email), product_id)
);

CREATE TABLE IF NOT EXISTS evplace.enquiries_by_id (
  enquiry_id text PRIMARY KEY,
  customer_email text,
  status text,
  total_ngn decimal,
  items_json text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS evplace.orders_by_id (
  order_id text PRIMARY KEY,
  customer_email text,
  status text,
  total_ngn decimal,
  items_json text,
  payment_status text,
  fulfilment_status text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS evplace.service_requests_by_id (
  request_id text PRIMARY KEY,
  customer_email text,
  customer_name text,
  phone text,
  location text,
  vehicle_text text,
  service_type text,
  issue_text text,
  diagnostic_summary text,
  assigned_technician text,
  status text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS evplace.diagnostic_reports_by_id (
  report_id text PRIMARY KEY,
  owner_email text,
  vehicle_text text,
  symptom_summary text,
  preliminary_assessment text,
  urgency text,
  disclaimer text,
  created_at timestamp
);

CREATE TABLE IF NOT EXISTS evplace.content_sections (
  section_key text PRIMARY KEY,
  content_json text,
  updated_by text,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS evplace.audit_logs_by_day (
  day_bucket date,
  event_id timeuuid,
  actor_email text,
  action text,
  entity_type text,
  entity_id text,
  metadata_json text,
  created_at timestamp,
  PRIMARY KEY ((day_bucket), event_id)
) WITH CLUSTERING ORDER BY (event_id DESC);

CREATE TABLE IF NOT EXISTS evplace.app_settings (
  setting_key text PRIMARY KEY,
  value_json text,
  updated_by text,
  updated_at timestamp
);

-- User password hashes must only be stored in the protected server-side auth
-- collection or a dedicated credential store. Never store plaintext passwords.
-- Do not add default credentials or Astra tokens to CQL or source control.
