# KIRI PROJECT — Agent Infrastructure Blueprint
**Versi:** 1.0 — September 2026
**Status:** Blueprint, belum dieksekusi
**Sumber:** Product Brief + Website Master Flow + UIUX Foundation (Downloads/) + kondisi mesin lokal

---

## 0. Konteks Mesin (terverifikasi via terminal)

| Item | Nilai | Konsekuensi |
|---|---|---|
| CPU | Intel i5-7200U (2 core / 4 thread) | Bukan mesin training. Inference kecil saja. |
| RAM | 8 GB (free ±1 GB saat idle) | Model lokal maks **3–4B Q4**, dan itu pun pelan. |
| GPU | Tidak ada (Intel HD 620) | Lupakan ide model 7B+ lokal yang enak. |
| Docker | v29.2.1 ✓ | Bisa host Postgres + orchestrator container. |
| Ollama | v0.34.1 ✓ | Siap, tapi model besar = swap hell. |
| Disk C: | **98% penuh (sisa 6 GB)** | ⚠️ **Blocker #1. Bersihkan sebelum install apa pun.** |
| Node | v24 ✓ | n8n, MCP, tooling jalan. |

**Kesimpulan mesin:** lokal = *kontrol plane + fallback kecil*. Kekuatan inferensi utama tetap dari API (plan GLM5.3 openagentic.id yang sudah aktif). Jangan paksakan self-host model besar di i5-7200U — boros waktu, bikin mesin hang, dan nol nilai tambah buat KIRI.

---

## 1. Prinsip Desain

1. **Isolasi nyata, bukan dekoratif.** Setiap agent berjalan dalam container sendiri, punya kredensial sendiri (API key terpisah per agent, bukan satu key buat semua), dan hanya bisa akses resource yang dia butuhkan.
2. **Human-in-the-loop di titik yang sama dengan alur bisnis KIRI.** Admin review KIRI (Request Collaboration → Admin Review → Connect) = checkpoint approval. Agent tidak pernah connect-kan dua pihak tanpa approve manual.
3. **Modular, bertahap** — sesuai arahan developer di Master Flow §08–09. Jangan bangun dashboard dulu; bangun jalur terpendek yang langsung menghasilkan nilai.
4. **Satu sumber kebenaran state.** Semua agent baca/tulis ke satu Postgres (Supabase), bukan file JSON terpisah per agent.

---

## 2. Arsitektur

```
                    ┌─────────────────────────────────────────┐
                    │           KIRI PROJECT WEBSITE           │
                    │   (5 kategori ecosystem, directory,      │
                    │    request collaboration, membership)    │
                    └───────────────────┬─────────────────────┘
                                        │ webhook / event
                    ┌───────────────────▼─────────────────────┐
                    │      ORCHESTRATOR (LangGraph)            │
                    │  - state machine per alur bisnis         │
                    │  - checkpointer → state persist & resume │
                    │  - human-in-the-loop interrupt()         │
                    │  - jalan di Docker, bukan bare metal     │
                    └──┬─────────┬─────────┬─────────┬────────┘
                       │         │         │         │
              ┌────────▼──┐ ┌────▼─────┐ ┌─▼──────┐ ┌▼─────────┐
              │ AGENT:    │ │ AGENT:   │ │ AGENT: │ │ AGENT:   │
              │ Research  │ │ Content  │ │ Match- │ │ Ops/CRM  │
              │           │ │          │ │ making │ │          │
              └─────┬─────┘ └────┬─────┘ └───┬────┘ └────┬─────┘
                    │            │           │           │
        ┌───────────▼────────────▼───────────▼───────────▼──────────┐
        │  SHARED SERVICES (semua di-container, terisolasi)          │
        │  • Postgres (Supabase) — state, member, collaboration log  │
        │  • Sandbox exec (E2B free tier) — kode agent, bukan di host│
        │  • MCP servers — playwright, filesystem (scoped), github   │
        │  • Observability (Langfuse CE / AgentOps)                  │
        │  • n8n — glue non-agent: notif, cron, webhook routing      │
        └────────────────────────────────────────────────────────────┘
```

