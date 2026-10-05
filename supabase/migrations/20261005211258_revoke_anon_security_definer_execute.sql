-- BCS Phase A: remove anon (and PUBLIC) EXECUTE on SECURITY DEFINER functions
-- Applied in production as 20261005211258_revoke_anon_security_definer_execute.
-- Why PUBLIC too: 9 of these functions also carry a PUBLIC grant (=X/postgres) on top of
-- the explicit anon grant. Revoking only from anon would leave them callable through PUBLIC.
-- authenticated and service_role keep their own explicit grants, so they are not affected.
-- is_staff() is deliberately left out (see report: public-read RLS policies call it as anon).

-- Trigger functions (Postgres does not check EXECUTE when a trigger fires)
revoke execute on function public.handle_new_user()                     from public, anon;
revoke execute on function public.guard_patient_verification_columns()  from public, anon;
revoke execute on function public.prevent_locked_note_update()          from public, anon;
revoke execute on function public.prevent_role_escalation()             from public, anon;

-- RPCs the app calls only through service role or a staff session
revoke execute on function public.next_invoice_number()                 from public, anon;
revoke execute on function public.purge_expired_appointment_holds()     from public, anon;
revoke execute on function public.refresh_invoice_payment_status(uuid)  from public, anon;
revoke execute on function public.practice_finance_snapshot(timestamptz, timestamptz, date, date) from public, anon;

-- Auth helper functions (always false/null for anon; anon-facing RLS never needs them)
revoke execute on function public.current_user_role()                   from public, anon;
revoke execute on function public.is_admin()                            from public, anon;
revoke execute on function public.is_letter_author()                    from public, anon;
revoke execute on function public.is_portal_contact(uuid)               from public, anon;

-- Re-grant what should stay (does nothing if already granted; records the intent)
grant execute on function public.current_user_role()       to authenticated, service_role;
grant execute on function public.is_admin()                to authenticated, service_role;
grant execute on function public.is_letter_author()        to authenticated, service_role;
grant execute on function public.is_portal_contact(uuid)   to authenticated, service_role;
grant execute on function public.refresh_invoice_payment_status(uuid) to authenticated, service_role;
grant execute on function public.practice_finance_snapshot(timestamptz, timestamptz, date, date) to authenticated, service_role;
grant execute on function public.next_invoice_number()               to service_role;
grant execute on function public.purge_expired_appointment_holds()   to service_role;
