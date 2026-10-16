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
| `npm run dev` | API with hot reload (tsx) |
| `npm run build` | Compile TypeScript → `dist/` (+ copy migrations & seed data) |
| `npm run start` | Run the compiled API (`node dist/index.js`) |
| `npm run migrate` | Apply pending SQL migrations |
| `npm run seed` | Reset + reload all seed data |
| `npm run typecheck` | Type-check without emitting |

## Ports

- API: **4000**
- PostgreSQL: **5433** (5432 is often taken by a system Postgres)

## Frontend connection (dev)

The Vite dev server proxies `/api` and `/uploads` to this API, so the frontend
needs no configuration — just run both. To point at a different host, set
`VITE_API_PROXY_TARGET` before `npm run dev` in the frontend.

## Production

The server can serve the built frontend itself, so the whole app runs on one
domain (no CORS, no separate API URL). Build the frontend, then point
`FRONTEND_DIST` at it:

```bash
# from the repo root
npm install && npm run build          # builds the frontend into ./dist
cd server && npm install && npm run build
FRONTEND_DIST=../dist NODE_ENV=production node dist/index.js
```

Or use the root `Dockerfile` / `docker-compose.yml`, which does all of the above.

### Required production env vars

| Var | Notes |
|---|---|
| `DATABASE_URL` | Hosted Postgres connection string |
| `DATABASE_SSL` | `true` for Neon / Render / Supabase |
| `JWT_SECRET` | Server refuses to boot in production with the default value |
| `CORS_ORIGINS` | Only needed if the frontend is on a different origin |
| `FRONTEND_DIST` | Absolute path to the built frontend (e.g. `/app/dist`) |
| `SEED_ADMIN_PASSWORD` | Rotate before going public (currently a known default) |

Migrations run automatically on boot.
