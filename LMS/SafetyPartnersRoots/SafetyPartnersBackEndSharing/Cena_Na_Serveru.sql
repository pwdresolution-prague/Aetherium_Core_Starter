create table if not exists public.pricing_config (
  id                      boolean primary key default true check (id),  -- vždy jen jeden řádek
  price_per_student_minor int     not null,
  vat_rate                numeric(5,4) not null,
  currency                text    not null default 'CZK'
);
insert into public.pricing_config (price_per_student_minor, vat_rate) values (49000, 0.2100)
on conflict (id) do nothing;
alter table public.pricing_config enable row level security;

create or replace function public.calculate_order_amounts(p_students int)
returns table (subtotal_minor int, vat_minor int, total_minor int,
               vat_rate numeric, price_per_student_minor int, currency text)
language sql stable
set search_path = public
as $$
  select (p_students * c.price_per_student_minor)::int,
         round(p_students * c.price_per_student_minor * c.vat_rate)::int,
         (p_students * c.price_per_student_minor
            + round(p_students * c.price_per_student_minor * c.vat_rate))::int,
         c.vat_rate, c.price_per_student_minor, c.currency
  from public.pricing_config c;
$$;
revoke execute on function public.calculate_order_amounts(int) from public, anon, authenticated;
grant  execute on function public.calculate_order_amounts(int) to service_role;

-- sloupce objednávky pro data z importu a rozpad ceny
alter table public.registration_orders
  add column if not exists student_count int,
  add column if not exists students      jsonb,   -- jen platní studenti po validaci serverem
  add column if not exists subtotal_minor int,
  add column if not exists vat_minor      int,
  add column if not exists vat_rate       numeric(5,4);
