# ✅ Laporan Verifikasi Ulang — `fixsecurty.md`

> **Tujuan dokumen:** memverifikasi ulang seluruh temuan di `fixsecurty.md` terhadap kode terbaru (`src/**` + `server/src/**`).
> **Metode:** audit read-only — tidak ada satu pun file kode yang diubah.
> **Tanggal verifikasi:** 17 Oktober 2026
> **Catatan keamanan dokumen:** password/kunci tidak dicantumkan di dokumen ini. (Terdeteksi kredensial plaintext di repo — lihat bagian "Temuan Baru" — tapi nilainya tidak ditulis ulang di sini.)

---

## Ringkasan Hasil

| Kategori | Total | ✅ Fix | ⚠️ Sebagian | 🔴 Masih Terbuka |
|---|---|---|---|---|
| 🔴 KRITIS | 7 | 6 | 1 (K7) | — |
| 🟠 SEDANG | 14 | 12 | 1 (S7) | 1 (sisa S14 → bagian "Sisa") |
| 🟡 RINGAN | 4 | 0 | 0 | 4 |
| 🆕 Temuan baru | 1 | 0 | 0 | 1 |

**Kesimpulan:** tiga alur inti yang tadinya rusak end-to-end (registrasi → review, pembayaran → upgrade tier, chat admin) **sudah diperbaiki dan benar**. Sisa pekerjaan berputar di manajemen rahasia, seed akun demo, dan sisa-ringan.

---

## 🔴 KRITIS

### K1. Review pendaftaran selalu gagal (404) → ✅ FIX
- Client kini `PATCH /api/registrations/:id` (`src/services/dataService.ts` → `reviewRegistration`), bukan lagi `POST /entities/:id/verify` dengan ID registrasi.
- Server: `server/src/routes/registrations.routes.ts` menyediakan `PATCH /:id` dengan `requireAdmin`; repo `reviewRegistration` meng-update status registrasi **dan** status entitas pendampingnya dalam satu transaksi.
- Client me-refresh directory setelah keputusan disimpan (`AppContext.reviewRegistration`).

### K2. Verifikasi pembayaran tidak menaikkan tier → ✅ FIX
- `server/src/repositories/payments.ts` — `verifyPayment` kini menjalankan `UPDATE profiles SET membership_tier` dalam transaksi yang sama (`withTransaction`), hanya saat `action === 'verify'`.
- `payments.routes.ts` (POST) kini selalu mengisi `profile_id` dari sesi JWT (`req.user.id`), jadi syarat `row.profile_id` terpenuhi untuk pembayaran baru.

### K3. Format tier `track:tier` tidak kompatibel constraint DB → ✅ FIX
- Fungsi baru `mapPaymentTier()` memetakan `creator:exclusive` → `exclusive`, `business:platinum` → `platinum`, dst. sebelum menulis ke `profiles.membership_tier`.
- Bila nilai tak bisa dipetakan: pembayaran tetap terverifikasi, tier tidak diubah (aman, tidak 500).

### K4. Alur registrasi → pembayaran → login putus → ✅ FIX
- Semua Page 09–13 kini memanggil `createAccountForRegistration()` (`src/lib/registration.ts`) → `POST /api/auth/register` + auto-login; ada fallback login bila email sudah terdaftar.
- Login server menerima **email ATAU nomor WhatsApp** (`findByLoginIdentifier` + `normalizePhone` di `auth.routes.ts`); migrasi `003_security_fixes.sql` menambah `profiles.phone` + unique index.
- Page14 kini masuk daftar `AUTH_PAGES` di `src/App.tsx`; `POST /payments` kini `requireAuth`.
- `src/lib/localAuth.ts` bukan lagi dead code — sekarang facade ke backend API.

