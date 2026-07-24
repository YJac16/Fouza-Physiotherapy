-- Seed: demo services (no PHI)
insert into public.services (name, slug, description, duration_minutes, price_cents, currency, is_bookable_online, is_active)
values
  ('Initial Consultation', 'initial-consultation', 'Comprehensive assessment and first treatment.', 60, 70000, 'ZAR', true, true),
  ('Follow-up Consultation', 'follow-up-consultation', 'Focused follow-up for one joint or region.', 45, 60000, 'ZAR', true, true),
  ('Double Follow-up', 'double-follow-up', 'Extended session for two regions.', 90, 80000, 'ZAR', true, true),
  ('Injury Prevention Assessment', 'injury-prevention', 'Movement screening and prevention plan.', 60, 60000, 'ZAR', true, true)
on conflict (slug) do nothing;

insert into public.consent_forms (title, slug, body_md, version, is_active)
values (
  'General Treatment Consent',
  'general-treatment-consent',
  E'# Consent to Physiotherapy Treatment\n\nI consent to assessment and treatment by Fouza Physiotherapy...',
  1,
  true
)
on conflict (slug) do nothing;

insert into public.intake_forms (title, slug, schema_json, is_active)
values (
  'New Patient Intake',
  'new-patient-intake',
  '{"fields":["medical_history","medications","goals","allergies"]}'::jsonb,
  true
)
on conflict (slug) do nothing;

insert into public.practice_settings (key, value)
values
  ('booking.timezone', '"Africa/Johannesburg"'::jsonb),
  ('booking.hold_minutes', '10'::jsonb),
  ('billing.currency', '"ZAR"'::jsonb)
on conflict (key) do nothing;
