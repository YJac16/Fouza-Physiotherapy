-- =============================================================================
-- Row Level Security policies
-- Migration: 20260101000001_rls_policies.sql
-- =============================================================================

-- Helper: current user's role
create or replace function public.current_user_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'practitioner', 'receptionist')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.practitioners enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.clinical_notes enable row level security;
alter table public.exercise_programmes enable row level security;
alter table public.programme_exercises enable row level security;
alter table public.consent_forms enable row level security;
alter table public.consent_signatures enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_line_items enable row level security;
alter table public.blog_posts enable row level security;
alter table public.google_reviews enable row level security;
alter table public.practice_settings enable row level security;

-- Profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can manage profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Patients
create policy "Staff can manage patients"
  on public.patients for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Patients can view own record"
  on public.patients for select
  using (profile_id = auth.uid());

-- Practitioners / Services (public read of active)
create policy "Anyone can view active practitioners"
  on public.practitioners for select
  using (is_active = true or public.is_staff());

create policy "Staff can manage practitioners"
  on public.practitioners for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Anyone can view active bookable services"
  on public.services for select
  using (is_active = true or public.is_staff());

create policy "Staff can manage services"
  on public.services for all
  using (public.is_staff())
  with check (public.is_staff());

-- Appointments
create policy "Staff can manage appointments"
  on public.appointments for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Patients can view own appointments"
  on public.appointments for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = appointments.patient_id
        and p.profile_id = auth.uid()
    )
  );

-- Clinical notes (staff only — never patient-readable by default)
create policy "Staff can manage clinical notes"
  on public.clinical_notes for all
  using (public.is_staff())
  with check (public.is_staff());

-- Exercise programmes
create policy "Staff can manage programmes"
  on public.exercise_programmes for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Patients can view own programmes"
  on public.exercise_programmes for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = exercise_programmes.patient_id
        and p.profile_id = auth.uid()
    )
  );

create policy "Staff can manage programme exercises"
  on public.programme_exercises for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Patients can view own programme exercises"
  on public.programme_exercises for select
  using (
    exists (
      select 1
      from public.exercise_programmes ep
      join public.patients p on p.id = ep.patient_id
      where ep.id = programme_exercises.programme_id
        and p.profile_id = auth.uid()
    )
  );

-- Consent
create policy "Anyone authenticated can view active consent forms"
  on public.consent_forms for select
  using (is_active = true or public.is_staff());

create policy "Staff can manage consent forms"
  on public.consent_forms for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Staff can manage consent signatures"
  on public.consent_signatures for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Patients can view and create own signatures"
  on public.consent_signatures for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = consent_signatures.patient_id
        and p.profile_id = auth.uid()
    )
  );

create policy "Patients can sign forms"
  on public.consent_signatures for insert
  with check (
    exists (
      select 1 from public.patients p
      where p.id = consent_signatures.patient_id
        and p.profile_id = auth.uid()
    )
  );

-- Invoices
create policy "Staff can manage invoices"
  on public.invoices for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Patients can view own invoices"
  on public.invoices for select
  using (
    exists (
      select 1 from public.patients p
      where p.id = invoices.patient_id
        and p.profile_id = auth.uid()
    )
  );

create policy "Staff can manage invoice line items"
  on public.invoice_line_items for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Patients can view own invoice line items"
  on public.invoice_line_items for select
  using (
    exists (
      select 1
      from public.invoices i
      join public.patients p on p.id = i.patient_id
      where i.id = invoice_line_items.invoice_id
        and p.profile_id = auth.uid()
    )
  );

-- Blog
create policy "Anyone can view published posts"
  on public.blog_posts for select
  using (status = 'published' or public.is_staff());

create policy "Staff can manage blog posts"
  on public.blog_posts for all
  using (public.is_staff())
  with check (public.is_staff());

-- Reviews
create policy "Anyone can view visible reviews"
  on public.google_reviews for select
  using (is_visible = true or public.is_staff());

create policy "Staff can manage reviews"
  on public.google_reviews for all
  using (public.is_staff())
  with check (public.is_staff());

-- Practice settings
create policy "Staff can read practice settings"
  on public.practice_settings for select
  using (public.is_staff());

create policy "Admins can manage practice settings"
  on public.practice_settings for all
  using (public.is_admin())
  with check (public.is_admin());
