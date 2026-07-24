-- =============================================================================
-- Phase 3.5 — Security hardening
-- Migration: 20260102000000_security_hardening.sql
-- =============================================================================

-- Force signup role to patient — ignore client-supplied role metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'patient'::public.app_role
  );
  return new;
end;
$$;

-- Prevent non-admins from changing their own role
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change user roles';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation
before update on public.profiles
for each row execute function public.prevent_role_escalation();

-- Tighten profile self-update: users may update identity fields only
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- Prevent updates to locked clinical notes (except admin)
create or replace function public.prevent_locked_note_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.is_locked = true and not public.is_admin() then
    raise exception 'Locked clinical notes cannot be modified';
  end if;
  return new;
end;
$$;

drop trigger if exists clinical_notes_prevent_locked_update on public.clinical_notes;
create trigger clinical_notes_prevent_locked_update
before update on public.clinical_notes
for each row execute function public.prevent_locked_note_update();

-- Document booking path: public/patient inserts go through service-role API (Phase 6).
-- Staff retain full appointment management via existing RLS.
comment on table public.appointments is
  'Appointments. Online booking uses service-role Server Actions with conflict checks; patients read own rows via RLS.';
