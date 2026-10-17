# KIRI Project — Runbook Deploy & Launch (v2, Opsi A)

> Menggantikan `DEPLOY.md` lama (kedaluwarsa). Arsitektur final **Opsi A**: satu container Docker — Express menyajikan API + `dist/` frontend, Postgres terkelola terpisah.
> Bukti arsitektur: `Dockerfile` multi-stage, `server/src/app.ts` SPA fallback, `docker-compose.yml` root.

## 0. Keputusan yang sudah dikunci

| Keputusan | Nilai |
|---|---|
| Target deploy | Opsi A — satu container Docker |
| Pricing resmi | Creator: Rp 49k / 99k / 199k per tahun · Business: Rp 97k / 257k / 1.299k per tahun (poster) |
| Tier DB | `basic` \| `exclusive` \| `platinum` (tanpa `free`, default `basic`) |
| Klaim escrow | Dilunakkan: "Verifikasi Pembayaran Manual oleh Tim Admin" |
| Isi data launch | Data seed (535 entitas) diisi lewat jalur non-destruktif (§3) |

## 1. Rahasia & akses (BLOCKER)

Jalankan perintah ini di mesin kamu, **jangan minta siapa pun (termasuk saya) menempelkan nilainya di chat**:

```sh
# JWT_SECRET (≥48 byte acak) — simpan langsung ke secret manager hosting
openssl rand -base64 48
```

- [ ] `JWT_SECRET` produksi tersimpan di secret manager hosting (server menolak boot bila default — jangan hapus guard `server/src/config.ts:16-20`).
- [ ] `DATABASE_URL` produksi terisi; `DATABASE_SSL=true` bila host mewajibkan TLS.
- [ ] `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` baru, kuat — hanya ada di secret manager saat bootstrap, lalu hapus dari env runtime.
- [ ] Verifikasi `server/.env` tidak ter-commit (`git status` bersih, ada di `.gitignore`).
- [ ] Rotasi semua rahasia yang pernah muncul di chat/log/screenshot.

## 2. Database produksi (BLOCKER)

