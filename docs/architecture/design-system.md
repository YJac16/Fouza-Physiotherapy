# Design System

Premium healthcare UI framework for Fouza Physiotherapy.

## Tokens

| Module | Path |
|--------|------|
| Colours, type, spacing, radii, shadows, motion, breakpoints | `src/lib/design-tokens` |
| Framer Motion presets | `src/lib/motion` |
| Global CSS variables + reduced-motion | `src/app/globals.css` |
| Tailwind theme bridge | `tailwind.config.ts` |

## Palette

- **Primary** — Medical blue
- **Accent** — Soft teal (`accent` + `accent-soft`)
- **Background** — Warm white
- **Secondary** — Very light grey
- **Card** — Pure white
- **Semantic** — success / warning / destructive / info
- **Dark mode** — class strategy via `next-themes`

## Component map

| Layer | Location |
|-------|----------|
| Primitives (Button, Card, Input, …) | `src/components/ui` |
| Layout (Navbar, Footer, SiteShell, AdminShell) | `src/components/layout` |
| Shared (Logo, FAQ, States, Newsletter) | `src/components/shared` |
| Forms | `src/components/forms` |
| Marketing / Booking / Patient / Admin / Blog cards | `src/components/{domain}` |

## Theme

`ThemeProvider` wraps the app inside `AppProviders`. Use `ThemeToggle` for light/dark.

## Usage

```tsx
import { Button, SiteShell, Hero, ServiceCard } from "@/components";
```

Do not put business/Supabase logic in these components — they are presentational and reusable.
