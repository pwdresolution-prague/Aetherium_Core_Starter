-- ==========================================================================================
-- STEP 16 ================= Tabulka COURSES ==================================================
-- ==========================================================================================

create type course_status as enum ('draft', 'published', 'archived');

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  status course_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_courses_updated_at
  before update on public.courses
  for each row
  execute function public.set_updated_at();

alter table public.courses enable row level security;

-- Katalog kurzů vidí kdokoliv přihlášený, ALE jen ty publikované
create policy "courses_select_published"
  on public.courses for select
  using (status = 'published' or public.is_admin());

create policy "courses_admin_full_access"
  on public.courses for all using (public.is_admin());


-- ==========================================================================================
-- STEP 17 ================= Tabulka COURSE_STAGES ==========================================
-- ==========================================================================================

create table public.course_stages (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  description text,
  visibility_scope text,   -- viz otevřená otázka pod kódem
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_course_stages_updated_at
  before update on public.course_stages
  for each row
  execute function public.set_updated_at();

create index idx_course_stages_course_id on public.course_stages(course_id);

alter table public.course_stages enable row level security;

create policy "course_stages_select_visible"
  on public.course_stages for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.courses c
      where c.id = course_stages.course_id and c.status = 'published'
    )
  );

create policy "course_stages_admin_full_access"
  on public.course_stages for all using (public.is_admin());


-- ==========================================================================================
-- STEP 18 ================= Tabulka COURSE_TOPICS ============================================
-- ==========================================================================================

create table public.course_topics (
  id uuid primary key default gen_random_uuid(),
  stage_id uuid not null references public.course_stages(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  description text,
  visibility_scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_course_topics_updated_at
  before update on public.course_topics
  for each row
  execute function public.set_updated_at();

create index idx_course_topics_stage_id on public.course_topics(stage_id);

alter table public.course_topics enable row level security;

create policy "course_topics_select_visible"
  on public.course_topics for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.course_stages cs
      join public.courses c on c.id = cs.course_id
      where cs.id = course_topics.stage_id and c.status = 'published'
    )
  );

create policy "course_topics_admin_full_access"
  on public.course_topics for all using (public.is_admin());


-- ==========================================================================================
-- STEP 19 ================= Tabulka COURSE_LESSONS ===========================================
-- ==========================================================================================

create table public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.course_topics(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  description text,
  visibility_scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_course_lessons_updated_at
  before update on public.course_lessons
  for each row
  execute function public.set_updated_at();

create index idx_course_lessons_topic_id on public.course_lessons(topic_id);

alter table public.course_lessons enable row level security;

create policy "course_lessons_select_visible"
  on public.course_lessons for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.course_topics ct
      join public.course_stages cs on cs.id = ct.stage_id
      join public.courses c on c.id = cs.course_id
      where ct.id = course_lessons.topic_id and c.status = 'published'
    )
  );

create policy "course_lessons_admin_full_access"
  on public.course_lessons for all using (public.is_admin());


-- ==========================================================================================
-- STEP 20 ================= Tabulka COURSE_MATERIALS =========================================
-- ==========================================================================================

create table public.course_materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.course_lessons(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  description text,
  file_url text,          -- Storage public URL (pro veřejné materiály)
  storage_path text,      -- Storage interní cesta (pro RLS-chráněné materiály)
  visibility_scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_course_materials_updated_at
  before update on public.course_materials
  for each row
  execute function public.set_updated_at();

create index idx_course_materials_lesson_id on public.course_materials(lesson_id);

alter table public.course_materials enable row level security;

create policy "course_materials_select_visible"
  on public.course_materials for select
  using (
    public.is_admin()
    or exists (
      select 1 from public.course_lessons cl
      join public.course_topics ct on ct.id = cl.topic_id
      join public.course_stages cs on cs.id = ct.stage_id
      join public.courses c on c.id = cs.course_id
      where cl.id = course_materials.lesson_id and c.status = 'published'
    )
  );

create policy "course_materials_admin_full_access"
  on public.course_materials for all using (public.is_admin());
