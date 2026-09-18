# KIRI PROJECT ECOSYSTEM — LAPORAN KESIAPAN
**Tanggal:** 19 September 2026 · **Status: DEPLOY-READY (kode) / BELUM LIVE (infra)**

---

## 1. Ringkasan Eksekutif

| Aspek | Status | Catatan |
|---|---|---|
| Kode frontend (28 halaman) | ✅ SIAP | Build hijau, TS clean, bundle ~170KB gzip |
| Bug integrasi Supabase | ✅ FIXED | 5 bug kritis ditemukan & diperbaiki |
| Database schema + RLS | ✅ SIAP | 315 baris, tervalidasi, siap dijalankan |
| Config hosting | ✅ SIAP | vercel.json + netlify.toml |
| Repo GitHub | ✅ TER-PUSH | `Zeropro091/kiriecos` @ d0a18c3, 156MB (was 326MB) |
| Supabase project live | ❌ BELUM | Butuh manual setup (lihat AGENT_SERVER_TASKS.md) |
| Frontend live (URL publik) | ❌ BELUM | Butuh import repo ke Vercel/Netlify + env vars |
| Auth (login asli) | ⏳ PASCA-LAUNCH | Mock localStorage + RLS open-insert, dimoderasi admin |

**Kesimpulan:** Gagal-soft di sisi kode = NOL. Yang tersisa adalah 3 langkah infrastruktur yang butuh kredensial akun (±30 menit kerja manual atau AI agent server).

---

## 2. Bug Kritis yang Diperbaiki (sebelum deploy)

1. **Insert collaboration gagal total** — kode kirim `title`/`requester_id`, schema minta `project_title`/`sender_id`. → Dipetakan ulang ke kolom schema.
2. **Upload 403** — `uploadMedia()` pakai bucket `'media'` yang tidak ada. → Rute ke `avatars`/`portfolios` sesuai migration.
3. **Payment receipt gagal masuk** — `payment_receipts.user_id NOT NULL` vs submit anon. → Nullable + policy insert-anon.
4. **Silent failures** — error insert di-swallow. → Semua error kini di-log dengan jelas.
5. **RLS memblokir semua pendaftaran** — tidak ada INSERT policy untuk anon. → Ditambah open-registration policies (entitas tetap `pending_review`, dimoderasi admin).

## 3. Arsitektur Final

```
[Vercel/Netlify] ←— static build (dist/) —— [Vite+React+TS]
        │ VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
        ▼
[Supabase] — 7 tabel (profiles, entities, portfolios, services,
             community_members, collaboration_requests, payment_receipts)
           — 3 storage buckets (receipts🔒, avatars, portfolios)
           — RLS: public read approved, anon insert pending, admin update
```

## 4. Checklist Go-Live

- [x] Fix bug Supabase (5 bug)
- [x] RLS + storage policies untuk anonymous submission
- [x] Hosting config (SPA rewrites + cache headers)
- [x] Repo dibersihkan (326MB → 156MB, zip >100MB dihapus dari history)
- [x] Push ke GitHub
- [ ] Supabase project dibuat + migration dijalankan ← **AGENT SERVER**
- [ ] Admin user dibuat di tabel `profiles` ← **AGENT SERVER**
- [ ] Vercel/Netlify connect repo + env vars ← **AGENT SERVER**
- [ ] Smoke test 15 menit (checklist di DEPLOY.md §4) ← **AGENT SERVER**

## 5. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Auth masih mock | Gak ada sesi user asli | RLS open-insert + moderasi manual admin (cukup untuk soft launch) |
| Supabase down saat launch | Form gagal | Kosongkan `VITE_SUPABASE_URL` → redeploy → Mock Mode otomatis |
| Spam submission anon | DB penuh sampah | Semua masuk `pending_review` — gak tampil publik sebelum approve |
| History git sudah di-rewrite | Force push sudah dilakukan | Jangan edit history lagi; branch protection off saat ini |
