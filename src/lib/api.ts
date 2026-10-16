/**
 * KIRI PROJECT — HTTP client for the backend API.
 *
 * Replaces the direct localStorage access the app used to do. Holds the JWT in
 * memory + localStorage and attaches it to every request. All data mutations
 * now go through the server, which enforces authorization — the browser is no
 * longer the trust boundary.
 */

import type { UserSession } from '../types';

const TOKEN_KEY = 'kiri.auth.token';
const USER_KEY = 'kiri.auth.session';

const RAW_BASE = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '');
const API_BASE = RAW_BASE ? `${RAW_BASE}/api` : '/api';

export function assetUrl(path: string): string {
  if (!path) return path;
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return RAW_BASE ? `${RAW_BASE}${path.startsWith('/') ? '' : '/'}${path}` : path;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

let token: string | null = localStorage.getItem(TOKEN_KEY);

export function getToken(): string | null {
  return token;
}

export function setSession(user: UserSession, nextToken: string): void {
  token = nextToken;
  try {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('[KIRI] Failed to persist session:', err);
  }
}

export function loadStoredUser(): UserSession | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  token = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(0, 'Tidak dapat terhubung ke server KIRI. Pastikan backend berjalan.');
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    if (res.status === 401) clearSession();
    throw new ApiError(res.status, data?.error ?? `Permintaan gagal (${res.status}).`);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