**Kenapa LangGraph, bukan [OI] Agents SDK / CrewAI:**
- Blueprint KIRI butuh alur **stateful + approval**: collaboration request masuk → admin review → connect → status. Itu bukan chat sekali-jalan, itu workflow panjang yang harus bisa pause berhari-hari dan resume. `interrupt()` + checkpointer LangGraph exactly ini.
- CrewAI bagus buat role-play cepat, tapi state/persistence-nya tidak sekuat LangGraph untuk alur approval.
- [OI] SDK lebih cepat untuk prototype, tapi tidak punya checkpointing bawaan — kalau nanti butuh audit trail "siapa approve apa kapan", bakal rewrite.

---

## 3. Agent-per-Agent (Senjata & Perlengkapan)

### Agent 1 — KIRI Research Agent
**Tugas:** Riset pasar UMKM/kreator Bali, kompetitor platform kolaborasi, calon mitra, materi untuk konten edukasi KIRI.
**Perlengkapan:**
- Model: GLM-5.3 via openagentic.id (utama), Llama-3.2-3B via Ollama (fallback, draft kasar)
- Tools: web search MCP, web_extract, filesystem MCP (scope: `~/kiri-agents/research/` SAJA)
- Output ke: Supabase table `research_notes`
**Isolasi:** container sendiri, API key sendiri (key riset, bukan key admin), filesystem read-write hanya di folder riset.

### Agent 2 — KIRI Content Agent
**Tugas:** Draft copy homepage/directory sesuai design system KIRI (dark green/beige/gold, serif heading), caption IG, materi Kelas KIRI.
**Perlengkapan:**
- Model: GLM-5.3 (copy utama)
- Tools: filesystem MCP (scope: folder konten), akses baca ke Brand Identity Guide (sudah ada di Desktop/kiri project website/Master Book/)
- Guardrail: prompt hard-coded "no AI slop phrasing" + review manual sebelum publish (button approve di dashboard, bukan auto-post)
**Isolasi:** read-only ke aset brand; write hanya ke draft folder. Tidak pernah posting langsung ke IG tanpa approve.

### Agent 3 — KIRI Matching Agent (inti nilai bisnis)
**Tugas:** Saat Business/UMKM submit Request Collaboration, agent ini menganalisis profile creator di directory dan merekomendasikan top-5 match ke admin KIRI — **bukan connect otomatis**.
**Perlengkapan:**
- Model: GLM-5.3 (reasoning)
- Tools: query Supabase (read-only ke tabel member/profile), output ke tabel `match_suggestions`
- Human-in-the-loop: admin approve/reject tiap saran → baru KIRI connects. Ini = titik `interrupt()` di LangGraph.
**Isolasi:** read-only ke data member. Tidak bisa kirim pesan/email ke siapa pun.

### Agent 4 — KIRI Ops Agent
**Tugas:** Notifikasi Telegram/email (request masuk, verification pending, approval), ingest pendaftaran dari Google Sheet "KIRI PROJECT Pendaftaran KIRI Creator" ke database, reminder follow-up.
**Perlengkapan:**
- Model: kecil saja (GLM-5.3-flash atau Ollama 3B) — tugasnya routing, bukan reasoning berat
- Tools: n8n (workflow engine), Telegram bot API, Supabase (write ke log)
**Isolasi:** satu-satunya agent yang boleh kirim pesan keluar. Rate limit + whitelist penerima.

### Agent 5 (Phase 2) — Sandbox Developer Agent
**Tugas:** Auto-fix bug kecil website, generate komponen React sesuai design system, migrasi database.
**Perlengkapan:**
- Eksekusi kode via **E2B free tier** (sandbox cloud) — BUKAN di mesin lokal. Ini kunci isolasi yang sering dilewatkan orang: kode yang dihasilkan agent jalan di VM buangan, bukan di laptop lo.
- Alternative self-host: Docker container `--network=none` + `--read-only` sebagai sandbox murah kalau E2B quota habis.
- Git branch terpisah + PR workflow, tidak pernah push langsung ke main.

---

## 4. Infrastruktur Pendukung

### Database — Supabase (free tier)
- Pilih **Supabase**, bukan Neon, untuk KIRI: butuh Auth + Storage + Row Level Security dari hari-1 (member profile, verification status, dashboard). Neon lebih unggul branching, tapi KIRI bukan project yang butuh itu dulu.
- Catatan dari benchmark: Supabase free tier pause setelah 7 hari inactivity — untuk production KIRI nanti, upgrade atau set cron ping. Untuk development, tidak masalah.
- Tables minimal: `members`, `profiles`, `collaboration_requests`, `match_suggestions`, `research_notes`, `content_drafts`, `agent_runs` (audit log tiap eksekusi agent).

