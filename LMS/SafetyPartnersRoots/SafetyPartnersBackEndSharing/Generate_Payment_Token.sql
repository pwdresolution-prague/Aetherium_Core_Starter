create type public.registration_order_status as enum
  ('draft','otp_verified','payment_pending','paid','token_issued','expired');

create table if not exists public.registration_orders (
  id            uuid primary key default gen_random_uuid(),
  status        public.registration_order_status not null default 'draft',
  contact_phone text not null,
  form_data     jsonb not null default '{}',
  target_role   public.user_role not null check (target_role in ('subscriber','client')),
  tenant_id     uuid references public.tenants(id),
  subscriber_id uuid references public.subscribers(id),
  amount_minor  integer,                       -- částka v haléřích, počítá server
  currency      text not null default 'CZK',
  payment_ref   text unique,                   -- ID platby u brány, unikátní = ochrana proti duplicitě
  paid_at       timestamptz,
  expires_at    timestamptz not null default now() + interval '24 hours',
  created_at    timestamptz not null default now()
);

alter table public.registration_orders enable row level security;   -- bez politik, jako registration_tokens

create or replace function public.fulfill_registration_order(
  p_order_id    uuid,
  p_payment_ref text,
  p_paid_minor  integer,
  p_token_hash  text,
  p_ttl_hours   int default 72
)
returns table (out_token_id uuid, out_tenant_id uuid, out_role public.user_role)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_order    public.registration_orders%rowtype;
  v_token_id uuid;
begin
  select * into v_order from public.registration_orders where id = p_order_id for update;  -- zámek řádku
  if not found then raise exception 'order not found'; end if;

  if v_order.status = 'token_issued' then return; end if;          -- opakovaný webhook: nic nedělej
  if v_order.status <> 'payment_pending' then raise exception 'invalid status: %', v_order.status; end if;
  if v_order.tenant_id is null then raise exception 'order has no tenant'; end if;
  if p_paid_minor <> v_order.amount_minor then raise exception 'amount mismatch'; end if;

  insert into public.registration_tokens (tenant_id, subscriber_id, target_role, token_hash, expires_at)
  values (v_order.tenant_id, v_order.subscriber_id, v_order.target_role, p_token_hash,
          now() + make_interval(hours => p_ttl_hours))
  returning id into v_token_id;

  update public.registration_orders
     set status = 'token_issued', payment_ref = p_payment_ref, paid_at = now()
   where id = p_order_id;

  insert into public.event_log (system_module, event_type, event_source, payload)
  values ('registration', 'token_issued_after_payment', 'fulfill_registration_order',
          jsonb_build_object('order_id', p_order_id, 'token_id', v_token_id, 'payment_ref', p_payment_ref));

  return query select v_token_id, v_order.tenant_id, v_order.target_role;
end;
$$;

revoke execute on function public.fulfill_registration_order(uuid,text,integer,text,int) from public, anon, authenticated;
grant  execute on function public.fulfill_registration_order(uuid,text,integer,text,int) to service_role;
