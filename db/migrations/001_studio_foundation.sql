-- STUDIO / Capricho Imports - PostgreSQL 15+
-- Execute only in a dedicated STUDIO database after security review.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS studio_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_qore_user_id text UNIQUE,
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin','editor','reviewer','viewer')),
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS studio_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(120) NOT NULL CHECK (length(trim(title)) > 0),
  brand varchar(100) NOT NULL,
  channel varchar(100) NOT NULL,
  sku varchar(80) NOT NULL DEFAULT '',
  objective text NOT NULL CHECK (length(trim(objective)) > 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','approved','rejected','archived')),
  created_by uuid NOT NULL REFERENCES studio_users(id),
  updated_by uuid REFERENCES studio_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_studio_briefings_created_at ON studio_briefings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_briefings_status ON studio_briefings(status);
CREATE INDEX IF NOT EXISTS idx_studio_briefings_brand ON studio_briefings(brand);
CREATE TABLE IF NOT EXISTS studio_audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_user_id uuid REFERENCES studio_users(id),
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  changes jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_studio_audit_entity ON studio_audit_log(entity_type,entity_id);
COMMIT;
