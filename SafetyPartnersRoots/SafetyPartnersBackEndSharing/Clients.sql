-- ==========================================================================================
-- STEP 13 ================= Tabulka CLIENTS =================================================
-- ==========================================================================================

create table public.clients (
  id uuid primary key references public.profiles(id) on delete cascade,

  ico varchar(8) not null unique,
  dic varchar(12),
  company_name text not null,
  legal_form text,
  registered_address text not null,
  founded_at date,
  entity_status text,
  file_reference text,
  data_box_id varchar(7),

  phone text not null,
  email text not null unique,
  operation_address text,

  config jsonb not null default '{}'::jsonb,   -- per-klient white-label nastavení (z excelu)
  requested_seats_count integer,

  subscriber_id uuid not null references public.subscribers(id),  -- KDO klienta založil/spravuje
  tenant_id uuid not null references public.tenants(id),

  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_clients_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

create index idx_clients_subscriber_id on public.clients(subscriber_id);

-- ---------------------------------------------------------------------
-- Business pravidlo: Client smí vzniknout, jen když to Provider
-- v business_purpose povolil (reselling / doubleComb)
-- ---------------------------------------------------------------------
create or replace function public.check_subscriber_allows_clients()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.subscribers
    where id = new.subscriber_id
      and business_purpose in ('reselling', 'doubleComb')
  ) then
    raise exception 'Tento Provider má business_purpose = interní, nesmí zakládat Klienty.';
  end if;
  return new;
end;
$$;

create trigger trg_clients_check_subscriber_purpose
  before insert on public.clients
  for each row
  execute function public.check_subscriber_allows_clients();

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.clients enable row level security;

create policy "clients_select_own"
    on public.clients for select using (auth.uid() = id);

create policy "clients_update_own"
    on public.clients for update using (auth.uid() = id);

create policy "clients_insert_own"
    on public.clients for insert with check (auth.uid() = id);

-- Provider vidí VŠECHNY svoje Clienty (potřebné pro reselling dashboard)
create policy "clients_select_by_parent_subscriber"
    on public.clients for select using (subscriber_id = auth.uid());

create policy "clients_admin_full_access"
    on public.clients for all using (public.is_admin());
