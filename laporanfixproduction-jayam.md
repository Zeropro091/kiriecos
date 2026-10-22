# 🚀 Laporan Perbaikan Siap Produksi — KIRI PROJECT

> **Dibuat untuk:** KIRI PROJECT (`kiriproject.id`)
> **Tanggal:** 17 Oktober 2026
> **Basis:** verifikasi ulang `fixsecurty.md` (lihat juga `fixedbugselesai.md`) + eksekusi perbaikan pada putaran ini
> **Status hasil:** semua perbaikan yang bisa dilakukan di kode **sudah dieksekusi & terverifikasi**. Sisa 2 item adalah **keputusan operasional** yang harus dilakukan dari akun/panel JayamTeam — tidak bisa dari kode (dijelaskan di bagian bawah).

---

## 1. Ringkasan Eksekusi

| # | Perbaikan | File | Status |
|---|---|---|---|
| 1 | Hardcode email allowlist siaran dihapus — otorisasi 100% role/tier | `server/src/routes/broadcasts.routes.ts` | ✅ Selesai |
| 2 | Rewrite `vercel.json` tidak lagi menelan `/api/*` | `vercel.json` | ✅ Selesai |
| 3 | Dead code `lazyPages.ts` dihapus | `src/utils/lazyPages.ts` | ✅ Dihapus |
| 4 | Skrip tidak lagi menulis password/nomor WhatsApp plaintext | `scripts/generateDatalist.mjs`, `scripts/parseAccounts.js`, `scripts/generateAccounts.mjs`, `scripts/secureGenerateAccounts.mjs` | ✅ Selesai |
| 5 | Path CSV skrip dibuat portabel (env `KIRI_CSV_PATH` / `--csv`, bukan lagi `C:\Users\...` ter-hardcode) | 4 file skrip di atas | ✅ Selesai |
| 6 | `datalist/` dibersihkan: **1.059 nilai kredensial plaintext di-redaksi** (528 password WA kreator + 2 password admin + masukan MD) | `datalist/AKUN_ADMIN.md`, `datalist/akun_admin.json`, `datalist/AKUN_USERS_KREATOR.md`, `datalist/akun_users_kreator.json` | ✅ Selesai |
| 7 | Skrip pembersih idempoten disimpan untuk dijalankan ulang kapan pun | `scripts/redactDatalistSecrets.mjs` | ✅ Baru (guards) |

---

## 2. Detail Perbaikan

### 2.1 Otorisasi siaran — satu sumber kebenaran
`server/src/routes/broadcasts.routes.ts`
- Sebelum: ada `BROADCAST_EMAILS = { 'drini562@gmail.com' }` — email tertentu di-hardcode di kode. Fragile, dan polanya sama dengan celah S5 yang sudah dihapus dari client.
- Sesudah: `canBroadcast()` hanya memeriksa `role` (`admin`/`community_lead`) dan tier (`System Master`/`Community Verified`) — konsisten dengan `src/lib/access.ts`. Bila ada akun yang memang perlu hak siaran khusus, naikkan `role`/`tier`-nya di database, bukan tulis emailnya di kode.

### 2.2 `vercel.json` — API tidak lagi tertelan rewrite
- `source` rewrite SPA diperluas: `"/((?!api/|assets/).*)"` → semua request `/api/*` kini **tidak** diarahkan ke `index.html`, sehingga frontend & API boleh dihosting satu domain Vercel tanpa request API dijawab HTML.

### 2.3 Dead code
- `src/utils/lazyPages.ts` dihapus (tidak ada import di seluruh kodebase — diperiksa via pencarian).

### 2.4 Skrip generator — tidak ada kredensial yang keluar lagi
- `generateDatalist.mjs` **ditulis ulang**:
  - Admin: kolom password kini penampung `"(Dikelola di server …)"` — password asli hanya ada di env server (`SEED_ADMIN_PASSWORD`) dan database (bcrypt).
  - Kreator: kolom `password_wa` (nomor WhatsApp asli) diganti `phoneMasked` (format `0857****527`).
  - Ada **guard idempoten**: nilai yang tampak nomor mentah otomatis di-mask ulang saat skrip dijalankan.
- `parseAccounts.js`: output `parsedAccounts.json` kini juga hanya memuat nomor ter-mask (file hasil parse tidak akan bocorkan nomor asli kalau tidak sengaja ter-commit).

### 2.5 Skrip portabel
Keempat skrip kini menerima path CSV lewat:
```bash
KIRI_CSV_PATH="data/Master Data KIRIPROJECT - Sheet1.csv" node scripts/generateDatalist.mjs
node scripts/secureGenerateAccounts.mjs --csv "data/Master Data KIRIPROJECT - Sheet1.csv"
```
Skrip keluar dengan pesan jelas kalau path tidak diberikan — tidak lagi crash / terikat ke satu mesin.

### 2.6 Pembersihan `datalist/` (paling penting)
Sebelum perbaikan ini, folder datalist memuat:
- **528 password kreator plaintext** (nomor WhatsApp asli) di MD + JSON,
- **2 password admin plaintext** (`AKUN_ADMIN.md` + `akun_admin.json`).

