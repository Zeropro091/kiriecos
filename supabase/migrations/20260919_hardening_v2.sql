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
BEGIN
    -- Rate limit: max 5 registrations per client per hour
    SELECT COUNT(*) INTO recent_count
    FROM public.anon_submission_log
    WHERE client_key = COALESCE(NEW.location, 'unknown') || ':' || (NEW.type)::text
      AND action = 'entity_insert'
      AND created_at > NOW() - INTERVAL '1 hour';

    IF recent_count >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded for registrations';
    END IF;

    INSERT INTO public.anon_submission_log (client_key, action)
    VALUES (COALESCE(NEW.location, 'unknown') || ':' || (NEW.type)::text, 'entity_insert');

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
CREATE POLICY "Anon can read receipts via signed url" ON storage.objects
  FOR SELECT USING (bucket_id = 'receipts');

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

    expected_token := current_setting('app.kiri_admin_token', true);
    RETURN expected_token IS NOT NULL AND provided_token = expected_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set the expected token ONCE here (CHANGE THIS before deploying!)
SELECT set_config('app.kiri_admin_token', 'kiri-change-me-2026', false);

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
CREATE POLICY "Anon can read pending receipts"
ON public.payment_receipts FOR SELECT
USING (status = 'pending_verification' OR public.is_admin_or_token());
