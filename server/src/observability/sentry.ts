import * as Sentry from '@sentry/node';
import { env } from '../config.js';
import { logger } from '../logger.js';

export const sentryEnabled = Boolean(env.SENTRY_DSN);

export function initErrorTracking(): void {
  if (!sentryEnabled) {
    logger.info('error tracking disabled (no SENTRY_DSN set)');
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT,
    tracesSampleRate: env.isProduction ? 0.1 : 1.0,
  });

  logger.info('error tracking enabled (Sentry)');
}

export function captureError(error: unknown, context?: Record<string, unknown>): void {
  if (!sentryEnabled) return;
  Sentry.withScope((scope) => {
    if (context) scope.setContext('detail', context);
    Sentry.captureException(error);
  });
}
