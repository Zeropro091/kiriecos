# KIRI Project — Pre-Deploy & Launch Checklist

> Status file ini: daftar **sisa pekerjaan + verifikasi** sebelum deploy dan launch.
> Dibuat dari audit kode pada branch `main` (terakhir: `d2105c0`).
> `DEPLOY.md` yang lama menggambarkan arsitektur Supabase/frontend-only dan **sudah kedaluwarsa** — jangan dipakai sebagai runbook sampai ditulis ulang.

Legenda: `[ ]` belum dikerjakan · `[x]` sudah terverifikasi di kode

---

## 0. Keputusan arsitektur deploy (tentukan dulu, baru eksekusi)

- [ ] Tetapkan **satu** target deploy dan patuhi sampai launch:
  - Opsi A (sudah didukung kode): satu container Docker — Express menyajikan API + `dist/` frontend, Postgres terpisah. Bukti: `Dockerfile` multi-stage, `server/src/app.ts:123-132` (SPA fallback), `docker-compose.yml` root + `server/docker-compose.yml`.
  - Opsi B: frontend statis (Vercel/Netlify) + API terpisah — **belum didukung** (tidak ada proxy `/api` di `vercel.json`/`netlify.toml`, tidak ada `render.yaml`/`fly.toml`). Pilih ini hanya jika siap menulis config + `VITE_API_URL` per environment.
- [ ] Tetapkan URL produksi final (domain + scheme). Semua item CORS, CSP, dan cookie di bawah bergantung pada ini.

---

## 1. Rahasia & akses (BLOCKER — tidak boleh launch tanpanya)

