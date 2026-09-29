-- ==========================================================================================
-- STEP 29 ================= Funkce OWNS_STUDENT() ============================================
-- ==========================================================================================

create or replace function public.owns_student(p_student_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.students s
    left join public.clients c on c.id = s.client_id
    where s.id = p_student_id
      and (
        s.id = auth.uid()               -- student sám za sebe
        or s.client_id = auth.uid()     -- přímý Client (reselling model)
        or s.subscriber_id = auth.uid() -- přímý Subscriber (interní model)
        or c.subscriber_id = auth.uid() -- Subscriber nad svým Clientem
      )
  );
$$;
