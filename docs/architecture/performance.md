# Performance notes (Phase 23)

## Targets

- Marketing Lighthouse Performance ≥ 90 (stretch 95)
- Admin usable TTI on mid-range laptop

## Practices in codebase

- Next.js App Router RSC for marketing and admin lists
- Security headers without blocking first-party assets
- Image remotePatterns limited to Supabase storage
- Client components isolated to wizards/forms/shells
- Dynamic import candidates: analytics charts, heavy PDF viewers (when added)

## Follow-ups before go-live

- Audit `public/` photo sizes; serve WebP/AVIF via `next/image`
- Confirm Framer Motion only on marketing motion paths
- Avoid waterfalls: parallel `Promise.all` already used on dashboards
- Monitor Web Vitals in Vercel Analytics after domain attach
