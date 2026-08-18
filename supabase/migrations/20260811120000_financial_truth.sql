-- =============================================================================
-- Phase 1 — Financial truth
-- Snapshot appointment prices, service attribution on invoice lines,
-- and payment-status refresh (paid only when fully covered).
-- =============================================================================

alter table public.appointments
  add column if not exists price_cents integer,
  add column if not exists currency text not null default 'ZAR';

alter table public.appointments
  drop constraint if exists appointments_price_cents_check;

alter table public.appointments
  add constraint appointments_price_cents_check
  check (price_cents is null or price_cents >= 0);

alter table public.invoice_line_items
  add column if not exists service_id uuid references public.services (id) on delete set null;

create index if not exists invoice_line_items_service_id_idx
  on public.invoice_line_items (service_id);

-- Stored invoice status stays `sent` until linked payments cover the total.
create or replace function public.refresh_invoice_payment_status(p_invoice_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status public.invoice_status;
  v_total integer;
  v_paid integer;
begin
  if not (public.is_staff() or auth.role() = 'service_role') then
    raise exception 'not allowed';
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
$$;

revoke all on function public.refresh_invoice_payment_status(uuid) from public;
grant execute on function public.refresh_invoice_payment_status(uuid)
  to authenticated, service_role;

create or replace function public.practice_finance_snapshot(
  p_paid_from timestamptz,
  p_paid_to_exclusive timestamptz,
  p_issue_from date,
  p_issue_to date
)
returns table (
  cash_collected_cents bigint,
  invoiced_cents bigint,
  outstanding_cents bigint
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not (public.is_staff() or auth.role() = 'service_role') then
    raise exception 'not allowed';
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
$$;

revoke all on function public.practice_finance_snapshot(timestamptz, timestamptz, date, date) from public;
grant execute on function public.practice_finance_snapshot(timestamptz, timestamptz, date, date)
  to authenticated, service_role;

-- Historical appointment prices stay null (decision 2a). Snapshot only new bookings.

-- Recompute stored invoice status: paid only when linked payments cover the total.
update public.invoices i
set status = sub.new_status
from (
  select
    i2.id,
    case
      when i2.status = 'void' then i2.status
      when coalesce(p.paid, 0) >= i2.total_cents and i2.total_cents >= 0
        then 'paid'::public.invoice_status
      when i2.status = 'draft' and coalesce(p.paid, 0) = 0
        then 'draft'::public.invoice_status
      when i2.status = 'paid'
        then 'sent'::public.invoice_status
      else i2.status
    end as new_status
  from public.invoices i2
  left join (
    select invoice_id, sum(amount_cents)::integer as paid
    from public.payments
    where invoice_id is not null
    group by invoice_id
  ) p on p.invoice_id = i2.id
) sub
where i.id = sub.id
  and i.status is distinct from sub.new_status;
