/**
 * K4: the registration flow used to collect forms but never create an account —
 * page 14 (payment) then ran without a session, so submitting a receipt failed.
 * This helper creates the account (email + password, optional WhatsApp) and
 * auto-logs-in right after the registration is submitted, binding the account
 * to the pending entity the registration created.
 */

import { localAuth } from './localAuth';
import type { EntityType } from '../types';

export interface RegistrationAccountInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  entityType: EntityType;
  entityId?: string;
}

export async function createAccountForRegistration(
  input: RegistrationAccountInput
): Promise<{ error?: string }> {
  const registered = await localAuth.register(input);
  if (registered.session) return {};

  // The email may already belong to an account (e.g. the applicant registered
  // before). If the same password logs in, treat it as the same person and
  // continue with the fresh registration; otherwise surface the error.
  const login = await localAuth.verify(input.email, input.password);
  if (login.session) return {};

  return { error: registered.error ?? 'Akun gagal dibuat. Silakan coba lagi.' };
}
