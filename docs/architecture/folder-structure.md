# Folder Structure

```text
fouza-physiotherapy/
├── docs/
│   └── architecture/
│       ├── authentication.md
│       ├── database.md
│       ├── folder-structure.md
│       └── system.md
├── public/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Public website + booking
│   │   │   ├── book/
│   │   │   └── layout.tsx
│   │   ├── (auth)/               # Login / register
│   │   │   └── login/
│   │   ├── (portal)/             # Patient portal
│   │   │   └── portal/
│   │   ├── (admin)/              # Admin dashboard
│   │   │   └── admin/
│   │   ├── api/
│   │   │   └── health/
│   │   ├── auth/
│   │   │   └── callback/         # OAuth / magic-link exchange
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layouts/
│   │   ├── providers/
│   │   ├── shared/
│   │   └── ui/                   # shadcn/ui
│   ├── config/
│   │   ├── env.ts
│   │   ├── routes.ts
│   │   └── site.ts
│   ├── features/
│   │   ├── auth/
│   │   ├── billing/
│   │   ├── blog/
│   │   ├── booking/
│   │   ├── clinical-notes/
│   │   ├── consent-forms/
│   │   ├── exercise-programmes/
│   │   ├── marketing/
│   │   ├── patients/
│   │   ├── practice/
│   │   ├── reviews/
│   │   └── README.md
│   ├── hooks/
│   ├── lib/
│   │   ├── constants/
│   │   ├── email/
│   │   ├── supabase/
│   │   ├── utils/
│   │   └── validations/
│   ├── middleware.ts
│   └── types/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   └── seed/
├── .env.example
├── components.json               # shadcn config
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── README.md
├── INSTALLATION.md
└── DEPLOYMENT.md
```

Each feature folder contains: `components/`, `hooks/`, `actions/`, `api/`, `schemas/`, `types/`, `lib/`, `index.ts`.
