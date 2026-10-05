-- =====================================================================
-- BCS Phase B1 — RPC privilege + guard hardening
-- Project: raxwortsxirulebexxgp   Repo: YJac16/Fouza-Physiotherapy
-- Applied in production as 20261005212706_bcs_phase_b1_rpc_hardening.
-- Prereq: Phase A (20261005211258 revoke_anon_security_definer_execute)
--         is already applied in prod (verified 2026-10-05 23:12:58 SAST).
-- Out of scope: Auth settings (B2), is_staff() grants (public-read RLS).
-- Whole file runs in ONE transaction; any error = nothing changes.
-- Includes B1-d (generate_booking_reference revoke).
-- =====================================================================
begin;

-- ---------------------------------------------------------------------
-- B1-a  Service-only RPCs: remove `authenticated` EXECUTE.
--   Only caller in repo = createServiceClient() (service_role):
--     next_invoice_number()              src/features/billing/actions/billing.ts:331
--     purge_expired_appointment_holds()  src/features/booking/api/bookings.ts:111
--     refresh_invoice_payment_status()   src/features/billing/actions/billing.ts:182
--   No DB-side callers (functions/policies/defaults/pg_cron) — verified.
-- ---------------------------------------------------------------------
revoke execute on function public.next_invoice_number()                from public, anon, authenticated;
revoke execute on function public.purge_expired_appointment_holds()    from public, anon, authenticated;
revoke execute on function public.refresh_invoice_payment_status(uuid) from public, anon, authenticated;

grant  execute on function public.next_invoice_number()                to service_role;
grant  execute on function public.purge_expired_appointment_holds()    to service_role;
grant  execute on function public.refresh_invoice_payment_status(uuid) to service_role;

-- practice_finance_snapshot KEEPS authenticated: it is called with the
-- staff user's session client (src/features/analytics/api/finance.ts:32).
revoke execute on function public.practice_finance_snapshot(timestamptz, timestamptz, date, date) from public, anon;
grant  execute on function public.practice_finance_snapshot(timestamptz, timestamptz, date, date) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- B1-b  Fail-closed guards.
--   Old guard: if not (is_staff() or auth.role() = 'service_role')
--   With NO JWT claims: is_staff()=false, auth.role()=NULL
--     -> not (false or null) = NULL -> IF NULL does not raise -> FAIL-OPEN
--   (verified in prod read-only: role authenticated + no claims got a row).
--   New guard: explicit allow-list, everything else raises 42501.
--   Bodies below are otherwise byte-for-byte identical to prod.
-- ---------------------------------------------------------------------
create or replace function public.practice_finance_snapshot(
  p_paid_from timestamptz,
  p_paid_to_exclusive timestamptz,
  p_issue_from date,
  p_issue_to date
)
returns table (cash_collected_cents bigint, invoiced_cents bigint, outstanding_cents bigint)
language plpgsql
stable
security definer
set search_path = public
as $function$
declare
  v_jwt_role text := coalesce(auth.role(), '');
  v_uid uuid := auth.uid();
begin
  -- Fail closed: missing/empty JWT, anon, non-staff -> denied.
  if not (
    v_jwt_role = 'service_role'
    or (v_jwt_role = 'authenticated' and v_uid is not null and coalesce(public.is_staff(), false))
  ) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  return query
  select
    (
      select coalesce(sum(p.amount_cents), 0)::bigint
      from public.payments p
      where p.paid_at >= p_paid_from
        and p.paid_at < p_paid_to_exclusive
    ) as cash_collected_cents,
    (
      select coalesce(sum(i.total_cents), 0)::bigint
      from public.invoices i
      where i.status <> 'void'
        and i.issue_date >= p_issue_from
        and i.issue_date <= p_issue_to
    ) as invoiced_cents,
    (
      select coalesce(sum(greatest(i.total_cents - coalesce(pay.paid, 0), 0)), 0)::bigint
      from public.invoices i
      left join (
        select invoice_id, sum(amount_cents)::integer as paid
        from public.payments
        where invoice_id is not null
        group by invoice_id
      ) pay on pay.invoice_id = i.id
      where i.status <> 'void'
    ) as outstanding_cents;
end;
$function$;

create or replace function public.refresh_invoice_payment_status(p_invoice_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_status public.invoice_status;
  v_total integer;
  v_paid integer;
  v_jwt_role text := coalesce(auth.role(), '');
  v_uid uuid := auth.uid();
begin
  -- Fail closed: missing/empty JWT, anon, non-staff -> denied.
  if not (
    v_jwt_role = 'service_role'
    or (v_jwt_role = 'authenticated' and v_uid is not null and coalesce(public.is_staff(), false))
  ) then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select status, total_cents into v_status, v_total
  from public.invoices
  where id = p_invoice_id
  for update;

  if not found then
    return null;
  end if;

  if v_status = 'void' then
    return v_status::text;
  end if;

  select coalesce(sum(amount_cents), 0)::integer into v_paid
  from public.payments
  where invoice_id = p_invoice_id;

  if v_total >= 0 and v_paid >= v_total then
    update public.invoices set status = 'paid' where id = p_invoice_id;
    return 'paid';
  end if;

  if v_status = 'draft' and v_paid = 0 then
    return 'draft';
  end if;

  if v_status = 'paid' then
    update public.invoices set status = 'sent' where id = p_invoice_id;
    return 'sent';
  end if;

  return v_status::text;
end;
$function$;

-- CREATE OR REPLACE keeps existing ACLs; re-assert anyway (idempotent).
revoke execute on function public.refresh_invoice_payment_status(uuid) from public, anon, authenticated;
grant  execute on function public.refresh_invoice_payment_status(uuid) to service_role;
revoke execute on function public.practice_finance_snapshot(timestamptz, timestamptz, date, date) from public, anon;
grant  execute on function public.practice_finance_snapshot(timestamptz, timestamptz, date, date) to authenticated, service_role;

-- ---------------------------------------------------------------------
-- B1-c  Pin search_path (Supabase advisor 0011 function_search_path_mutable).
--   All three bodies fully qualify public objects; everything else is
--   pg_catalog (timezone, now, to_char, lpad, nextval, tstzrange,
--   clock_timestamp, &&), which is always searched -> '' is safe.
--   SECURITY INVOKER is unchanged.
-- ---------------------------------------------------------------------
alter function public.set_updated_at()                   set search_path = '';
alter function public.appointment_holds_reject_overlap() set search_path = '';
alter function public.generate_booking_reference()       set search_path = '';

-- ---------------------------------------------------------------------
-- B1-d  generate_booking_reference() is PUBLIC/anon-executable via
--   /rest/v1/rpc and consumes booking_reference_seq (anon can burn refs).
--   Only caller: admin.rpc (service_role) bookings.ts:329. No column default.
-- ---------------------------------------------------------------------
revoke execute on function public.generate_booking_reference() from public, anon, authenticated;
grant  execute on function public.generate_booking_reference() to service_role;

commit;
