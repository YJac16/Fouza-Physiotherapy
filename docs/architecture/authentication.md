# Authentication Architecture

## Overview

Authentication is powered by **Supabase Auth** with cookie-based sessions via `@supabase/ssr`.

```
Browser ──► Next.js Middleware (refresh session + role gate)
                │
                ├── createBrowserClient  (Client Components)
                ├── createServerClient   (RSC / Server Actions / Route Handlers)
                └── createServiceClient  (admin / webhooks — bypasses RLS)
```

## Roles

| Role | Access |
|------|--------|
| `admin` | Full admin dashboard + practice settings |
| `practitioner` | Clinical notes, programmes, appointments, patients |
| `receptionist` | Booking, patients, billing |
| `patient` | Patient portal only |

Roles live on `public.profiles.role` (`app_role` enum). Signup always creates `patient` (Phase 3.5 hardening). Staff are invite-only via `staff_invites`.

## Implemented flows

- Login / register / forgot / reset password UI + Server Actions (`features/auth`)
- Auth callback `/auth/callback`
- Guards: `requireUser`, `requireStaff`, `requireRole`, `requireAdmin` (`src/lib/auth/guards.ts`)
- Middleware role-aware redirects to `/admin` or `/portal`

## Route protection

| Path | Requirement |
|------|-------------|
| `/admin/*` | Authenticated + staff role |
| `/portal/*` | Authenticated (patients; staff may also access) |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Redirect to role home if signed in |

## Security

- Users cannot escalate their own `role` (trigger + RLS with check)
- Service role only on server
- Never expose `SUPABASE_SERVICE_ROLE_KEY`
