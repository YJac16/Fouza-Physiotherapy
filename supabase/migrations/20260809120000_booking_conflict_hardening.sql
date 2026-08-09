-- Booking conflict hardening: exclusion constraints, hold overlap trigger, buffer setting

create extension if not exists btree_gist with schema extensions;

-- Prevent overlapping active appointments for the same practitioner
alter table public.appointments
  drop constraint if exists appointments_no_overlap;

alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    practitioner_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('pending', 'confirmed'));

-- One availability exception row per practitioner + date
create unique index if not exists availability_exceptions_practitioner_date_uidx
  on public.availability_exceptions (practitioner_id, exception_date);

-- Hold overlap protection (cannot use EXCLUDE WHERE expires_at > now() — not IMMUTABLE)
create or replace function public.appointment_holds_reject_overlap()
returns trigger
language plpgsql
as $$
declare
  conflicting_appointment uuid;
  conflicting_hold uuid;
begin
  if new.ends_at <= new.starts_at then
    raise exception 'Hold end must be after start'
      using errcode = '23514';
  end if;

  select a.id into conflicting_appointment
  from public.appointments a
  where a.practitioner_id = new.practitioner_id
    and a.status in ('pending', 'confirmed')
    and tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(new.starts_at, new.ends_at, '[)')
  limit 1;

  if conflicting_appointment is not null then
    raise exception 'Slot conflicts with an existing appointment'
      using errcode = '23P01';
  end if;

  select h.id into conflicting_hold
  from public.appointment_holds h
  where h.practitioner_id = new.practitioner_id
    and h.id is distinct from new.id
    and h.expires_at > clock_timestamp()
    and tstzrange(h.starts_at, h.ends_at, '[)') && tstzrange(new.starts_at, new.ends_at, '[)')
  limit 1;

  if conflicting_hold is not null then
    raise exception 'Slot conflicts with an existing hold'
      using errcode = '23P01';
  end if;

  return new;
end;
$$;

drop trigger if exists appointment_holds_no_overlap on public.appointment_holds;

create trigger appointment_holds_no_overlap
  before insert or update of practitioner_id, starts_at, ends_at, expires_at
  on public.appointment_holds
  for each row
  execute function public.appointment_holds_reject_overlap();

-- Configurable buffer (default 0 — no schedule change until configured)
insert into public.practice_settings (key, value)
values ('booking.buffer_minutes', '0'::jsonb)
on conflict (key) do nothing;

-- Ensure hold minutes setting exists
insert into public.practice_settings (key, value)
values ('booking.hold_minutes', '10'::jsonb)
on conflict (key) do nothing;

-- Helper to purge expired holds (called from app cron)
create or replace function public.purge_expired_appointment_holds()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.appointment_holds
  where expires_at <= clock_timestamp();
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.purge_expired_appointment_holds() from public;
grant execute on function public.purge_expired_appointment_holds() to service_role;
