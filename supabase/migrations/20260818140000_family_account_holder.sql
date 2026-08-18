-- Family account holders, billing contacts, and staff-assisted consent capture.

alter table public.patients
  add column if not exists billing_name text,
  add column if not exists billing_email text,
  add column if not exists billing_phone text,
  add column if not exists billing_address text,
  add column if not exists consent_capture_method text,
  add column if not exists consent_captured_by uuid references public.profiles (id) on delete set null;

alter table public.patients
  drop constraint if exists patients_consent_capture_method_check;

alter table public.patients
  add constraint patients_consent_capture_method_check
  check (
    consent_capture_method is null
    or consent_capture_method in ('portal', 'staff_assisted')
  );

create table if not exists public.patient_contacts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  relationship text,
  is_account_holder boolean not null default false,
  can_view_portal boolean not null default true,
  can_book boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (patient_id, email)
);

create unique index if not exists patient_contacts_one_account_holder
  on public.patient_contacts (patient_id)
  where is_account_holder = true;

create unique index if not exists patient_contacts_patient_profile_idx
  on public.patient_contacts (patient_id, profile_id)
  where profile_id is not null;

create index if not exists patient_contacts_profile_id_idx
  on public.patient_contacts (profile_id);

create index if not exists patient_contacts_email_idx
  on public.patient_contacts (email);

drop trigger if exists patient_contacts_set_updated_at on public.patient_contacts;
create trigger patient_contacts_set_updated_at
before update on public.patient_contacts
for each row execute function public.set_updated_at();

create or replace function public.is_portal_contact(p_patient_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.patient_contacts c
    where c.patient_id = p_patient_id
      and c.profile_id = auth.uid()
      and c.can_view_portal = true
  );
$$;

grant execute on function public.is_portal_contact(uuid) to authenticated, service_role;

alter table public.patient_contacts enable row level security;

create policy "Staff manage patient_contacts"
  on public.patient_contacts for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Contacts view own patient_contacts"
  on public.patient_contacts for select
  using (profile_id = auth.uid());

create policy "Contacts can view linked patients"
  on public.patients for select
  using (public.is_portal_contact(id));

create policy "Contacts can view linked appointments"
  on public.appointments for select
  using (public.is_portal_contact(patient_id));

create policy "Contacts can view linked programmes"
  on public.exercise_programmes for select
  using (public.is_portal_contact(patient_id));

create policy "Contacts can view linked programme exercises"
  on public.programme_exercises for select
  using (
    exists (
      select 1
      from public.exercise_programmes ep
      where ep.id = programme_exercises.programme_id
        and public.is_portal_contact(ep.patient_id)
    )
  );

create policy "Contacts can view linked invoices"
  on public.invoices for select
  using (public.is_portal_contact(patient_id));

create policy "Contacts can view linked invoice line items"
  on public.invoice_line_items for select
  using (
    exists (
      select 1
      from public.invoices i
      where i.id = invoice_line_items.invoice_id
        and public.is_portal_contact(i.patient_id)
    )
  );

create policy "Patients and contacts view own payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = payments.patient_id
        and (p.profile_id = auth.uid() or public.is_portal_contact(p.id))
    )
  );

create policy "Contacts can view linked documents"
  on public.documents for select
  using (
    is_patient_visible = true
    and public.is_portal_contact(patient_id)
  );

create policy "Contacts can view linked consent signatures"
  on public.consent_signatures for select
  using (public.is_portal_contact(patient_id));

create policy "Contacts can view linked intake responses"
  on public.intake_responses for select
  using (public.is_portal_contact(patient_id));
