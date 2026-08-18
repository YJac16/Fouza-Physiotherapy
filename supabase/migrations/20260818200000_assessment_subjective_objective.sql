alter table public.initial_assessments
  add column if not exists subjective jsonb not null default '{}'::jsonb,
  add column if not exists objective jsonb not null default '{}'::jsonb;

comment on column public.initial_assessments.subjective is
  'Structured subjective assessment notes. Staff-only; not patient-readable.';
comment on column public.initial_assessments.objective is
  'Structured objective assessment notes. Staff-only; not patient-readable.';
