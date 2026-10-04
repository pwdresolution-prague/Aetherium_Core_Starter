-- ==========================================================================================
-- STEP 15 ================= ORDERS: rozšíření na Subscriber / Client / Student =============
-- ==========================================================================================

alter table public.subscriber_orders rename to orders;

alter table public.orders
  alter column subscriber_id drop not null,
  add column client_id uuid references public.clients(id),
  add column student_id uuid references public.students(id),
  add column linked_order_id uuid;  -- viz vysvětlení níže

alter table public.orders
  add constraint chk_orders_single_payer check (
    (subscriber_id is not null)::int +
    (client_id is not null)::int +
    (student_id is not null)::int = 1
  );

-- Propojí importované studenty s objednávkou, která je zaplatila
-- (užitečné pro certifikáty/přístup: "za koho konkrétně bylo zaplaceno")
alter table public.students
  add column order_id uuid references public.orders(id);

-- ---------------------------------------------------------------------
-- RLS (nahrazuje původní politiky ze STEP 12)
-- ---------------------------------------------------------------------
drop policy "subscriber_orders_select_own" on public.orders;
drop policy "subscriber_orders_admin_full_access" on public.orders;

create policy "orders_select_own"
    on public.orders for select
    using (
      auth.uid() = subscriber_id
      or auth.uid() = client_id
      or auth.uid() = student_id
    );

-- Provider vidí i objednávky svých Clientů (reselling přehled/provize)
create policy "orders_select_by_parent_subscriber"
    on public.orders for select
    using (client_id in (select id from public.clients where subscriber_id = auth.uid()));

create policy "orders_admin_full_access"
    on public.orders for all using (public.is_admin());
