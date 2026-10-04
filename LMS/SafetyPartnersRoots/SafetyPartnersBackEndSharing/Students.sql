-- ==========================================================================================
-- STEP 14 ================= Tabulka STUDENTS ==================================================
-- ==========================================================================================

create table public.students (
  id uuid primary key references public.profiles(id) on delete cascade,

  first_name text not null,
  last_name text not null,
  phone text,
  email text not null unique,

  -- Přesně jeden z těchto tří patterns:
  --  1) client_id vyplněné      → zaměstnanec Clienta (reselling model)
  --  2) subscriber_id vyplněné  → zaměstnanec přímo Providera (interní model)
  --  3) oba NULL                → samoplátce, koupil si kurz sám za sebe
  client_id uuid references public.clients(id),
  subscriber_id uuid references public.subscribers(id),

  job_position text,
  avatar_seed text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint chk_students_single_parent check (
    not (client_id is not null and subscriber_id is not null)
  )
);

create trigger trg_students_updated_at
  before update on public.students
  for each row
  execute function public.set_updated_at();

create index idx_students_client_id on public.students(client_id);
create index idx_students_subscriber_id on public.students(subscriber_id);

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.students enable row level security;

create policy "students_select_own"
    on public.students for select using (auth.uid() = id);

create policy "students_update_own"
    on public.students for update using (auth.uid() = id);

-- Samoplátce si smí založit JEN nezávislý řádek (bez client_id/subscriber_id) —
-- brání tomu, aby si někdo sám při registraci nastavil cizí client_id/subscriber_id
create policy "students_insert_own_independent"
    on public.students for insert
    with check (auth.uid() = id and client_id is null and subscriber_id is null);

create policy "students_select_by_direct_owner"
    on public.students for select
    using (auth.uid() = subscriber_id or auth.uid() = client_id);

create policy "students_select_by_parent_subscriber"
    on public.students for select
    using (client_id in (select id from public.clients where subscriber_id = auth.uid()));

create policy "students_admin_full_access"
    on public.students for all using (public.is_admin());
