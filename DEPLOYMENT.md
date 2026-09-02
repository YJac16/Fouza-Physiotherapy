# Deployment Guide

Target stack: **Vercel** (Next.js) + **Supabase** (Postgres / Auth / Storage) + **Resend** (email).

**Production domain:** `https://fouzaphysiotherapy.co.za`

## 1. Prepare Supabase (production)

1. Create a production Supabase project (separate from local/dev).
2. Apply migrations:

   ```bash
   npx supabase link --project-ref <prod-project-ref>
   npx supabase db push
   ```

3. **Authentication → URL Configuration:**
   - **Site URL:** `https://fouzaphysiotherapy.co.za`
   - **Redirect URLs:**
     - `https://fouzaphysiotherapy.co.za/auth/callback`
     - `https://fouzaphysiotherapy.co.za/reset-password`
     - `http://localhost:3000/auth/callback` (local dev only)
     - `http://localhost:3000/reset-password` (local dev only)
4. Enable email confirmations if required for your launch policy.
5. Storage buckets: `avatars`, `blog-media`, `patient-documents`, `exercise-media` (see migrations).

## 2. Prepare Resend

1. Verify sending domain **`fouzaphysiotherapy.co.za`** in Resend.
2. Create a production API key.
3. Set:
   - `RESEND_FROM_EMAIL` = `Fouza Physiotherapy <noreply@fouzaphysiotherapy.co.za>`
   - `RESEND_REPLY_TO` = practice inbox (e.g. `fouza.physiotherapy@gmail.com`)

## 3. Deploy to Vercel

### Build settings

| Field | Value |
|-------|-------|
| Framework Preset | Next.js |
| Root Directory | `.` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | *(leave blank)* |
| Node.js Version | `22.x` (`.nvmrc`) |

### Environment variables

Set in Vercel **Production** (and a separate **Preview** project where noted).

| Variable | Client/Server | Production value source | Secret? |
|----------|---------------|-------------------------|---------|
| `NEXT_PUBLIC_APP_URL` | Client | `https://fouzaphysiotherapy.co.za` | No |
| `NEXT_PUBLIC_APP_NAME` | Client | `Fouza Physiotherapy` | No |
| `NEXT_PUBLIC_PRACTICE_NAME` | Client | `Fouza Physiotherapy` | No |
| `NEXT_PUBLIC_PRACTICE_EMAIL` | Client | Practice inbox | No |
| `NEXT_PUBLIC_PRACTICE_PHONE` | Client | `+27645136210` | No |
| `NEXT_PUBLIC_PRACTICE_ADDRESS` | Client | 47 Upper Duke Street… | No |
| `NEXT_PUBLIC_PRACTICE_NUMBER` | Client | HPCSA number when confirmed | No |
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Supabase → API → Project URL | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Supabase → API → anon key | No |
| `NEXT_PUBLIC_AUTH_REDIRECT_URL` | Client | `https://fouzaphysiotherapy.co.za/auth/callback` | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase → API → service_role | **Yes** |
| `RESEND_API_KEY` | Server | Resend dashboard | **Yes** |
| `RESEND_FROM_EMAIL` | Server | Verified fouzaphysiotherapy.co.za sender | No |
| `RESEND_REPLY_TO` | Server | Practice inbox | No |
| `CRON_SECRET` | Server | Generate random string (32+ chars) | **Yes** |
| `GOOGLE_PLACE_ID` | Server | Google Business Profile | No |
| `GOOGLE_PLACES_API_KEY` | Server | Google Cloud Console | **Yes** |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Client | GA4 (optional) | No |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Client | Search Console (optional) | No |
| `NEXT_PUBLIC_ENABLE_ONLINE_BOOKING` | Client | `true` | No |
| `NEXT_PUBLIC_ENABLE_PATIENT_PORTAL` | Client | `true` | No |
| `NEXT_PUBLIC_ENABLE_BLOG` | Client | `true` | No |
| `NEXT_PUBLIC_ENABLE_GOOGLE_REVIEWS` | Client | `true` | No |

**Preview deployments:** use a **staging Supabase project** and staging Resend key where possible. Never point Preview at production Supabase.

### Cron jobs (`vercel.json`)

| Path | Schedule | Notes |
|------|----------|-------|
| `GET /api/cron/outbox` | Every 5 min (`*/5 * * * *`) | Drains email outbox, purges expired booking holds |
| `GET /api/cron/reminders` | Daily 06:00 UTC (`0 6 * * *`) | Enqueues appointment reminders |

Vercel Cron automatically sends `Authorization: Bearer <CRON_SECRET>`. Set `CRON_SECRET` in Production and Preview.

## 4. Custom domain (DNS)

1. Vercel → Project → Settings → Domains → add `fouzaphysiotherapy.co.za` (and `www` if used).
2. Add DNS records at your registrar as shown by Vercel.
3. Mirror the production domain in Supabase Auth URL settings and `NEXT_PUBLIC_APP_URL`.

## 5. Post-deploy checklist

- [ ] `GET https://fouzaphysiotherapy.co.za/api/health` → `{ "status": "ok" }`
- [ ] Marketing home loads over HTTPS
- [ ] Auth: sign-in, register, password reset (`/reset-password`)
- [ ] Native `/book` wizard works end-to-end
- [ ] Booking confirmation email delivers via Resend
- [ ] Patient portal + admin load for correct roles
- [ ] RLS verified with patient vs staff test users
- [ ] Cron jobs show successful runs in Vercel dashboard

## 6. Environments

| Env | App URL | Supabase | Notes |
|-----|---------|----------|-------|
| Local | `http://localhost:3000` | Local or dev project | `.env.local` |
| Preview | `*.vercel.app` | Staging project | Vercel Preview env vars |
| Production | `https://fouzaphysiotherapy.co.za` | Production project | Strict secrets |

## 7. CI

GitHub Actions (`.github/workflows/ci.yml`): `typecheck`, `lint`, Vitest, Playwright smoke after build.

Never commit `.env.local`. Rotate `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, and `CRON_SECRET` if exposed.

See also: [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md).
