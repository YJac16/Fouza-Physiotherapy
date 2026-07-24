-- =============================================================================
-- Phase 4 — Extended PMS schema
-- Migration: 20260103000000_extended_schema.sql
-- =============================================================================

-- Availability
create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  slot_minutes integer not null default 60 check (slot_minutes > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint availability_rules_time check (end_time > start_time)
);

create index availability_rules_practitioner_idx on public.availability_rules (practitioner_id);

create table public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners (id) on delete cascade,
  exception_date date not null,
  is_available boolean not null default false,
  start_time time,
  end_time time,
  reason text,
  created_at timestamptz not null default timezone('utc', now())
);

create index availability_exceptions_practitioner_date_idx
  on public.availability_exceptions (practitioner_id, exception_date);

create table public.appointment_holds (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  hold_token text not null unique,
  email text,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint appointment_holds_time check (ends_at > starts_at)
);

create index appointment_holds_expires_idx on public.appointment_holds (expires_at);

-- Staff invites
create table public.staff_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  role public.app_role not null check (role in ('admin', 'practitioner', 'receptionist')),
  token text not null unique,
  invited_by uuid references public.profiles (id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index staff_invites_email_idx on public.staff_invites (email);

-- Intake
create table public.intake_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  schema_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger intake_forms_set_updated_at
before update on public.intake_forms
for each row execute function public.set_updated_at();

create table public.intake_responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.intake_forms (id) on delete restrict,
  patient_id uuid not null references public.patients (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create index intake_responses_patient_idx on public.intake_responses (patient_id);

-- Exercise library
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  instructions text,
  media_url text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger exercises_set_updated_at
before update on public.exercises
for each row execute function public.set_updated_at();

alter table public.programme_exercises
  add column if not exists exercise_id uuid references public.exercises (id) on delete set null;

-- Documents
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  title text not null,
  doc_type text not null default 'general',
  storage_path text not null,
  mime_type text,
  size_bytes integer,
  is_patient_visible boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index documents_patient_idx on public.documents (patient_id);

-- Payments
create type public.payment_method as enum ('cash', 'card', 'eft', 'other');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete restrict,
  invoice_id uuid references public.invoices (id) on delete set null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'ZAR',
  method public.payment_method not null default 'eft',
  paid_at timestamptz not null default timezone('utc', now()),
  notes text,
  recorded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index payments_patient_idx on public.payments (patient_id);

alter table public.invoice_line_items
  add column if not exists treatment_code text,
  add column if not exists icd10_code text;

create table public.invoice_sequences (
  id uuid primary key default gen_random_uuid(),
  year integer not null unique,
  last_number integer not null default 0
);

-- Notifications
create type public.notification_channel as enum ('email', 'sms', 'whatsapp', 'in_app');
create type public.notification_status as enum ('pending', 'sent', 'failed', 'cancelled');

create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  channel public.notification_channel not null default 'email',
  template_key text not null,
  recipient text not null,
  payload jsonb not null default '{}'::jsonb,
  status public.notification_status not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  scheduled_for timestamptz not null default timezone('utc', now()),
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index notification_outbox_status_idx on public.notification_outbox (status, scheduled_for);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text,
  href text,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index notifications_profile_idx on public.notifications (profile_id, is_read);

-- Audit
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- Reviews requests + waitlist + timeline + codes
create table public.review_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  practitioner_id uuid references public.practitioners (id) on delete set null,
  preferred_date date,
  notes text,
  status text not null default 'open',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.patient_timeline_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  event_type text not null,
  title text not null,
  summary text,
  entity_type text,
  entity_id text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index patient_timeline_patient_idx on public.patient_timeline_events (patient_id, created_at desc);

create table public.icd10_codes (
  code text primary key,
  description text not null
);

create table public.treatment_codes (
  code text primary key,
  description text not null,
  default_price_cents integer
);

-- Invoice number helper
create or replace function public.next_invoice_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  y integer := extract(year from timezone('utc', now()))::integer;
  n integer;
begin
  insert into public.invoice_sequences (year, last_number)
  values (y, 1)
  on conflict (year) do update
    set last_number = public.invoice_sequences.last_number + 1
  returning last_number into n;

  return 'INV-' || y::text || '-' || lpad(n::text, 5, '0');
end;
$$;

-- Views
create or replace view public.v_upcoming_appointments as
select
  a.*,
  p.first_name || ' ' || p.last_name as patient_name,
  s.name as service_name
from public.appointments a
join public.patients p on p.id = a.patient_id
left join public.services s on s.id = a.service_id
where a.starts_at >= timezone('utc', now())
  and a.status in ('pending', 'confirmed');

-- RLS enable
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.appointment_holds enable row level security;
alter table public.staff_invites enable row level security;
alter table public.intake_forms enable row level security;
alter table public.intake_responses enable row level security;
alter table public.exercises enable row level security;
alter table public.documents enable row level security;
alter table public.payments enable row level security;
alter table public.invoice_sequences enable row level security;
alter table public.notification_outbox enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.review_requests enable row level security;
alter table public.waitlist_entries enable row level security;
alter table public.patient_timeline_events enable row level security;
alter table public.icd10_codes enable row level security;
alter table public.treatment_codes enable row level security;

-- Staff policies (broad operational access)
create policy "Staff manage availability_rules" on public.availability_rules for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage availability_exceptions" on public.availability_exceptions for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage appointment_holds" on public.appointment_holds for all using (public.is_staff()) with check (public.is_staff());
create policy "Admins manage staff_invites" on public.staff_invites for all using (public.is_admin()) with check (public.is_admin());
create policy "Staff manage intake_forms" on public.intake_forms for all using (public.is_staff()) with check (public.is_staff());
create policy "Anyone auth can view active intake forms" on public.intake_forms for select using (is_active = true or public.is_staff());
create policy "Staff manage intake_responses" on public.intake_responses for all using (public.is_staff()) with check (public.is_staff());
create policy "Patients manage own intake_responses" on public.intake_responses for select using (
  exists (select 1 from public.patients p where p.id = intake_responses.patient_id and p.profile_id = auth.uid())
);
create policy "Patients insert own intake_responses" on public.intake_responses for insert with check (
  exists (select 1 from public.patients p where p.id = intake_responses.patient_id and p.profile_id = auth.uid())
);
create policy "Staff manage exercises" on public.exercises for all using (public.is_staff()) with check (public.is_staff());
create policy "Authenticated can view active exercises" on public.exercises for select using (is_active = true or public.is_staff());
create policy "Staff manage documents" on public.documents for all using (public.is_staff()) with check (public.is_staff());
create policy "Patients view visible documents" on public.documents for select using (
  is_patient_visible = true and exists (
    select 1 from public.patients p where p.id = documents.patient_id and p.profile_id = auth.uid()
  )
);
create policy "Staff manage payments" on public.payments for all using (public.is_staff()) with check (public.is_staff());
create policy "Admins manage invoice_sequences" on public.invoice_sequences for all using (public.is_admin()) with check (public.is_admin());
create policy "Staff manage notification_outbox" on public.notification_outbox for all using (public.is_staff()) with check (public.is_staff());
create policy "Users view own notifications" on public.notifications for select using (profile_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "Staff insert notifications" on public.notifications for insert with check (public.is_staff());
create policy "Admins manage audit_logs" on public.audit_logs for select using (public.is_admin());
create policy "Staff insert audit_logs" on public.audit_logs for insert with check (public.is_staff());
create policy "Staff manage review_requests" on public.review_requests for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage waitlist" on public.waitlist_entries for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff manage timeline" on public.patient_timeline_events for all using (public.is_staff()) with check (public.is_staff());
create policy "Patients view own timeline" on public.patient_timeline_events for select using (
  exists (select 1 from public.patients p where p.id = patient_timeline_events.patient_id and p.profile_id = auth.uid())
);
create policy "Staff manage icd10" on public.icd10_codes for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff read icd10" on public.icd10_codes for select using (public.is_staff());
create policy "Staff manage treatment_codes" on public.treatment_codes for all using (public.is_staff()) with check (public.is_staff());
create policy "Staff read treatment_codes" on public.treatment_codes for select using (public.is_staff());
