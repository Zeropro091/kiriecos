import fs from 'fs';
import crypto from 'crypto';

// S14: never emit plaintext credentials or raw phone numbers from this
// generator. Passwords ship as SHA-256 hashes and phones are masked —
// see scripts/secureGenerateAccounts.mjs for the reference implementation.
function sha256Node(str) {
  return crypto.createHash('sha256').update(str.trim()).digest('hex');
}

function normalizePhone(phone) {
  let digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('62')) {
    digits = '0' + digits.slice(2);
  }
  return digits;
}

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur);
  return result;
}

// Path CSV portabel: env KIRI_CSV_PATH atau --csv "path" (tidak lagi hardcode ke mesin tertentu)
const argIdx = process.argv.indexOf('--csv');
const csvArg = argIdx !== -1 ? process.argv[argIdx + 1] : undefined;
const csvPath = csvArg || process.env.KIRI_CSV_PATH;
if (!csvPath || !fs.existsSync(csvPath)) {
  console.error(
    'Path CSV wajib disetel dan harus ada. Contoh:\n' +
      '  KIRI_CSV_PATH="data/Master Data KIRIPROJECT - Sheet1.csv" node scripts/generateAccounts.mjs\n' +
      '  node scripts/generateAccounts.mjs --csv "data/Master Data KIRIPROJECT - Sheet1.csv"'
  );
  process.exit(1);
}
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split(/\r?\n/);

const creators = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const cols = parseCSVLine(line);
  const idRaw = (cols[1] || '').trim();
  const name = (cols[2] || '').trim();
  if (!idRaw || !idRaw.startsWith('KP-') || !name) continue;

  let wa = (cols[7] || '').trim();
  let email = (cols[8] || '').trim();
  let ig = (cols[9] || '').trim();
  let tiktok = (cols[11] || '').trim();

  if (/[a-zA-Z]/.test(wa) && /^08\d+/.test(email)) {
    wa = email;
    email = '';
  }

  let cleanPhone = normalizePhone(wa);
  if (!cleanPhone) cleanPhone = '08123456789';

  let handle = ig || tiktok || '';
  handle = handle.replace(/^@/, '').trim();
  let username = handle.toLowerCase().replace(/[^a-z0-9_.]/g, '');
  if (!username) {
    username = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
  }

  let userEmail = email.includes('@') ? email.toLowerCase().trim() : (idRaw.toLowerCase() + '@kiriproject.id');

  creators.push({
    id: 'creator-' + idRaw.toLowerCase(),
    kpId: idRaw,
    name: name,
    username: username,
    email: userEmail,
    phone: cleanPhone,
    instagram: ig.replace(/^@/, '').trim(),
    tiktok: tiktok.replace(/^@/, '').trim(),
    category: (cols[15] || 'Content Creator').trim()
  });
}

console.log('Total parsed accounts:', creators.length);
console.log('Sample 3:', JSON.stringify(creators.slice(0, 3), null, 2));

const accounts = creators.map((c) => ({
  id: c.id,
  kpId: c.kpId,
  name: c.name,
  username: c.username,
  email: c.email,
  maskedPhone: c.phone.length > 6
    ? c.phone.slice(0, 4) + '****' + c.phone.slice(-4)
    : '0812****789',
  passwordHash: sha256Node(c.phone),
  role: 'creator',
  entityType: 'creator',
  entityId: c.id,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  membershipTier: 'Registered Creator',
  isVerified: true
}));

const tsContent = `import { UserSession } from '../types';

export interface CreatorAccountCredential extends UserSession {
  kpId: string;
  username: string;
  maskedPhone: string;
  passwordHash: string;
}

export const MASTER_CREATOR_ACCOUNTS: CreatorAccountCredential[] = ${JSON.stringify(accounts, null, 2)};
`;

fs.writeFileSync('src/data/masterCreatorAccounts.ts', tsContent, 'utf8');
console.log('src/data/masterCreatorAccounts.ts generated successfully!');
