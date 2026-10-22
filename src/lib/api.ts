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

const REQUEST_TIMEOUT_MS = 15000;

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

/**
 * S4: broadcast so the session state (React context) can reset immediately when
 * the token expires/is rejected. Without this, api.ts cleared localStorage but
 * the in-memory user stayed "logged in" until the next reload.
 */
function emitUnauthorized(): void {
  try {
    window.dispatchEvent(new CustomEvent('kiri:unauthorized'));
  } catch {
    // Non-browser environment — no listeners to notify.
  }
}

function parseJsonSafe(text: string): Record<string, unknown> {
  if (!text) return {};
  try {
    const parsed = JSON.parse(text);
    return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Idempotent reads get one automatic retry: behind a tunnel/proxy a single
  // request can hit a stale or restarting origin and come back as HTML or a 5xx.
  const attempts = method === 'GET' ? 2 : 1;
  let res: Response | null = null;
  let text = '';
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
      text = res.status === 204 ? '' : await res.text();
    } catch {
      res = null;
      lastError = new ApiError(0, 'Tidak dapat terhubung ke server KIRI. Coba lagi sebentar.');
      clearTimeout(timer);
      continue;
    }
    clearTimeout(timer);

    // A 2xx that is not JSON means a non-API origin answered (SPA fallback HTML).
    const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
    if (res.ok && res.status !== 204 && !isJson) {
      lastError = new ApiError(502, 'Server KIRI membalas dengan format tidak valid.');
      res = null;
      continue;
    }
    if (res.status >= 502 && res.status <= 504 && attempt < attempts - 1) {
      lastError = new ApiError(res.status, `Server sedang sibuk (${res.status}).`);
      res = null;
      continue;
    }
    lastError = null;
    break;
  }

  if (!res) throw lastError ?? new ApiError(0, 'Tidak dapat terhubung ke server KIRI.');

  if (res.status === 204) return undefined as T;

  const data = parseJsonSafe(text);

  if (!res.ok) {
    if (res.status === 401) {
      clearSession();
      emitUnauthorized();
    }
    const message = typeof data.error === 'string' ? data.error : `Permintaan gagal (${res.status}).`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};
