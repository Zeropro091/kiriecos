# 🔍 masalahbrowser.md — Diagnosis "Situs Tidak Bisa Dibuka (Incognito pun Gagal)"

> **Tanggal:** 19 Oktober 2026
> **Metode:** audit read-only + pengujian langsung ke `https://kiriproject.id` (curl ×20+, build lokal, typecheck). **Tidak ada satu pun file kode yang diubah.**
> **Pertanyaan user:** (1) kenapa kemarin bisa dibuka pakai incognito, sekarang incognito pun gagal? (2) apakah sudah ada list/tombol "Ajukan Collab" untuk partner seperti di kreator?

---

> ⚠️ **PEMBARUAN (19 Okt 2026, malam):** akar masalah akhirnya terbukti: tunnel `lensa` punya 2 konektor aktif yang sama-sama mengklaim `kiriproject.id`, sehingga trafik bergantian antara KIRI lama dan baru (hipotesis A di bawah benar). Setelah record DNS `@` diarahkan ke tunnel `kiri`, `kiriproject.id` menyajikan build baru 20/20. Detail koreksi ada di `Summerybrowserfix.md`.

## TL;DR

1. **Bukan bug di kode frontend, bukan virus/cookie di browser kamu, dan bukan karena incognito.** Kode yang sekarang ada di repo **lolos `tsc` dan `vite build` tanpa error** (aku build sendiri tadi).
2. **Root cause: ada DUA versi aplikasi yang hidup bersamaan di belakang domain `kiriproject.id`.** Setiap request di-routing-kan acak ke salah satunya (Cloudflare Tunnel dengan lebih dari satu konektor/cloudflared aktif). Statistik nyata dari tes 20× kepanjangan:
   - `/api/entities` → **8× balik data JSON** (server baru), **12× balik index.html** (server lama yang tidak punya rute itu — rilisnya jatuh ke SPA fallback).
   - **Homepage sendiri bergantian kirim dua build berbeda**: `index-hyEX5jzQ.js` (build lama) vs `index-DIthJ9-i.js` (build baru — hasil build lokal hari ini persis sama hash-nya).
   - Kesimpulan: ±60% trafik mengena server LAMA. Itulah kenapa "tadi bisa dibuka" (kebetulan dapat instans baru), "sekarang incognito pun gak bisa" (kebetulan dapat instans lama). Incognito tidak relevan — kebetulan/belokannya berbeda saja.
3. **Jawaban tanya-tanya partner:** ✅ Sudah ada. Halaman profil mitra strategis (**page-07**) sudah punya tombol **"Inisiasi Kerjasama Strategis"** yang buka modal Collab yang **sama persis** dengan kreator (`openCollabModalFor` → modal page-20 → form brief **page-21**). Kartu partnership di Direktori (page-02) juga sudah punya tombol **"Kolaborasi"** untuk semua tipe entitas, termasuk mitra strategis. Satu syaratnya: **wajib login dulu** — kalau belum login, tombol langsung menampilkan peringatan + lempar ke halaman login.

---

## 1. Bukti (apa yang diukur, bukan tebakan)

Semua diukur `2026-10-19 ±12:55 UTC` lewat curl ke produksi:

| Endpoint | Hasil |
|---|---|
| `GET /api/health` | ✅ 200 JSON `{"ok":true,"db":"up"}` — database OK |
| `GET /api/entities` (20×) | **8× JSON 200 (711.579 byte)** ✅ — **12× text/html (index.html)** ❌ |
| `GET /` (6×) | bergantian memuat `index-hyEX5jzQ.js` dan `index-DIthJ9-i.js` |
| `GET /assets/vendor-react-BnEND93y.js` (4×) | 3× `text/javascript` benar, 1× **index.html** dijadikan JS |
| `GET /api/auth/login` (password salah) | 401 JSON — rute auth bekerja baik di kedua versi |
| `GET /api/broadcasts` | 200 JSON ✅ |
| `typecheck` lokal | `tsc --noEmit` → 0 error |
| `npm run build` lokal | sukses, pull `dist/assets/index-DIthJ9-i.js` (hash ≥ yang hidup di produksi) |

**Cara baca:** kedua "identitas" itu di Cisco PoP yang sama (CF-RAY `...NRT`), dan `cf-cache-status: DYNAMIC` (Cloudflare tidak men-cache jawaban ini) → perubahan itu **tidak datang dari cache**, tapi dari sumber resminya (HTTP<→spa fallback) terus-menerus: **ada 2 proses/oris  yang berbeda yang di-requesting.** Kemungkinan besar (urut kemungkinan):

