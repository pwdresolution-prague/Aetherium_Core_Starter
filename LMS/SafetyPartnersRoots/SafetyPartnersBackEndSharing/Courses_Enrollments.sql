-- ==========================================================================================
-- STEP 30 ================= Tabulka COURSE_ENROLLMENTS ========================================
-- ==========================================================================================

create type enrollment_status as enum ('assigned', 'in_progress', 'completed', 'expired');

create table public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid not null references public.courses(id),
  order_id uuid references public.orders(id),      -- NULL = přiřazeno zdarma/adminem, ne přes platbu
  assigned_by uuid references public.profiles(id),
  status enrollment_status not null default 'assigned',
  enrolled_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,

  unique (student_id, course_id)   -- nejde zapsat stejného studenta na stejný kurz dvakrát
);

create index idx_course_enrollments_student_id on public.course_enrollments(student_id);
create index idx_course_enrollments_course_id on public.course_enrollments(course_id);

alter table public.course_enrollments enable row level security;

create policy "enrollments_select_owned"
  on public.course_enrollments for select
  using (public.owns_student(student_id));

create policy "enrollments_insert_owned"
  on public.course_enrollments for insert
  with check (public.owns_student(student_id));

create policy "enrollments_admin_full_access"
  on public.course_enrollments for all using (public.is_admin());
