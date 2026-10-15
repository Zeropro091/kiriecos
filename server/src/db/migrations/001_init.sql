-- ==============================================================================
-- KIRI PROJECT — initial schema (PostgreSQL)
-- Mirrors the TypeScript domain model in src/types/index.ts and the ER design in
-- KIRI_Technical_Architecture_Blueprint.md. Idempotent: safe to re-run.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --- Enums -------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM
    ('creator','community_lead','umkm_owner','media_partner','strategic_partner','admin','guest');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE entity_type AS ENUM
    ('creator','community','business','media','strategic');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM
    ('pending_review','approved','rejected','suspended');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE collaboration_status AS ENUM
    ('submitted','in_review','matched','connected','in_progress','completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM
    ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM
    ('pending_verification','verified','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE broadcast_scope AS ENUM
    ('indonesia','regional');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- --- profiles (auth + role) --------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  name            TEXT NOT NULL,
  role            user_role NOT NULL DEFAULT 'creator',
  entity_type     entity_type,
  entity_id       UUID,
  avatar          TEXT NOT NULL DEFAULT '',
  membership_tier TEXT NOT NULL DEFAULT 'free',
  is_verified     BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --- entities ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                entity_type NOT NULL,
  name                TEXT NOT NULL,
  handle              TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT '',
  badge               TEXT,
  verified            BOOLEAN NOT NULL DEFAULT false,
  verification_status verification_status NOT NULL DEFAULT 'pending_review',
  rejection_reason    TEXT,
  avatar              TEXT NOT NULL DEFAULT '',
  cover_image         TEXT NOT NULL DEFAULT '',
  bio                 TEXT NOT NULL DEFAULT '',
  location            TEXT NOT NULL DEFAULT '',
  website             TEXT,
  instagram           TEXT,
  tiktok              TEXT,
  youtube             TEXT,
  tags                TEXT[] NOT NULL DEFAULT '{}',
  looking_for         TEXT[] NOT NULL DEFAULT '{}',
  members_count       INTEGER,
  featured            BOOLEAN NOT NULL DEFAULT false,
  owner_profile_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  custom_landing_page_active BOOLEAN NOT NULL DEFAULT false,
  custom_html         TEXT,
  custom_css          TEXT,
  custom_js           TEXT,
  custom_domain_requested BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_entities_status_type_category
  ON entities (verification_status, type, category);
CREATE INDEX IF NOT EXISTS idx_entities_tags ON entities USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_entities_owner ON entities (owner_profile_id);

-- --- entity_stats (the `stats` array on Entity) ------------------------------
CREATE TABLE IF NOT EXISTS entity_stats (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id  UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  value      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_entity_stats_entity ON entity_stats (entity_id);

-- --- portfolios --------------------------------------------------------------
CREATE TABLE IF NOT EXISTS portfolios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id  UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'photo',
  image_url  TEXT NOT NULL DEFAULT '',
  caption    TEXT,
  views      TEXT,
  likes      TEXT,
  link       TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_portfolios_entity ON portfolios (entity_id);

-- --- services ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id    UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  price        TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  deliverables TEXT[] NOT NULL DEFAULT '{}',
  sort_order   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_services_entity ON services (entity_id);

-- --- community_members -------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id  UUID REFERENCES entities(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'Contributor',
  category   TEXT NOT NULL DEFAULT '',
  avatar     TEXT NOT NULL DEFAULT '',
  joined_date TEXT NOT NULL DEFAULT '',
  email      TEXT NOT NULL DEFAULT '',
  instagram  TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_members_entity ON community_members (entity_id);

-- --- registrations -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id      UUID REFERENCES entities(id) ON DELETE SET NULL,
  type           entity_type NOT NULL,
  name           TEXT NOT NULL,
  contact_person TEXT NOT NULL DEFAULT '',
  email          TEXT NOT NULL DEFAULT '',
  phone          TEXT NOT NULL DEFAULT '',
  city           TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL DEFAULT '',
  social_link    TEXT NOT NULL DEFAULT '',
  details        TEXT NOT NULL DEFAULT '',
  status         application_status NOT NULL DEFAULT 'pending',
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  rejection_reason TEXT
);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations (status);

-- --- collaboration_requests --------------------------------------------------
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code  TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  category       TEXT NOT NULL DEFAULT '',
  requester_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  requester_id   TEXT NOT NULL DEFAULT '',
  requester_name TEXT NOT NULL,
  requester_type entity_type NOT NULL,
  target_id      TEXT NOT NULL DEFAULT '',
  target_name    TEXT NOT NULL,
  target_type    entity_type NOT NULL,
  budget         TEXT NOT NULL DEFAULT '',
  timeline       TEXT NOT NULL DEFAULT '',
  scope          TEXT NOT NULL DEFAULT '',
  deliverables   TEXT[] NOT NULL DEFAULT '{}',
  status         collaboration_status NOT NULL DEFAULT 'submitted',
  admin_notes    TEXT,
  matched_talent_name TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_collabs_status ON collaboration_requests (status);
CREATE INDEX IF NOT EXISTS idx_collabs_requester ON collaboration_requests (requester_profile_id);

-- --- payment_receipts --------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_receipts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_id             TEXT NOT NULL DEFAULT '',
  user_name           TEXT NOT NULL DEFAULT '',
  entity_id           UUID REFERENCES entities(id) ON DELETE SET NULL,
  tier                TEXT NOT NULL DEFAULT 'free',
  amount              INTEGER NOT NULL DEFAULT 0,
  bank_name           TEXT NOT NULL DEFAULT '',
  sender_account_name TEXT NOT NULL DEFAULT '',
  receipt_image_url   TEXT NOT NULL DEFAULT '',
  status              payment_status NOT NULL DEFAULT 'pending_verification',
  admin_notes         TEXT,
  submitted_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_receipts (status);

-- --- broadcast_messages ------------------------------------------------------
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope        broadcast_scope NOT NULL DEFAULT 'indonesia',
  region       TEXT,
  sender_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  sender_id    TEXT NOT NULL DEFAULT '',
  sender_name  TEXT NOT NULL DEFAULT '',
  sender_role  TEXT NOT NULL DEFAULT '',
  sender_avatar TEXT NOT NULL DEFAULT '',
  sender_badge TEXT,
  content      TEXT NOT NULL,
  likes_count  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_broadcasts_scope_region
  ON broadcast_messages (scope, region, created_at DESC);

-- --- admin_audits (blueprint: admin-only trail) ------------------------------
CREATE TABLE IF NOT EXISTS admin_audits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  subject_table TEXT NOT NULL DEFAULT '',
  subject_id TEXT NOT NULL DEFAULT '',
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --- updated_at touch trigger -------------------------------------------------
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_entities_touch ON entities;
CREATE TRIGGER trg_entities_touch BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_profiles_touch ON profiles;
CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_collabs_touch ON collaboration_requests;
CREATE TRIGGER trg_collabs_touch BEFORE UPDATE ON collaboration_requests
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
