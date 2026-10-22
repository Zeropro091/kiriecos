import fs from 'fs';
import path from 'path';

/**
 * Alat redaksi sekali-jalan (idempoten): membersihkan kredensial plaintext
 * yang sudah ter-generate ke folder datalist/.
 *
 * - akun_users_kreator.json : field `password_wa` (nomor WhatsApp asli) →
 *   diganti `phoneMasked` (mis. 0857****527).
 * - akun_admin.json         : field `password` → "(Dikelola di server …)".
 * - AKUN_USERS_KREATOR.md   : sel kolom Password (digit murni) → versi
 *   ter-mask; catatan header ditulis ulang.
 * - AKUN_ADMIN.md           : kolom Kata Sandi + petunjuk login → penanda
 *   "(Dikelola di server …)", tanpa menampilkan nilai password.
 *
 * Aman dijalankan ulang: nilai yang sudah ter-mask/ditandai dilewati.
 * File data mentah tetap hive tidak diubah — hanya output datalist/.
 */

const mask = (raw) => {
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length < 8) return '0****' + digits.slice(-3);
  return digits.slice(0, 4) + '****' + digits.slice(-3);
};

const isRawPhoneLike = (v) => /^\+?\d{5,16}$/.test(String(v).trim());
const isMasked = (v) => /\*{3,4}/.test(String(v));

const SERVER_MANAGED = '(Dikelola di server — bcrypt, tidak tersimpan di dokumen ini)';

const dir = './datalist';
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
const write = (f, data) => fs.writeFileSync(path.join(dir, f), data, 'utf8');

let changes = 0;

/* 1) akun_users_kreator.json ------------------------------------------------ */
const usersJsonPath = path.join(dir, 'akun_users_kreator.json');
if (fs.existsSync(usersJsonPath)) {
  const users = JSON.parse(read('akun_users_kreator.json'));
  let n = 0;
  for (const u of users) {
    const pw = u.password_wa;
    if (typeof pw === 'string' && pw.trim()) {
      u.phoneMasked = isMasked(pw) ? pw : mask(pw);
      delete u.password_wa;
      n += 1;
    }
  }
  write('akun_users_kreator.json', JSON.stringify(users, null, 2) + '\n');
  changes += n;
  console.log(`akun_users_kreator.json : ${n} field password_wa di-redaksi`);
}

/* 2) akun_admin.json -------------------------------------------------------- */
const adminJsonPath = path.join(dir, 'akun_admin.json');
if (fs.existsSync(adminJsonPath)) {
  const admins = JSON.parse(read('akun_admin.json'));
  let n = 0;
  for (const a of admins) {
    if (a.password && !a.password.startsWith('(Dikelola')) {
      a.password = SERVER_MANAGED;
      n += 1;
    }
  }
  write('akun_admin.json', JSON.stringify(admins, null, 2) + '\n');
  changes += n;
  console.log(`akun_admin.json         : ${n} field password di-redaksi`);
}

/* 3) AKUN_USERS_KREATOR.md -------------------------------------------------- */
const usersMdPath = path.join(dir, 'AKUN_USERS_KREATOR.md');
if (fs.existsSync(usersMdPath)) {
  const src = read('AKUN_USERS_KREATOR.md');
  let n = 0;
  const out = src
    // Header/password-credential note ditulis ulang
    .replace(
      '### 📌 Format Kredensial Login Pengguna:\n- **Username / Identifier**: Username Instagram/TikTok, ID Akun (`KP-xxxxx`), atau Email terdaftar.\n- **Password**: **Nomor WhatsApp terdaftar** (hanya angka, misal: `085724262527`).\n- **Halaman Login**: `/page-15-login`.',
      '### 📌 Format Kredensial Login Pengguna:\n- **Username / Identifier**: Username Instagram/TikTok, ID Akun (`KP-xxxxx`), atau Email terdaftar.\n- **Kata sandi**: dikelola di server (bcrypt) — tidak ditulis di dokumen ini. Nomor WhatsApp hanya ditampilkan ter-mask sebagai referensi.\n- **Halaman Login**: `/page-15-login`.'
    )
    // Header kolom
    .replace('Password (No. WhatsApp)', 'WhatsApp (Ter-mask)')
    // Redaksi sel telpon: seluruh sel digit-murni dalam dokumen (kolom apapun)
    .replace(/`(\+?\d{5,16})`/g, (match, digits) => {
      if (isMasked(digits)) return match;
      n += 1;
      return '`' + mask(digits) + '`';
    });
  write('AKUN_USERS_KREATOR.md', out);
  changes += n;
  console.log(`AKUN_USERS_KREATOR.md   : ${n} nomor mentah di-mask`);
} else {
  console.log('AKUN_USERS_KREATOR.md   : file tidak ada, dilewati');
}

