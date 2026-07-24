# Installation Guide

## Prerequisites

- **Node.js** 20+
- **npm** 10+ (or pnpm / yarn)
- **Git**
- **Supabase CLI** (optional for local DB): `npm i -g supabase` or use the project `supabase` package
- **Docker** (required only if running Supabase locally)

## 1. Clone and install

```bash
cd "Fouza Physiotherapy"
npm install
```

## 2. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with values from your Supabase project (**Settings → API**) and Resend (**API Keys**).

Minimum for local UI boot:

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server only) |
| `RESEND_API_KEY` | Resend dashboard |
| `RESEND_FROM_EMAIL` | Verified sender in Resend |

Also set practice contact fields (`NEXT_PUBLIC_PRACTICE_*`) and `NEXT_PUBLIC_AUTH_REDIRECT_URL`.

## 3. Supabase project

### Option A — Hosted (recommended to start)

1. Create a project at [supabase.com](https://supabase.com).
2. Link CLI (optional):

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

3. Copy API URL and keys into `.env.local`.

### Option B — Local Supabase

```bash
npx supabase start
npx supabase db reset
```

Copy the local URL/anon/service keys printed by `supabase start` into `.env.local`.

## 4. Auth redirect URLs

In Supabase Dashboard → **Authentication → URL Configuration**:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

## 5. Run the app

```bash
npm run dev
```

- App: http://localhost:3000  
- Health: http://localhost:3000/api/health  

## 6. shadcn/ui components

Base config is in `components.json`. Add components as needed:

```bash
npx shadcn@latest add button input label card form dialog
```

## 7. Type generation (after schema changes)

```bash
npm run db:types
```

## Verify

```bash
npm run typecheck
npm run lint
npm run build
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Env validation errors | Ensure `.env.local` matches `.env.example` (no empty required keys) |
| Middleware auth errors | Confirm Supabase URL/anon key; check redirect URLs |
| RLS denials | Confirm user has a `profiles` row with the correct `role` |
| Docker errors on `supabase start` | Start Docker Desktop, then retry |

Next: implement features module-by-module starting with `auth` and `practice`.
