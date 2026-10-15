/**
 * KIRI PROJECT — authentication facade over the backend API.
 *
 * Previously this verified credentials against localStorage, which the file's
 * own comments admitted was "NOT a security boundary". Credentials now live in
 * PostgreSQL and are checked server-side (bcrypt + JWT). This module keeps the
 * same method names so the pages did not need a rewrite — only the transport
 * changed.
 */

import type { UserSession } from '../types';
import { api, setSession, loadStoredUser, clearSession, getToken } from './api';

interface AuthResponse {
  user: UserSession;
  token: string;
}

export const localAuth = {
  /** No-op: the server owns seeding now. Kept so existing callers compile. */
  async init(): Promise<void> {
    return Promise.resolve();
  },

  async verify(identifier: string, password: string): Promise<{ session?: UserSession; error?: string }> {
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email: identifier.trim(), password });
      setSession(res.user, res.token);
      return { session: res.user };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Login gagal.' };
    }
  },

  /** Creators authenticate with their WhatsApp number, same as before. */
  async verifyCreator(identifier: string, phone: string): Promise<{ session?: UserSession; error?: string }> {
    return this.verify(identifier, phone);
  },

  async verifyAdmin(identifier: string, password: string): Promise<{ session?: UserSession; error?: string }> {
    const result = await this.verify(identifier, password);
    if (result.session && result.session.role !== 'admin') {
      clearSession();
      return { error: 'Akun ini bukan administrator KIRI.' };
    }
    return result;
  },

  async register(input: {
    email: string;
    password: string;
    name: string;
    entityType?: UserSession['entityType'];
  }): Promise<{ session?: UserSession; error?: string }> {
    try {
      const res = await api.post<AuthResponse>('/auth/register', input);
      setSession(res.user, res.token);
      return { session: res.user };
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Pendaftaran gagal.' };
    }
  },

  saveSession(session: UserSession): void {
    const existing = getToken();
    if (existing) setSession(session, existing);
  },

  loadSession(): UserSession | null {
    return getToken() ? loadStoredUser() : null;
  },

  clearSession(): void {
    clearSession();
  },

  reset(): void {
    clearSession();
  },
};
