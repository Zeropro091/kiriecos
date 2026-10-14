import fs from 'fs';
import crypto from 'crypto';

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

const csvPath = 'C:\\Users\\Putu Ari\\Downloads\\Master Data KIRIPROJECT - Sheet1.csv';
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

  // HASH THE PASSWORD: SHA-256 of the normalized phone number
  const passwordHash = sha256Node(cleanPhone);

  // Masked phone for UI display (e.g. 0857****2527)
  const maskedPhone = cleanPhone.length > 6
    ? cleanPhone.slice(0, 4) + '****' + cleanPhone.slice(-4)
    : '0812****789';

  creators.push({
    id: 'creator-' + idRaw.toLowerCase(),
    kpId: idRaw,
    name: name,
    username: username,
    email: userEmail,
    maskedPhone: maskedPhone,
    passwordHash: passwordHash,
    role: 'creator',
    entityType: 'creator',
    entityId: 'creator-' + idRaw.toLowerCase(),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    membershipTier: 'Registered Creator',
    isVerified: true
  });
}

console.log('Total secured creator accounts:', creators.length);
console.log('Sample secured record:', JSON.stringify(creators[0], null, 2));

const tsContent = `import { UserSession } from '../types';

export interface CreatorAccountCredential extends UserSession {
  kpId: string;
  username: string;
  maskedPhone: string;
  passwordHash: string;
}

export const MASTER_CREATOR_ACCOUNTS: CreatorAccountCredential[] = ${JSON.stringify(creators, null, 2)};
`;

fs.writeFileSync('src/data/masterCreatorAccounts.ts', tsContent, 'utf8');
console.log('src/data/masterCreatorAccounts.ts securely generated with SHA-256 password hashes!');
