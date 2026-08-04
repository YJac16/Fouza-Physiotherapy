-- Soften treatment consent item 7 (information sharing / POPI wording)

update public.consent_forms
set
  body_md = replace(
    body_md,
    E'7. I give consent for Fouza Physiotherapy to disclose information regarding my diagnosis (ICD10 Coding), medical condition, prognosis and treatment program for account rendering purposes and appropriate referral. Any other information released will be discussed with the signatory according to the POPI Act (Act number 4 of 2013).',
    E'7. I understand that, where necessary for my treatment, referral, medical scheme claims, or account rendering, relevant personal and health information (including ICD-10 diagnosis codes) may be shared with authorised parties. My personal information will be processed in accordance with the Protection of Personal Information Act, 2013 (Act No. 4 of 2013).'
  ),
  version = public.consent_forms.version + 1
where slug = 'treatment-consent'
  and is_active = true
  and body_md like '%7. I give consent for Fouza Physiotherapy to disclose information regarding my diagnosis (ICD10 Coding)%';
