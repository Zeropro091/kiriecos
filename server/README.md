# KIRI PROJECT — Backend API

Express + PostgreSQL REST API. This is the server the frontend talks to; it owns
persistence and enforces authorization (the browser is no longer the trust boundary).

## Requirements

- Node.js 20+
- Docker (for the local PostgreSQL container)

## First-time setup

```bash
cd server
npm install
cp .env.example .env          # then edit JWT_SECRET if you like
docker compose up -d          # starts PostgreSQL on port 5433
npm run migrate               # creates all tables
npm run seed                  # loads the directory data + admin account
npm run start                 # API on http://localhost:4000
```

The seed prints `admin ready: admin@kiriproject.id`. The seeded password comes
from `SEED_ADMIN_PASSWORD` in `.env` (default `kiri-admin` — a known DEBT, rotate it).

## Daily workflow

```bash
docker compose up -d          # ensure the database is running
npm run dev                   # API with watch-reload on :4000
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | API with hot reload |
| `npm run start` | API without watch |
| `npm run migrate` | Apply pending SQL migrations |
| `npm run seed` | Reset + reload all seed data |
| `npm run typecheck` | Type-check without emitting |

## Ports

- API: **4000**
- PostgreSQL: **5433** (5432 is often taken by a system Postgres)

## Frontend connection

The Vite dev server proxies `/api` and `/uploads` to this API, so the frontend
needs no configuration — just run both. To point at a different host, set
`VITE_API_PROXY_TARGET` before `npm run dev` in the frontend.
