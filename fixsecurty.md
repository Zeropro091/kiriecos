# 📋 Laporan Audit Logika — KIRI Project (`C:\kiri`)

> **Status dokumen:** hasil audit **read-only** seluruh logic — client (`src/**`), server (`server/src/**`), data, scripts, dan config. Tidak ada satu pun file kode yang diubah saat audit.
> **Tanggal audit:** 17 Oktober 2026
> **Catatan keamanan dokumen:** nilai rahasia (password/kunci) **sengaja tidak dicantumkan** di dokumen ini, sehingga aman untuk dibagikan.

**Ringkasan:** ditemukan **7 temuan kritis**, **14 sedang**, **4 ringan**. Tiga alur inti (registrasi → review, pembayaran → upgrade tier, chat admin) saat ini **rusak end-to-end**.

---

## 🔴 KRITIS — fitur inti rusak / keamanan

**K1. Review pendaftaran selalu gagal (404)**
- `src/context/AppContext.tsx:343` `reviewRegistration(id)` → `src/services/dataService.ts:91` `reviewEntity(reg.id)` → `POST /entities/:id/verify`.
- ID di tabel `registrations` ≠ ID entity (ada kolom `entity_id` terpisah, dibuat dalam 1 transaksi di `server/src/repositories/registrations.ts`). Maka request verifikasi ke `/entities/{regId}/verify` selalu 404.
- Server sebenarnya punya endpoint yang benar — `PATCH /api/registrations/:id` (`registrations.routes.ts` + repo `reviewRegistration`) — tapi **tidak pernah dipanggil klien**.
- **Dampak:** tombol Approve/Reject di Page26 tidak pernah berhasil; status pendaftaran tidak pernah berubah.

**K2. Verifikasi pembayaran tidak menaikkan membership tier**
- `server/src/repositories/payments.ts:92–98` — `verifyPayment` hanya `UPDATE payment_receipts`, tidak pernah menulis `profiles.membership_tier`.
- **Dampak:** admin verifikasi pembayaran → status "verified", tapi user selamanya tetap tier lama. Fitur membership tidak berfungsi.

**K3. Format tier tidak kompatibel dengan constraint DB**
- `src/pages/Page14MembershipPayment.tsx:195` mengirim `tier: "${track}:${selectedTier}"` (mis. `creator:exclusive`).
- Constraint `profiles_membership_tier_check` (`server/src/db/migrations/002_launch_features.sql`) hanya mengizinkan `basic | exclusive | platinum | System Master`.
- `payment_receipts.tier` bertipe bebas teks sehingga lolos, tapi tidak ada satu baris kode pun yang memetakan format ini ke tier profil → **tier tidak akan pernah ter-upgrade** meski K2 diperbaiki nanti.

**K4. Alur registrasi → pembayaran → login putus total**
- Pages 09–13 memanggil `submitRegistration(...)` lalu `navigateTo('page-14-membership-payment')` **tanpa membuat akun/login**.
- Page14 berjalan dalam kondisi logged-out → `POST /api/payments` selalu 401 (butuh token).
- Page15 mengklaim login via "username, email, atau nomor WhatsApp", padahal `server/src/routes/auth.routes.ts` hanya mencocokkan **email**. `localAuth.verifyCreator` (`src/lib/localAuth.ts`) adalah dead code.
- **Dampak:** pendaftar baru tidak akan pernah bisa login maupun menyelesaikan pembayaran.

**K5. Submit pembayaran tanpa upload bukti selalu 400**
- `Page14MembershipPayment.tsx:181` — default `uploadedProofUrl` adalah URL Unsplash `https://...`.
- Server (`server/src/routes/payments.routes.ts`) memvalidasi `receiptImageDataUrl: z.string().startsWith('data:')` → selalu 400 jika user tidak upload file.

**K6. Endpoint members tanpa otorisasi (kebocoran data)**
- `server/src/routes/members.routes.ts`: `GET /members` **publik sepenuhnya** (tanpa `requireAuth`); POST/PATCH/DELETE hanya `requireAuth` **tanpa cek kepemilikan/admin**.
- `createMember` membuat `entityId` opsional → member dengan `entity_id` NULL bisa dibuat.
- Klien (`AppContext.tsx:262, 284, 304–312`) mengubah state optimistis tanpa cek permission dan **tanpa rollback** saat server gagal (hanya toast error).
- `AppContext.tsx:96` `getMembers()` menarik anggota **semua komunitas** — padahal halaman ini dilabeli "Controlled/Private Member Database".

