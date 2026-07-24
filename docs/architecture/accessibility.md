# Accessibility notes (Phase 22)

## Implemented

- Skip-to-content link on marketing layout (`#main-content`)
- Semantic landmarks in AdminShell / PortalShell nav
- Form labels on auth, booking, SOAP, billing, CMS forms
- Signature pad has `aria-label`
- Focus-visible styles via shared button/input primitives

## Manual QA checklist

- [ ] Keyboard-only path: Home → Book → complete wizard
- [ ] Keyboard-only path: Login → Portal → Forms
- [ ] Keyboard-only path: Admin → Patients → create
- [ ] Screen reader announces booking step changes (live region optional follow-up)
- [ ] Colour contrast on primary CTA vs warm white background
- [ ] Error text associated with fields (expand `aria-describedby` where missing)

## Target

WCAG 2.2 AA on marketing + critical portal/admin flows. Prefer axe DevTools on `/`, `/book`, `/login`, `/portal`, `/admin`.
