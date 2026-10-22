/**
 * KIRI PROJECT — centralized authorization rules.
 *
 * Every role decision in the app funnels through here so there is exactly ONE
 * definition of "who is an admin" and "who may broadcast".
 *
 * S5: role and membership tier now come from the server-issued session (JWT),
 * which the API verifies on every request. Hardcoded email allow-lists were
 * removed — a forged local session could previously spoof an allow-listed
 * email, and the lists drifted from the server's actual rules.
 */

import type { UserSession } from '../types';

/** True when the session is an authenticated admin. */
export function isAdmin(user: UserSession | null | undefined): boolean {
  return Boolean(user && user.role === 'admin');
}

/** True when the session exists at all (any role). */
export function isAuthenticated(user: UserSession | null | undefined): boolean {
  return Boolean(user);
}

/** True when the session may publish broadcast messages. */
export function canBroadcast(user: UserSession | null | undefined): boolean {
  if (!user) return false;
  return (
    isAdmin(user) ||
    user.role === 'community_lead' ||
    user.membershipTier === 'System Master' ||
    user.membershipTier === 'Community Verified'
  );
}

/** True when the session may move collaboration requests through their stages. */
export function canManageCollaborations(user: UserSession | null | undefined): boolean {
  return isAdmin(user);
}