### K5. Submit pembayaran tanpa upload bukti selalu 400 → ✅ FIX
- `Page14MembershipPayment.tsx`: fallback URL Unsplash dihapus; file bukti wajib, ditolak lebih awal dengan pesan yang jelas.
- Server tetap memvalidasi `receiptImageDataUrl` diawali `data:` dan menyimpannya via `saveDataUrl` (magic-byte, cap 5 MB → 415/413).

### K6. Endpoint members tanpa otorisasi → ✅ FIX
- `GET /members` kini `requireAuth`; non-admin hanya menerima anggota entity miliknya sendiri (tanpa entity → list kosong); admin bisa filter `?entityId=`.
- `POST /members`: entityId untuk non-admin dipaksa ke entity sendiri (input client diabaikan); `PATCH/DELETE /:id` menolak entity milik orang lain (403).
- Catatan kecil: di sisi client, update status/delete anggota masih optimistic tanpa rollback (hanya toast error) — kosmetik, bukan lubang keamanan.

### K7. Rahasia produksi plaintext (`kiri.env.production`) → ⚠️ SEBAGIAN
- File fisik **masih ada di root proyek** (terverifikasi lewat `ls`). Sudah masuk `.gitignore` (baris 26) sehingga tidak ter-track git.
- Yang **belum bisa diverifikasi dari kode**: apakah password DB Neon, AWS key, `JWT_SECRET`, dan `SEED_ADMIN_PASSWORD` sudah dirotasi. Itu aksi operasional manual → **masih wajib dilakukan**, lalu file dihapus/dipindah ke secret manager.
- Pengaman config sudah ada: server menolak start di produksi dengan `JWT_SECRET` default. ✅

---

## 🟠 SEDANG

### S1. Editor profil: services/portfolio hilang + toast sukses palsu → ✅ FIX
- `dataService.updateEntity` kini mengirim `services` & `portfolio`; server menerima keduanya lewat whitelist zod yang ketat.
- Toast sukses hanya muncul **setelah** server OK; bila gagal, perubahan di-rollback ke nilai sebelumnya (`AppContext.updateEntityProfile`).

### S2. Crash & fallback indeks hardcoded → ✅ FIX
- `Page17` menemukan entity via `currentUser.entityId` dan punya empty-state jelas bila sesi belum tertaut — tidak crash lagi.
- Semua fallback indeks (`entities[3]`, `entities[0]`, `collabRequests[0]`) dihapus dari halaman profiling/directory; sekarang `find` berdasar `selectedEntityId` atau tipe, plus empty-state.
- Sisa kecil: string `'creator-1'` masih ada sebagai fallback ID di `AppContext.submitCollabRequest` — placeholder, bukan sumber tampilan profil.

### S3. Unread chat admin terbalik + preview selalu kosong → ✅ FIX
- `chatMessages.ts`: unread di server kini menghitung `sender_role='member' AND read_at IS NULL` — arah yang benar untuk inbox admin.
- Fungsi baru `markMemberMessagesRead` dipanggil saat admin membuka thread (`GET /api/chat/threads/:profileId`) → badge unread akurat.
- `adminInbox.ts` membaca `last_message_body` ✅.

### S4. `api.ts`: `JSON.parse` mentah + desync state 401 → ✅ FIX
- `parseJsonSafe` menangani respons HTML/502 tanpa SyntaxError mentah.
- Saat 401: token dibersihkan dan event `kiri:unauthorized` dipicu; `AppContext` me-reset `currentUser` — UI langsung keadaan logged-out.

### S5. `isAdmin` klien berbasis email vs server berbasis role → ✅ FIX
- `src/lib/access.ts` kini 100% berbasis `role` dari sesi JWT — email allow-list dihapus.
- **Sisa terkait:** server masih punya hardcode `BROADCAST_EMAILS` (satu email) di `broadcasts.routes.ts` — pola yang mirip; sebaiknya diganti karena role/tier (lihat bagian "Sisa").

