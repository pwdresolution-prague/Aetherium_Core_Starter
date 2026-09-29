-- ==========================================================================================
-- STEP 38 ================= Tabulka BIOMETRIC_EVENTS ==========================================
-- ==========================================================================================
-- Syrová data behaviorální biometriky během testu (rytmus psaní, pohyb myši,
-- ztráta fokusu okna...) - jeden řádek = jedna zachycená metrika v čase.

create table public.biometric_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  metric_type text not null,          -- 'keystroke_rhythm' / 'mouse_movement' / 'window_blur'...
  related_test_id uuid references public.tests(id),
  value jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

create index idx_biometric_events_student_id on public.biometric_events(student_id);
create index idx_biometric_events_related_test_id on public.biometric_events(related_test_id);

alter table public.biometric_events enable row level security;

-- Zapisuje jen server (Edge Function sbírající telemetrii), NE přímo klient z prohlížeče -
-- surová biometrická data si nikdo nesmí "upravit" před odesláním
create policy "biometric_events_select_owned"
  on public.biometric_events for select
  using (public.owns_student(student_id));

create policy "biometric_events_admin_full_access"
  on public.biometric_events for all using (public.is_admin());


-- ==========================================================================================
-- STEP 39 ================= Tabulka BIOMETRIC_SCORES ==========================================
-- ==========================================================================================
-- Vypočtené rizikové skóre za jeden test (agregace nad biometric_events) -
-- typicky dopočítáno serverem po odevzdání testu.

create table public.biometric_scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  related_test_id uuid not null references public.tests(id),
  risk_score numeric(5,2) not null,
  detail jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now(),

  unique (student_id, related_test_id)   -- jedno skóre na jeden pokus/kontext
);

create index idx_biometric_scores_student_id on public.biometric_scores(student_id);

alter table public.biometric_scores enable row level security;

create policy "biometric_scores_select_owned"
  on public.biometric_scores for select
  using (public.owns_student(student_id));

create policy "biometric_scores_admin_full_access"
  on public.biometric_scores for all using (public.is_admin());
