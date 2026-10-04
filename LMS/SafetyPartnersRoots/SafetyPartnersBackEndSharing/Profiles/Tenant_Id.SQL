-- ==========================================================================================
-- STEP 9 ================= Tabulka TENANTS ==================================================
-- ==========================================================================================

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'starter', -- napojení na payment/pricing přijde později
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_tenants_updated_at
  before update on public.tenants
  for each row
  execute function public.set_updated_at();

alter table public.tenants enable row level security;

-- Admin vidí a spravuje všechny tenanty
create policy "tenants_admin_full_access"
    on public.tenants
    for all
    using (public.is_admin());

-- ---------------------------------------------------------------------
-- STEP 10: doplnění odložené FK z profiles.sql (STEP 6)
-- ---------------------------------------------------------------------
alter table public.profiles
    add constraint fk_profiles_tenant
    foreign key (tenant_id) references public.tenants(id);
