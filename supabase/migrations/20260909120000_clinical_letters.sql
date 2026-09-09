-- Clinical letters: proof of attendance and medical referral

create type public.clinical_letter_type as enum ('proof_of_attendance', 'medical_referral');
create type public.clinical_letter_status as enum ('draft', 'signed', 'sent');

create or replace function public.is_letter_author()
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
      and role in ('admin', 'practitioner')
  );
$$;

grant execute on function public.is_letter_author() to authenticated, service_role;

create table public.clinical_letter_templates (
  id uuid primary key default gen_random_uuid(),
  letter_type public.clinical_letter_type not null unique,
  title text not null,
  body text not null,
  physiotherapist_name text not null default 'Fouza Abrahams',
  qualifications text not null default 'BSc (Hons) Physiotherapy',
  contact text,
  updated_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create table public.clinical_letters (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients (id) on delete cascade,
  appointment_id uuid references public.appointments (id) on delete set null,
  letter_type public.clinical_letter_type not null,
  status public.clinical_letter_status not null default 'draft',
  letter_date date not null default (timezone('Africa/Johannesburg', now()))::date,
  attendance_date date,
  recipient_name text,
  recipient_email text,
  patient_age text,
  patient_sex text,
  subject_line text,
  body text not null,
  physiotherapist_name text not null,
  qualifications text,
  practice_name text,
  contact text,
  signature_data text,
  signed_at timestamptz,
  signed_by uuid references public.profiles (id) on delete set null,
  sent_at timestamptz,
  sent_to text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index clinical_letters_patient_idx on public.clinical_letters (patient_id);
create index clinical_letters_status_idx on public.clinical_letters (status);
create index clinical_letters_type_idx on public.clinical_letters (letter_type);

create trigger clinical_letter_templates_set_updated_at
before update on public.clinical_letter_templates
for each row execute function public.set_updated_at();

create trigger clinical_letters_set_updated_at
before update on public.clinical_letters
for each row execute function public.set_updated_at();

alter table public.clinical_letter_templates enable row level security;
alter table public.clinical_letters enable row level security;

create policy "Staff view letter templates"
  on public.clinical_letter_templates for select
  using (public.is_staff());

create policy "Authors manage letter templates"
  on public.clinical_letter_templates for all
  using (public.is_letter_author())
  with check (public.is_letter_author());

create policy "Staff view clinical letters"
  on public.clinical_letters for select
  using (public.is_staff());

create policy "Authors insert clinical letters"
  on public.clinical_letters for insert
  with check (public.is_letter_author());

create policy "Authors update clinical letters"
  on public.clinical_letters for update
  using (public.is_letter_author())
  with check (public.is_letter_author());

create policy "Authors delete clinical letters"
  on public.clinical_letters for delete
  using (public.is_letter_author());

create policy "Patients view signed clinical letters"
  on public.clinical_letters for select
  using (
    status in ('signed', 'sent')
    and exists (
      select 1
      from public.patients p
      where p.id = clinical_letters.patient_id
        and p.profile_id = auth.uid()
    )
  );

create policy "Contacts view signed clinical letters"
  on public.clinical_letters for select
  using (
    status in ('signed', 'sent')
    and public.is_portal_contact(patient_id)
  );

insert into public.clinical_letter_templates (
  letter_type,
  title,
  body,
  physiotherapist_name,
  qualifications,
  contact
) values (
  'proof_of_attendance',
  'PROOF OF ATTENDANCE / PHYSIOTHERAPY RECOMMENDATION',
  $body$This is to certify that the above-mentioned patient attended {{practiceName}} on {{attendanceDate}}, presenting with {{presentingComplaint}}. The patient presented with {{findings}} and was assessed and treated accordingly.

Following assessment and treatment, it is recommended that the patient modify {{pronounPossessive}} activities over the next 48 hours to allow for appropriate recovery and symptom management. {{pronounSubjectCap}} is advised to avoid prolonged sitting, sustained postures, and activities that aggravate {{pronounPossessive}} symptoms.

Regular changes in position and intermittent walking, as tolerated, are encouraged to minimise symptom aggravation and facilitate recovery.

Where possible, consideration for temporary modification of {{pronounPossessive}} usual activities and/or work demands during this period would be beneficial.

Thank you for your consideration.$body$,
  'Fouza Abrahams',
  'BSc (Hons) Physiotherapy',
  '+27 64 513 6210 · fouza.physiotherapy@gmail.com'
), (
  'medical_referral',
  'REFERRAL FOR MEDICAL ASSESSMENT',
  $body$I am referring the above-mentioned patient for further medical assessment following {{pronounPossessive}} physiotherapy consultation for {{presentingComplaint}}.

On assessment, the patient presented with {{findings}}

{{recommendations}}

Physiotherapy treatment was provided for {{pronounPossessive}} current symptoms, with advice to modify activities and avoid aggravating positions while awaiting further assessment.

Thank you for your assistance and further management of this patient.$body$,
  'Fouza Abrahams',
  'BSc (Hons) Physiotherapy',
  '+27 64 513 6210 · fouza.physiotherapy@gmail.com'
);
