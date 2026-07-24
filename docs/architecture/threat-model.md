# Threat model (Phase 21)

## Assets

- Patient PHI (clinical notes, intake, documents, contact details)
- Auth sessions and role claims
- Billing ledger and invoice numbers
- Staff invite tokens

## Trust boundaries

| Boundary | Controls |
|----------|----------|
| Browser → Next.js | HTTPS, CSP, cookies via Supabase SSR |
| Next.js → Supabase | Anon key + RLS; service role only in server actions / cron |
| Cron → outbox | `Authorization: Bearer CRON_SECRET` |
| Public forms | Honeypot + in-memory rate limit |

## Top threats & mitigations

1. **Privilege escalation** — signup forced to `patient`; role change blocked by trigger + RLS.
2. **Cross-patient PHI leak** — portal queries scoped by `patients.profile_id`; clinical notes staff-only.
3. **Double booking** — holds + conflict checks on service-role booking path.
4. **Spam / abuse** — contact rate limit; booking honeypot.
5. **Storage PHI exposure** — private buckets; path convention `patient_id/...`.
6. **Locked note tampering** — DB trigger prevents updates when `is_locked`.

## Residual risks

- In-memory rate limits do not share state across Vercel instances (upgrade to Redis for production scale).
- PDF invoice generation / virus scanning deferred; register documents metadata-first.
- Google Places key must remain server-only.
