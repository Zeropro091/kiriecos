# KIRI PROJECT — Deploy Runbook

Status: **DEPLOY-READY** (kode + config siap, tinggal eksekusi 4 langkah di bawah).

## Arsitektur
- **Frontend**: Vite + React + TS → static build di `dist/` (Vercel / Netlify)
- **Backend**: Supabase (Postgres + Storage) — schema di `supabase/migrations/20260918_init_kiri_schema.sql`
- **Mode**: kalau env Supabase kosong → app jalan dalam Mock Mode (data in-memory, hilang saat refresh). Untuk production, env WAJIB terisi.

## Langkah Deploy (sekali jalan, ±30 menit)

### 1. Supabase Setup
1. Buat project baru di [supabase.com](https://supabase.com) (region: Singapore)
2. Buka **SQL Editor** → paste seluruh isi `supabase/migrations/20260918_init_kiri_schema.sql` → Run
   - Migration ini bikin: 7 tabel, enum types, indexes, RLS policies (termasuk open-registration + storage upload untuk anon), 3 storage buckets
3. Buat 1 admin user manual di **Table Editor → profiles** (email + full_name, role = `admin`) — dipakai `public.is_admin()` untuk approve payment/review
4. Copy **Project URL** + **anon public key** dari Settings → API

### 2. Repo bersih (WAJIB sebelum push)
Repo sekarang **326 MB** karena aset docx/zip/extracted_images ter-commit. Jangan push dulu — jalankan:

```bash
# Lihat apa yang bikin bengkak
git ls-files | xargs -I{} du -k "{}" 2>/dev/null | sort -rn | head -20
```

Yang perlu di-untrack (tapi JANGAN dihapus dari lokal):
```bash
git rm -r --cached extracted_images extracted_doc_text.txt \
  "KIRI_PROJECT_UIUX_FOUNDATION_COMPLETE_VISUAL_ALL_ASSETS.docx" \
  kiri_project_images.zip 2>/dev/null
git commit -m "chore: untrack large binary assets from repo"
```

> Catatan: `.git` tetap bengkak secara history (326MB). Untuk clean history total, pakai `git filter-repo` atau mulai fresh repo. Untuk launch cepat: cukup untrack di atas + push (GitHub masih terima <2GB).

### 3. Deploy Frontend — Vercel
1. Push ke GitHub: `git push origin main`
2. [vercel.com/new](https://vercel.com/new) → import repo `Zeropro091/kiriecos`
3. Framework preset: **Vite** (auto-detect) — build `npm run build`, output `dist`
4. **Environment Variables** (Production + Preview):
   - `VITE_SUPABASE_URL` = (dari langkah 1)
   - `VITE_SUPABASE_ANON_KEY` = (dari langkah 1)
5. Deploy → dapat URL `kiriecos.vercel.app`

`vercel.json` sudah include SPA rewrites + cache headers (aman untuk refresh direct URL).

### 3b. Alternatif: Netlify
`netlify.toml` sudah disiapkan (build + SPA redirect + cache). Tinggal connect repo di [netlify.com](https://netlify.com), set env variables yang sama.

### 4. Smoke Test Production (15 menit)
Setelah live, tes alur ini di browser (bukan localhost):
- [ ] Home load, navigate directory → profil UMKM
- [ ] Register satu akun creator → cek Supabase Table Editor `entities` ada row baru (status `pending_review`)
- [ ] Submit collab request → cek `collaboration_requests`
- [ ] Upload payment receipt → cek Storage bucket `receipts` ada file + `payment_receipts` ada row
- [ ] Login admin (halaman admin) → approve/reject berfungsi
- [ ] Hard refresh (F5) di sub-halaman → tidak 404 (SPA rewrite bekerja)

## Known Limitations (post-launch, bukan blocker)
- **Auth**: login masih localStorage (mock). RLS open-insert policies menutup gap ini sementara — semua pendaftaran masuk sebagai `pending_review` dan dimoderasi admin manual. Integrasi Supabase Auth = prioritas pasca-launch.
- **Payment**: verifikasi manual transfer bank (by design — sesuai brief).
- **`sender_id`/`receiver_id` collab**: anon submit → NULL. Akan keisi setelah Auth di-wire.

## Rollback / Darurat
Kalau Supabase bermasalah pas launch: kosongkan `VITE_SUPABASE_URL` di Vercel → redeploy → app otomatis jalan Mock Mode (demo tetap bisa, data gak persist).
