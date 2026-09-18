# KIRI PROJECT — Drafting AI & Perlengkapan Tempur
**Fase:** Persiapan (belum eksekusi)
**Keputusan:** TANPA in-app agent. Semua fitur cerdas = fitur aplikasi biasa, dibangun sekali di fase build.
**Yang aktif:** 1 Human Orchestrator (Ari) + 2 AI Agent Development.
**Disk ready:** 14 GB free — cukup, senjata utamanya cloud/API.

---

## 1. Human Orchestrator (lo) — command center
| Senjata | Fungsi | Status |
|---|---|---|
| **Hermes (ini)** | Orchestrator harian: delegasi, cron research, memory, Telegram check-in | ✅ Aktif |
| **Claude Code** | Lead coder: PR review, refactor, arsitektur Next.js | cek terpasang |
| **Gemini CLI** | Coder kedua + konteks besar (baca 27 master page sekaligus) | cek terpasang |
| **Codex CLI** | Coder ketiga / second opinion + auto-fix | cek terpasang |
| **gh CLI + git** | PR workflow: semua agent kerja di branch, lo yang merge | ✅ Ada |

**Aturan main:** lo = prompt engineer + lead architect. Agent tidak pernah push ke main. Lo validasi skema relasi, alur payment (membership fee ≠ campaign fee, dipisah), dan merge PR.

---

## 2. Agent Dev #1 — UI & Design System Agent
| Item | Keputusan |
|---|---|
| Otak | GLM-5.3 (openagentic.id) via coding CLI |
| Input | 27 master page order + wireframe (UIUX Foundation docx) + design tokens |
| Perlengkapan | Tailwind config token `dark-green / beige / gold` + serif heading; skill antislop-ui saat review visual |
| Output | Komponen React/Next.js modular + form wizard multi-step pendaftaran |
| Checkpoint | Visual QA via browser (observed-only) sebelum PR di-merge |

## 3. Agent Dev #2 — Data Schema & RBAC Agent
| Item | Keputusan |
|---|---|
| Otak | GLM-5.3 via coding CLI |
| Perlengkapan | **Supabase MCP** (migrasi schema, RLS policy) + SQL migration files di repo |
| Tugas | 5 entitas (Creator, Komunitas, UMKM, Media Partner, Strategic Partner), RLS per role, parser CSV/Excel unggah massal, webhook payment gateway |
| Checkpoint | Lo validasi skema + test webhook payment di sandbox (Midtrans/Xendit sandbox, BUKAN live key) |

**Database: Supabase** — Auth + Storage (KTP/NIB) + RLS + pgvector satu free tier.

---

## 4. Mantan "In-App Agent" → Sekarang Fitur Aplikasi Biasa
Dibangun oleh 2 Agent Dev di atas sebagai kode biasa. Tanpa agent runtime, tanpa orchestration tambahan.

| Fitur | Implementasi (polos & murah) |
|---|---|
| **Verifikasi profile** | Upload dokumen + admin review di dashboard. Helper otomatis ringan: cek format link sosmed + kompres gambar. Metrik pengikut diisi manual saat onboarding. |
| **Collaboration matching** | Query filter (kategori, anggaran, lokasi, timeline) + skor kecocokan sederhana (SQL). Pgvector/LLM assist baru kalau filter terbukti kurang. |
| **Outreach & pengingat** | Template pesan siap-copy di dashboard + link wa.me/mailto otomatis. Pengingat membership = cron job Supabase (pg_cron) → email Resend. |

**Keuntungan:** Rp0 biaya runtime, gak ada key API messaging tersimpan di server, semua keputusan connect tetap di tangan admin.

---

## 5. Tabel Perlengkapan
| Perlengkapan | Untuk | Biaya |
|---|---|---|
| Supabase free tier | DB + Auth + Storage + RLS + pg_cron | Rp0 |
| openagentic.id GLM-5.3 | Otak 2 agent dev | ✅ Plan aktif |
| Supabase MCP | Agent Dev #2 | Rp0 |
| Resend | Email pengingat membership | 3k email/mo gratis |
| Midtrans/Xendit sandbox | test payment webhook | Rp0 |
| Vercel | hosting Next.js | free tier |

*(n8n, WA Cloud API, Playwright, vision API — dicoret. Baru dipertimbangkan kalau fiturnya udah jalan dan terbukti butuh.)*

## 6. Urutan Kerja
1. **Setup repo & Supabase** → Agent Dev #2 bangun schema 5 entitas + RLS.
2. **Design tokens** → Agent Dev #1 bangun komponen + 27 master page, PR per halaman.
3. **Form wizard + auth** → dipasang di atas schema & komponen.
4. **Dashboard admin** → review verification + matching list + template outreach.
5. **Payment webhook** (sandbox dulu) → membership & campaign fee terpisah.
6. **pg_cron + Resend** → pengingat membership otomatis.
7. Checkpoint lo di tiap langkah: review PR, validasi skema, test payment.

*Draft hidup — tiap keputusan final di-update di sini, bukan di kepala.*
