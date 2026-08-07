-- Patient verification + denormalized informed consent flags for booking gates.

alter table public.patients
  add column if not exists verified_account boolean not null default false,
  add column if not exists informed_consent_signed boolean not null default false,
  add column if not exists informed_consent_signed_at timestamptz,
  add column if not exists informed_consent_version text;

comment on column public.patients.verified_account is
  'When true (with informed consent), patient may book follow-up services online.';
comment on column public.patients.informed_consent_signed is
  'Denormalized: true after full Fouza consent package is completed.';
comment on column public.patients.informed_consent_signed_at is
  'Timestamp when informed consent package was completed.';
comment on column public.patients.informed_consent_version is
  'Version label of consent forms at time of signing (e.g. treatment:v3+account:v1).';

create index if not exists patients_verified_account_idx
  on public.patients (verified_account)
  where verified_account = true;

create index if not exists patients_informed_consent_signed_idx
  on public.patients (informed_consent_signed)
  where informed_consent_signed = true;

-- Patients may update their own demographics; verification/consent flags are staff/service-role only.
drop policy if exists "Patients can update own record" on public.patients;
create policy "Patients can update own record"
  on public.patients for update
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create or replace function public.guard_patient_verification_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    new.verified_account is distinct from old.verified_account
    or new.informed_consent_signed is distinct from old.informed_consent_signed
    or new.informed_consent_signed_at is distinct from old.informed_consent_signed_at
    or new.informed_consent_version is distinct from old.informed_consent_version
  ) then
    -- Allow service role, staff, and non-authenticated migration/DDL contexts.
    if coalesce(auth.role(), '') in ('service_role', 'postgres', 'supabase_admin')
      or auth.uid() is null
      or public.is_staff()
    then
      return new;
    end if;
    raise exception 'Only staff can change verification and consent status flags';
  end if;
  return new;
end;
$$;

drop trigger if exists patients_guard_verification_columns on public.patients;
create trigger patients_guard_verification_columns
before update on public.patients
for each row execute function public.guard_patient_verification_columns();

-- Backfill from existing complete consent packages (intake + required signatures).
with completed as (
  select
    p.id as patient_id,
    max(cs.signed_at) as signed_at,
    string_agg(
      distinct cf.slug || ':v' || cf.version::text,
      '+'
      order by cf.slug || ':v' || cf.version::text
    ) as version_label
  from public.patients p
  join public.intake_forms inf
    on inf.slug = 'fouza-consent-intake' and inf.is_active = true
  join public.intake_responses ir
    on ir.patient_id = p.id and ir.form_id = inf.id
  join public.consent_forms cf
    on cf.slug in ('treatment-consent', 'account-responsibility') and cf.is_active = true
  join public.consent_signatures cs
    on cs.patient_id = p.id and cs.form_id = cf.id
  group by p.id
  having count(distinct cf.id) >= 2
)
update public.patients p
set
  informed_consent_signed = true,
  informed_consent_signed_at = coalesce(p.informed_consent_signed_at, c.signed_at),
  informed_consent_version = coalesce(p.informed_consent_version, c.version_label),
  verified_account = true
from completed c
where p.id = c.patient_id
  and p.informed_consent_signed = false;