### S6. Error handler server salah status → ✅ FIX
- `app.ts` kini menghormati `err.status`/`err.statusCode` (JSON body error → 400, storage → 413/415), lalu fallback `res.statusCode`, dan terakhir 500.

### S7. Seed tidak lengkap untuk non-admin → ⚠️ SEBAGIAN
- `seed.ts` masih hanya membuat profil admin; tidak ada profil non-admin, tidak ada `entity_id` pada profil seed.
- **Dampaknya mengecil**: alur register sekarang menautkan ownership (`claimEntityOwnership`), jadi pengguna baru bisa mengedit entity miliknya.
- **Masih bermasalah**: akun demo di `datalist/AKUN_USERS_KREATOR.md` tidak dibuat di DB — login kreator demo **akan gagal**. Bila akun demo itu dibutuhkan, seed perlu ditambah; bila tidak, bersihkan datalistnya.

### S8. Like broadcast tanpa auth & tanpa dedupe → ✅ FIX
- `POST /broadcasts/:id/like` kini `requireAuth` + validasi UUID.
- Repo memakai ledger `broadcast_likes` (PK `(broadcast_id, profile_id)`, `ON CONFLICT DO NOTHING`) — like ulang tidak menginflasi count. Tabel dibuat di migrasi 003.

### S9. Sandbox landing page kustom mati di produksi → ✅ FIX
- Dokumen landing sandbox kini **dirender oleh server** di rute `GET /api/sandbox/landing/:entityId` dengan CSP sendiri yang mengizinkan CDN Tailwind + inline script, sedangkan CSP utama tetap ketat.
- Ekstra kontrol akses: hanya admin/owner/entitas approved yang bisa melihat landing yang belum approved.

### S10. Konfigurasi S3 rawan salah senyap → ✅ FIX
- `config.ts` kini **fail-fast**: `S3_BUCKET` tanpa `AWS_ENDPOINT_URL_S3` (atau sebaliknya) membuat server gagal start — tidak lagi fallback disk senyap.

### S11. Pencarian/filter tidak berfungsi → ✅ FIX
- `Page01Home` menyerahkan query ke Directory via `sessionStorage['kiri.directory.search']`; `Page02Directory` mengkonsumsinya dan menghapus key setelah dibaca.
- Server `GET /entities` menerima `?search=` (ILIKE pada name/bio/category).
- Tab filter kini menyertakan `strategic`; routing tipe → halaman profil memakai map eksplisit sehingga `strategic` tidak lagi melorot ke halaman media.
- `Footer` kini memakai lookup per tipe, bukan ID legacy.
- Sisa kecil: `src/data/mockData.ts` masih berisi ID legacy (`creator-1`, dsb.) sebagai mock lokal — Footer & Page01 sudah tidak memakainya.

### S12. Guard halaman minim → ✅ FIX
- `App.tsx` mendefinisikan `AUTH_PAGES` (page-14, 16, 17, 18, 19, 23, 30, 31, 32) + komponen `AuthRequired`/`AdminAccessDenied`; page 25/26 tetap dijaga `isAdmin`.

### S13. `imageCompressor` parameter tak terpakai → ✅ FIX
- `maxSizeMB` kini dipakai: setelah pass pertama, kualitas diturun bertahap (maks 6 ronde, floor 0.4) sampai blob memenuhi ceiling.

### S14. Data pribadi ter-bundle ke frontend → ✅ FIX (sisa lihat bagian "Sisa")
- `geoTalentData.ts` / `masterGeoCreators.json` kini menyimpan nomor WA yang sudah di-mask di source; `scripts/maskGeoPhoneSource.mjs` menyediakan masking idempoten.
- `scripts/generateAccounts.mjs` sudah ditulis ulang: hanya menghasilkan hash password, bukan password plaintext.

---

## 🆕 Temuan Baru (lebih berat dari kategori ringan)

