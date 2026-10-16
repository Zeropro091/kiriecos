import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const serverRoot = join(here, '..');

const copies = [
  { from: join(serverRoot, 'src', 'seed-data'), to: join(serverRoot, 'dist', 'seed-data') },
  { from: join(serverRoot, 'src', 'db', 'migrations'), to: join(serverRoot, 'dist', 'db', 'migrations') },
];

for (const { from, to } of copies) {
  if (!existsSync(from)) continue;
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`[build] copied ${from} -> ${to}`);
}
