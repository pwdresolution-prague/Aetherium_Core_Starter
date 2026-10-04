-- Registrační tokeny pro firmy (Provider = subscriber, Client)
-- Upraveno podle skutečného schématu projektu LMS-E-learning_Management_System:
--   tenants(id), subscribers(id), enum user_role, tabulka event_log.
-- pgcrypto je v projektu nainstalováno ve schématu "extensions".

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.registration_tokens (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  subscriber_id uuid references public.subscribers(id) on delete cascade,  -- vyplnit u tokenu pro role 'client'
  target_role   public.user_role not null
                check (target_role in ('subscriber', 'client')),
  token_hash    text not null unique,      -- jen SHA-256 hash, token samotný se neukládá
  expires_at    timestamptz not null,
  used_at       timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists registration_tokens_tenant_idx
  on public.registration_tokens (tenant_id);

-- RLS zapnuto a bez politik: přes API (anon/authenticated) se do tabulky nikdo nedostane.
alter table public.registration_tokens enable row level security;

-- Vytvoření tokenu: vrací token v čistém tvaru JEN JEDNOU, v DB zůstane hash.
create or replace function public.create_registration_token(
  p_tenant_id     uuid,
  p_target_role   public.user_role,
  p_subscriber_id uuid default null,
  p_ttl_hours     int  default 72
)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text;
  v_id    uuid;
begin
  if p_target_role not in ('subscriber', 'client') then
    raise exception 'invalid target_role';
  end if;

  v_token := encode(gen_random_bytes(24), 'hex');   -- 48 hex znaků

  insert into public.registration_tokens
    (tenant_id, subscriber_id, target_role, token_hash, expires_at)
  values (
    p_tenant_id,
    p_subscriber_id,
    p_target_role,
    encode(digest(v_token, 'sha256'), 'hex'),
    now() + make_interval(hours => p_ttl_hours)
  )
  returning id into v_id;

  -- audit (bez tokenu!)
  insert into public.event_log (system_module, event_type, event_source, payload)
  values ('registration', 'token_issued', 'create_registration_token',
          jsonb_build_object('token_id', v_id, 'tenant_id', p_tenant_id,
                             'target_role', p_target_role, 'ttl_hours', p_ttl_hours));

  return v_token;
end;
$$;

-- Spotřebování tokenu: atomicky ověří platnost a označí jako použitý.
-- Vrátí 0 řádků, pokud je token neplatný, expirovaný nebo už použitý.
create or replace function public.consume_registration_token(p_token text)
returns table (tenant_id uuid, subscriber_id uuid, target_role public.user_role)
language sql
security definer
set search_path = public, extensions
as $$
  update public.registration_tokens t
     set used_at = now()
   where t.token_hash = encode(digest(p_token, 'sha256'), 'hex')
     and t.used_at is null
     and t.expires_at > now()
  returning t.tenant_id, t.subscriber_id, t.target_role;
$$;

-- DŮLEŽITÉ: Supabase vystavuje funkce v public přes API. Bez tohoto by je mohl volat kdokoli.
revoke execute on function public.create_registration_token(uuid, public.user_role, uuid, int)
  from public, anon, authenticated;
revoke execute on function public.consume_registration_token(text)
  from public, anon, authenticated;

grant execute on function public.create_registration_token(uuid, public.user_role, uuid, int) to service_role;
grant execute on function public.consume_registration_token(text) to service_role;
