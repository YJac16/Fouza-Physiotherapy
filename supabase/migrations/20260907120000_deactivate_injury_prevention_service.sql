-- Remove Injury Prevention Assessment from active bookable catalogues.
-- Historical appointments and invoices keep their service_id reference.

update public.services
set
  is_active = false,
  is_bookable_online = false,
  updated_at = timezone('utc', now())
where slug = 'injury-prevention'
   or slug in ('sports-injury-prevention', 'sports-and-injury-prevention')
   or lower(name) like '%sports%injury%prevention%';