- A. ** lebih dari satu `cloudflared` (Cloudflare Tunnel konektor) yang masih hidup** untuk hostname yang sama — mis. tunnel lama di sekolah/mesin lamamu + tunnel baru di VPS produksi. Cloudflare menyebarkan traffic acak ke semua konektor yang aktif **dengan default `originRequest.connectTimeout`**; ini persis menghasilkan pola "kadang oke kadang mati".
- B. app berjalan dua kali di server yang sama pada port yang berbeda (mis. pm2 `kiri` di :4000 **plus** container Docker/port `APP_PORT=8080` yang sudah tak pernah dihapus dan tunnel lama masih menuding situ).
- C. DNS/record Cloudflare ganda (A record tua + CNAME tunnel) — kurang mungkin karena kedua jalur hidup bersamaan persis.

---

## 2. Kenapa "instans lama" bikin halaman tampak rusak total (halaman blank)

Ketika traffic-nya mengena** server lama**, dua hal terjadi bersamaan:

1. **`/api/entities` membalas index.html.** Klien frontend (`src/lib/api.ts → parseJsonSafe`) sabar merekonstruksi HTML → `res.entities` jadi `undefined` → `AppContext.setEntities(undefined)` → **Page02/Page01 melakukan `entities.filter(...)` → TypeError ("Cannot read properties of undefined (reading 'filter')") → React memuntahkan seluruh tree** → halaman putih tanpa teks. Karena **tidak ada ErrorBoundary**, satu data yang gagal bikin seluruh aplikasi blank — ini alasan kenapa terasa seperti "situs total mati", bukan sekadar "direktori kosong".
2. **Build frontend lama muat JS yang tidak ada** (`/assets/index-hyEX5jzQ.js`)) — server baru membalas index.html untuk file itu → browser gagal *module parse* → halaman putih lagi.

Jadi gejala "kemarin bisa, sekarng blank meskipun incognito" = **bukan berubahnya kode/browser**, melainkan **melindungi help random** dari merindu instansítás.

---

## 3. Cara memperbaiki — **tanpa mengubah satu baris kode**

Semua di bawah ini aksi operasi/deploy yang bergantung server. Kerja berurutan A → B → C:

### A. Matikan instans lama (satuk mematikan dan satu VANITAS)

Di **VPS Windows produksi** (sesuai DEPLOY.md, `C:\kiri`), PowerShell:

```powershell
# 1. Lihat semua proses kiri (pm2 + node + docker)
pm2 list
pm2 jlist | ConvertFrom-Json | Select name,pm2_env\status,pm2_env\pm_cwd
netstat -ano | findstr ":4000 :8080"
docker ps -a --filter name=kiri

# 2. Hapus DUPLIKAT-nya (bukan proses kanonik). Contoh kalau ganda pm2:
pm2 delete <id-duplikat>      # sisakan SATU proses dengan nama 'kiri'
pm2 save

# 3. Kalau tersisa container Docker tua:
docker rm -f kiri             # atau docker rm -f <nama-lama>

# 4. Kalau ada proses node manual/duplikat (bukan dari pm2):
taskkill /PID <dari-netstat> /F
```

### B. Tutup konektor cloudflared yang tua

Cari SEMUA server/mesin yang pernah di-deploy (VPS lama atau `C:\kiri` di mesin lain). Di masing-masing:

```powershell
Get-Process cloudflared -ErrorAction SilentlyContinue   # tunnel lama hidup?
taskkill /IM cloudflared /F                             # matikan yang bukan tujuan kanonik
```

Lalu di Cloudflare: **Dashboard → Zero Trust → Networks → Tunnels → (tunnel `kiriproject.id`) → Connectors — pastikan tinggal SATU konektor ikut jalan** (yang lain "disconnected/deleted").

### C. Deploy versi TERBARU sekali lagi (biarkan kedua jejak sinkron)

```powershell
cd C:\kiri
.\deploy.ps1            # pull build terbaru, restart pm2/docker secara idempoten
```

`deploy.ps1` otomatis `pm2 delete kiri` sebelum `pm2 start` → proses tua pasti tersingkir; pastikan **output-nya `runner : pm2` (atau docker) dan commit = hash terbaru**.

### D. Flush cache Cloudflare (sekali saja, aman)

Cloudflare Dashboard → **Caching → Purge → Purge Everything**.

### E. Verifikasi final (cmd yang sama seperti di atas)

```powershell
# Semua harus JSON, TANPA html, setelah 20 percobaan:
1..20 | ForEach-Object {
  $r = Invoke-WebRequest -Uri "https://kiriproject.id/api/entities" -TimeoutSec 10
  "{0}  {1}" -f $r.StatusCode, $r.Headers["Content-Type"]
}
```

