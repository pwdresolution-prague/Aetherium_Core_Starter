-- ==========================================================================================
-- STEP 33 ================= Funkce SUBMIT_TEST_ATTEMPT() =====================================
-- ==========================================================================================
-- Vyhodnotí pokus o test PROTI test_answer_keys, které student nikdy nevidí,
-- a zapíše výsledek. Volá se z frontendu jako RPC (supabase.rpc('submit_test_attempt', ...)),
-- ne přímým UPDATE na test_attempts (na to policy z STEP 31 schválně nedává právo).

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
  v_total_questions integer;
  v_correct_answers integer;
  v_score numeric(5,2);
  v_min_score numeric(5,2);
  v_passed boolean;
  v_course_id uuid;
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

  -- Kolik otázek test celkem má
  select count(*) into v_total_questions
  from public.test_questions tq
  join public.test_topics tt on tt.id = tq.topic_id
  join public.test_stages ts on ts.id = tt.stage_id
  where ts.test_id = v_test_id;

  if v_total_questions = 0 then
    raise exception 'Test nemá žádné otázky';
  end if;

  -- Kolik student trefil správně - JOIN na test_answer_keys, kam student nemá RLS přístup,
  -- ale tahle funkce (security definer) ano
  select count(*) into v_correct_answers
  from public.test_attempt_answers taa
  join public.test_answer_keys tak on tak.option_id = taa.selected_option_id
  where taa.attempt_id = p_attempt_id
    and tak.is_correct = true;

  v_score := round((v_correct_answers::numeric / v_total_questions) * 100, 2);

  select nullif(requirement_value, '')::numeric
    into v_min_score
  from public.test_pass_requirements
  where test_id = v_test_id and requirement_name = 'min_score_percent'
  limit 1;

  if v_min_score is null then
    v_min_score := 80; -- bezpečný default, pokud test nemá definovaný práh
  end if;

  v_passed := v_score >= v_min_score;

  update public.test_attempts
  set score = v_score,
