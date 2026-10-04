-- ==========================================================================================
-- STEP 35 ================= Trigger: auto-založení certifikátu po úspěšném testu =============
-- ==========================================================================================

create or replace function public.handle_test_passed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Spustí se jen v okamžiku PŘECHODU na passed = true, ne při každém update řádku
  if new.passed = true and (old.passed is distinct from true) then
    insert into public.certificates (student_id, attempt_id, certificate_status)
    values (new.student_id, new.id, 'pending_issue');
  end if;
  return new;
end;
$$;

create trigger trg_test_attempts_issue_certificate
  after update on public.test_attempts
  for each row
  execute function public.handle_test_passed();
