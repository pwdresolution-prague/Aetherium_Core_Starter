-- ==========================================================================================
-- STEP 21 ================= Tabulka TESTS ====================================================
-- ==========================================================================================
-- Znovupoužívám enum course_status (draft/published/archived) - stejný životní cyklus

create table public.tests (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  status course_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_tests_updated_at
  before update on public.tests
  for each row execute function public.set_updated_at();

create index idx_tests_course_id on public.tests(course_id);

alter table public.tests enable row level security;

create policy "tests_select_published"
  on public.tests for select
  using (status = 'published' or public.is_admin());

create policy "tests_admin_full_access"
  on public.tests for all using (public.is_admin());


-- ==========================================================================================
-- STEP 22 ================= Tabulka TEST_STAGES ==============================================
-- ==========================================================================================

create table public.test_stages (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  description text,
  visibility_scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_test_stages_updated_at
  before update on public.test_stages
  for each row execute function public.set_updated_at();

create index idx_test_stages_test_id on public.test_stages(test_id);

alter table public.test_stages enable row level security;

create policy "test_stages_select_visible"
  on public.test_stages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.tests t
      where t.id = test_stages.test_id and t.status = 'published'
    )
  );

create policy "test_stages_admin_full_access"
  on public.test_stages for all using (public.is_admin());


-- ==========================================================================================
-- STEP 23 ================= Tabulka TEST_TOPICS ==============================================
-- ==========================================================================================

create table public.test_topics (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.test_stages(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  description text,
  visibility_scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_test_topics_updated_at
  before update on public.test_topics
  for each row execute function public.set_updated_at();

create index idx_test_topics_stage_id on public.test_topics(stage_id);

alter table public.test_topics enable row level security;

create policy "test_topics_select_visible"
  on public.test_topics for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.test_stages ts
      join public.tests t on t.id = ts.test_id
      where ts.id = test_topics.stage_id and t.status = 'published'
    )
  );

create policy "test_topics_admin_full_access"
  on public.test_topics for all using (public.is_admin());


-- ==========================================================================================
-- STEP 24 ================= Tabulka TEST_MATERIALS ===========================================
-- ==========================================================================================

create table public.test_materials (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.test_topics(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  description text,
  file_url text,
  storage_path text,
  visibility_scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_test_materials_updated_at
  before update on public.test_materials
  for each row execute function public.set_updated_at();

create index idx_test_materials_topic_id on public.test_materials(topic_id);

alter table public.test_materials enable row level security;

create policy "test_materials_select_visible"
  on public.test_materials for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.test_topics tt
      join public.test_stages ts on ts.id = tt.stage_id
      join public.tests t on t.id = ts.test_id
      where tt.id = test_materials.topic_id and t.status = 'published'
    )
  );

create policy "test_materials_admin_full_access"
  on public.test_materials for all using (public.is_admin());


-- ==========================================================================================
-- STEP 25 ================= Tabulka TEST_QUESTIONS ===========================================
-- ==========================================================================================

create table public.test_questions (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.test_topics(id) on delete cascade,
  title text not null,             -- text otázky
  sort_order integer not null default 0,
  description text,
  visibility_scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_test_questions_updated_at
  before update on public.test_questions
  for each row execute function public.set_updated_at();

create index idx_test_questions_topic_id on public.test_questions(topic_id);

alter table public.test_questions enable row level security;

create policy "test_questions_select_visible"
  on public.test_questions for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.test_topics tt
      join public.test_stages ts on ts.id = tt.stage_id
      join public.tests t on t.id = ts.test_id
      where tt.id = test_questions.topic_id and t.status = 'published'
    )
  );

create policy "test_questions_admin_full_access"
  on public.test_questions for all using (public.is_admin());


-- ==========================================================================================
-- STEP 26 ================= Tabulka TEST_ANSWER_OPTIONS (BEZ správné odpovědi) ===============
-- ==========================================================================================

create table public.test_answer_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.test_questions(id) on delete cascade,
  answer_text text not null,
  sort_order integer not null default 0,
  visibility_scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_test_answer_options_updated_at
  before update on public.test_answer_options
  for each row execute function public.set_updated_at();

create index idx_test_answer_options_question_id on public.test_answer_options(question_id);

alter table public.test_answer_options enable row level security;

create policy "test_answer_options_select_visible"
  on public.test_answer_options for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.test_questions tq
      join public.test_topics tt on tt.id = tq.topic_id
      join public.test_stages ts on ts.id = tt.stage_id
      join public.tests t on t.id = ts.test_id
      where tq.id = test_answer_options.question_id and t.status = 'published'
    )
  );

create policy "test_answer_options_admin_full_access"
  on public.test_answer_options for all using (public.is_admin());


-- ==========================================================================================
-- STEP 27 ================= Tabulka TEST_ANSWER_KEYS (správné odpovědi - jen admin) ==========
-- ==========================================================================================

create table public.test_answer_keys (
  option_id uuid primary key references public.test_answer_options(id) on delete cascade,
  is_correct boolean not null default false,
  explanation text
);

alter table public.test_answer_keys enable row level security;

-- ZÁMĚRNĚ jediná politika: admin. Student/Client/Subscriber nemají žádný přístup.
create policy "test_answer_keys_admin_only"
  on public.test_answer_keys for all using (public.is_admin());


-- ==========================================================================================
-- STEP 28 ================= Tabulka TEST_PASS_REQUIREMENTS ===================================
-- ==========================================================================================

create table public.test_pass_requirements (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.tests(id) on delete cascade,
  requirement_name text not null,
  requirement_value text not null,
  sort_order integer not null default 0,
  description text,
  visibility_scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_test_pass_requirements_updated_at
  before update on public.test_pass_requirements
  for each row execute function public.set_updated_at();

create index idx_test_pass_requirements_test_id on public.test_pass_requirements(test_id);

alter table public.test_pass_requirements enable row level security;

create policy "test_pass_requirements_select_visible"
  on public.test_pass_requirements for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.tests t
      where t.id = test_pass_requirements.test_id and t.status = 'published'
    )
  );

create policy "test_pass_requirements_admin_full_access"
  on public.test_pass_requirements for all using (public.is_admin());
