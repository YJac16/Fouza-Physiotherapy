# Deployment Guide

Target stack: **Vercel** (Next.js) + **Supabase** (Postgres / Auth / Storage) + **Resend** (email).

## 1. Prepare Supabase (production)

1. Create a production Supabase project (separate from local/dev).
2. Apply migrations:

   ```bash
   npx supabase link --project-ref <prod-project-ref>
   npx supabase db push
   ```

3. Auth → URL Configuration:
   - Site URL: `https://your-domain.com`
   - Redirect URLs: `https://your-domain.com/auth/callback`
4. (Optional) Enable email confirmations and customize templates.
5. Create Storage buckets when media features are implemented (`avatars`, `blog-media`, etc.).

## 2. Prepare Resend

1. Verify your sending domain in Resend.
2. Create an API key scoped to production.
3. Set `RESEND_FROM_EMAIL` to a verified address, e.g. `Fouza Physiotherapy <noreply@yourdomain.com>`.

## 3. Deploy to Vercel

### Build settings (Import project or Settings → General → Build & Development Settings)

| Field | Value |
|-------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `.` (repository root) |
| **Install Command** | `npm install` |
| **Build Command** | `npm run build` |
| **Output Directory** | **leave blank** (do not set `out` or `.next`) |
| **Node.js Version** | `22.x` (Settings → General → Node.js Version, or `.nvmrc`; required by current `@supabase/*` packages) |

`npm run build` runs `next build`. Vercel’s Next.js runtime manages `.next` internally.

**Supabase URL:** use the project root `https://<ref>.supabase.co` — never append `/rest/v1/`.

### Via Git integration (recommended)

1. Push this repository to GitHub / GitLab / Bitbucket.
2. Import the repo in [Vercel](https://vercel.com).
3. Apply the build settings table above.
4. Add environment variables (Production + Preview as appropriate):

| Variable | Notes |
|----------|-------|
| `NEXT_PUBLIC_APP_URL` | `https://your-deployment.vercel.app` (update after first deploy) |
| `NEXT_PUBLIC_APP_NAME` | Fouza Physiotherapy |
| `NEXT_PUBLIC_PRACTICE_*` | Contact details |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` (no `/rest/v1/`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — mark sensitive; never `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_AUTH_REDIRECT_URL` | `https://your-deployment.vercel.app/auth/callback` |
| `RESEND_API_KEY` | Production key |
| `RESEND_FROM_EMAIL` | Verified sender |
| `RESEND_REPLY_TO` | Practice inbox |
| `GOOGLE_PLACES_API_KEY` | Optional |
| `GOOGLE_PLACE_ID` | Optional |
| `CRON_SECRET` | Outbox cron auth |
| Feature flags | Match `.env.example` |

5. Deploy. After the first `*.vercel.app` URL is assigned, update `NEXT_PUBLIC_APP_URL` / auth redirect and redeploy.

### Via CLI (no Git remote)

```bash
npm i -g vercel
vercel login
vercel link          # create or link project
# Add env vars in dashboard, or: vercel env add NAME preview
vercel               # preview deploy
vercel --prod        # production
```

### After deploy — Supabase Auth URLs

Authentication → URL Configuration (preview project `raxwortsxirulebexxgp`):

- **Site URL:** `https://fouza-physiotherapy-yaseens-projects-1765104f.vercel.app`
- **Redirect URLs:**  
  `https://fouza-physiotherapy-yaseens-projects-1765104f.vercel.app/auth/callback`  
  `https://fouza-physiotherapy-yaseens-projects-1765104f.vercel.app/reset-password`  
  (also keep `http://localhost:3000/auth/callback` and `/reset-password` for local Next.js against this project)

## 4. Custom domain

1. Vercel → Project → Settings → Domains → add `your-domain.com`.
2. Update DNS as instructed.
3. Mirror the same domain in Supabase Auth URL settings and `NEXT_PUBLIC_APP_URL`.

## 5. Post-deploy checklist

- [ ] `GET /api/health` returns `{ status: "ok" }`
- [ ] Marketing home loads over HTTPS
- [ ] Auth callback works (sign-in / register / reset)
- [ ] Booking confirmation emails send via Resend (`booking.confirmed`, `portal.invite` magic link to `/portal/forms`)
- [ ] Supabase Auth redirect URLs include production `/auth/callback`
- [ ] Native `/book` wizard works (the only public booking path)
- [ ] Patient portal + admin shells load for correct roles
- [ ] RLS verified with patient vs staff test users
- [ ] Resend test email delivers
- [ ] Cron: `vercel.json` schedules `GET /api/cron/outbox` every 5 minutes (`CRON_SECRET` required in prod)
- [ ] Preview deployments use a non-production Supabase project when possible

## 6. Environments

| Env | App URL | Supabase | Notes |
|-----|---------|----------|-------|
| Local | localhost:3000 | Local or dev project | `.env.local` |
| Preview | `*.vercel.app` | Dev/staging project | Vercel Preview env vars |
| Production | custom domain | Production project | Strict secrets, confirmations on |

## 7. CI

GitHub Actions workflow `.github/workflows/ci.yml` runs typecheck, lint, Vitest, and Playwright smoke after build.

Never commit `.env.local`. Rotate `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `CRON_SECRET` if exposed.

## 8. Additional production env

| Variable | Notes |
|----------|-------|
| `CRON_SECRET` | Protects outbox drain endpoint |
| `NEXT_PUBLIC_PRACTICE_NUMBER` | HPCSA / practice number when confirmed |
| `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACE_ID` | Reviews sync |

## 9. Rollback

- Vercel → Deployments → Promote a previous production deployment.
- Database rollbacks require careful forward-fix migrations; prefer additive migrations.
- Soft-launch: native `/book` is the only public booking path. Do not send visitors to an external scheduler.

See also: `docs/PRODUCTION_READINESS.md`, `docs/architecture/threat-model.md`.