### Orkestrasi — LangGraph (self-hosted di Docker)
- `langgraph-cli` / `langgraph dev` untuk development lokal.
- Checkpointer: `PostgresSaver` → connect ke Supabase. State collaboration flow survive restart.
- Deploy: satu `docker-compose.yml` berisi: orchestrator + n8n + (opsional) ollama. Semua di network Docker sendiri, port hanya expose yang perlu.

### MCP Servers (dipasang per-agent, tidak global)
| Server | Dipasang di | Scope |
|---|---|---|
| filesystem | Research, Content | folder masing-masing saja |
| playwright | Research | browsing publik |
| github | Developer (Phase 2) | repo website KIRI saja |
| postgres | Matching | read-only credential |

### Observability — Langfuse (self-host CE) atau AgentOps (free tier)
- Mulai dengan **AgentOps** (lebih cepat setup, dashboard cloud, free tier cukup). Kalau nanti butuh self-host/PII control (member data), migrasi ke Langfuse CE di Docker.
- Track: setiap run agent → cost, latency, output, siapa approve apa.

### Local LLM — hanya fallback
- `ollama run llama3.2:3b` atau `qwen2.5:3b` untuk draft/sanity-check saat offline atau API down.
- **Jangan** install 7B+ di mesin ini — 8GB RAM + no GPU = 30 menit per prompt, tidak usable.

---

## 5. Roadmap Eksekusi (sinkron fase website)

### Phase 0 — Minggu ini (bersih-bersih + pondasi)
1. **Bersihkan disk C (98% penuh)** — ini blocker sesungguhnya. Target minimal 30 GB free.
2. Buat akun Supabase → project `kiri-project` → schema 7 tabel di atas.
3. `docker-compose.yml` minimal: LangGraph orchestrator + n8n + Postgres checkpointer.
4. Set API key terpisah per agent (jangan satu key untuk semua).

### Phase 1 — Sinkron dengan fase website "Foundation" (Homepage, Directory, Join/Register)
- Ops Agent ON: ingest pendaftaran dari Google Sheet → Supabase, notif Telegram.
- Research Agent ON: riset UMKM Bali untuk isi directory seed (30–50 entri awal biar directory tidak kosong).
- Content Agent ON: draft copy homepage & directory.

### Phase 2 — Sinkron fase "Collaboration" (Request Collaboration, Admin Review)
- Matching Agent ON dengan human-in-the-loop: suggestion → admin approve → connect.
- Semua approval tercatat di `agent_runs` (audit trail).

### Phase 3 — Sinkron fase "Dashboard"
- Agent dashboard di admin KIRI: lihat status run, approve/reject, lihat cost per agent.
- Sandbox Developer Agent ON (E2B) untuk maintenance website.

### Phase 4 — Advanced
- Matching Agent upgrade: embedding-based similarity + feedback loop dari riwayat kolaborasi.
- Analytics: conversion per kategori ecosystem.

---

## 6. Checklist Isolasi (jangan skip satupun)

- [ ] Setiap agent = 1 container Docker sendiri, bukan proses bare-metal
- [ ] Setiap agent = 1 API key sendiri (bisa di-revoke satu-satu kalau bocor)
- [ ] Filesystem MCP di-scope ke folder spesifik, bukan `/` atau home
- [ ] Matching Agent = read-only credential ke database member
- [ ] Hanya Ops Agent yang punya kredensial Telegram/email
- [ ] Semua eksekusi kode via sandbox (E2B / Docker locked-down), tidak pernah di host
- [ ] Semua output agent yang berdampak eksternal (kirim pesan, publish, connect member) wajib approve manusia
- [ ] `agent_runs` table mencatat: agent_id, input hash, output, timestamp, approved_by

---

## 7. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Disk penuh bikin Docker gagal | Phase 0 wajib; monitor dengan cron `df -h` |
| Supabase free pause 7 hari | Cron ping mingguan / upgrade saat production |
| E2B free tier habis | Fallback: Docker `--network=none --read-only` |
| Matching Agent salah rekomendasi | Selalu human approval; log feedback untuk perbaikan |
| API key bocor di repo | Key di `.env` (gitignored) + Vercel env, per-agent, rotasi berkala |
| Ollama bikin laptop hang | Default OFF; hanya nyalakan manual saat butuh |

---

*Dokumen ini blueprint hidup — update setiap ada keputusan arsitektur baru.*
