# INSTRUKSI AI AGENT SERVER — KIRI PROJECT GO-LIVE

> Untuk AI agent yang berjalan di server/deployment environment.
> Prasyarat: akses ke (1) akun Supabase, (2) akun Vercel ATAU Netlify, (3) repo `Zeropro091/kiriecos`.
> Kerjakan berurutan. Setiap langkah punya kriteria verifikasi — jangan lanjut sebelum lolos.

---

## TASK 1 — Provision Supabase (±10 menit)

1. Buat project baru: nama `kiri-production`, region **Singapore (ap-southeast-1)**.
2. Buka **SQL Editor** → New query → paste SELURUH isi file `supabase/migrations/20260918_init_kiri_schema.sql` → **Run**.
3. **Verifikasi:**
   - Table Editor menampilkan 7 tabel: `profiles, entities, portfolios, services, community_members, collaboration_requests, payment_receipts`
   - Storage menampilkan 3 buckets: `receipts` (private), `avatars` (public), `portfolios` (public)
   - Jalankan `SELECT COUNT(*) FROM pg_policies WHERE schemaname='public';` → hasil ≥ 10
4. Buat admin: Table Editor → `profiles` → insert row:
   - `email`: email admin KIRI · `full_name`: nama admin · `role`: `admin`
5. Salin **Settings → API**: `Project URL` dan `anon public key` — simpan untuk Task 2.

⚠️ JANGAN pakai `service_role key` di frontend — hanya anon key.

## TASK 2 — Deploy Frontend (±10 menit)

**Vercel (utama):**
1. vercel.com/new → import `Zeropro091/kiriecos` (preset Vite, auto).
2. Environment Variables (Production **dan** Preview):
   - `VITE_SUPABASE_URL` = URL dari Task 1
   - `VITE_SUPABASE_ANON_KEY` = anon key dari Task 1
3. Deploy. `vercel.json` di repo sudah handle SPA rewrites + cache.

**Netlify (cadangan):** connect repo, env vars sama — `netlify.toml` sudah lengkap.

**Verifikasi:**
- Build sukses, URL live (mis. `kiriecos.vercel.app`)
- Buka `<URL>/page-02-directory` lalu hard refresh (F5) → **tidak 404** (SPA rewrite bekerja)

## TASK 3 — Smoke Test Produksi (±15 menit)

Jalankan di browser pada URL produksi (BUKAN localhost), urut:

| # | Aksi | Verifikasi |
|---|---|---|
| 1 | Buka home, navigasi ke Directory | Halaman render, profil tampil (mock seed) |
| 2 | Registrasi akun creator (Page09) | Sukses message; cek Supabase `entities` ada row baru `pending_review` |
| 3 | Submit collab request (Page21) | Tracking code muncul; cek `collaboration_requests` ada row |
| 4 | Upload bukti bayar (Page14) | Sukses; cek Storage `receipts` ada file + `payment_receipts` ada row |
| 5 | Hard refresh di sub-halaman | Tidak 404 |
| 6 | Console browser | Tidak ada error merah `Supabase insert/upload error` |

**Jika langkah 2/3/4 gagal dengan error 403/42501 (RLS):** migration belum lengkap atau policies gak jalan → jalankan ulang SQL Task 1, cek `pg_policies`.

## TASK 4 — Lapor Balik

Setelah selesai, laporkan: URL produksi, status tiap smoke test (pass/fail), dan timestamp. Jika ada kegagalan yang tidak bisa diselesaikan, laporkan error persisnya — JANGAN mengarang status sukses.

---

## Post-Launch Backlog (bukan blocker, urutan prioritas)
1. **Wire Supabase Auth** ke Page15/Page24 (login user + admin) → hilangkan mock localStorage, isi `sender_id`/`receiver_id` collab otomatis, RLS bisa diperketat.
2. Domain kustom + HTTPS.
3. seeding data directory asli UMKM Bali (ganti mock).
4. Rate limiting / CAPTCHA di form publik (anti-spam anon insert).
5. Monitoring: Supabase logs + Vercel analytics.
