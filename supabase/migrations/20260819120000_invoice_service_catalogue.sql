-- Invoice service catalogue: align prices and add invoice-only add-ons.

update public.services
set
  price_cents = 100000,
  updated_at = timezone('utc', now())
where slug = 'initial-consultation';

insert into public.services (
  name,
  slug,
  description,
  duration_minutes,
  price_cents,
  currency,
  is_bookable_online,
  is_active
)
values
  (
    'Dry Needling',
    'dry-needling',
    'Targeted dry needling per unit.',
    15,
    10000,
    'ZAR',
    false,
    true
  ),
  (
    'Referral',
    'referral',
    'Referral letter or referral service.',
    15,
    10000,
    'ZAR',
    false,
    true
  ),
  (
    'Individualised Home Exercise Program',
    'home-exercise-program',
    'Personalised home exercise programme.',
    15,
    10000,
    'ZAR',
    false,
    true
  ),
  (
    'Travel',
    'travel',
    'Travel surcharge for home visits.',
    15,
    15000,
    'ZAR',
    false,
    true
  )
on conflict (slug) do nothing;