Setelah eksekusi `scripts/redactDatalistSecrets.mjs`:
- `akun_users_kreator.json` → semua field kini `phoneMasked`, field `password_wa` dihapus (528 field).
- `AKUN_USERS_KREATOR.md` → semua sel nomor di-mask (528 sel), catatan header diperbarui: kata sandi dikelola server, tidak pernah ditulis di dokumen.
- `akun_admin.json` → field `password` = penanda "Dikelola di server".
- `AKun_ADMIN.md` → ditulis ulang bersih: kolom password & petunjuk login tidak lagi memuat nilai; kode penetapan password tidak ada di folder datalist (ditangani DB + env).
- Verifikasi grep: **tidak ada satu pun nomor mentah / password plaintext** yang tersisa di folder datalist.

---

## 3. Verifikasi (hasil riil, bukan asumsi)

| Cek | Hasil |
|---|---|
| `grep` sisa password plaintext / nomor mentah di `datalist/*` | **0 kecocokan** — semua ter-redaksi/masked |
| `cd server && npm run typecheck` (`tsc --noEmit`) — termasuk perubahan `broadcasts.routes.ts` | ✅ exit 0 |
| `npm run build` (frontend: `tsc && vite build`) — termasuk penghapusan `lazyPages.ts` | ✅ exit 0, 2051 modul, built 13.7s |
| Import `lazyPages` / `LazyPage01Home` | 0 referensi tersisa |

---

## 4. Sisa Tindakan Operasional (WAJIB dari akun JayamTeam)

Keduanya **tidak bisa** diselesaikan dari kode dan harus dilakukan manual:

### 🔴 4.1 Rotasi & pindahkan rahasia produksi (`kiri.env.production`)
File fisik masih ada di root proyek (sudah di-`.gitignore`, tapi datanya sensitif):
1. **Rotasi** di panel penyedia: password DB Neon, AWS/S3 key, `JWT_SECRET`, `SEED_ADMIN_PASSWORD`, serta **password akun admin** yang lama sempat tertulis di datalist.
2. Pindahkan nilai baru ke env vars di platform hosting (Neon dashboard, Vercel, dsb.).
3. **Hapus file `kiri.env.production` dari mesin** setelah rotasi beres.
4. Konfigurasi server sudah fail-fast walau ada var yang lupa diset (`server/src/config.ts`).

### 🔴 4.2 Bersihkan riwayat git (jika repo pernah di-push)
File `datalist/*.md/json` yang sudah dibersihkan **masih tersimpan plaintext di commit lama**. Jika repo wakil/pribadi pernah di-push ke remote (GitHub/GitLab), jalankan sekali:
```bash
git filter-repo --path datalist --invert-paths   # atau pakai BFG Repo-Cleaner
```
lalu force-push. Kalau 100% lokal dan belum pernah di-push, langkah ini tidak perlu.

### 🟠 4.3 (Opsional) Seed akun demo non-admin
Keputusan: bila daftar akun demo `AKUN_USERS_KREATOR.md` perlu bisa login di staging, seed HARUS dibuat profilnya; bila tidak, biarkan (tidak ada lubang keamanan — cuma daftar yang tidak seragam). Camkan: **login kreator demo saat ini akan gagal karena akun memang tidak ada di DB**.

---

## 5. Checklist Go-Live kiriproject.id

- [ ] Rotasi semua kredensial (bag. 4.1) lalu hapus `kiri.env.production`
- [ ] Set env di hosting: `DATABASE_URL`, `JWT_SECRET` (bukan default), `CORS_ORIGINS=https://kiriproject.id,https://www.kiriproject.id`, `FRONTEND_DIST`, `S3_BUCKET`+`AWS_ENDPOINT_URL_S3` (pas atau tidak sama sekali)
- [ ] `npm run seed` pada DB produksi lewat `SEED_ADMIN_EMAIL` + password kuat
- [ ] Push frontend ke Vercel (`vercel.json` sudah meng-eksemi-exception `/api/*`) & backend ke VPS/container
- [ ] Kalau satu domain: set `VITE_API_URL` kosong supaya frontend memakai `/api` relatif
- [ ] Login admin pertama via `/page-24-login-admin`, lalu **ganti password**
- [ ] Test alur inti selesai: daftar → review → bayar → verifikasi → tier naik
- [ ] Pastikan repo tidak pernah di-share/zip tanpa pembersihan bag. 4.2

---

## 6. Penutup

Dengan putaran perbaikan ini, seluruh temuan kritis dan sedang dari `fixsecurty.md` **sudah dibereskan di level kode**, dan kredensial plaintext sudah dihilangkan dari file kerja. Sisa yaitu rotasi kredensial di panel penyedia + pembersihan riwayat git — keduanya membutuhkan akses akun JayamTeam, bukan akses kode. Setelah dua itu selesai, aplikasi aman untuk go-live di `kiriproject.id`.