Kriteria lulus: 20/20 `application/json; charset=utf-8`. Browser: Ctrl+F5 di tab biasa **dan** incognito — direktori & data profile kreator/harmon muncul kembali dengan tombol kolaborasi.

---

## 4. Jawaban pertanyaan "List partner + tombol collab yang sama?"

✅ **Sudah ada, cukup dilihat redak-nya di modal/board:**

| Lokasi | Tombol | Aksi |
|---|---|---|
| Profil mitra strategis (page-07) | **"Inisiasi Kerjasama Strategis"** | buka modal request via KIRI (`openCollabModalFor(partner)`) |
| Kartu katalog direktori (page-02), tipe `strategic` | **"Kolaborasi"** | buka modal request yang sama |
| Modal request (page-20 `CollabRequestModal`) | "Lanjut ke Formulir Brief" | → **page-21** (brief, termasuk kategori "Press Release & Editorial" yang cocok untuk partner media/institusi) |
| (tambahan) profil partner | "Ajukan Kemitraan Institusi" | ini yang menuju registrasi institusi (page-13), **bukan** collab — memang desainnya beda |

Catatan penting (bukan bug): seluruh jalur collab `openCollabModalFor` **mewajibkan login**. Kalau belum login, muncul toast *"Masuk atau daftar terlebih dahulu..."* lalu lempar ke page-15. Setelah instans lama dimatikan (bagian 3), ini akan terasa normal kembali.

---

## 5. Daftar "risiko yang memang ada" menantikan perbaikan kode (tapi bukan akar masalah ini)

Ini bug nyata yang sudah diketahui dari audit `fixedbugselesai.md` / `fixsecurty.md`, **masih terbuka**, tapi tidak menyebabkan masalah "gak bisa buka" hari ini:

| ID | Bug | Dampak saat instans baru/satu-satunya berjalan | Fix minimal (nanti, saat mau ngubah kode) |
|---|---|---|---|
| **BUG-N1** | **Tanpa ErrorBoundary + `entities` bisa `undefined`**: `getApprovedEntities()` mengembalikan `res?.entities` tanpa validasi; kalau salah satu respons "aneh" (HTML/proxy/mirror), React blank-page seluruh app | halaman putih (gejala yang kamu temukan) | tambahkan `ErrorBoundary` di `App.tsx` + fallback `setEntities(Array.isArray(approved) ? approved : [])` |
| K7 | `kiri.env.production` fisik masih ada di root repo (sudah `.gitignore`-ed) + password admin `datalist/AKUN_ADMIN.md` plaintext | kebocoran kredensial | rotasi kredensial → pindah ke secret manager → hapus file fisik & bersihkan datalist |
| S7 | Seed akun demo kreator (`datalist/AKUN_USERS_KREATOR.md`) tidak dibuat di DB | login kulator demo tidak berhasil | tambahkan seed non-admin atau bersihkan datalist |
| — | `BROADCAST_EMAILS` hardcode di `broadcasts.routes.ts` | pola berbasis email (mirroring `isAdmin` lama) | padukan ke role + tier |
| RINGAN | 4 script hardcode path `C:\Users\...`; `vercel.json` rewrite bisa menelan `/api` bila satu domain; `src/utils/lazyPages.ts` dead code | membingungkan waktu develop | rapikan nanti |

---

## 6. Checklist pembersihan "berantakan ufung" bagi user (opsional)

Bukan wajib, tapi bantu menghilangkan kemungkinan sisu ter-cached di browser setelah server disatukan:

1. Setelah fix bagian 3: buka `https://kiriproject.id` → **Ctrl+F5** (reload hard).
2. Chrome → Settings → Privacy → **Clear browsing data** → pilih **Cookies & cache** (bukan password).
3. Masih gagal juga? Buka **DevTools (F12) → Network → `api/entities`**, lihat tipe Content-Type-nya — kalau masih `text/html`, berarti **instans lama masih hidup di koneksi Cloudflare** → ulangi bagian B/C.
4. Simpan hasil `curl`/Network screenshot kalau perlu dikirim ke vendor hosting/Cloudflare.

---

*Catatan: laporan ini hanya hasil pengujian; confirm dengan satu run `deploy.ps1` (bagian 3.B) kala kunci daftar servernya lengkap.*

---

<br>

<div align="center">

**🔍 masalahbrowser.md** — Diagnosis & Panduan Perbaikan Situs KIRI PROJECT

**KIRI PROJECT** — [kiriproject.id](https://kiriproject.id)

*Disusun otomatis oleh Buffy (Codebuff/Freebuff) — audit read-only, tanpa perubahan kode.*

</div>
