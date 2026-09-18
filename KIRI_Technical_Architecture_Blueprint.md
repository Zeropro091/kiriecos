# KIRI PROJECT - TECHNICAL ARCHITECTURE & DATA PIPELINE BLUEPRINT
*Target Scale: 1,000 - 5,000+ Active Members (Bali UMKM, Creators, Communities, Media & Strategic Partners)*
*Author: OpenAgentic Engineering Orchestrator*
*Date: September 2026*

---

## 1. Executive Summary & Core Logic Flow

KIRI Project adalah platform direktori & kolaborasi terintegrasi untuk ekosistem Bali. Platform ini menggunakan arsitektur **Hybrid Client-Side Routing with Supabase BaaS (Backend-as-a-Service)** & **Fallback Local Mock Store**.

### Core Lifecycle Logic:
1. **User Registration & Entity Creation (Page 08 -> Page 09-13):**
   - User memilih tipe entitas (`creator`, `community`, `business`, `media`, `strategic`).
   - User mengisi profil awal, portofolio, & meng-upload dokumen verifikasi (KTP / NIB / Surat Komunitas).
   - Status entitas awal: `pending_review`.
2. **Admin Review & Verification (Page 24 -> Page 25 -> Page 26):**
   - Admin melihat antrean pendaftaran di **Admin Reviews (Page 26)**.
   - Admin mengecek dokumen & kelayakan profil.
   - Action: **Approve** (status -> `approved`, terbit di Directory) ATAU **Reject** (status -> `rejected` + alasan).
3. **Public Directory & Search (Page 01 -> Page 02):**
   - Hanya entitas berstatus `approved` yang tampil di **Public Directory (Page 02)**.
   - Filter & Search di-optimize menggunakan Postgres B-Tree & GIN indexing.
4. **Collaboration Request & Brief Engine (Page 20 -> Page 21 -> Page 22 -> Page 23):**
   - User berstatus `approved` dapat mengirim **Collaboration Brief** ke entitas lain.
   - Status kolaborasi: `draft` -> `pending_approval` -> `accepted` / `declined` -> `in_progress` -> `completed`.
5. **Membership Tier & Manual Payment Pipeline (Page 14 -> Admin Verification):**
   - Tier: `Free` (Max 3 request kolaborasi/bulan) vs `Pro / Verified` (Unlimited + Priority Matching + Verified Badge).
   - User meng-upload bukti transfer manual di Page 14.
   - Admin memverifikasi transaksi di Dashboard Admin -> Status membership di-upgrade ke `pro`.

---

## 2. Database Entity Relationship & Schema Design (PostgreSQL / Supabase)

### Entities & Enums Summary:
* `user_role`: `['creator', 'community_lead', 'umkm_owner', 'media_partner', 'strategic_partner', 'admin']`
* `entity_type`: `['creator', 'community', 'business', 'media', 'strategic']`
* `verification_status`: `['pending_review', 'approved', 'rejected', 'suspended']`
* `membership_tier`: `['free', 'pro', 'enterprise']`
* `collaboration_status`: `['pending', 'accepted', 'declined', 'completed', 'cancelled']`

### Table Schemas:
1. **`profiles`**: Menampung user auth, email, role, & status membership.
2. **`entities`**: Data utama kreator, komunitas, UMKM, media, & partner (Nama, Bio, Category, Location, Socials, Status Approval).
3. **`portfolios`**: Item portofolio (Foto, Video, Campaign, Artikel) relasi ke `entities`.
4. **`services`**: Penawaran layanan & rate card (relasi 1-to-N dengan `entities`).
5. **`community_members`**: Daftar anggota dalam komunitas (relasi ke `entities`).
6. **`collaboration_requests`**: Brief & permohonan kerja sama antar-entitas.
7. **`payment_receipts`**: Bukti transfer manual membership untuk verifikasi admin.

---

## 3. Security & Row Level Security (RLS) Matrix

| Table | Read Public | Read Auth User | Write / Insert | Update / Delete |
|---|---|---|---|---|
| `entities` | Status `approved` saja | Profile milik sendiri + Status `approved` | Authenticated User (Pendaftaran Baru) | Pemilik profil / Admin |
| `portfolios` | Jika Entity `approved` | Pemilik / Admin | Pemilik Profil | Pemilik Profil / Admin |
| `collaboration_requests` | ❌ Tidak | Sender & Receiver saja | Authenticated User | Sender & Receiver saja |
| `payment_receipts` | ❌ Tidak | Uploaded User & Admin | Authenticated User | Admin Only |
| `admin_audits` | ❌ Tidak | Admin Only | System / Admin | Admin Only |

---

## 4. Performance & Scalability Strategy (For 2,000 - 5,000 Members)

1. **Indexing Strategy:**
   - Multi-column index pada `entities(status, type, category)` untuk pencarian instan di Directory.
   - GIN index pada `entities.tags` (Array text search).
2. **React Code Splitting & Component Lazy Loading:**
   - 27 Halaman di-import menggunakan `React.lazy()` & `Suspense` untuk memangkas initial bundle size dari >2MB menjadi <150KB.
3. **Mock Data Fallback Architecture:**
   - Jika `VITE_SUPABASE_URL` terisi -> Memanggil Supabase REST API.
   - Jika `VITE_SUPABASE_URL` kosong -> Menggunakan `LocalMockDataStore` di memory/localStorage tanpa ada error network.

---

## 5. Directory Structure & Implementation Roadmap

```
C:\Users\Putu Ari\Desktop\kiri project ecos\
├── supabase/
│   └── migrations/
│       └── 20260918_init_kiri_schema.sql  <-- Full Production Database Migration
├── src/
│   ├── lib/
│   │   └── supabase.ts                    <-- Supabase Client + Fallback Detector
│   ├── types/
│   │   └── index.ts                       <-- Extended Strong TypeScript Interfaces
│   ├── services/
│   │   ├── dataService.ts                 <-- Unified Repository Service Layer
│   │   └── mockDataStore.ts               <-- Production-grade Mock Store for Offline/Dev
│   └── App.tsx                            <-- Lazy-loaded Routes & Router Performance
└── KIRI_Technical_Architecture_Blueprint.md
```
