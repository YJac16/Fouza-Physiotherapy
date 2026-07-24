# Database Architecture

## Stack

- **PostgreSQL** hosted on Supabase
- Schema managed via `supabase/migrations/*.sql`
- Typed clients via `src/types/database.ts` (regenerate with `npm run db:types`)

## Entity relationship (core)

```
auth.users 1──1 profiles
profiles   1──0..1 patients
profiles   1──0..1 practitioners

patients 1──* appointments *──1 practitioners
patients 1──* clinical_notes
patients 1──* exercise_programmes 1──* programme_exercises
patients 1──* consent_signatures *──1 consent_forms
patients 1──* invoices 1──* invoice_line_items

services 1──* appointments
profiles 1──* blog_posts
google_reviews (synced cache)
practice_settings (key/value jsonb)
```

## Domains

| Domain | Tables | Feature module |
|--------|--------|----------------|
| Identity | `profiles` | `auth` |
| CRM | `patients`, `practitioners` | `patients`, `practice` |
| Scheduling | `services`, `appointments` | `booking`, `practice` |
| Clinical | `clinical_notes` | `clinical-notes` |
| Programmes | `exercise_programmes`, `programme_exercises` | `exercise-programmes` |
| Consent | `consent_forms`, `consent_signatures` | `consent-forms` |
| Billing | `invoices`, `invoice_line_items` | `billing` |
| Content | `blog_posts` | `blog` |
| Reputation | `google_reviews` | `reviews` |
| Config | `practice_settings` | `practice` |

## Money & time conventions

- Monetary values stored as **integer cents** (`price_cents`, `total_cents`).
- Default currency: `ZAR`.
- Timestamps: `timestamptz` in UTC.
- App display timezone: `Africa/Johannesburg` (`src/lib/constants`).

## Migrations

```bash
# Local
npx supabase start
npx supabase db reset          # apply all migrations + seed

# Remote (linked project)
npx supabase db push
npx supabase gen types typescript --local > src/types/database.ts
```

## RLS summary

- **Staff** (`admin` | `practitioner` | `receptionist`): manage operational data.
- **Patients**: read own appointments, programmes, invoices, consent signatures; sign forms.
- **Public**: active services/practitioners, published blog posts, visible reviews.
- **Clinical notes**: staff only.
- **Practice settings**: staff read; admin write.

Helper functions: `current_user_role()`, `is_staff()`, `is_admin()`.

## Storage (planned buckets)

| Bucket | Purpose | Access |
|--------|---------|--------|
| `avatars` | Profile images | Owner + staff |
| `exercise-media` | Exercise videos/images | Staff write; patient read assigned |
| `consent-signatures` | Signature payloads (if file-based) | Staff + owner |
| `blog-media` | Blog cover images | Public read; staff write |

## Seeding

Place seed SQL in `supabase/seed/` and reference from `config.toml` when ready.
Do not seed PHI in shared environments.

## Typed clients note

`src/types/database.ts` is a hand stub covering Phase 4 tables. After applying migrations, regenerate with `npm run db:types` and re-attach the `Database` generic on Supabase clients when the SDK version matches the generated shape.
