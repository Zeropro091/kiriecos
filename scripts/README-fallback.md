# KIRI — sistem fallback (restore point)

Kalau ada yang rusak setelah perubahan (update kode, migrasi DB, ganti konfigurasi),
pakai ini untuk kembali ke kondisi terakhir yang sehat.

## Cara cepat

```
node C:\kiri\scripts\kiri-fallback.mjs backup          # bikin restore point
node C:\kiri\scripts\kiri-fallback.mjs list            # lihat daftar
node C:\kiri\scripts\kiri-fallback.mjs restore <ID>    # kembali ke titik itu
```

Atau klik dua kali `scripts\kiri-fallback.cmd` — dia menampilkan daftar lalu
minta ID.

## Apa yang disimpan

Satu restore point = folder `backups/<ID>/` berisi:

- `db.json.gz` — dump **semua tabel** DB (logis, bukan pg_dump), ±0.2 MB
- `manifest.json` — commit git, config container (env, port, restart policy), hash dump
- `restore.cmd` — perintah siap-jalan untuk titik itu

Plus satu image Docker `kiri-rollback:<ID>` hasil `docker commit` container `kiri`.
Karena container itu **tidak punya volume**, image tersebut memuat kode app *dan*
file uploads — jadi rollback mengembalikan keduanya.

## Kenapa aman

`restore` selalu mengambil snapshot **kondisi sekarang** dulu (label `pre-restore`).
Kalau container hasil restore tidak lulus `/api/health`, atau jumlah baris DB tidak
cocok, container lama dihidupkan lagi dan DB dipulihkan dari snapshot itu. Restore
yang gagal tidak boleh membuat situs ikut mati.

Semua penulisan DB terjadi dalam **satu transaksi** — kalau gagal di tengah,
Postgres rollback sendiri dan data lama utuh.

## Yang perlu diketahui

- Restore menyentuh situs **live**. Container lama di-rename dan dihapus setelah
  restore sukses, jadi downtime-nya beberapa detik.
- `KEEP = 6` di `kiri-fallback.mjs`: titik terlama otomatis dihapus (folder + image).
- Dump memakai JSON, bukan `pg_dump` (image app tidak punya client Postgres).
  Restore = `TRUNCATE` semua tabel dalam satu statement, lalu `INSERT` mengikuti
  urutan FK (induk dulu). `session_replication_role` **tidak bisa** dipakai —
  Neon menolak untuk role `neondb_owner`.
- Repo git adalah fallback terpisah untuk **kode**: `main` di `Zeropro091/kiriecos`
  sudah sinkron. Push butuh `git -c credential.helper=manager`.
