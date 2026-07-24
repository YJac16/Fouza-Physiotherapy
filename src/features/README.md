# Feature Modules

Feature-based architecture for Fouza Physiotherapy.

Each feature under `src/features/<name>` owns:

| Folder | Purpose |
|--------|---------|
| `components/` | UI specific to this feature |
| `hooks/` | TanStack Query hooks & feature hooks |
| `actions/` | Next.js Server Actions |
| `api/` | Data-access / repository functions (Supabase) |
| `schemas/` | Zod validation schemas |
| `types/` | Feature-local TypeScript types |
| `lib/` | Feature-local helpers |
| `index.ts` | Public exports only (barrel) |

**Rule:** App Router pages in `src/app` compose features — they do not own business logic.

## Modules

| Feature | Responsibility |
|---------|----------------|
| `marketing` | Public website sections & CTAs |
| `auth` | Sign-in, sign-up, session, roles |
| `booking` | Online appointment booking |
| `patients` | Patient records & CRM |
| `clinical-notes` | SOAP notes & clinical documentation |
| `exercise-programmes` | Home exercise programmes |
| `consent-forms` | Digital consent & signatures |
| `billing` | Invoices, statements, payments |
| `reviews` | Google Reviews sync & display |
| `blog` | Blog CMS & public posts |
| `practice` | Practice settings, services, staff |
