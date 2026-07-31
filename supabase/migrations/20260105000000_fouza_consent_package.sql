-- Patient fields for consent intake + Fouza consent package seed + Fouza availability

alter table public.patients
  add column if not exists id_number text,
  add column if not exists medical_aid_dependant_code text,
  add column if not exists postal_address text;

-- Deactivate stub forms
update public.consent_forms
set is_active = false
where slug = 'general-treatment-consent';

update public.intake_forms
set is_active = false
where slug = 'new-patient-intake';

insert into public.consent_forms (title, slug, body_md, version, is_active)
values
(
  'Consent to Physiotherapy Treatment',
  'treatment-consent',
  E'# Consent to Physiotherapy Treatment

1. During assessment and treatment, I may be required to expose specific body parts related to my condition or injury. I understand that I may refuse when I feel uncomfortable.
2. During assessment/treatment, the physiotherapist may be required to touch me in order to provide effective treatment and I should inform them if I am uncomfortable in them doing so.
3. I have the right to withdraw this consent at any time or for a specific treatment procedure.
4. I understand that the physiotherapist will explain the benefits and risks of a specific procedure or modality, and will inform me of any alternative.
5. I understand that there are small possibilities of risks or side-effects to the treatment and this would be discussed with the physiotherapist. I also understand and trust that the physiotherapist would take all necessary precautions to avoid these risks.
6. I understand that I am able to ask the physiotherapist any questions during or after the physiotherapy session.
7. I give consent for Fouza Physiotherapy to disclose information regarding my diagnosis (ICD10 Coding), medical condition, prognosis and treatment program for account rendering purposes and appropriate referral. Any other information released will be discussed with the signatory according to the POPI Act (Act number 4 of 2013).

I hereby willingly consent to the treatment offered and recommended to me by my physiotherapist(s). I therefore intend to verbally consent to future physiotherapy sessions.',
  1,
  true
),
(
  'Consent to Responsibility of Physiotherapy Account',
  'account-responsibility',
  E'# Consent to Responsibility of Physiotherapy Account

I the undersigned hereby accept full financial responsibility for this account until it is settled in full.

I hereby declare all personal and financial information as true and correct.

This practice is a cash practice and not contracted to medical aid.

I understand I will be responsible for all legal fees involved, if legal action is needed to collect any outstanding fees.

I hereby declare that the billing procedures of this practice have been discussed with me and that I do understand the conditions and implications thereof.

Due to the nature of our business, price estimate given prior to procedure may vary to the actual total received at the end of the procedure.

I hereby declare that at least 4 hours'' notice of cancellation is required.

Appointments not kept will be charged to your account and this fee is not refundable from your medical aid.

**PLEASE NOTE:** I submit my statement directly to you and NOT your medical aid. You are responsible for settlement of the bill. Please contact your medical aid to check your physiotherapy benefits and the rules pertaining to Allied Providers. Unfortunately, benefits vary between various plans and you may not always be reimbursed by your scheme.',
  1,
  true
)
on conflict (slug) do update
set
  title = excluded.title,
  body_md = excluded.body_md,
  is_active = true,
  version = public.consent_forms.version + 1;

insert into public.intake_forms (title, slug, schema_json, is_active)
values (
  'Fouza Physiotherapy Consent Form',
  'fouza-consent-intake',
  '{
    "version": 1,
    "sections": [
      "patient_details",
      "account_responsible",
      "medical_aid",
      "release_information",
      "referral_source",
      "undertaking",
      "please_note"
    ]
  }'::jsonb,
  true
)
on conflict (slug) do update
set
  title = excluded.title,
  schema_json = excluded.schema_json,
  is_active = true;

-- Exclusive Mon–Fri 09:00–17:00 availability for Fouza practitioner (if profile exists)
insert into public.availability_rules (
  practitioner_id, day_of_week, start_time, end_time, slot_minutes, is_active
)
select pr.id, d.day_of_week, time '09:00', time '17:00', 60, true
from public.practitioners pr
join public.profiles p on p.id = pr.profile_id
cross join (values (1), (2), (3), (4), (5)) as d(day_of_week)
where lower(p.email) = 'fouzaabrahams0404@gmail.com'
  and pr.is_active = true
  and not exists (
    select 1
    from public.availability_rules ar
    where ar.practitioner_id = pr.id
      and ar.day_of_week = d.day_of_week
      and ar.start_time = time '09:00'
      and ar.end_time = time '17:00'
  );
