import fs from 'fs';

/**
 * Kredensial TIDAK PERNAH ditulis dalam plaintext:
 * - Kolom "password" admin diganti penanda "(dikelola di server)" — password
 *   asli hanya ada di env server (SEED_ADMIN_*) dan database (bcrypt hash).
 * - Nomor WhatsApp kreator di-mask (mis. 0857****527) — pola sama dgn
 *   scripts/maskGeoPhoneSource.mjs. Hash password tidak disertakan di sini.
 *
 * Path CSV portabel: set env KIRI_CSV_PATH atau berikan sebagai argv[2].
 * Contoh: `node scripts/generateDatalist.mjs --csv "data/Master Data KIRIPROJECT - Sheet1.csv"`
 */

const mask = (raw) => {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length < 8) return '0****' + digits.slice(-3);
  return digits.slice(0, 4) + '****' + digits.slice(-3);
};

const looksMasked = (v) => /\*{3,4}/.test(String(v));
const looksRaw = (v) => /^\+?0\d{7,15}$/.test(String(v).trim());

const SERVER_MANAGED_PASSWORD = '(Dikelola di server — lihat SEED_ADMIN_PASSWORD / reset password admin)';

// Buat folder datalist jika belum ada
if (!fs.existsSync('./datalist')) {
  fs.mkdirSync('./datalist', { recursive: true });
}

// 1. FILE AKUN ADMIN (datalist/AKUN_ADMIN.md & datalist/akun_admin.json)
const adminAccounts = [
  {
    id: 'user-admin',
    nama: 'Admin KIRI (Kak Rini & Team)',
    role: 'Super Administrator / System Master',
    email: 'admin@kiriproject.id',
    username: 'admin',
    password: SERVER_MANAGED_PASSWORD,
    hakAkses: 'Akses penuh pengawasan ekosistem, matching, review pendaftaran, escrow, dan Siaran Komunitas Nasional/Regional',
    urlLogin: '/page-24-login-admin'
  },
  {
    id: 'user-community',
    nama: 'Kak Rini',
    role: 'Community Lead (Bali Creative Circle)',
    email: 'drini562@gmail.com',
    username: 'kakrini',
    password: SERVER_MANAGED_PASSWORD,
    hakAkses: 'Kelola database anggota komunitas, review verifikasi, dan Siaran Komunitas Regional',
    urlLogin: '/page-15-login'
  }
];

let adminMd = `# 🛡️ DAFTAR AKUN ADMINISTRATOR & OTORITAS KHUSUS KIRI PROJECT\n\n`;
adminMd += `Daftar akun level Administrator dan Otoritas Siaran KIRI Project.\n`;
adminMd += `> 🔒 **Kata sandi tidak pernah ditulis di sini** — dikelola di server (env \`SEED_ADMIN_PASSWORD\` / database bcrypt). Bila lupa, reset lewat admin KIRI.\n\n`;
adminMd += `| No | Nama Akun | Role / Peran | Alamat Email | Username | Kata Sandi (Password) | Hak Akses & Wewenang |\n`;
adminMd += `|---|---|---|---|---|---|---|\n`;

adminAccounts.forEach((acc, idx) => {
  adminMd += `| ${idx + 1} | **${acc.nama}** | \`${acc.role}\` | \`${acc.email}\` | \`${acc.username}\` | ${acc.password} | ${acc.hakAkses} |\n`;
});

adminMd += `\n---\n### 🔑 Petunjuk Login Admin:\n`;
adminMd += `1. **Halaman Login Admin**: Akses di \`/page-24-login-admin\`.\n`;
adminMd += `2. **Email**: Gunakan \`admin@kiriproject.id\` atau \`drini562@gmail.com\`.\n`;
adminMd += `3. **Kata sandi**: dikelola di server — **tidak** ada di dokumen ini.\n`;
adminMd += `4. **Hak Istimewa**: Akun-akun ini memiliki kewenangan untuk mengirimkan **Siaran Komunitas (Nasional & Per-Daerah)** di \`/page-29-broadcast\`.\n`;

fs.writeFileSync('./datalist/AKUN_ADMIN.md', adminMd, 'utf8');
fs.writeFileSync('./datalist/akun_admin.json', JSON.stringify(adminAccounts, null, 2), 'utf8');

// 2. PARSE KREATOR DARI CSV
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