**K7. Rahasia produksi tersimpan plaintext (`kiri.env.production`)**
- File tersebut berisi: password Neon DB (live), AWS access/secret key (prefix `nak_live_...`), `JWT_SECRET`, dan `SEED_ADMIN_PASSWORD`.
- Sudah masuk `.gitignore` (baris 26), tapi file fisik ada di root project. Siapa pun yang menyalin/zip folder ini (atau riwayat file lama) mendapat akses penuh ke DB, storage, dan token admin.
- **Rekomendasi:** rotasi semua kredensial, lalu pindahkan ke secret manager / environment server saja.

---

## 🟠 SEDANG

**S1. Editor profil: services/portfolio hilang + toast sukses palsu**
- `Page17ProfileEditor.tsx:38–46` mengirim `services` & `portfolio`; `AppContext.tsx:369` (`updateEntityProfile`) hanya meneruskan `name/handle/category/bio/location/website` ke API (server PATCH whitelist zod). Perubahan layanan/portfolio hilang diam-diam, tapi toast sukses tetap tampil sebelum respons server.

**S2. Crash & fallback indeks hardcoded saat data kosong**
- `Page17ProfileEditor.tsx:18–20` — `currentEntity.name` crash jika `entities` kosong (belum loading).
- Fallback posisi array: `Page18:19 (entities[3])`, `Page03:24`, `Page05:23`, `Page06:23`, `Page07:21`, `Page04:35`, `Page16:35`, `Page20:18`, `Page21:20`, `Page28:27`, `Page23:22`, `Page22:20 (collabRequests[0])`.
- Karena ID DB berupa UUID (seed membuat UUID baru), fallback posisi ini sering menampilkan entity yang salah, bukan entity yang dimaksud.

**S3. Unread chat admin terbalik + preview selalu kosong**
- `server/src/repositories/chatMessages.ts:69–75` — `unread_count` menghitung `sender_role='admin' AND read_at IS NULL`, artinya "belum dibaca member", bukan "belum dibaca admin".
- `markThreadMessagesRead` hanya dipicu oleh GET `/chat/messages` versi member, sehingga angka unread di inbox admin (`AdminChatInbox`) tidak akan pernah akurat.
- `src/lib/adminInbox.ts:81` membaca `last_message`, padahal server mengembalikan `last_message_body` → preview selalu kosong.

**S4. `api.ts`: `JSON.parse` mentah + desync state 401**
- `src/lib/api.ts:83` — `JSON.parse(text)` tanpa try/catch; respons HTML (proxy/502) → SyntaxError mentah.
- Baris 86: saat 401, token dihapus dari storage tapi state `currentUser` di AppContext tidak direset → UI tetap terlihat login.

**S5. `isAdmin` klien berbasis email vs server berbasis role**
- `src/lib/access.ts` mensyaratkan email ∈ `ADMIN_EMAILS=['admin@kiriproject.id']`; `server/src/auth/middleware.ts` hanya cek role.
- Jika `SEED_ADMIN_EMAIL` berbeda (default dev `kiri-admin` di `server/src/config.ts`), admin yang sah di server **ditolak** oleh guard UI (Page 25/26 di `App.tsx`).

**S6. Error handler server salah status**
- `server/src/app.ts:144–151` — `err.status` diabaikan; JSON-parse error (body invalid) menghasilkan **500**, bukan 400.

**S7. Seed tidak lengkap untuk non-admin**
- `server/src/seed.ts` tidak membuat `profiles` untuk user non-admin dan tidak pernah mengisi `profiles.entity_id` → cek `isOwn` di `PATCH /entities/:id` selalu `false` untuk non-admin; pemilik entity tidak bisa mengedit entity-nya sendiri.

**S8. Like broadcast tanpa auth & tanpa dedupe**
- `POST /broadcasts/:id/like` dapat dipanggil siapa pun berulang kali — count bisa digelembungkan tanpa batas.

**S9. Sandbox landing page kustom mati di produksi**
- `Page28BrandLandingPage.tsx` menyuntikkan `<script src="https://cdn.tailwindcss.com">` + inline JS ke iframe `srcdoc`.
- CSP di `server/src/app.ts:58` (`script-src 'self'`, tanpa `unsafe-inline`/CDN) memblokir keduanya saat dilayani Express → halaman kustom developer tidak akan berjalan.

