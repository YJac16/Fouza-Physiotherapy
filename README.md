# Fouza Physiotherapy

Production physiotherapy practice platform — marketing site, patient portal, admin dashboard, native online booking (`/book`), clinical notes, exercise programmes, consent forms, billing, Google Reviews, and blog.

**Live:** [fouzaphysiotherapy.co.za](https://fouzaphysiotherapy.co.za)

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS, shadcn/ui, Framer Motion |
| Forms | React Hook Form + Zod |
| Data | TanStack Query, Supabase, PostgreSQL |
| Email | Resend (`fouzaphysiotherapy.co.za`) |
| Hosting | Vercel |

## Architecture

Feature-based modules under `src/features/*`, composed by App Router route groups:

- `(marketing)` — public website & `/book`
- `(auth)` — login, register, password reset
- `(portal)` — patient portal
- `(admin)` — practice management dashboard

Deep dives: [docs/architecture/](docs/architecture/)

## Quick start

See **[INSTALLATION.md](INSTALLATION.md)**.

```bash
npm ci
cp .env.example .env.local   # fill Supabase + Resend keys
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build (fails on lint errors) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright smoke tests |
| `npm run db:types` | Generate Supabase types |
| `npm run db:reset` | Reset local DB + migrations |

## Production readiness

See **[docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md)** and **[DEPLOYMENT.md](DEPLOYMENT.md)**.

## License

Private — all rights reserved.
