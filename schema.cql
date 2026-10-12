-- EV Place Limited — Astra DB / Apache Cassandra logical schema
-- Run this only if you intend to use the CQL interface and have created the keyspace.
-- IMPORTANT: The current Vercel application uses Astra Data API collections (JSON API),
-- not the CQL driver. Running this file does NOT create Data API collections.
-- To use the current app, sign in as admin and use Settings > Database & sync > Create required tables
-- (the button creates Astra Data API collections), or configure ASTRA_DB_* variables in Vercel.
-- Keep password hashes and reset tokens private; never expose this database to browsers.

CREATE KEYSPACE IF NOT EXISTS evplace
WITH replication = {'class': 'NetworkTopologyStrategy', 'datacenter1': 1};

USE evplace;

CREATE TABLE IF NOT EXISTS products (
  product_id text PRIMARY KEY,
  product_type text,
  make text,
  model text,
  name text,
  model_year int,
  condition text,
  price decimal,
  stock int,
  sku text,
  status text,
  category text,
  capacity_kwh decimal,
  output_kw decimal,
  battery_kwh decimal,
  range_km int,
  dc_charge_kw int,
  chemistry text,
  image_url text,
  compatibility text,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS users (
  email text PRIMARY KEY,
  full_name text,
  password_hash text,
  role text,
  status text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS garages (
  user_email text,
  garage_id text,
  make text,
  model text,
  model_year int,
  trim text,
  vin text,
  updated_at timestamp,
  PRIMARY KEY (user_email, garage_id)
);

CREATE TABLE IF NOT EXISTS enquiries (
  enquiry_id text PRIMARY KEY,
  customer_email text,
  status text,
  items_json text,
  total decimal,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS service_requests (
  request_id text PRIMARY KEY,
  customer_email text,
  customer_name text,
  phone text,
  location text,
  vehicle text,
  service_type text,
  details text,
  diagnosis_summary text,
  status text,
  assigned_technician text,
  created_at timestamp,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS admin_settings (
  setting_key text PRIMARY KEY,
  setting_value text,
  updated_at timestamp
);

CREATE TABLE IF NOT EXISTS password_resets (
  token_hash text PRIMARY KEY,
  email text,
  expires_at timestamp,
  created_at timestamp
);

CREATE TABLE IF NOT EXISTS audit_logs (
  day date,
  event_id timeuuid,
  actor_email text,
  action text,
  details_json text,
  created_at timestamp,
  PRIMARY KEY (day, event_id)
) WITH CLUSTERING ORDER BY (event_id DESC);
