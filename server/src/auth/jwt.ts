import jwt from 'jsonwebtoken';
import { env } from '../config.js';
import type { AuthClaims, PublicUser } from '../types.js';

export function signToken(user: PublicUser): string {
  const claims: AuthClaims = { sub: user.id, email: user.email, role: user.role };
  return jwt.sign(claims, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): AuthClaims | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as AuthClaims;
  } catch {
    return null;
  }
}
