import { createApp } from './app.js';
import { env } from './config.js';
import { pool } from './db/pool.js';
import { runMigrations } from './db/migrate.js';

async function main(): Promise<void> {
  await pool.query('SELECT 1');
  console.log('[db] connected');

  await runMigrations();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`[server] KIRI API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}

main().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
