# Architecture Hardening (Phase 3.5)

## Goals

- Prevent privilege escalation via profile `role`
- Force new signups to `patient`
- Lock clinical notes after `is_locked`
- Align auth routes with middleware
- Keep online booking on service-role Server Actions (Phase 6)

## Public booking channel

Native `/book` is the only public booking path. Marketing, portal, and booking CTAs
must stay on-site (`routes.booking.root`). Do not fall back to an external scheduler.

## Migrations

- `20260102000000_security_hardening.sql`
