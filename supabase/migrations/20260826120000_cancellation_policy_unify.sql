-- Unify cancellation policy: 6 hours notice, 50% fee for late cancel / no-show

update public.consent_forms
set
  body_md = replace(
    body_md,
    'I hereby declare that at least 4 hours'' notice of cancellation is required.

Appointments not kept will be charged to your account and this fee is not refundable from your medical aid.',
    'I hereby declare that at least 6 hours'' notice of cancellation is required.

Appointments not kept will be charged 50% of the consultation fee if not cancelled at least 6 hours beforehand. This fee is not refundable from your medical aid.'
  ),
  version = version + 1,
  updated_at = now()
where slug = 'account-responsibility'
  and body_md like '%4 hours%';
