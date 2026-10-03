import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co'
);

/**
 * Admin API key — this is the SAME value stored server-side in
 * public.app_config.admin_token and read by is_admin_or_token().
 *
 * It is exposed in the client bundle, so treat it as a *separator* between
 * normal visitors and staff, NOT a strong secret. Rotate it from the
 * Supabase SQL editor if it ever leaks:
 *   UPDATE public.app_config SET value = '<new>' WHERE key = 'admin_token';
 * Then update VITE_KIRI_ADMIN_TOKEN and redeploy.
 *
 * When Supabase Auth is fully wired, is_admin() (auth.uid() + role='admin')
 * takes over and this token becomes a fallback only.
 */
const ADMIN_TOKEN = (import.meta as any).env?.VITE_KIRI_ADMIN_TOKEN || 'kiri-admin-change-me-2026';

/**
 * Custom fetch that attaches the admin token header on EVERY request.
 *
 * PostgREST exposes request headers to `is_admin_or_token()` via
 * current_setting('request.headers'), so a plain header is enough — no
 * session state, no set_config() ordering bugs. Non-admin visitors simply
 * carry a header that matches nothing; RLS still blocks them.
 */
const adminHeaderFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers || {});
  if (ADMIN_TOKEN && !headers.has('x-kiri-admin-token')) {
    headers.set('x-kiri-admin-token', ADMIN_TOKEN);
  }
  return fetch(input, { ...init, headers });
};

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      global: { fetch: adminHeaderFetch },
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
