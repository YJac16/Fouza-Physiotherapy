# Architecture Hardening (Phase 3.5)

## Goals

- Prevent privilege escalation via profile `role`
- Force new signups to `patient`
- Lock clinical notes after `is_locked`
- Align auth routes with middleware
- Keep online booking on service-role Server Actions (Phase 6)

## Interim booking channel

Until native booking (Phase 6) is live, public CTAs may use Setmore:

- `siteConfig.bookingExternalUrl` → `https://fouzaphysiotherapy.setmore.com/`

Native `/book` wizard will supersede this; keep Setmore as fallback during rollout.

## Migrations

- `20260102000000_security_hardening.sql`
