/**
 * KIRI PROJECT — centralized authorization rules.
 *
 * Every role decision in the app funnels through here so there is exactly ONE
 * definition of "who is an admin" and "who may broadcast". Previously the role
 * checks were scattered: `Page29Broadcast` had its own copy, `Page22` had
 * another, and the admin pages had NONE — so anyone could open
 * `page-25-dashboard-admin` by navigating to it directly.
 *
 * SECURITY POSTURE — read this before trusting it:
 * This still runs entirely in the browser with no server, so it is NOT a hard
 * security boundary. It closes the realistic holes (unauthenticated actions,
 * page-accessible-without-role, UI-only checks with no action-layer enforcement)
 * but a determined user with devtools can still forge a session. Moving these
 * checks server-side is required before this data is shared or hosted.
 */

import type { UserSession } from '../types';

/**
 * Explicit admin allow-list. Role alone is NOT sufficient — a forged session
 * with `role: 'admin'` but a non-allow-listed email is rejected.
 */
export const ADMIN_EMAILS: readonly string[] = ['admin@kiriproject.id'];

/** Emails granted broadcast rights without the admin role. */
const BROADCAST_EMAILS: readonly string[] = ['drini562@gmail.com'];

/** True when the session is an authenticated admin. */
export function isAdmin(user: UserSession | null | undefined): boolean {
  if (!user) return false;
  if (user.role !== 'admin') return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

/** True when the session exists at all (any role). */
export function isAuthenticated(user: UserSession | null | undefined): boolean {
  return Boolean(user);
}

/** True when the session may publish broadcast messages. */
export function canBroadcast(user: UserSession | null | undefined): boolean {
  if (!user) return false;
  const email = user.email.toLowerCase();
  return (
    isAdmin(user) ||
    user.role === 'community_lead' ||
    BROADCAST_EMAILS.includes(email) ||
    user.membershipTier === 'System Master' ||
    user.membershipTier === 'Community Verified'
  );
}

/** True when the session may move collaboration requests through their stages. */
export function canManageCollaborations(user: UserSession | null | undefined): boolean {
  return isAdmin(user);
}
