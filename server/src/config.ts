import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isProduction = NODE_ENV === 'production';

const JWT_SECRET = required('JWT_SECRET', 'dev-only-insecure-secret-change-me');

if (isProduction && JWT_SECRET === 'dev-only-insecure-secret-change-me') {
  throw new Error(
    'FATAL: JWT_SECRET is still the development default. Set a real secret before running in production.'
  );
}

export const env = {
  NODE_ENV,
  isProduction,
  PORT: Number(process.env.PORT ?? 4000),
  DATABASE_URL: required('DATABASE_URL'),
  DATABASE_SSL: process.env.DATABASE_SSL === 'true',
  JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  CORS_ORIGINS: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? 'uploads',
  MAX_UPLOAD_BYTES: Number(process.env.MAX_UPLOAD_BYTES ?? 5 * 1024 * 1024),
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL ?? 'admin@kiriproject.id',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD ?? 'kiri-admin',
  FRONTEND_DIST: process.env.FRONTEND_DIST ?? '',
} as const;

