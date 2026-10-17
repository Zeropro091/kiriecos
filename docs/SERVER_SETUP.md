# KIRI — Setup Server (langkah dari nol)

Dokumen ini untuk menjalankan KIRI di server. Semua kode ada di GitHub. Secret **tidak** ada di repo; kamu isi sendiri di server.

## Checklist

- [ ] **1. Kode di GitHub.** Branch `main` sudah berisi semua perubahan (merge PR launch).
- [ ] **2. Server siap.** Linux, Node 22+, Git. Atau Docker + Docker Compose (disarankan).
- [ ] **3. Clone repo.** `git clone https://github.com/Zeropro091/kiriecos.git kiri && cd kiri`
- [ ] **4. Buat file env di server** (lihat tabel di bawah). Simpan sebagai `server/.env`. Jangan commit.
- [ ] **5. Build & jalankan** (pilih salah satu di bawah).
- [ ] **6. Cek health:** `curl https://<domain>/api/health` → `{"ok":true,"db":"up",...}`
- [ ] **7. Login admin** dengan `SEED_ADMIN_EMAIL` dan password dari env. Ganti password setelah login pertama.
- [ ] **8. Reverse proxy & HTTPS** (lihat bagian Domain).
- [ ] **9. Smoke test:** register, login, lihat daftar entitas, upload bukti bayar.
- [ ] **10. Backup:** snapshot Neon sebelum perubahan besar.

## Env yang dibutuhkan (`server/.env`)

| Key | Isi | Wajib |
|---|---|---|
| `NODE_ENV` | `production` | ya |
| `PORT` | `4000` | ya |
| `DATABASE_URL` | connection string Neon (pooled) | ya |
| `DATABASE_SSL` | `true` | ya |
| `JWT_SECRET` | string acak 48+ byte (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`) | ya |
| `JWT_EXPIRES_IN` | `7d` | ya |
| `CORS_ORIGINS` | `https://kiriproject.id,https://www.kiriproject.id` | ya |
| `SEED_ADMIN_EMAIL` | email admin | ya (untuk seed) |
| `SEED_ADMIN_PASSWORD` | password admin baru, bukan `kiri-admin` | ya (untuk seed) |
| `S3_BUCKET` | `assets` | ya, untuk upload |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | kredensial Neon Object Storage | ya, untuk upload |
| `AWS_ENDPOINT_URL_S3` | endpoint Neon S3 | ya, untuk upload |
| `AWS_REGION` | dari Neon | ya, untuk upload |
| `UPLOAD_DIR` | `uploads` (dipakai hanya jika `S3_BUCKET` kosong) | tidak |
| `MAX_UPLOAD_BYTES` | `5242880` | tidak |
| `SENTRY_ENVIRONMENT` | `production` | tidak |

Semua nilai Neon bisa diambil ulang dengan `neon env pull --branch production --services postgres,object-storage --file server/.env.production`.

## Jalankan — Opsi A: Docker (disarankan)

Dockerfile di root sudah build frontend, build backend, dan menyajikan keduanya di satu port.

```bash
cd kiri
docker build -t kiri-app .
docker run -d --name kiri --restart unless-stopped \
  --env-file server/.env -p 4000:4000 kiri-app
docker logs -f kiri
```

Jangan pakai `docker-compose.yml` untuk database. Itu menjalankan Postgres lokal, sedangkan produksi pakai Neon.

## Jalankan — Opsi B: Node langsung

```bash
cd kiri
pnpm install --frozen-lockfile && pnpm run build   # frontend → dist/
cd server
npm ci && npm run build                             # backend → dist/
npm run migrate                                     # jalankan sekali / saat ada migrasi baru
# Jalankan dengan process manager (pm2 atau systemd), contoh pm2:
pm2 start "node --env-file=.env dist/index.js" --name kiri
```

Opsi B harus punya `frontend/dist` di lokasi yang dibaca server (`FRONTEND_DIST`, default `../dist`).

## Migrasi & seed

- **Migrasi** (`npm run migrate`): aman dijalankan ulang. Hanya menambah tabel/kolom baru.
- **Seed** (`npm run seed`): **MENGOSONGKAN semua tabel** lalu mengisi ulang. Jangan pernah jalankan di database yang sudah ada datanya. Di Neon produksi sudah terisi, jadi jangan dijalankan lagi.

## Domain & HTTPS

Frontend dan API lewat satu domain (`kiriproject.id`). Di reverse proxy (Nginx/Caddy/Cloudflare) arahkan semua ke `127.0.0.1:4000`. Cek `CORS_ORIGINS` cocok dengan domain yang dipakai.

Catatan: saat ini `kiriproject.id` masih menampilkan frontend statis lama dari Cloudflare, bukan backend ini. Setelah deploy, pastikan record DNS dan rule Cloudflare mengarah ke server.

## Hal yang sengaja tidak ada di repo

- `server/.env`, `server/.env.production`, `.neon` (sudah di-`.gitignore`)
- `node_modules/`, `dist/`, `server/uploads/`
- Data 535 entitas: ada di Neon (branch `production`), bukan di git
- Kredensial Neon dan JWT secret asli

## Kalau ada yang gagal

| Gejala | Penyebab biasa |
|---|---|
| Server exit "JWT_SECRET" | `JWT_SECRET` masih default atau kosong |
| `db: down` di health | `DATABASE_URL` salah atau `DATABASE_SSL` tidak `true` |
| Upload gagal 500 | `S3_BUCKET` / `AWS_*` belum diisi |
| CORS error di browser | `CORS_ORIGINS` tidak memuat domain yang dipakai |
| Halaman kosong di `/` | frontend belum di-build atau `FRONTEND_DIST` salah |
