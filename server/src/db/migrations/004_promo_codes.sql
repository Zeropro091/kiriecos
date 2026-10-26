-- ==============================================================================
-- KIRI PROJECT — promo / voucher codes untuk keanggotaan
--   promo_codes       : definisi kode (persen, nominal, atau gratis 100%)
--   promo_redemptions : jejak pemakaian per member (audit + batas per user)
--   payment_receipts  : kolom tambahan untuk menyimpan kode & nilai diskon
-- Idempotent: aman dijalankan ulang.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS promo_codes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code               TEXT NOT NULL,
  description        TEXT NOT NULL DEFAULT '',
  -- percent = potongan persen, fixed = potongan nominal, free = akses gratis penuh
  discount_type      TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed', 'free')),
  discount_value     INTEGER NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  -- 'any' berlaku untuk creator & business
  track              TEXT NOT NULL DEFAULT 'any' CHECK (track IN ('any', 'creator', 'business')),
  -- NULL = semua tier. Isi satu atau beberapa tier dipisah koma: 'exclusive,platinum'
  tier_scope         TEXT,
  max_uses           INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  used_count         INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  max_uses_per_user  INTEGER NOT NULL DEFAULT 1 CHECK (max_uses_per_user > 0),
  valid_from         TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until        TIMESTAMPTZ,
  active             BOOLEAN NOT NULL DEFAULT true,
  created_by         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Kode tidak peka huruf besar/kecil: 'promo10' == 'PROMO10'.
CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_codes_code_upper
  ON promo_codes (upper(code));

CREATE INDEX IF NOT EXISTS idx_promo_codes_active ON promo_codes (active) WHERE active;

CREATE TABLE IF NOT EXISTS promo_redemptions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promo_code_id  UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  profile_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_id     UUID REFERENCES payment_receipts(id) ON DELETE SET NULL,
  track          TEXT NOT NULL,
  tier           TEXT NOT NULL,
  amount_before  INTEGER NOT NULL,
  amount_after   INTEGER NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promo_redemptions_code ON promo_redemptions (promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_redemptions_profile ON promo_redemptions (profile_id);

-- Satu kode hanya boleh dipakai sekali oleh satu member (batas tambahan
-- max_uses_per_user dihitung di aplikasi; index ini mencegah dobel di level DB).
CREATE UNIQUE INDEX IF NOT EXISTS idx_promo_redemptions_once
  ON promo_redemptions (promo_code_id, profile_id);

ALTER TABLE payment_receipts ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE payment_receipts ADD COLUMN IF NOT EXISTS discount_amount INTEGER NOT NULL DEFAULT 0;
ALTER TABLE payment_receipts ADD COLUMN IF NOT EXISTS amount_before_discount INTEGER;
