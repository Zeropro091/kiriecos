# Deploy KIRI Project ke Server Windows

Panduan ini buat siapa pun yang pegang server-nya. Nggak perlu paham kode.
Total waktu: ~15 menit (mayoritas nunggu `npm ci`).

Yang lo butuh:
- Server Windows 10/11 atau Windows Server, ada internet.
- Akses Administrator di server itu.
- **Satu file dari Ari: `kiri.env.production`** — isinya kredensial database & storage. File ini RAHASIA: jangan di-commit, jangan di-share, jangan di-upload ke mana pun.

---

## Langkah 1 — buka PowerShell

`Win + X` → **Terminal (Windows PowerShell)** → kalau bisa pilih **Administrator**.
Administrator dipakai supaya port 4000 bisa dibuka di firewall. Kalau nggak admin, script tetap jalan, cuma akses dari mesin lain nggak terbuka.

```powershell
winget --version
```

Kalau `winget` nggak ada: install "App Installer" dari Microsoft Store, atau install manual [Git](https://git-scm.com/download/win) + [Node.js LTS](https://nodejs.org) (versi 22).

---

## Langkah 2 — ambil kode

```powershell
cd C:\
git clone https://github.com/Zeropro091/kiriecos.git kiri
cd C:\kiri
```

Kalau `git` belum ada: `winget install Git.Git`, lalu tutup-buka PowerShell.

**Kalau nggak mau install git**, pakai ZIP — hasilnya sama:

```powershell
Invoke-WebRequest https://github.com/Zeropro091/kiriecos/archive/refs/heads/main.zip -OutFile "$env:TEMP\kiri.zip"
Expand-Archive "$env:TEMP\kiri.zip" C:\ -Force
Rename-Item C:\kiriecos-main C:\kiri
cd C:\kiri
```

Script deploy mendeteksi sendiri kalau foldernya bukan repo git, dan tetap jalan (cuma update kode nanti lewat download ulang).

---

## Langkah 3 — deploy (satu perintah)

Taruh `kiri.env.production` di `C:\kiri\`, lalu:

```powershell
.\deploy.ps1 -EnvFile .\kiri.env.production -Bootstrap
```

Kalau kena execution policy:

```powershell
powershell -ExecutionPolicy Bypass -File .\deploy.ps1 -EnvFile .\kiri.env.production -Bootstrap
```

Script ini jalan berurutan, dan **aman diulang** kalau gagal di tengah:

1. cek/install git + Node.js LTS (kalau `-Bootstrap`)
2. clone atau update kode ke branch `main`
3. pasang `server\.env` dari file yang lo kasih
4. validasi env — kalau `JWT_SECRET` masih nilai contoh, script berhenti (itu memang harus berhenti)
5. `npm ci` + build frontend → `dist\`
6. `npm ci` + build backend → `server\dist\`
7. migrasi database (aditif: bikin tabel yang belum ada, **tidak menghapus data**)
8. start app — pakai Docker kalau terpasang, kalau tidak pm2
9. tunggu `/api/health` balas `db=up`, lalu cek halaman utama balas 200

Kalau sukses, output terakhirnya:

```
==================================================
 KIRI PROJECT - SELESAI
==================================================
commit   : <hash>
runner   : pm2   (atau docker)
folder   : C:\kiri
akses    :
  http://127.0.0.1:4000
  http://<ip-lan>:4000
```

Buka URL itu di browser server — harusnya keluar landing page KIRI.

---

## Langkah 4 — yang dikirim balik ke Ari

```powershell
Invoke-RestMethod http://127.0.0.1:4000/api/health | ConvertTo-Json
```

Harusnya:

```json
{ "ok": true, "db": "up", "service": "kiri-server", "time": "..." }
```

Kirim juga output akhir `deploy.ps1` (bagian "SELESAI") dan, kalau pakai Docker:

```powershell
docker ps --filter name=kiri
```

---

## Akses dari internet (opsional, buat tes cepat)

Cuma kalau Ari minta. Ini bikin URL publik sementara (`https://xxx.trycloudflare.com`), bukan `kiriproject.id`:

```powershell
.\deploy.ps1 -Tunnel -SkipPull
```

Domain `kiriproject.id` dipasang terpisah lewat Cloudflare Tunnel permanen — itu butuh login Cloudflare, jadi dipegang Ari.

---

## Yang JANGAN dilakukan

| Jangan | Kenapa |
|---|---|
| `npm run seed` di server | Bisa menimpa/menghapus data produksi |
| commit atau upload `kiri.env.production` / `server\.env` | Kredensial produksi — repo ini publik |
| `git push` ke repo | Server cuma buat jalanin, bukan buat ngoding |
| hapus `C:\kiri` waktu app jalan | Database aman (di Neon), tapi upload lokal bisa hilang |

---

## Kalau gagal

Script selalu berhenti dengan baris `GAGAL: <alasan>` dan, kalau app-nya sudah nyala, mencetak 40 baris log terakhir.

| Gejala | Penyebab | Solusi |
|---|---|---|
| `git` / `node` tidak ditemukan | belum terpasang | ulangi dengan `-Bootstrap` |
| `Node vX terlalu lama` | Node < 20 | `winget install OpenJS.NodeJS.LTS`, buka PowerShell baru |
| `npm ci (root) gagal` | koneksi / lockfile | ulangi; kalau tetap, kirim output lengkapnya |
| `migrasi gagal` | `DATABASE_URL` salah atau `DATABASE_SSL` bukan `true` | cek `server\.env` |
| `health check tidak pernah db=up` | DB tak terjangkau / port 4000 dipakai app lain | cek log yang dicetak; `netstat -ano \| findstr :4000` |
| `EADDRINUSE :4000` | port dipakai proses lain | `pm2 delete kiri`, ulangi |
| halaman kebuka tapi API 404 | build frontend gagal senyap | pastikan `C:\kiri\dist\index.html` ada |
| `docker build` gagal soal WSL | Docker Desktop belum siap | buka Docker Desktop, tunggu "Engine running", ulangi |

Kalau mentok: kirim ke Ari output `GAGAL:` + 40 baris di atasnya. Jangan kirim isi `kiri.env.production`.

---

## Update kode nanti

```powershell
cd C:\kiri
.\deploy.ps1
```

Migrasi idempoten, jadi aman dijalankan tiap update. Kalau mau skip migrasi: `.\deploy.ps1 -SkipMigrate`.

## Struktur singkat

```
C:\kiri\
  deploy.ps1            <- script deploy
  dist\                 <- hasil build frontend (otomatis)
  server\
    .env                <- kredensial (JANGAN di-commit)
    dist\               <- hasil build backend (otomatis)
    src\db\migrations\  <- SQL migrasi
```

Database **tidak** ada di server ini — pakai Neon Postgres (hosted). Server cuma jalanin app; kalau server mati, data tetap aman.

Untuk detail teknis (arsitektur, variabel env, troubleshooting developer): `docs/DEPLOY_V2.md` dan `docs/SERVER_SETUP.md`.
