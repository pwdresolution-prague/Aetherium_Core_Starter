-- ==========================================================================================
-- STEP 49 ================= View CERTIFICATES_EXPIRING_SOON ==================================
-- ==========================================================================================

create or replace view public.certificates_expiring_soon
with (security_invoker = true)
as
select
  c.id as certificate_id,
  c.certificate_number,
  c.expires_at,
  s.id as student_id,
  s.first_name,
  s.last_name,
  s.phone,
  s.email
from public.certificates c
join public.students s on s.id = c.student_id
where c.certificate_status = 'issued'
  and c.expires_at is not null
  and c.expires_at between now() and now() + interval '30 days';
