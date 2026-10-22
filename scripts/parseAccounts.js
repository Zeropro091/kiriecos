const fs = require('fs');

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
const argvIdx = process.argv.indexOf('--csv');
const csvArg = argvIdx !== -1 ? process.argv[argvIdx + 1] : undefined;
const csvPath = csvArg || process.env.KIRI_CSV_PATH;
if (!csvPath || !fs.existsSync(csvPath)) {
  console.error(
    'Path CSV wajib disetel dan harus ada. Contoh:\n' +
      '  KIRI_CSV_PATH="data/Master Data KIRIPROJECT - Sheet1.csv" node scripts/parseAccounts.js\n' +
      '  node scripts/parseAccounts.js --csv "data/Master Data KIRIPROJECT - Sheet1.csv"'
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

  // If column 7 got province text and column 8 got the 08... phone number
  if (/[a-zA-Z]/.test(wa) && /^08\d+/.test(email)) {
    wa = email;
    email = '';
  }

  // Normalize phone number (digits only, e.g. 085724262527)
  let cleanPhone = wa.replace(/\D/g, '');
  if (!cleanPhone) cleanPhone = '08123456789';

  // Determine handles
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
    // Nomor mentah tidak ditulis ke file — hanya versi ter-mask untuk
    // membatasi data pribadi yang bisa ter-commit tidak sengaja.
    phoneMasked: cleanPhone.length > 6
      ? cleanPhone.slice(0, 4) + '****' + cleanPhone.slice(-3)
      : '0****' + cleanPhone.slice(-3),
    instagram: ig.replace(/^@/, '').trim(),
    tiktok: tiktok.replace(/^@/, '').trim(),
  });
}

console.log('Total parsed accounts:', creators.length);
console.log('Sample 3:', JSON.stringify(creators.slice(0, 3), null, 2));

fs.writeFileSync('./scripts/parsedAccounts.json', JSON.stringify(creators, null, 2));
