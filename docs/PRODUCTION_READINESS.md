# Production readiness — Fouza Physiotherapy

Live target: **https://fouzaphysiotherapy.co.za**

This checklist tracks what must be true before public launch. Automated checks run in CI (`typecheck`, `lint`, Vitest, Playwright smoke, `next build`). Dashboard configuration is manual — see [DEPLOYMENT.md](../DEPLOYMENT.md).

## Environment

| Item | Status |
|------|--------|
| Production Supabase project linked; migrations applied (`supabase db push`) | Manual |
| Preview uses a **separate** Supabase project (not production data) | Manual |
| All Vercel secrets set (no placeholder keys) | Manual |
| `NEXT_PUBLIC_APP_URL` = `https://fouzaphysiotherapy.co.za` (Production) | Manual |
| `RESEND_FROM_EMAIL` uses verified `fouzaphysiotherapy.co.za` sender | Manual |
| `CRON_SECRET` set in Vercel Production + Preview | Manual |
| Supabase Auth Site URL + redirect URLs include production domain | Manual |

## Security & POPIA

| Item | Status |
|------|--------|
| RLS enabled on all patient/clinical tables | Code + manual verify |
| Patients cannot read other patients or staff clinical notes | Manual role test |
| Staff invite-only (no public role escalation) | Code |
| Storage buckets private where required | Manual |
| Security headers (CSP, XFO, nosniff, Referrer-Policy) | Code (`next.config.ts`) |
| Cron endpoints reject unauthenticated calls in production | Code |
| Auth callback blocks open redirects | Code |
| No patient data in URLs, logs, or client error surfaces | Code review |

## Booking (`/book`)

| Item | Status |
|------|--------|
| Native `/book` only — no external scheduler | Code + E2E |
| Double-book prevention (exclusion constraints + hold overlap) | DB migration + unit tests |
| Hold expiry + purge via cron | Code |
| Past-date / timezone validation | Unit tests + server guards (`isPastBookingDateKey`, hold `startsAt` check) |
| Live concurrent double-book race test | **Not run** — no Supabase credentials in agent VM |
| Confirmation emails enqueued to outbox | Code |
| Staff + patient notification on confirm | Code |

## Email (Resend)

| Item | Status |
|------|--------|
| Booking confirm, portal invite, password reset | Code |
| Outbox drain cron every 5 minutes | `vercel.json` |
| Reminder cron daily 06:00 UTC | `vercel.json` |
| Reply-to = practice inbox; sender = `fouzaphysiotherapy.co.za` | Env |
| Live send test in staging before go-live | Manual |

## Cron schedule (`vercel.json`)

| Path | Schedule | Purpose |
|------|----------|---------|
| `/api/cron/outbox` | `*/5 * * * *` | Drain email outbox + purge expired holds |
| `/api/cron/reminders` | `0 6 * * *` | Enqueue appointment reminders (daily) |

Vercel sends `Authorization: Bearer $CRON_SECRET` on cron invocations. `CRON_SECRET` is **required** when `VERCEL_ENV` is `production` or `preview`.

## Quality gates (automated)

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
CI=true npm run test:e2e   # production server + axe a11y scans
```

`@axe-core/playwright` runs WCAG 2.x AA scans on critical public pages. Booking conflict smoke requires live Supabase credentials (`scripts/smoke-booking-conflicts.ts`).

Production builds **fail on ESLint errors** (`ignoreDuringBuilds` removed).

### Lighthouse (local production build, homepage)

| Category | Score |
|----------|-------|
| Performance | 67 (large `/public` JPEGs — see [PERF_PUBLIC_ASSETS.md](PERF_PUBLIC_ASSETS.md)) |
| Accessibility | 98 |
| Best practices | 100 |
| SEO | 100 |

Re-run against `https://fouzaphysiotherapy.co.za` after deploy and image optimization.

## SEO

| Item | Status |
|------|--------|
| Canonical origin from `NEXT_PUBLIC_APP_URL` | Code |
| `sitemap.xml`, `robots.txt` | Code |
| OG + Twitter metadata on marketing pages | Code |
| `noIndex` on portal, admin, auth | Code |
| Local business JSON-LD | Code |

## Go-live sequence

1. Apply Supabase migrations to production.
2. Set Vercel Production env vars (see DEPLOYMENT.md env table).
3. Configure Supabase Auth URLs for `https://fouzaphysiotherapy.co.za`.
4. Verify Resend domain + send test email.
5. Deploy; confirm `GET /api/health` → `{ "status": "ok" }`.
6. Smoke-test `/book`, login, password reset, portal (patient), admin (staff).
7. Confirm cron runs (Vercel → Cron Jobs → logs).
8. Soft-launch staff booking; then enable public booking flag if needed.

## Rollback

- Vercel → Deployments → promote previous production deployment.
- Database: forward-fix migrations only; do not roll back applied migrations without a plan.

See also: [DEPLOYMENT.md](../DEPLOYMENT.md), [architecture/threat-model.md](architecture/threat-model.md).