const argIdx = process.argv.indexOf('--csv');
const csvArg = argIdx !== -1 ? process.argv[argIdx + 1] : undefined;
const csvPath = csvArg || process.env.KIRI_CSV_PATH;
if (!csvPath) {
  console.error(
    'Path CSV tidak diberikan. Jalankan dengan env atau argumen:\n' +
      '  KIRI_CSV_PATH="path/ke/Master Data KIRIPROJECT - Sheet1.csv" node scripts/generateDatalist.mjs\n' +
      '  node scripts/generateDatalist.mjs --csv "path/ke/Master Data KIRIPROJECT - Sheet1.csv"'
  );
  process.exit(1);
}
if (!fs.existsSync(csvPath)) {
  console.error(`File CSV tidak ditemukan: ${csvPath}`);
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
  let domisili = (cols[5] || '').trim();
  let provinsi = (cols[6] || '').trim();

  if (/[a-zA-Z]/.test(wa) && /^08\d+/.test(email)) {
    wa = email;
    email = '';
  }

  let cleanPhone = wa.replace(/\D/g, '');
  if (!cleanPhone) cleanPhone = '08123456789';

  let handle = ig || tiktok || '';
  handle = handle.replace(/^@/, '').trim();
  let username = handle.toLowerCase().replace(/[^a-z0-9_.]/g, '');
  if (!username) {
    username = name.toLowerCase().replace(/[^a-z0-9]/g, '.');
  }

  let userEmail = email.includes('@') ? email.toLowerCase().trim() : (idRaw.toLowerCase() + '@kiriproject.id');

  creators.push({
    kpId: idRaw,
    name: name,
    username: username,
    email: userEmail,
    // Password asli (nomor WhatsApp) TIDAK ditulis — hanya versi termask
    // untuk referensi visual. Kredensial login dikelola server (bcrypt).
    phoneMasked: mask(cleanPhone),
    domisili: domisili || provinsi || 'Indonesia',
    niche: (cols[15] || 'Lifestyle').trim()
  });
}

// TULIS FILE AKUN USERS & KREATOR (datalist/AKUN_USERS_KREATOR.md & datalist/akun_users_kreator.json)
let userMd = `# 👥 DAFTAR AKUN KREATOR, UMKM & PENGGUNA TERDAFTAR KIRI PROJECT\n\n`;
userMd += `Total akun terdaftar: **${creators.length + 2} Akun** (${creators.length} Kreator CSV + Akun Pilot UMKM & Creator Pro).\n\n`;
userMd += `### 📌 Format Kredensial Login Pengguna:\n`;
userMd += `- **Username / Identifier**: Username Instagram/TikTok, ID Akun (\`KP-xxxxx\`), atau Email terdaftar.\n`;
userMd += `- **Kata sandi**: dikelola di server (bcrypt) — **TIDAK** ditulis di dokumen ini. Nomor WhatsApp hanya ditampilkan versi ter-mask sebagai referensi.\n`;
userMd += `- **Halaman Login**: \`/page-15-login\`.\n\n`;
userMd += `| No | ID Akun | Nama Lengkap | Username (USN) | WhatsApp (Ter-mask) | Email Alternatif | Niche / Kategori | Domisili |\n`;
userMd += `|---|---|---|---|---|---|---|---|\n`;

// Pilot Users (nomor sudah literal demo, tetap ikut format ter-mask)
userMd += `| 1 | \`KP-PILOT-01\` | **Raka Dewantara** | \`rakadewantara\` | \`0812****789\` | \`raka@dewantara.id\` | Cinematography & Travel | Ubud, Bali |\n`;
userMd += `| 2 | \`KP-PILOT-02\` | **Wayan Kintamani (Kopi Batur)** | \`kopikintamani\` | \`0819****432\` | \`info@kopikintamani.id\` | Coffee Roastery & UMKM | Kintamani, Bali |\n`;

creators.forEach((c, idx) => {
  userMd += `| ${idx + 3} | \`${c.kpId}\` | **${c.name}** | \`${c.username}\` | \`${c.phoneMasked}\` | \`${c.email}\` | ${c.niche} | ${c.domisili} |\n`;
});

fs.writeFileSync('./datalist/AKUN_USERS_KREATOR.md', userMd, 'utf8');

const fullUserJson = [
  {
    kpId: 'KP-PILOT-01',
    name: 'Raka Dewantara',
    username: 'rakadewantara',
    phoneMasked: '0812****789',
    email: 'raka@dewantara.id',
    role: 'creator',
    niche: 'Cinematography',
    domisili: 'Ubud, Bali'
  },
  {
    kpId: 'KP-PILOT-02',
    name: 'Wayan Kintamani',
    username: 'kopikintamani',
    phoneMasked: '0819****432',
    email: 'info@kopikintamani.id',
    role: 'business / UMKM',
    niche: 'Food & Beverage',
    domisili: 'Kintamani, Bali'
  },
  ...creators
];

fs.writeFileSync('./datalist/akun_users_kreator.json', JSON.stringify(fullUserJson, null, 2), 'utf8');

// Idempoten: pastikan tidak ada nilai mentah lolos — kalau ada, selamatkan.
let rawLeak = 0;
for (const c of fullUserJson) {
  const v = c.phoneMasked;
  if (v && looksRaw(v) && !looksMasked(v)) {
    c.phoneMasked = mask(v);
    rawLeak += 1;
  }
}
if (rawLeak > 0) {
  console.warn(`[warn] ${rawLeak} nomor mentah ditemukan — sudah di-mask ulang.`);
}

console.log('Semua file terpisah di folder datalist/ berhasil dibuat (tanpa kredensial plaintext)!');
