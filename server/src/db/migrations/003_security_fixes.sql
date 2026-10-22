-- ==============================================================================
-- KIRI PROJECT — security & flow fixes
--   1. profiles.phone       — lets members log in with their WhatsApp number
--                             (the registration flow stores it at sign-up).
--   2. broadcast_likes      — per-profile like ledger so /like is authenticated
--                             and idempotent (no unlimited count inflation).
-- Idempotent: safe to re-run.
-- ==============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_phone_unique
  ON profiles (phone)
  WHERE phone IS NOT NULL AND phone <> '';

CREATE TABLE IF NOT EXISTS broadcast_likes (
  broadcast_id UUID NOT NULL REFERENCES broadcast_messages(id) ON DELETE CASCADE,
  profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (broadcast_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_broadcast_likes_profile ON broadcast_likes (profile_id);
