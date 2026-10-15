import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIAL_ENTITIES, INITIAL_COLLAB_REQUESTS, INITIAL_REGISTRATIONS, INITIAL_COMMUNITY_MEMBERS } from '../src/data/mockData';
import { INITIAL_BROADCAST_MESSAGES } from '../src/data/broadcastData';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'server', 'src', 'seed-data');
mkdirSync(outDir, { recursive: true });

function dump(name, value) {
  writeFileSync(join(outDir, `${name}.json`), JSON.stringify(value, null, 2), 'utf8');
  console.log(`wrote server/src/seed-data/${name}.json`);
}

dump('entities', INITIAL_ENTITIES);
dump('collaborations', INITIAL_COLLAB_REQUESTS);
dump('registrations', INITIAL_REGISTRATIONS);
dump('members', INITIAL_COMMUNITY_MEMBERS);
dump('broadcasts', INITIAL_BROADCAST_MESSAGES);

console.log('Seed snapshot generated.');
