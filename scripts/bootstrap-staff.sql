-- Bootstrap staff accounts (run once against Fouza Physiotherapy data project)
-- Prefer: npx tsx scripts/bootstrap-practice-admin.ts for fouza.physiotherapy@gmail.com
alter table public.profiles disable trigger profiles_prevent_role_escalation;

update public.profiles
set role = 'admin'::public.app_role,
    full_name = 'Fouza Abrahams'
where email = 'fouza.physiotherapy@gmail.com';

update public.profiles
set role = 'admin'::public.app_role,
    full_name = 'Fouza Abrahams'
where email = 'fouzaabrahams0404@gmail.com';

update public.profiles
set role = 'receptionist'::public.app_role,
    full_name = 'Yaseen',
    email = 'fouzaphysiotherapist@gmail.com'
where email = 'fouzaphysiotherapist@gmail.com';

insert into public.practitioners (profile_id, title, bio, specialties, is_active)
select p.id,
       'Founder & Physiotherapist',
       'BSc Physiotherapy (UCT). HPCSA Registered Physiotherapist.',
       array['musculoskeletal','rehab','injury prevention'],
       true
from public.profiles p
where p.email = 'fouza.physiotherapy@gmail.com'
on conflict (profile_id) do update
set title = excluded.title,
    bio = excluded.bio,
    specialties = excluded.specialties,
    is_active = true;

alter table public.profiles enable trigger profiles_prevent_role_escalation;

create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and not public.is_admin()
     and coalesce(auth.jwt() ->> 'role', '') is distinct from 'service_role' then
    raise exception 'Only admins can change user roles';
  end if;
  return new;
end;
$$;

select email, full_name, role from public.profiles order by email;
