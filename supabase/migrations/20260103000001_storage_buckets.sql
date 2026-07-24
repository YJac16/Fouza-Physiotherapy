-- =============================================================================
-- Phase 4 — Storage buckets
-- Migration: 20260103000001_storage_buckets.sql
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('exercise-media', 'exercise-media', false, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
  ('consent-signatures', 'consent-signatures', false, 2097152, array['image/png', 'image/jpeg', 'application/json']),
  ('blog-media', 'blog-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('patient-documents', 'patient-documents', false, 20971520, array['application/pdf', 'image/jpeg', 'image/png']),
  ('invoices', 'invoices', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- Avatars: owners can manage own folder
create policy "Avatar public read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Avatar owner upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Blog media public read"
  on storage.objects for select
  using (bucket_id = 'blog-media');

create policy "Staff write blog media"
  on storage.objects for insert
  with check (bucket_id = 'blog-media' and public.is_staff());

create policy "Staff manage patient documents"
  on storage.objects for all
  using (bucket_id = 'patient-documents' and public.is_staff())
  with check (bucket_id = 'patient-documents' and public.is_staff());

create policy "Staff manage exercise media"
  on storage.objects for all
  using (bucket_id = 'exercise-media' and public.is_staff())
  with check (bucket_id = 'exercise-media' and public.is_staff());

create policy "Staff manage consent signatures storage"
  on storage.objects for all
  using (bucket_id = 'consent-signatures' and public.is_staff())
  with check (bucket_id = 'consent-signatures' and public.is_staff());

create policy "Staff manage invoice pdfs"
  on storage.objects for all
  using (bucket_id = 'invoices' and public.is_staff())
  with check (bucket_id = 'invoices' and public.is_staff());
