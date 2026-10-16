import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config.js';
import { logger } from './logger.js';
import { captureError } from './observability/sentry.js';
import { pool } from './db/pool.js';
import { attachUser } from './auth/middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { entityRouter } from './routes/entities.routes.js';
import { collaborationRouter } from './routes/collaborations.routes.js';
import { registrationRouter } from './routes/registrations.routes.js';
import { paymentRouter } from './routes/payments.routes.js';
import { memberRouter } from './routes/members.routes.js';
import { broadcastRouter } from './routes/broadcasts.routes.js';
import { UPLOAD_ROOT } from './storage/files.js';

const here = dirname(fileURLToPath(import.meta.url));
const defaultFrontendDist = resolve(join(here, '..', '..', 'dist'));

export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => (req.headers['x-request-id'] as string) || randomUUID(),
      autoLogging: { ignore: (req) => req.url === '/api/health' },
      customLogLevel: (_req, res, err) => {
        if (err || res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", 'https://cdn.tailwindcss.com'],
          'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.tailwindcss.com'],
          'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://*.unsplash.com'],
          'connect-src': ["'self'"],
          'frame-src': ["'self'"],
          'object-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
        },
      },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);
        if (!env.isProduction && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin not allowed: ${origin}`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));

  app.use('/uploads', express.static(UPLOAD_ROOT, { maxAge: '1h' }));

  const apiLimiter = rateLimit({
    windowMs: 60_000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api', apiLimiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60_000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Terlalu banyak percobaan. Coba lagi nanti.' },
  });

  app.get('/api/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ ok: true, db: 'up', service: 'kiri-server', time: new Date().toISOString() });
    } catch (err) {
      logger.error({ err }, 'health check failed: database unreachable');
      res.status(503).json({ ok: false, db: 'down', service: 'kiri-server', time: new Date().toISOString() });
    }
  });

  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api', attachUser);
  app.use('/api/entities', entityRouter);
  app.use('/api/collaborations', collaborationRouter);
  app.use('/api/registrations', registrationRouter);
  app.use('/api/payments', paymentRouter);
  app.use('/api/members', memberRouter);
  app.use('/api/broadcasts', broadcastRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
  });

  const frontendDist = env.FRONTEND_DIST ? resolve(env.FRONTEND_DIST) : defaultFrontendDist;
  const indexHtml = join(frontendDist, 'index.html');
  const hasFrontend = existsSync(indexHtml);

  if (hasFrontend) {
    app.use(express.static(frontendDist, { index: false, maxAge: '1h' }));
    app.get('*', (_req, res) => {
      res.sendFile(indexHtml);
    });
  }

  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    const status = res.statusCode >= 400 ? res.statusCode : 500;
    logger.error({ err, reqId: req.id, path: req.path }, 'unhandled request error');
    captureError(err, { reqId: req.id, method: req.method, path: req.path, status });
    if (env.isProduction) {
      res.status(status).json({ error: 'Terjadi kesalahan pada server.' });
      return;
    }
    res.status(status).json({ error: err.message });
  });

  return app;
}