/* 4) AKUN_ADMIN.md ---------------------------------------------------------- */
const adminMdPath = path.join(dir, 'AKUN_ADMIN.md');
if (fs.existsSync(adminMdPath)) {
  const src = read('AKUN_ADMIN.md');
  let n = 0;
  let out = src;

  // Sel kolom "Kata Sandi (Password)": baris tabel — kolom ke-6 (index 5).
  out = out
    .split('\n')
    .map((line) => {
      if (!line.trim().startsWith('|') || line.includes('---')) return line;
      const cells = line.split('|');
      // cells: ['', ' No ', ' Nama ', ' Role ', ' Email ', ' Username ', ' Password ', ' Hak ', '']
      const pwIdx = 6;
      if (cells.length > pwIdx) {
        const pw = (cells[pwIdx] || '').trim();
        const bare = pw.replace(/^`|`$/g, '');
        const isEmailLike = /@/.test(bare);
        const isNumeric = isRawPhoneLike(bare);
        const isMarker = pw.startsWith('(Dikelola');
        if (!isEmailLike && !isMarker && (isNumeric || bare.length > 0)) {
          cells[pwIdx] = ` ${SERVER_MANAGED} `;
          n += 1;
          return cells.join('|');
        }
      }
      return line;
    })
    .join('\n');

  // Petunjuk login: hilangkan nilai password yang tertulis
  out = out.replace(/Kata Sandi \(Password\)[^\n]*\n/g, (m) =>
    /Dikelola/.test(m) ? m : `3. **Kata Sandi (Password)**: dikelola di server — tidak ditulis di dokumen ini.\n`
  );
  out = out.replace("3. **Kata Sandi (Password)**: **`@projectkiri.id`**\n", "");
  out = out.replace("2. **Email / Username**: Masukkan `admin@kiriproject.id`, `admin@projectkiri.id`, atau username `admin`.\n", "2. **Email / Username**: Masukkan `admin@kiriproject.id`, `admin@projectkiri.id`, atau username `admin`.\n3. **Kata Sandi (Password)**: dikelola di server (env `SEED_ADMIN_PASSWORD` / database bcrypt) — tidak ditulis di dokumen ini.\n");
  // Renumber — sisa bullet lama
  out = out.replace('3. **Kata Sandi (Password)**: dikelola di server — tidak ditulis di dokumen ini.\n4. **Hak Istimewa**', '3. **Kata Sandi**: dikelola di server (env `SEED_ADMIN_PASSWORD` / database bcrypt) — tidak ditulis di dokumen ini.\n4. **Hak Istimewa**');
  out = out.replace('4. **Hak Istimewa**: Akun ini memiliki kewenangan eksklusif', '4. **Hak Istimewa**: Akun ini memiliki kewenangan eksklusif');

  // Pemberitahuan keamanan di atas dokumen
  if (!out.includes('Kata sandi tidak pernah ditulis')) {
    out = out.replace(
      'Dokumen ini berisi daftar kredensial akun level Administrator dan Otoritas Siaran KIRI Project.\n',
      'Daftar akun level Administrator dan Otoritas Siaran KIRI Project.\n> 🔒 **Kata sandi tidak pernah ditulis di dokumen ini** — dikelola di server (env `SEED_ADMIN_PASSWORD` / database bcrypt). Bila lupa, reset lewat admin KIRI.\n'
    );
  }

  write('AKUN_ADMIN.md', out);
  changes += n;
  console.log(`AKUN_ADMIN.md           : ${n} kolom password di-redaksi`);
} else {
  console.log('AKUN_ADMIN.md           : file tidak ada, dilewati');
}

console.log(`\nSelesai. Total perubahan: ${changes}`);
