BEGIN;
ALTER TABLE studio_users ADD COLUMN IF NOT EXISTS password_hash text;
CREATE TABLE IF NOT EXISTS studio_sessions (token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES studio_users(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL);
CREATE TABLE IF NOT EXISTS studio_records (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL CHECK(kind IN ('products','assets','pieces','descriptions','campaigns','videos')),
 title varchar(120) NOT NULL CHECK(length(trim(title))>0), data jsonb NOT NULL,
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','in_review','approved','rejected','archived')),
 created_by uuid NOT NULL REFERENCES studio_users(id), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS studio_product_sku ON studio_records ((data->>'sku')) WHERE kind='products';
CREATE TABLE IF NOT EXISTS studio_reviews (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), record_id uuid NOT NULL REFERENCES studio_records(id), reviewer_id uuid NOT NULL REFERENCES studio_users(id), decision text NOT NULL CHECK(decision IN ('approved','rejected')), checklist jsonb NOT NULL, notes text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS studio_login_attempts (key_hash text PRIMARY KEY, attempts integer NOT NULL DEFAULT 1, window_start timestamptz NOT NULL DEFAULT now());
COMMIT;
