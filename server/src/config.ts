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
  // Neon Object Storage (S3-compatible). When both are set, uploads go to the bucket
  // instead of local disk. Credentials/region come from the standard AWS_* env chain.
  S3_BUCKET: process.env.S3_BUCKET ?? '',
  S3_ENDPOINT: process.env.AWS_ENDPOINT_URL_S3 ?? '',
  MAX_UPLOAD_BYTES: Number(process.env.MAX_UPLOAD_BYTES ?? 5 * 1024 * 1024),
  SEED_ADMIN_EMAIL: process.env.SEED_ADMIN_EMAIL ?? 'admin@kiriproject.id',
  SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD ?? 'kiri-admin',
  FRONTEND_DIST: process.env.FRONTEND_DIST ?? '',
  LOG_LEVEL: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  SENTRY_DSN: process.env.SENTRY_DSN ?? '',
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT ?? NODE_ENV,
} as const;

// Fail fast on half-configured object storage: a bucket without an endpoint (or
// vice versa) would silently fall back to local disk and lose uploads on redeploy.
if (env.S3_BUCKET && !env.S3_ENDPOINT) {
  throw new Error(
    'FATAL: S3_BUCKET is set but AWS_ENDPOINT_URL_S3 is missing. Uploads would silently fall back to local disk. Set both or neither.'
  );
}
if (!env.S3_BUCKET && env.S3_ENDPOINT) {
  throw new Error(
    'FATAL: AWS_ENDPOINT_URL_S3 is set but S3_BUCKET is missing. Set both or neither.'
  );
}