- [ ] `JWT_SECRET` produksi: generate acak ≥ 48 byte, simpan di secret manager hosting (bukan di repo, bukan di chat). Verifikasi: server menolak boot bila masih default (`server/src/config.ts:16-20` — jangan hapus guard ini).
- [ ] `DATABASE_URL` produksi terisi dan `DATABASE_SSL=true` bila host mewajibkan TLS (`server/src/config.ts:27`, `server/src/db/pool.ts:9`).
- [ ] Putar kredensial admin bootstrap: `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (`server/src/config.ts:36-37`, dipakai `server/src/seed.ts:43-54`). Kata sandi default lemah.
- [ ] Pastikan `server/.env` (ada secara lokal) **tidak ter-commit**. `server/.env.example` hanya berisi template — jangan isi nilai asli di file `.example`.
- [ ] Cabut/rotasi setiap rahasia yang pernah ditempel di chat, log, atau screenshot.

## 2. Database produksi (BLOCKER)

- [ ] Provision Postgres terkelola (backup otomatis harian, retensi ≥ 7 hari).
- [ ] Jalankan migrasi terhadap DB produksi dan simpan outputnya sebagai bukti.
- [ ] Uji rollback migrasi (atau minimal snapshot sebelum migrasi).
- [ ] **JANGAN PERNAH** menjalankan `npm run seed` ke produksi: `server/src/seed.ts:109-111` melakukan `TRUNCATE ... CASCADE` ke semua tabel termasuk `profiles`. Seed hanya untuk dev/staging.
- [ ] Catat prosedur backup/restore dan siapa yang memegang aksesnya.

## 3. Keamanan aplikasi (BLOCKER)

- [ ] Verifikasi header keamanan di URL produksi dengan `curl -I`:
  - `Content-Security-Policy` aktif dengan allowlist sekecil mungkin (`server/src/app.ts:49-64`). Perhatikan: `script-src`/`style-src` saat ini mengizinkan `cdn.tailwindcss.com` — pertimbangkan menghapusnya bila sandbox tidak dipakai di produksi.
  - `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` dari helmet.
- [ ] Kunci `trust proxy`: `server/src/app.ts:30` memakai `trust proxy, 1`. Cocokkan angkanya dengan jumlah proxy/LB/CDN di depan app; salah angka = rate limit membaca IP yang salah.
- [ ] Tinjau ulang attachment auth di semua router: `attachUser` dipasang global di `/api` (`server/src/app.ts:111`) — pastikan tidak ada route publik sensitif yang tanpa sengaja bergantung padanya, dan setiap route tulis/admin memakai `requireAuth`/`requireAdmin` (`server/src/auth/middleware.ts`).
- [ ] Uji sisi negatif auth (wajib lolos semua):
  - Tanpa token → 401 di semua endpoint tulis + endpoint admin.
  - Token non-admin → 403 di endpoint admin (registrations review, user management, dsb).
  - Token kedaluwarsa/tidak valid → 401.
  - User yang sudah dihapus/dinonaktifkan → tidak bisa memakai token lama (verifikasi lewat DB di `middleware.ts:20`, jangan diubah jadi cek token saja).
- [ ] Putuskan umur token: `JWT_EXPIRES_IN` default `7d` (`server/src/config.ts:29`) — panjang untuk akun admin. Pertimbangkan lebih pendek + refresh, atau dokumentasikan risikonya.
- [ ] Direktori upload privat: `/uploads` disajikan statis **tanpa auth** (`server/src/app.ts:82`). Bukti transfer berisi data pribadi — wajib dipindah ke balik auth (atau ke object storage privat dengan signed URL) sebelum menerima upload asli.
- [ ] Validasi upload: saat ini allowlist MIME + batas `MAX_UPLOAD_BYTES` 5MB (`server/src/storage/files.ts:9-28`) — tambahkan verifikasi magic bytes, tolak SVG/HTML, dan pertimbangkan strip metadata/EXIF. Catat: JSON body limit 10MB vs base64 yang mengembang ±33% — uji upload tepat di batas.

## 4. Klaim produk vs realitas backend (BLOCKER — risiko hukum/kepercayaan)

UI saat ini menjanjikan hal yang backend **tidak** lakukan. Sebelum launch, pilih salah satu per klaim: hapus, lunakkan, atau bangun fiturnya.

- [ ] Klaim escrow/dana: `Page04CreatorProfile.tsx:121,226-230`, `Page08JoinSelect.tsx:27`, `Page14MembershipPayment.tsx:220`, `Page20CollabGateway.tsx:82`, `Page21CollabBriefForm.tsx:248-256`, `Page22CollabSuccess.tsx:26`, `Page23MyCollaborations.tsx:237-243`, `Page25DashboardAdmin.tsx:102,155`, `Page27RequestFlowchart.tsx:60-63` ("Dana Terlindungi 100%", "Jaminan KIRI Escrow", "100% aman", "dana diamankan"). Faktanya: pembayaran = bukti transfer manual yang direview admin (`server/src/routes/payments.routes.ts`, `server/src/repositories/payments.ts`). Tidak ada penahanan/pencairan dana otomatis.
- [ ] Harga membership yang tampil di UI (`Page14MembershipPayment.tsx:199,261` — Rp 149.000 / Rp 499.000): pastikan sama dengan tarif resmi dan proses pencocokan bukti transfernya jelas.
- [ ] Status kolaborasi & notifikasi ke kedua pihak: pastikan ada alur yang terdokumentasi (siapa mengubah status apa, siapa diberi tahu).

## 5. Data & seed (BLOCKER untuk integritas launch)

- [ ] Putuskan isi launch: data seed (`server/src/seed-data/*.json`, 535 entitas dsb.) vs data produksi kosong + registrasi organik. Jangan campur tanpa rencana (ID/tracking bisa bentrok dengan data asli).
- [ ] Hapus/nonaktifkan data mock di bundle frontend bila tidak dipakai produksi: `src/data/mockData.ts` (`INITIAL_ENTITIES`, `INITIAL_COLLAB_REQUESTS`, `INITIAL_REGISTRATIONS`, `INITIAL_COMMUNITY_MEMBERS`), `src/data/broadcastData.ts` (`INITIAL_BROADCAST_MESSAGES`). Terpakai aktif setidaknya oleh `src/components/MasterNavDrawer.tsx` (`MASTER_PAGES`, `REFERENCE_IMAGES`) — cabut dengan hati-hati, bukan hapus membabi buta.
- [ ] Ganti nomor/metrik contoh di UI dengan data nyata atau label yang jujur (contoh pola yang sudah benar: `Page16DashboardUser.tsx:58-61`, `Page25DashboardAdmin.tsx:45-48`). Sisir seluruh `src/pages` untuk angka hardcode lain.
- [ ] Formulir registrasi punya nilai awal contoh (`Page09RegisterCreator.tsx:31`, `Page11RegisterBusiness.tsx:23,158-161`) — pastikan tidak bisa terkirim tanpa sengaja / kosongkan untuk produksi.

## 6. Observabilitas (BLOCKER untuk operasi)

- [ ] Isi `SENTRY_DSN` (dan `SENTRY_ENVIRONMENT=production`). Kode sudah siap: init di `server/src/index.ts:9`, capture di error handler `server/src/app.ts:134-143`, unhandled rejection/exception di `server/src/index.ts:11-20` — semua no-op bila DSN kosong. Tanpa DSN, error produksi tidak terpantau.
- [ ] Kirim satu event uji ke Sentry dari staging dan pastikan muncul di dashboard.
- [ ] Pastikan log terstruktur (pino, `server/src/logger.ts`) terkumpul di satu tempat (stdout container → log driver → retained ≥ 14 hari). Jangan mengandalkan file log di dalam container.
- [ ] Definisikan alert minimal: 5xx naik, `db: 'down'` di health, restart container berulang, disk `uploads/` > 80%.

## 7. Health, readiness & restart

- [x] `/api/health` mengecek DB (`SELECT 1`) dan mengembalikan 503 saat DB mati (`server/src/app.ts:100-108`).
- [x] `HEALTHCHECK` Docker memakai `/api/health` (`Dockerfile:39-40`) — karena memakai `r.ok`, status 503 menandai container tidak sehat. Benar.
- [x] Shutdown rapi SIGTERM/SIGINT + tutup pool (`server/src/index.ts:32-44`).
- [ ] Uji skenario DB mati sesaat: app harus 503 lalu pulih sendiri **tanpa restart manual** (pool `server/src/db/pool.ts` sudah pasang handler `error`; buktikan di staging).
- [ ] Pastikan orchestrator/hosting **tidak** me-restart container hanya karena satu probe 503 saat DB blip sesaat (atur `start-period`/`retries` dengan benar).

## 8. CI & rilis

- [x] Workflow ada: `.github/workflows/ci.yml`.
- [ ] Buktikan workflow hijau di branch/PR sebelum launch (jangan percaya keberadaannya saja).
- [ ] Kunci strategi rilis: rilis hanya dari tag (mis. `v1.0.0`), image Docker di-tag per rilis, simpan N image terakhir untuk rollback satu perintah.
- [ ] Tulis runbook rollback (perintah persis + siapa yang mengeksekusi).

## 9. Konfigurasi per environment

- [ ] Daftar final env produksi dan pemiliknya: `DATABASE_URL`, `DATABASE_SSL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGINS` (wajib = domain final), `PORT`, `UPLOAD_DIR`, `MAX_UPLOAD_BYTES`, `LOG_LEVEL`, `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `FRONTEND_DIST`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` (hanya saat bootstrap).
- [ ] Samakan `CORS_ORIGINS` dengan domain final — nilai contoh di `.env.example` (`http://localhost:8080`) **bukan** nilai produksi.
- [ ] Frontend: pastikan `VITE_API_URL`/proxy menunjuk ke API produksi pada build rilis (verifikasi di bundle hasil build, bukan tebakan).
- [ ] Bedakan `LOG_LEVEL` dev (`debug`) vs produksi (`info`/`warn`).

## 10. Verifikasi pra-launch (lolos semua = boleh launch)

- [ ] Build bersih: `tsc` + `npm run build` (frontend) dan `tsc -p tsconfig.json` (server) tanpa error.
- [ ] Migrasi + seed di environment staging yang mirip produksi.
- [ ] Alur auth lengkap: register → login → token kedaluwarsa → akses ditolak tanpa token; admin approve/reject; non-admin ditolak 403.
- [ ] Semua halaman utama dibuka (29 halaman per `MasterNavDrawer`): tanpa error console, tanpa teks placeholder, tanpa angka contoh.
- [ ] Upload bukti pembayaran end-to-end (terima + tolak + batas ukuran + tipe tak didukung).
- [ ] Rate limit: 20 percobaan login/15 menit terpicu sesuai pesan; 300 req/menit API tidak mengganggu pemakaian normal.
- [ ] `curl -I` header keamanan + uji CSP tidak memblokir aset/font/gambar produksi.
- [ ] Uji beban ringan (contoh: 50 pengguna bersamaan di direktori + submit) — catat p95 latency; pool DB `max: 10` (`server/src/db/pool.ts:10`) harus cukup untuk trafik launch.

## 11. Hari-H & minggu pertama

- [ ] Tentukan jam launch, penanggung jawab, dan kanal komando.
- [ ] Kriteria go/no-go tertulis (contoh: health 200 + login admin + 1 registrasi uji + Sentry menerima event).
- [ ] Kriteria rollback tertulis (contoh: 5xx > 1% selama 5 menit, atau DB tidak pulih dalam 10 menit).
- [ ] Pengumuman + kanal bantuan pengguna siap (siapa jawab, SLA berapa jam).
- [ ] Review hari ke-1/3/7: error Sentry, log lambat, keluhan escrow/pembayaran, lalu putuskan perbaikan gelombang kedua.

## 12. Sesudah launch (bukan blocker, jangan hilang)

- Putuskan umur token/JWT refresh; verifikasi email pendaftar; audit dependency terjadwal (`npm audit`); uji restore backup DB berkala; hapus `DEPLOY.md` lama atau tulis ulang mengikuti arsitektur baru; tinjau ulang allowlist CSP tiap ada aset pihak ketiga baru.
