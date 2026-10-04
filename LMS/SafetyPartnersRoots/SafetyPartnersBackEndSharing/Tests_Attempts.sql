-- ==========================================================================================
-- Aetherium core v1.0.0 - Basic ============================================================
-- By PWD - Resolution 2023 - 2026 ==========================================================
-- 28_09_2026 - 10:45pm ======================================================================
-- ======================================= Test_Attempts ================================


create or replace function public.submit_test_attempt(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
  v_test_id uuid;
  v_finished_at timestamptz;
  v_has_open_answer boolean;
  v_total_auto_questions integer := 0;
  v_correct_auto_questions integer := 0;
  v_score numeric(5,2);
  v_min_score numeric(5,2);
  v_passed boolean;
  v_grading_status text;
  q record;
begin
  select student_id, test_id, finished_at
    into v_student_id, v_test_id, v_finished_at
  from public.test_attempts
  where id = p_attempt_id;

  if v_student_id is null then
    raise exception 'Pokus nenalezen';
  end if;

  if v_student_id != auth.uid() then
    raise exception 'Nejsi vlastníkem tohoto pokusu';
  end if;

  if v_finished_at is not null then
    raise exception 'Tento pokus už byl vyhodnocen';
  end if;

  -- Projdi otázku po otázce - typ určuje způsob vyhodnocení
  for q in
    select tq.id as question_id, tq.question_type
    from public.test_questions tq
    join public.test_topics tt on tt.id = tq.topic_id
    join public.test_stages ts on ts.id = tt.stage_id
    where ts.test_id = v_test_id
  loop
    if q.question_type = 'open_answer' then
      continue; -- open_answer se do automatického skóre nepočítá vůbec
    end if;

    v_total_auto_questions := v_total_auto_questions + 1;

    if q.question_type = 'single_choice' or q.question_type = 'true_false' then
      -- Správně = vybraná JEDNA možnost a ta je is_correct = true
      if exists (
        select 1
        from public.test_attempt_answers taa
        join public.test_attempt_selected_options tso on tso.answer_id = taa.id
        join public.test_answer_keys tak on tak.option_id = tso.option_id
        where taa.attempt_id = p_attempt_id
          and taa.question_id = q.question_id
          and tak.is_correct = true
      ) then
        v_correct_auto_questions := v_correct_auto_questions + 1;
      end if;

    elsif q.question_type = 'multi_choice' then
      -- Správně = množina vybraných možností PŘESNĚ odpovídá množině správných
      -- (žádná chybí, žádná navíc) - proto porovnání přes dva NOT EXISTS
      if not exists (
        -- vybral nesprávnou možnost
        select 1
        from public.test_attempt_answers taa
        join public.test_attempt_selected_options tso on tso.answer_id = taa.id
        join public.test_answer_keys tak on tak.option_id = tso.option_id
        where taa.attempt_id = p_attempt_id
          and taa.question_id = q.question_id
          and tak.is_correct = false
      ) and not exists (
        -- NEvybral některou správnou možnost
        select 1
        from public.test_answer_options tao
        join public.test_answer_keys tak on tak.option_id = tao.id
        where tao.question_id = q.question_id
          and tak.is_correct = true
          and not exists (
            select 1
            from public.test_attempt_answers taa
            join public.test_attempt_selected_options tso on tso.answer_id = taa.id
            where taa.attempt_id = p_attempt_id
              and taa.question_id = q.question_id
              and tso.option_id = tao.id
          )
      ) then
        v_correct_auto_questions := v_correct_auto_questions + 1;
      end if;
    end if;
  end loop;

  select exists (
    select 1
    from public.test_questions tq
    join public.test_topics tt on tt.id = tq.topic_id
    join public.test_stages ts on ts.id = tt.stage_id
    where ts.test_id = v_test_id and tq.question_type = 'open_answer'
  ) into v_has_open_answer;

  if v_total_auto_questions = 0 then
    v_score := null; -- test je čistě open_answer, skóre dá až admin
  else
    v_score := round((v_correct_auto_questions::numeric / v_total_auto_questions) * 100, 2);
  end if;

  select nullif(requirement_value, '')::numeric into v_min_score
  from public.test_pass_requirements
  where test_id = v_test_id and requirement_name = 'min_score_percent'
  limit 1;

  if v_min_score is null then
    v_min_score := 80;
  end if;

  if v_has_open_answer then
    v_grading_status := 'pending_manual';
    v_passed := null;      -- čeká na admina, viz grade_open_answer() níž
  else
    v_grading_status := 'auto';
    v_passed := v_score >= v_min_score;
  end if;

  update public.test_attempts
  set score = v_score,
      passed = v_passed,
      grading_status = v_grading_status,
      finished_at = case when v_has_open_answer then null else now() end
  where id = p_attempt_id;

  if v_passed = true then
    update public.course_enrollments ce
    set status = 'completed', completed_at = now()
    from public.tests t
    where t.id = v_test_id
      and ce.student_id = v_student_id
      and ce.course_id = t.course_id;
  end if;

  return jsonb_build_object(
    'score', v_score,
    'passed', v_passed,
    'grading_status', v_grading_status,
    'correct_auto', v_correct_auto_questions,
    'total_auto', v_total_auto_questions,
    'min_score_required', v_min_score
  );
end;
$$;

grant execute on function public.submit_test_attempt(uuid) to authenticated;


-- ==========================================================================================
-- STEP 44 ================= GRADE_OPEN_ANSWER() - admin dokončí ruční hodnocení ===============
-- ==========================================================================================

create or replace function public.grade_open_answer(
  p_attempt_id uuid,
  p_final_passed boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_test_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Jen admin smí ručně hodnotit otevřené otázky';
  end if;

  select test_id into v_test_id from public.test_attempts where id = p_attempt_id;

  if v_test_id is null then
    raise exception 'Pokus nenalezen';
  end if;

  update public.test_attempts
  set passed = p_final_passed,
      grading_status = 'manually_graded',
      graded_by = auth.uid(),
      graded_at = now(),
      finished_at = now()
  where id = p_attempt_id;

  if p_final_passed then
    update public.course_enrollments ce
    set status = 'completed', completed_at = now()
    from public.tests t
    where t.id = v_test_id
      and ce.student_id = (select student_id from public.test_attempts where id = p_attempt_id)
      and ce.course_id = t.course_id;
  end if;

  return jsonb_build_object('passed', p_final_passed, 'grading_status', 'manually_graded');
end;
$$;

grant execute on function public.grade_open_answer(uuid, boolean) to authenticated;
