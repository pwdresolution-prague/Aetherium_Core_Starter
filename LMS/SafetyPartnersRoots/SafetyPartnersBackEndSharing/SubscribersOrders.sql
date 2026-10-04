-- ==========================================================================================
-- STEP 12 ================= Tabulka SUBSCRIBER_ORDERS ========================================
-- ==========================================================================================

create table public.subscriber_orders (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.subscribers(id),

  -- Přesná kopie polí z objektu 'order', který vrací calculateOrder() v PricingRules.js
  student_count integer not null,
  price_per_student numeric(10,2) not null,
  vat_rate numeric(4,3) not null,
  subtotal numeric(12,2) not null,
  vat_amount numeric(12,2) not null,
  total numeric(12,2) not null,
  currency text not null default 'CZK',

  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),

  -- Zmíněno v komentáři PaymentSubscriber.js jako TODO — unikátní klíč proti dvojité platbě
  idempotency_key text unique,

  payment_provider text,          -- 'gopay' / 'comgate' / 'stripe'...
  provider_transaction_id text,

  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.subscriber_orders enable row level security;

create policy "subscriber_orders_select_own"
    on public.subscriber_orders
    for select
    using (auth.uid() = subscriber_id);

create policy "subscriber_orders_admin_full_access"
    on public.subscriber_orders
    for all
    using (public.is_admin());
