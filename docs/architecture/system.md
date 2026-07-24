# System Architecture

## Product surfaces

| Surface | Route group | Audience |
|---------|-------------|----------|
| Marketing website | `(marketing)` | Public |
| Online booking | `(marketing)/book` | Public / patients |
| Auth | `(auth)` | Public |
| Patient portal | `(portal)/portal` | Patients |
| Admin dashboard | `(admin)/admin` | Staff |

## Layering

```
src/app/**          → routing, layouts, composition only
src/features/**     → domain logic, UI, actions, schemas
src/components/**   → shared UI (shadcn) + layouts + providers
src/lib/**          → supabase, email, utils, validations
src/config/**       → env, site, routes
src/types/**        → shared TypeScript types
src/hooks/**        → shared React hooks
supabase/**         → migrations, local config
docs/**             → architecture guides
```

## Feature-based modules

Business logic lives in `src/features/<domain>`. Pages import from feature barrels (`index.ts`), not deep internal paths where avoidable.

See [src/features/README.md](../../src/features/README.md).

## Data & async

- **Server Components** for initial reads (Supabase server client).
- **Server Actions** for mutations (`features/*/actions`).
- **TanStack Query** for client cache / interactive lists.
- **Zod** at form + action boundaries.
- **Resend** for transactional email (booking confirmations, invoices, magic links branding).

## Cross-cutting docs

- [Authentication](./authentication.md)
- [Database](./database.md)
- [Folder structure](./folder-structure.md)
- [Design system](./design-system.md)
