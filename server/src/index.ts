import { createApp } from './app.js';
import { env } from './config.js';
import { pool, closePool } from './db/pool.js';
import { runMigrations } from './db/migrate.js';
import { logger } from './logger.js';
import { initErrorTracking, captureError } from './observability/sentry.js';

async function main(): Promise<void> {
  initErrorTracking();

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'unhandled promise rejection');
    captureError(reason, { kind: 'unhandledRejection' });
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaught exception');
    captureError(err, { kind: 'uncaughtException' });
    process.exit(1);
  });

  await pool.query('SELECT 1');
  logger.info('database connected');

  await runMigrations();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'KIRI API listening');
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, 'shutting down');
    server.close(() => {
      closePool()
        .catch((err) => logger.error({ err }, 'error closing pool'))
        .finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error({ err }, 'server failed to start');
  process.exit(1);
});
