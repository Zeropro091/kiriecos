# KIRI Agents — Starter Kit (DRAFT)

Perlengkapan tempur untuk AI agent KIRI PROJECT. Belum jalan — ini blueprint yang bisa dieksekusi.

## Struktur
```
kiri-agents/
├── README.md              ← file ini
├── docker-compose.yml     ← n8n + orchestrator (belum di-up)
├── .env.example           ← template kredensial, copy ke .env
├── agents/                ← 1 file = 1 agent (config deklaratif)
│   ├── research.yaml      ← riset UMKM/kreator Bali
│   ├── content.yaml       ← draft copy sesuai brand KIRI
│   ├── matching.yaml      ← rekomendasi match (wajib approve admin)
│   └── ops.yaml           ← notifikasi Telegram + ingest pendaftaran
├── orchestrator/
│   └── graph.py           ← LangGraph skeleton, alur collaboration flow
└── sql/
    └── schema.sql         ← 7 tabel Supabase, jalankan di SQL Editor
```

## Urutan eksekusi (kalau mau nyala)
1. Buat project Supabase → jalankan `sql/schema.sql` di SQL Editor.
2. `cp .env.example .env` → isi kredensial (key per-agent, jangan satu untuk semua).
3. `docker compose up -d n8n` → buka :5678, buat workflow ingest pendaftaran.
4. `pip install langgraph psycopg[binary]` → `python orchestrator/graph.py` untuk test alur.
5. Matching Agent jalan terakhir — setelah directory ada isinya.

## Aturan main (jangan dilanggar)
- Matching Agent hanya **mengusulkan** — connect dua pihak selalu manual oleh admin.
- Hanya Ops Agent yang punya kredensial Telegram.
- Semua output yang berdampak eksternal lewat approval manusia dulu.
- Setiap run dicatat di tabel `agent_runs` — ini audit trail lo.
