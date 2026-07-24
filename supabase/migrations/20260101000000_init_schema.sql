-- =============================================================================
-- Fouza Physiotherapy — Initial schema
-- Migration: 20260101000000_init_schema.sql
-- =============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.app_role as enum (
  'admin',
  'practitioner',
  'receptionist',
  'patient'
);

create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

create type public.appointment_source as enum (
  'online',
  'admin',
  'phone'
);

create type public.programme_status as enum (
  'draft',
  'active',
  'completed',
  'archived'
);

create type public.invoice_status as enum (
  'draft',
  'sent',
  'paid',
  'void',
  'overdue'
);

create type public.blog_status as enum (
  'draft',
  'published',
  'archived'
);

-- -----------------------------------------------------------------------------
-- Updated-at trigger helper
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  role public.app_role not null default 'patient',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'patient')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Patients
-- -----------------------------------------------------------------------------
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  date_of_birth date,
  medical_aid_name text,
  medical_aid_number text,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index patients_profile_id_idx on public.patients (profile_id);
create index patients_email_idx on public.patients (email);
create index patients_name_idx on public.patients (last_name, first_name);

create trigger patients_set_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Practitioners
-- -----------------------------------------------------------------------------
create table public.practitioners (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  title text,
  bio text,
  specialties text[],
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger practitioners_set_updated_at
before update on public.practitioners
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Services
-- -----------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'ZAR',
  is_bookable_online boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Appointments
-- -----------------------------------------------------------------------------
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete restrict,
  practitioner_id uuid not null references public.practitioners (id) on delete restrict,
  service_id uuid references public.services (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  source public.appointment_source not null default 'online',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint appointments_time_range check (ends_at > starts_at)
);

create index appointments_patient_id_idx on public.appointments (patient_id);
create index appointments_practitioner_id_idx on public.appointments (practitioner_id);
create index appointments_starts_at_idx on public.appointments (starts_at);
create index appointments_status_idx on public.appointments (status);

create trigger appointments_set_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Clinical notes (SOAP)
-- -----------------------------------------------------------------------------
create table public.clinical_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  practitioner_id uuid not null references public.practitioners (id) on delete restrict,
  appointment_id uuid references public.appointments (id) on delete set null,
  subjective text,
  objective text,
  assessment text,
  plan text,
  is_locked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index clinical_notes_patient_id_idx on public.clinical_notes (patient_id);

create trigger clinical_notes_set_updated_at
before update on public.clinical_notes
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Exercise programmes
-- -----------------------------------------------------------------------------
create table public.exercise_programmes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  practitioner_id uuid not null references public.practitioners (id) on delete restrict,
  title text not null,
  description text,
  status public.programme_status not null default 'draft',
  starts_on date,
  ends_on date,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index exercise_programmes_patient_id_idx on public.exercise_programmes (patient_id);

create trigger exercise_programmes_set_updated_at
before update on public.exercise_programmes
for each row execute function public.set_updated_at();

create table public.programme_exercises (
  id uuid primary key default gen_random_uuid(),
  programme_id uuid not null references public.exercise_programmes (id) on delete cascade,
  name text not null,
  instructions text,
  sets integer,
  reps integer,
  hold_seconds integer,
  media_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index programme_exercises_programme_id_idx on public.programme_exercises (programme_id);

-- -----------------------------------------------------------------------------
-- Consent forms
-- -----------------------------------------------------------------------------
create table public.consent_forms (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body_md text not null,
  version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger consent_forms_set_updated_at
before update on public.consent_forms
for each row execute function public.set_updated_at();

create table public.consent_signatures (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.consent_forms (id) on delete restrict,
  patient_id uuid not null references public.patients (id) on delete cascade,
  signed_at timestamptz not null default timezone('utc', now()),
  signature_data text,
  ip_address text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (form_id, patient_id, signed_at)
);

create index consent_signatures_patient_id_idx on public.consent_signatures (patient_id);

-- -----------------------------------------------------------------------------
-- Billing
-- -----------------------------------------------------------------------------
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete restrict,
  appointment_id uuid references public.appointments (id) on delete set null,
  invoice_number text not null unique,
  status public.invoice_status not null default 'draft',
  issue_date date not null,
  due_date date,
  subtotal_cents integer not null check (subtotal_cents >= 0),
  tax_cents integer not null default 0 check (tax_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  currency text not null default 'ZAR',
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index invoices_patient_id_idx on public.invoices (patient_id);
create index invoices_status_idx on public.invoices (status);

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create table public.invoice_line_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price_cents integer not null,
  amount_cents integer not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- -----------------------------------------------------------------------------
-- Blog CMS
-- -----------------------------------------------------------------------------
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  body_md text not null,
  cover_image_url text,
  status public.blog_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index blog_posts_status_idx on public.blog_posts (status);
create index blog_posts_published_at_idx on public.blog_posts (published_at desc);

create trigger blog_posts_set_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Google Reviews cache
-- -----------------------------------------------------------------------------
create table public.google_reviews (
  id uuid primary key default gen_random_uuid(),
  google_review_id text unique,
  author_name text not null,
  rating integer not null check (rating between 1 and 5),
  text text,
  reviewed_at timestamptz,
  is_featured boolean not null default false,
  is_visible boolean not null default true,
  synced_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

-- -----------------------------------------------------------------------------
-- Practice settings (key/value JSON)
-- -----------------------------------------------------------------------------
create table public.practice_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger practice_settings_set_updated_at
before update on public.practice_settings
for each row execute function public.set_updated_at();
