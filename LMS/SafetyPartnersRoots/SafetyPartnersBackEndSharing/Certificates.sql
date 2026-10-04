-- ==========================================================================================
-- STEP 34 ================= Tabulka CERTIFICATES ==============================================
-- ==========================================================================================

create type certificate_status as enum ('pending_issue', 'issued', 'revoked', 'expired');

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id),
  attempt_id uuid references public.test_attempts(id),  -- PŘIDÁNO oproti excelu, viz vysvětlení
  stage_id uuid references public.course_stages(id),
  topic_id uuid references public.course_topics(id),
  iso_standard text,
  issued_at timestamptz,
  expires_at timestamptz,
  description text,
  law_reference text,
  issuing_company_name text,
  issuing_authority_id uuid,
  instructor_name text,
  trademark_info text,
  certificate_status certificate_status not null default 'pending_issue',
  certificate_template_id uuid,   -- FK doplníme, až vznikne tabulka šablon (otevřená otázka z excelu)
  certificate_number text unique,
  pdf_url text,
  created_at timestamptz not null default now()
);

create index idx_certificates_student_id on public.certificates(student_id);

alter table public.certificates enable row level security;

create policy "certificates_select_owned"
  on public.certificates for select
  using (public.owns_student(student_id));

create policy "certificates_admin_full_access"
  on public.certificates for all using (public.is_admin());
