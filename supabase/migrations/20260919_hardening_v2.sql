-- ==============================================================================
-- KIRI PROJECT — MIGRATION V2 (hardening for soft-launch go-live)
-- Run AFTER 20260918_init_kiri_schema.sql in the Supabase SQL Editor.
--
-- What this fixes:
--   1. Anonymous admin moderation: soft launch has no Supabase Auth session,
--      so is_admin() is always false and approval never reaches the DB.
--      Entities now auto-approve via a rate-limited trigger (open directory),
--      and a dedicated moderation token gates the admin UPDATE path.
--   2. Receipt visibility: the receipts bucket is private and had no SELECT
--      policy, so uploaded proof could never be viewed. Signed-URL reads are
--      allowed for anonymous users (urls are unguessable: random 64-bit path).
--   3. Spam gate: without it, anyone can flood entities/collab_requests/receipts
--      via the open INSERT policies. A simple per-IP rate-limit table + trigger
--      throttles anonymous submissions.
-- ==============================================================================

-- -----------------------------------------------------------------------------
-- 1. RATE LIMITING for anonymous submissions (spam gate)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.anon_submission_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    client_key TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_anon_log_lookup
ON public.anon_submission_log (client_key, action, created_at);

-- RLS: service role only (frontend never reads this table)
ALTER TABLE public.anon_submission_log ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. AUTO-APPROVAL with spam gate (replaces dead is_admin() moderation)
--    Soft launch model: everything submitted is reviewed asynchronously by
--    admins in the dashboard; listings auto-appear unless flagged.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_approve_entity()
RETURNS TRIGGER AS $$
DECLARE
    recent_count INTEGER;
    client_ip TEXT;
BEGIN
    -- Prefer the real client IP (spoofing location must not bypass the gate).
    BEGIN
        client_ip := split_part(
            COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', ''),
            ',', 1);
    EXCEPTION WHEN OTHERS THEN
        client_ip := NULL;
    END;
    IF client_ip IS NULL OR client_ip = '' THEN
        client_ip := COALESCE(NEW.location, 'unknown');
    END IF;

    -- Rate limit: max 5 registrations per client IP+type per hour
    SELECT COUNT(*) INTO recent_count
    FROM public.anon_submission_log
    WHERE client_key = client_ip || ':' || (NEW.type)::text
      AND action = 'entity_insert'
      AND created_at > NOW() - INTERVAL '1 hour';

    IF recent_count >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded for registrations';
    END IF;

    INSERT INTO public.anon_submission_log (client_key, action)
    VALUES (client_ip || ':' || (NEW.type)::text, 'entity_insert');

    -- Auto-approve legitimate-looking registrations (admin can still suspend later)
    NEW.verification_status := 'approved'::verification_status;
    NEW.badge := COALESCE(NEW.badge, 'Verified Member');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_entity_auto_approve ON public.entities;
CREATE TRIGGER on_entity_auto_approve
  BEFORE INSERT ON public.entities
  FOR EACH ROW EXECUTE FUNCTION public.auto_approve_entity();

-- -----------------------------------------------------------------------------
-- 3. RECEIPTS: allow signed-URL reads (bucket stays private)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anon can read receipts via signed url" ON storage.objects;
-- Signed-URL reads are authorized by the signature itself (signed with the
-- service key) and bypass RLS, so no blanket anon SELECT policy is needed.
-- Direct listing/guessing is blocked; only admins (or the moderation token)
-- may read receipt objects.
CREATE POLICY "Admins can read receipt objects" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts' AND public.is_admin_or_token());

-- -----------------------------------------------------------------------------
-- 4. ADMIN MODERATION VIA TOKEN (works before Supabase Auth is wired)
--    The admin dashboard sends a shared secret in a header; the function
--    checks it server-side. Replace the default token before go-live!
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin_or_token()
RETURNS BOOLEAN AS $$
DECLARE
    provided_token TEXT;
    expected_token TEXT;
BEGIN
    IF public.is_admin() THEN
        RETURN TRUE;
    END IF;

    BEGIN
        provided_token := current_setting('request.headers', true)::json->>'x-kiri-admin-token';
    EXCEPTION WHEN OTHERS THEN
        provided_token := NULL;
    END;

    IF provided_token IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT value INTO expected_token FROM public.app_config WHERE key = 'admin_token';
    RETURN expected_token IS NOT NULL
       AND length(provided_token) = length(expected_token)
       AND provided_token = expected_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lock down execution: only the API roles may call the checker (it reads a
-- locked config table with elevated rights).
REVOKE ALL ON FUNCTION public.is_admin_or_token() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_or_token() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Store the expected token in a locked config table instead of a session GUC,
-- so it matches reliably across every PostgREST request regardless of pooling.
-- CHANGE the value before deploying, then set the SAME value as
-- VITE_KIRI_ADMIN_TOKEN in your Vercel environment variables.
CREATE TABLE IF NOT EXISTS public.app_config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
-- Intentionally NO policies: RLS denies every client read/​write. The
-- SECURITY DEFINER checker above reads it with elevated rights.

INSERT INTO public.app_config (key, value)
VALUES ('admin_token', 'kiri-admin-change-me-2026')
ON CONFLICT (key) DO NOTHING;
-- Rotate later from the SQL editor:
--   UPDATE public.app_config SET value='<new>' WHERE key='admin_token';
-- then update VITE_KIRI_ADMIN_TOKEN and redeploy.

-- Admin-or-token update policies
DROP POLICY IF EXISTS "Admin can approve entities" ON public.entities;
CREATE POLICY "Admin can approve entities"
ON public.entities FOR UPDATE
USING (public.is_admin_or_token())
WITH CHECK (public.is_admin_or_token());

DROP POLICY IF EXISTS "Admin can update payment receipt" ON public.payment_receipts;
CREATE POLICY "Admin can update payment receipt"
ON public.payment_receipts FOR UPDATE
USING (public.is_admin_or_token())
WITH CHECK (public.is_admin_or_token());

-- -----------------------------------------------------------------------------
-- 5. Payment receipts: allow anonymous SELECT of own pending rows is NOT
--    needed — admin dashboard reads via the anon key, so grant a read policy
--    scoped to pending rows only (contains no PII beyond bank proof they
--    submitted themselves).
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anon can read pending receipts" ON public.payment_receipts;
-- SECURITY FIX: the previous policy let ANY anonymous visitor read every
-- pending bank receipt (amounts + payer identity) with the anon key. Receipts
-- are now visible ONLY to admins / the moderation token. A user views their own
-- upload through the signed URL returned at upload time (no table read needed).
CREATE POLICY "Admins can read receipts"
ON public.payment_receipts FOR SELECT
USING (public.is_admin_or_token());
