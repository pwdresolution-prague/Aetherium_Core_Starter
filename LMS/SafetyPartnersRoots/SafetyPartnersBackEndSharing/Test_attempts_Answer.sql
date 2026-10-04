-- ==========================================================================================
-- Aetherium core v1.0.0 - Basic ============================================================
-- By PWD - Resolution 2023 - 2026 ==========================================================
-- 28_09_2026 - 10:45pm ======================================================================
-- ======================================= TEST_ATTEMPT_ANSWERS ================================


create type question_type as enum ('single_choice', 'multi_choice', 'true_false', 'open_answer');

alter table public.test_questions
  add column question_type question_type not null default 'single_choice';


-- ==========================================================================================
-- STEP 41 ================= Restrukturalizace TEST_ATTEMPT_ANSWERS ===========================
-- ==========================================================================================
-- Původní 'selected_option_id' (STEP 32) uměl jen JEDNU vybranou možnost na otázku.
-- Pro multi_choice potřebujeme víc řádků najednou -> přesouváme do junction tabulky.
-- Pro open_answer potřebujeme volný text.

alter table public.test_attempt_answers
  drop column if exists selected_option_id,
  add column open_answer_text text;

create table public.test_attempt_selected_options (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid not null references public.test_attempt_answers(id) on delete cascade,
  option_id uuid not null references public.test_answer_options(id),
  unique (answer_id, option_id)
);

create index idx_test_attempt_selected_options_answer_id
  on public.test_attempt_selected_options(answer_id);

alter table public.test_attempt_selected_options enable row level security;

create policy "selected_options_select_owned"
  on public.test_attempt_selected_options for select
  using (
    exists (
      select 1 from public.test_attempt_answers taa
      join public.test_attempts ta on ta.id = taa.attempt_id
      where taa.id = test_attempt_selected_options.answer_id
        and public.owns_student(ta.student_id)
    )
  );

create policy "selected_options_insert_own"
  on public.test_attempt_selected_options for insert
  with check (
    exists (
      select 1 from public.test_attempt_answers taa
      join public.test_attempts ta on ta.id = taa.attempt_id
      where taa.id = test_attempt_selected_options.answer_id
        and ta.student_id = auth.uid()
        and ta.finished_at is null
    )
  );

create policy "selected_options_admin_full_access"
  on public.test_attempt_selected_options for all using (public.is_admin());


-- ==========================================================================================
-- STEP 42 ================= TEST_ATTEMPTS: podpora ručního hodnocení =========================
-- ==========================================================================================

alter table public.test_attempts
  add column grading_status text not null default 'auto'
    check (grading_status in ('auto', 'pending_manual', 'manually_graded')),
  add column graded_by uuid references public.profiles(id),
  add column graded_at timestamptz;
