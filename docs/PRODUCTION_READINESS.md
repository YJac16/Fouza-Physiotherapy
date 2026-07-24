# Production readiness checklist (Phase 26)

## Environment

- [ ] Production Supabase project linked and migrations applied (`db push`)
- [ ] Preview/staging uses a separate Supabase project
- [ ] All secrets set in Vercel (no placeholder keys)
- [ ] Resend domain verified; `RESEND_FROM_EMAIL` works
- [ ] `NEXT_PUBLIC_APP_URL` matches custom domain
- [ ] Auth redirect URLs include production `/auth/callback` and `/reset-password`
- [ ] `CRON_SECRET` set for `/api/cron/outbox`

## Security & POPIA

- [ ] Role escalation migration applied
- [ ] Staff invites only (no public staff signup)
- [ ] Clinical notes RLS verified (patients cannot read)
- [ ] Storage buckets private where required
- [ ] Security headers live (CSP, XFO, nosniff)
- [ ] Backup/restore drill documented

## Product cutover

- [ ] Native booking tested for double-book prevention
- [ ] Setmore kept as fallback during first week (optional)
- [ ] Staff trained on AdminShell modules
- [ ] Patient portal empty states reviewed
- [ ] Invoice numbering sequence seeded for current year

## Quality

- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run test:e2e` smoke passes against staging
- [ ] Lighthouse marketing ≥ 90 (target 95)
- [ ] Accessibility smoke on booking + portal + admin

## Go-live

- [ ] Soft launch staff-only booking
- [ ] Public booking enabled via feature flag
- [ ] Monitoring (Sentry) receiving events
- [ ] Rollback plan: previous Vercel deployment + DB forward-fix only
