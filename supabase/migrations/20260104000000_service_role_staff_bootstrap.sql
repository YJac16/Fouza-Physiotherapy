-- Allow service-role clients to update profiles.role (staff bootstrap / admin scripts).
-- End-user escalation remains blocked via is_admin() for authenticated sessions.

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
