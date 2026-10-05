
// ==========================================================================================
// Edge Function: Hromadné založení studentů PO zaplacené objednávce
// ==========================================================================================

import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2'

interface StudentImportRow {
  firstName: string
  lastName: string
  email: string
  phone?: string
}

interface RequestBody {
  orderId: string
  students: StudentImportRow[]
}

Deno.serve(async (req) => {
  // Prohlížečův preflight — musí se odbavit dřív, než cokoliv jiného
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Chybí Authorization header' }, 401)
    }

    const { orderId, students }: RequestBody = await req.json()

    if (!orderId || !Array.isArray(students) || students.length === 0) {
      return json({ error: 'Neplatný požadavek — chybí orderId nebo students[]' }, 400)
    }

    // ---------------------------------------------------------------
    // KLIENT A: mluví JMÉNEM volajícího (jeho vlastní JWT z hlavičky).
    // Slouží JEN k ověření vlastnictví — díky RLS politice
    // "orders_select_own" (STEP 15) vrátí objednávku, jen když je
    // volající skutečně subscriber_id / client_id té objednávky.
    // ---------------------------------------------------------------
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: order, error: orderError } = await callerClient
      .from('orders')
      .select('id, status, client_id, subscriber_id, student_count')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return json({ error: 'Objednávka nenalezena, nebo k ní nemáš přístup' }, 403)
    }

    if (order.status !== 'paid') {
      return json(
        { error: `Objednávka má stav '${order.status}', studenty lze založit až po 'paid'` },
        409,
      )
    }

    if (students.length > order.student_count) {
      return json(
        { error: `Import obsahuje ${students.length} studentů, objednávka je zaplacená jen za ${order.student_count}` },
        409,
      )
    }

    // ---------------------------------------------------------------
    // KLIENT B: service_role — obchází RLS, jediný, kdo smí zakládat
    // auth.users. Vytváří se AŽ TEĎ, po ověření přes callerClient.
    // ---------------------------------------------------------------
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const results: Array<{ email: string; ok: boolean; error?: string }> = []

    for (const student of students) {
      const { data: created, error: createError } = await adminClient.auth.admin.createUser({
        email: student.email,
        email_confirm: true,
        user_metadata: { role: 'student' },
      })

      if (createError || !created?.user) {
        // COMMENT: jedna chyba (např. e-mail už existuje) nesmí shodit celý import —
        // stejná filozofie jako valid/invalid v StudentImport.js
        results.push({ email: student.email, ok: false, error: createError?.message ?? 'Neznámá chyba' })
        continue
      }

      // handle_new_user() trigger už založil základní řádek v profiles.
      // Tady doplníme jen studentská pole + navázání na Clienta/Subscribera/objednávku.
      const { error: studentError } = await adminClient
        .from('students')
        .insert({
          id: created.user.id,
          first_name: student.firstName,
          last_name: student.lastName,
          phone: student.phone ?? null,
          email: student.email,
          client_id: order.client_id,
          subscriber_id: order.subscriber_id,
          order_id: order.id,
        })

      if (studentError) {
        results.push({ email: student.email, ok: false, error: studentError.message })
        continue
      }

      results.push({ email: student.email, ok: true })
    }

    return json({ results }, 200)
  } catch (err) {
    console.error('[create-students-from-order]', err)
    return json({ error: 'Interní chyba serveru' }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
