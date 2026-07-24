# Fouza Physiotherapy

Production-ready **physiotherapy practice management platform** — marketing site, patient portal, admin dashboard, online booking, clinical notes, exercise programmes, consent forms, billing, Google Reviews, and blog CMS.

> **Status:** Foundation only. Feature modules are scaffolded; product features are not implemented yet.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS, shadcn/ui, Framer Motion |
| Forms | React Hook Form + Zod |
| Data | TanStack Query, Supabase, PostgreSQL |
| Email | Resend |
| Hosting | Vercel |

## Architecture

Feature-based modules under `src/features/*`, composed by App Router route groups:

- `(marketing)` — public website & booking
- `(auth)` — authentication pages
- `(portal)` — patient portal
- `(admin)` — practice management dashboard

Deep dives:

- [System architecture](docs/architecture/system.md)
- [Folder structure](docs/architecture/folder-structure.md)
- [Authentication](docs/architecture/authentication.md)
- [Database](docs/architecture/database.md)

## Quick start

See the full **[Installation guide](INSTALLATION.md)**.

```bash
npm install
cp .env.example .env.local   # then fill in Supabase + Resend keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:types` | Generate Supabase types |
| `npm run db:reset` | Reset local DB + migrations |

## Environment

Copy `.env.example` → `.env.local`. Required keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## Deployment

See **[Deployment guide](DEPLOYMENT.md)** (Vercel + Supabase).

## License

Private — all rights reserved.