- [ ] Provision Postgres terkelola: backup otomatis harian, retensi ≥ 7 hari. Catat siapa pemegang akses.
- [ ] Snapshot awal sebelum migrasi pertama (ini rollback point #0).
- [ ] Jalankan migrasi:
  ```sh
  cd server && DATABASE_URL="<url-produksi>" DATABASE_SSL=true npm run migrate
  ```
  Simpan output sebagai bukti. Migrasi bersifat aditif (`001_init.sql`, `002_launch_features.sql` — tabel baru + ALTER kolom), tidak ada DROP.
- [ ] **JANGAN PERNAH** `npm run seed` ke produksi — `seed.ts` melakukan `TRUNCATE ... CASCADE`. Seed hanya dev/staging.

## 3. Isi data launch — jalur non-destruktif (seed 535 entitas tanpa TRUNCATE)

Karena launch pakai data seed tapi `seed.ts` destruktif, pakai jalur dump-restore — tidak perlu mengubah kode:

```sh
# 1) Staging lokal: jalankan seed seperti biasa
cd server && npm run seed        # dev/staging saja

# 2) Dump dari staging (data saja, schema sudah ada di produksi)
pg_dump "$STAGING_DATABASE_URL" \
  --data-only \
  --exclude-table=migrations \
  --no-owner --no-privileges \
  -F c -f kiri_launch_data.dump

# 3) Restore ke produksi (aman: produksi masih kosong saat bootstrap)
pg_restore "$PROD_DATABASE_URL" \
  --data-only --disable-triggers \
  --no-owner --no-privileges kiri_launch_data.dump
```

- [ ] Verifikasi pasca-restore: `SELECT count(*) FROM entities;` (≈535) dan 1 admin (`SEED_ADMIN_*` dibuat lewat bootstrap env, bukan dari dump).
- [ ] Snapshot baru setelah restore (rollback point #1).

## 4. Konfigurasi environment produksi (pemilik: kamu)

| Var | Nilai produksi | Catatan |
|---|---|---|
| `DATABASE_URL` | URL Postgres terkelola | |
| `DATABASE_SSL` | `true` (bila host mewajibkan TLS) | |
| `JWT_SECRET` | dari §1 | ≥48 byte |
| `JWT_EXPIRES_IN` | `7d` default; risiko admin di dokumentasikan — pertimbangkan lebih pendek | |
| `CORS_ORIGINS` | **domain final** (contoh `https://kiriproject.id`) — bukan `localhost:8080` | |
| `PORT` | `8080` (atau sesuai hosting) | |
| `UPLOAD_DIR` | volume persisten container | upload harus persisten |
| `MAX_UPLOAD_BYTES` | default 5MB | |
| `LOG_LEVEL` | `info` (bukan `debug`) | |
| `SENTRY_DSN` + `SENTRY_ENVIRONMENT=production` | dari akun Sentry kamu | tanpa ini error tak terpantau |
| `FRONTEND_DIST` | path `dist/` di container (sudah diatur Dockerfile) | |
| `VITE_API_URL` | kosong/relatif — Opsi A serve dari origin yang sama; **verifikasi di bundle hasil build** | |

## 5. Build & rilis

- [ ] CI hijau di commit rilis (bukti workflow `.github/workflows/ci.yml` lulus, bukan keberadaan file).
- [ ] Rilis hanya dari tag: `git tag v1.0.0 && git push --tags`; image Docker di-tag per rilis.
- [ ] Simpan N image terakhir untuk rollback satu perintah.

## 6. Runbook rollback (jalankan saat kriteria §8 terpicu)

```sh
# 1. Rollback aplikasi (paling umum, aman — DB tidak disentuh)
docker pull <registry>/kiri:<tag-sebelumnya>
docker compose up -d --no-deps app   # atau perintah deploy hosting, image tag sebelumnya

# 2. Rollback data (HANYA bila migrasi merusak data)
#    Restore snapshot terdekat, lalu deploy image yang cocok dengan schema snapshot itu:
pg_restore --clean --if-exists -d "$PROD_DATABASE_URL" <snapshot>.dump
```

- [ ] Penanggung jawab eksekusi: __________ (isi nama)
- [ ] Latensi target: rollback aplikasi < 5 menit; keputusan rollback data hanya lewat konfirmasi kamu.

## 7. Verifikasi pra-launch (semua harus hijau sebelum pengumuman)

- [ ] `curl -s https://<domain>/api/health` → 200.
- [ ] `curl -I https://<domain>` → CSP/HSTS/X-Content-Type-Options/X-Frame-Options/Referrer-Policy hadir; CSP **tanpa** `cdn.tailwindcss.com`.
- [ ] Login admin + 1 registrasi uji + 1 upload bukti uji (PNG) + upload file palsu (svg/html) ditolak 415.
- [ ] Tanpa token → 401 di endpoint tulis/admin; token non-admin → 403.
- [ ] Semua halaman dibuka tanpa error console; pricing tampil sesuai poster (2 halaman, tarif tahunan).
- [ ] Member card, landing-order (order masuk + admin lihat di dashboard), chat member↔admin berfungsi.
- [ ] Sentry menerima 1 event uji; log pino terkumpul (stdout → log driver, retensi ≥14 hari).
- [ ] Uji beban ringan: 50 user bersamaan direktori+submit, catat p95; pool `max: 10` cukup.

## 8. Go / No-Go hari-H

**GO bila:** health 200 · login admin sukses · 1 registrasi uji lolos · Sentry menerima event · rollback image tersedia.
**ROLLBACK bila:** 5xx > 1% selama 5 menit · DB tidak pulih 10 menit · CSP memblokir aset utama produksi · bukti pembayaran gagal tersimpan.

Jam launch / penanggung jawab / kanal komando: __________

## 9. Minggu pertama & pasca-launch

- Review hari-1/3/7: error Sentry, log lambat, keluhan pembayaran → gelombang perbaikan kedua.
- Uji restore backup DB dari snapshot harian (bukan cuma percaya backup ada).
- `npm audit` terjadwal; verifikasi email pendaftar (backlog); tinjau CSP tiap aset pihak ketiga baru.
- Backlog fitur dari poster yang belum dibangun: platform fee 7–10% per transaksi kolaborasi.
