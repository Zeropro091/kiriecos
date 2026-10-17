-- 002_launch_features.sql
-- NOTE: profiles.id is UUID in this schema (see 001_init.sql), so FK columns
-- referencing it are UUID, not BIGINT.

-- Membership tiers ------------------------------------------------------------------
ALTER TABLE profiles ALTER COLUMN membership_tier SET DEFAULT 'basic';

-- Normalise any legacy values (e.g. 'free') into 'basic' before adding the CHECK.
UPDATE profiles
SET membership_tier = 'basic'
WHERE membership_tier NOT IN ('basic', 'exclusive', 'platinum', 'System Master');

ALTER TABLE profiles
  ADD CONSTRAINT profiles_membership_tier_check
  CHECK (membership_tier IN ('basic', 'exclusive', 'platinum', 'System Master'));

-- Member cards ----------------------------------------------------------------------
CREATE TABLE member_cards (
  id          BIGSERIAL PRIMARY KEY,
  profile_id  UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  card_number TEXT NOT NULL UNIQUE,
  tier        TEXT NOT NULL,
  issued_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ,
  status      TEXT NOT NULL DEFAULT 'active'
);

-- Landing page orders ----------------------------------------------------------------
CREATE TABLE landing_page_orders (
  id           BIGSERIAL PRIMARY KEY,
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id  TEXT NOT NULL,
  custom_notes TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'in_review', 'in_progress', 'done', 'rejected')),
  admin_note   TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages ----------------------------------------------------------------------
CREATE TABLE chat_messages (
  id                BIGSERIAL PRIMARY KEY,
  thread_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_role       TEXT NOT NULL CHECK (sender_role IN ('member', 'admin')),
  sender_profile_id UUID NOT NULL REFERENCES profiles(id),
  body              TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at           TIMESTAMPTZ
);

CREATE INDEX idx_chat_messages_thread_profile_id ON chat_messages (thread_profile_id);
