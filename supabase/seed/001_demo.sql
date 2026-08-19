-- Seed: demo services (no PHI)
insert into public.services (name, slug, description, duration_minutes, price_cents, currency, is_bookable_online, is_active)
values
  ('Initial Consultation', 'initial-consultation', 'Comprehensive assessment and first treatment.', 60, 100000, 'ZAR', true, true),
  ('Follow-up Consultation', 'follow-up-consultation', 'Focused follow-up for one joint or region.', 45, 60000, 'ZAR', true, true),
  ('Double Follow-up', 'double-follow-up', 'Extended session for two regions.', 90, 80000, 'ZAR', true, true),
  ('Injury Prevention Assessment', 'injury-prevention', 'Movement screening and prevention plan.', 60, 60000, 'ZAR', true, true),
  ('Dry Needling', 'dry-needling', 'Targeted dry needling per unit.', 15, 10000, 'ZAR', false, true),
  ('Referral', 'referral', 'Referral letter or referral service.', 15, 10000, 'ZAR', false, true),
  ('Individualised Home Exercise Program', 'home-exercise-program', 'Personalised home exercise programme.', 15, 10000, 'ZAR', false, true),
  ('Travel', 'travel', 'Travel surcharge for home visits.', 15, 15000, 'ZAR', false, true)
on conflict (slug) do nothing;

insert into public.consent_forms (title, slug, body_md, version, is_active)
values
(
  'Consent to Physiotherapy Treatment',
  'treatment-consent',
  E'# Consent to Physiotherapy Treatment\n\nSee migration 20260105000000 for full body.',
  1,
  true
),
(
  'Consent to Responsibility of Physiotherapy Account',
  'account-responsibility',
  E'# Consent to Responsibility of Physiotherapy Account\n\nSee migration 20260105000000 for full body.',
  1,
  true
)
on conflict (slug) do nothing;

insert into public.intake_forms (title, slug, schema_json, is_active)
values (
  'Fouza Physiotherapy Consent Form',
  'fouza-consent-intake',
  '{"version":1,"sections":["patient_details","account_responsible","medical_aid","release_information","referral_source","undertaking","please_note"]}'::jsonb,
  true
)
on conflict (slug) do nothing;

insert into public.practice_settings (key, value)
values
  ('booking.timezone', '"Africa/Johannesburg"'::jsonb),
  ('booking.hold_minutes', '10'::jsonb),
  ('billing.currency', '"ZAR"'::jsonb),
  ('practice.number', '"0932469"'::jsonb),
  ('practice.pt_number', '"0137855"'::jsonb)
on conflict (key) do nothing;
