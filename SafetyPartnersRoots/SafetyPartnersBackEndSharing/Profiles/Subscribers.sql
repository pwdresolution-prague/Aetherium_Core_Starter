-- ==========================================================================================
-- STEP 11 ================= Tabulka SUBSCRIBERS =============================================
-- ==========================================================================================

create table public.subscribers (
  -- 1:1 vazba na profiles.id, stejný vzor jako u admina (ne přímo na auth.users)
  id uuid primary key references public.profiles(id) on delete cascade,

  -- Firemní údaje z ARES (shoda s ProviderAetherium.js poli ičoId/dicId/název-firmyId...)
  ico varchar(8) not null unique,
  dic varchar(12),
  company_name text not null,
  legal_form text,
  registered_address text not null,
  founded_at date,
  entity_status text,
  file_reference text,
  data_box_id varchar(7),

  -- Kontaktní údaje (kopie z profiles kvůli snadnému JOINu, stejná logika jako u admina)
  phone text not null,
  email text not null unique,
  operation_address text,

  -- Business kontext
  market_segment text,              -- 'Obor-podnikání' select
  business_purpose text,             -- 'účel' select (interní/reselling/doubleComb)
  company_description text,          -- 'CompanyDescriptionName'
  requested_seats_count integer,     -- 'početŠkoleníSubscriber' — PŘEDBĚŽNÝ odhad z formuláře,
                                      -- ne skutečný fakturovaný počet (ten určuje import na Summary.html)

  -- Multi-tenant a audit
  tenant_id uuid not null references public.tenants(id),
  created_by uuid references public.profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_subscribers_updated_at
  before update on public.subscribers
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.subscribers enable row level security;

-- Subscriber vidí a upravuje jen svůj vlastní řádek
create policy "subscribers_select_own"
    on public.subscribers
    for select
    using (auth.uid() = id);

create policy "subscribers_update_own"
    on public.subscribers
    for update
    using (auth.uid() = id);

-- Insert smí jen sám sobě, a jen jednou (id musí odpovídat přihlášenému uživateli
-- z fáze OTP) — tohle nahradí to, co teď dělá špatně ulozFirmu()
create policy "subscribers_insert_own"
    on public.subscribers
    for insert
    with check (auth.uid() = id);

-- Admin vidí a spravuje vše
create policy "subscribers_admin_full_access"
    on public.subscribers
    for all
    using (public.is_admin());
