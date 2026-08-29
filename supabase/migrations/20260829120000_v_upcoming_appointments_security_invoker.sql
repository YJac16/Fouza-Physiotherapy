-- v_upcoming_appointments was created as a SECURITY DEFINER view (default),
-- which bypasses RLS of the querying user (Supabase linter 0010).
-- Postgres 15+: security_invoker applies the caller's privileges and RLS.

alter view public.v_upcoming_appointments set (security_invoker = true);

revoke all on table public.v_upcoming_appointments from public;
grant select on table public.v_upcoming_appointments to authenticated;