### N1. Kredensial admin asli plaintext, ter-commit di repo
- `datalist/AKUN_ADMIN.md` dan `datalist/akun_admin.json` memuat **password admin dalam plaintext** beserta email admin.
- Catatan audit lama menganggap ini "kredensial demo", tetapi isinya tampak seperti kredensial nyata. Bila dipakai di produksi, ini setara temuan K7.
- **Rekomendasi:** hapus file dari repo, rotasi password, dan karena sudah pernah ter-commit, pertimbangkan pembersihan riwayat git (`git filter-repo`) jika repo pernah dipush.

---

## 🟡 RINGAN — status

1. **Dead code — masih**: `src/utils/lazyPages.ts` (`LazyPage01Home`) masih ada. Deadline: hapus bila tidak diperuntukan.
2. **Script tidak portabel — masih**: 4 script masih hardcode path CSV di `C:\Users\...`:
   `scripts/secureGenerateAccounts.mjs`, `scripts/parseAccounts.js`, `scripts/generateDatalist.mjs`, `scripts/generateAccounts.mjs`.
3. **vercel.json rewrite — masih**: `"source": "/((?!assets/).*)"` akan menangkap `/api/*` bila frontend & API di-host satu domain Vercel. Aman selama API tetap di domain terpisah; tambah pengecualian `/api` bila nanti satu domain.
4. **datalist kredensial — lebih parah dari catatan audit**: berkembang menjadi temuan baru N1 di atas; `AKUN_USERS_KREATOR.md` juga memuat nomor HP sebagai password bila di-generate ulang (`generateDatalist.mjs` masih menulisnya).

---

## 🎯 Daftar Aksi Tersisa (urut prioritas)

1. **🔴 Rotasi + pindahkan rahasia produksi**: rotasi password DB Neon, AWS key, `JWT_SECRET`, `SEED_ADMIN_PASSWORD`, dan password admin yang ter-commit di `datalist/AKUN_ADMIN.md` → pindah ke secret manager/env server, hapus file fisik `kiri.env.production` dari mesin.
2. **🔴 Bersihkan repo dari kredensial plaintext**: hapus/bersihkan `datalist/AKUN_ADMIN.md`, `akun_admin.json`, `AKUN_USERS_KREATOR.md` (password = nomor HP), dan perbaiki `generateDatalist.mjs` supaya tidak menulis password lagi.
3. **🟠 Lengkapi seed akun demo (S7)**: buat profil non-admin + `profiles.entity_id` bila akun demo perlu bisa login; atau hapus daftar demo dari datalist.
4. **🟠 Hapus `BROADCAST_EMAILS` hardcode** di `broadcasts.routes.ts`; cukup role (`admin`/`community_lead`) + tier.
5. **🟡 Sisa ringan**: hapus `src/utils/lazyPages.ts` bila memang tidak dipakai; buat path CSV skrip di-variabelkan/CLI arg; tambahkan pengecualian `/api` pada rewrites `vercel.json` bila rencananya satu domain.

---

## ✅ Yang sudah benar (konfirmasi ulang, tidak perlu dicek lagi)

- `PATCH /entities/:id`: whitelist zod ketat + ownership (isOwn/admin).
- Uploads (`uploads.routes.ts`): magic-byte PNG/JPEG/WEBP/PDF, cap 5 MB, `requireAuth`; `/uploads` tidak lagi static publik.
- `collaborations.routes.ts`: `PATCH` benar-benar `requireAdmin`.
- `landingOrders.routes.ts`: seluruh rute terproteksi + validasi ID.
- Session/JWT server-side solid; masalah lamanya di pemakaian (K4/S5) dan sudah dikunci.
- Migrasi terlacak di `schema_migrations`; migrasi 003 idempoten; seed `TRUNCATE` aman (CASCADE).
- Rate limit `/api` (300/menit) dan `/api/auth` (20/15 menit), CORS whitelist, helmet CSP ketat untuk aplikasi utama.
