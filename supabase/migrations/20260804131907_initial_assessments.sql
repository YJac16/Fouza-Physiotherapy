-- Initial assessments: mobile body-diagram clinical notes (staff only)

create table public.initial_assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  practitioner_id uuid not null references public.practitioners (id) on delete restrict,
  appointment_id uuid references public.appointments (id) on delete set null,
  chief_complaint text,
  history text,
  pain_scale smallint check (pain_scale is null or (pain_scale >= 0 and pain_scale <= 10)),
  observations text,
  plan text,
  region_notes jsonb not null default '[]'::jsonb,
  is_locked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index initial_assessments_patient_id_idx on public.initial_assessments (patient_id);
create index initial_assessments_created_at_idx on public.initial_assessments (created_at desc);

create trigger initial_assessments_set_updated_at
before update on public.initial_assessments
for each row execute function public.set_updated_at();

-- Reuse locked-note guard (message is generic enough for clinical records)
create trigger initial_assessments_prevent_locked_update
before update on public.initial_assessments
for each row execute function public.prevent_locked_note_update();

alter table public.initial_assessments enable row level security;

create policy "Staff can manage initial assessments"
  on public.initial_assessments for all
  using (public.is_staff())
  with check (public.is_staff());

comment on table public.initial_assessments is
  'Staff initial assessments with body-region annotations (region_notes jsonb). Not patient-readable.';
