import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from './jwt.js';
import { findById, toPublicUser } from '../repositories/profiles.js';

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token || null;
}

/** Attaches req.user when a valid token is present. Never rejects. */
export async function attachUser(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractBearer(req);
  if (!token) return next();

  const claims = verifyToken(token);
  if (!claims) return next();

  const row = await findById(claims.sub).catch(() => undefined);
  if (row) req.user = toPublicUser(row);
  next();
}

/** Rejects when no authenticated user is attached. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Autentikasi diperlukan.' });
    return;
  }
  next();
}

/**
 * Server-side admin gate. This is the check the frontend-only build was
 * missing entirely — here it cannot be bypassed from the browser.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Autentikasi diperlukan.' });
    return;
  }
  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Akses khusus administrator.' });
    return;
  }
  next();
}