**S10. Konfigurasi S3 rawan salah senyap**
- `server/src/config.ts`: endpoint dibaca dari `AWS_ENDPOINT_URL_S3` tetapi bucket dari `S3_BUCKET`. Jika bucket di-set tanpa endpoint, sistem **diam-diam fallback ke disk lokal** → file hilang saat redeploy.

**S11. Pencarian/filter tidak berfungsi**
- `Page01Home.tsx` — input pencarian hero hanya navigasi; query dibuang.
- `Page02Directory` — tab filter tidak menyertakan `strategic`.
- `Footer.tsx:17–21` + `Page01Home.tsx:25–57` memakai ID legacy (`creator-1`, `comm-1`, `biz-1`, `media-1`, `strat-1`) yang **tidak pernah sama** dengan UUID hasil seed → selalu jatuh ke fallback entity pertama/salah.

**S12. Guard halaman minim**
- Hanya `page-25`/`page-26` yang dijaga `isAdmin` di `App.tsx`. Page17/18/19 bisa dibuka tanpa login; Page17 bahkan mengedit `entities[0]` sebagai guest.
- Page14 juga tidak punya auth guard (terkait K4/K5).

**S13. `imageCompressor` parameter tak terpakai**
- `src/utils/imageCompressor.ts` mendeklarasikan `maxSizeMB` tapi tidak pernah menggunakannya untuk validasi/kompresi target.

**S14. Data pribadi ter-bundle ke frontend**
- `src/data/geoTalentData.ts` menyimpan **nomor WhatsApp asli** di `baseSampleCreators`; masking hanya terjadi saat mapping output (baris 317) — data mentah tetap ada di bundle JS yang bisa dibaca siapa pun.
- `scripts/generateAccounts.mjs:80` masih menulis `passwordPlain` (nomor HP = password) ke `src/data/masterCreatorAccounts.ts` bila dijalankan ulang (versi aman sudah ada: `secureGenerateAccounts.mjs`, gunakan itu / hapus yang lama).

---

## 🟡 RINGAN

1. **Dead code:** `src/utils/lazyPages.ts` (`LazyPage01Home`) dan komponen `IndonesiaMapInteractive` — `getRegionStats` hanya mencakup 7 dari 11 region; `onSelectLocation` mengirim nama parsial (`"DKI"`, `"DI"`).
2. **Scripts tidak portabel:** beberapa script di `scripts/*` hardcode path `C:\Users\Putu Ari\Downloads\...` → crash di mesin lain.
3. **`vercel.json` rewrite** `"/((?!assets/).*)"` juga menangkap `/api/*` bila frontend & API dihosting satu domain Vercel → request API dijawab `index.html`. Aman hanya jika API selalu di domain terpisah.
4. **`datalist/akun_admin.json` + `AKUN_ADMIN.md`** (hasil `generateDatalist.mjs`) berisi kredensial demo, termasuk email asli dan pola password yang menyesatkan ("bebas / apa saja") — sebaiknya dibersihkan dari repo publik.

---

## ✅ Yang sudah benar (tidak perlu diaudit ulang)

- `PATCH /entities/:id`: whitelist field zod ketat, tidak bisa menulis kolom arbitrer.
- Uploads (`server/src/routes/uploads.routes.ts`): validasi magic-byte (PNG/JPEG/WEBP/PDF), cap 5 MB, aman dari path traversal.
- `landingOrders.routes.ts`: seluruh route terproteksi dengan validasi ID numerik.
- `collaborations.routes.ts`: `PATCH` benar-benar `requireAdmin` di server.
- Migrasi terlacak di `schema_migrations`; `seed.ts` TRUNCATE aman karena CASCADE.
- Session/JWT server-side (`auth/jwt.ts` + middleware) solid; masalahnya di sisi pemakaian (K4/S5).

---

## 🎯 Prioritas perbaikan yang disarankan

1. **Perbaiki alur end-to-end dulu:** K4 → K1 → K2 → K3 (registrasi harus membuat akun, review memakai `PATCH /api/registrations/:id`, verifikasi bayar harus update `profiles.membership_tier` dengan format yang lolos constraint).
2. **Keamanan:** K6 (ownership check members) dan K7 (rotasi kredensial + pindah secret).
3. **Perbaikan UX penting:** S3 (unread chat + `last_message_body`), S1 (editor profil benar-benar menyimpan), S2 (guard empty-state).
