-- Guest booking: references, consent snapshots, payment idempotency

-- Appointments: human-readable reference + opaque guest access token
alter table public.appointments
  add column if not exists booking_reference text,
  add column if not exists confirmation_token text;

create unique index if not exists appointments_booking_reference_key
  on public.appointments (booking_reference)
  where booking_reference is not null;

create unique index if not exists appointments_confirmation_token_key
  on public.appointments (confirmation_token)
  where confirmation_token is not null;

create sequence if not exists public.booking_reference_seq start 1;

create or replace function public.generate_booking_reference()
returns text
language plpgsql
as $$
declare
  year_part text;
  seq_part text;
begin
  year_part := to_char(now() at time zone 'Africa/Johannesburg', 'YYYY');
  seq_part := lpad(nextval('public.booking_reference_seq')::text, 6, '0');
  return 'FP-' || year_part || '-' || seq_part;
end;
$$;

-- Backfill existing appointments with stable references (do not change consent/payment flags)
do $$
declare
  r record;
begin
  for r in
    select id
    from public.appointments
    where booking_reference is null
    order by created_at asc
  loop
    update public.appointments
    set booking_reference = public.generate_booking_reference()
    where id = r.id;
  end loop;
end;
$$;

-- Consent signatures: immutable snapshot of accepted wording
alter table public.consent_signatures
  add column if not exists form_version integer,
  add column if not exists body_md_snapshot text,
  add column if not exists user_agent text;

-- Allow guest_booking capture method on patients
alter table public.patients
  drop constraint if exists patients_consent_capture_method_check;

alter table public.patients
  add constraint patients_consent_capture_method_check
  check (
    consent_capture_method is null
    or consent_capture_method in ('portal', 'staff_assisted', 'guest_booking')
  );

-- Payment idempotency for staff double-submit protection
alter table public.payments
  add column if not exists idempotency_key text;

create unique index if not exists payments_idempotency_key_key
  on public.payments (idempotency_key)
  where idempotency_key is not null;

-- Extend hold TTL when guest is signing consent (optional setting)
insert into public.practice_settings (key, value)
values ('booking.consent_hold_minutes', '30')
on conflict (key) do nothing;
