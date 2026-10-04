import './LoadEnv.js' // MUSÍ být první
import { createClient } from '@supabase/supabase-js'

const { AI_SUPABASE_URL, AI_SUPABASE_SERVICE_ROLE_KEY } = process.env

if (!AI_SUPABASE_URL || !AI_SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
        'Chybí AI_SUPABASE_URL nebo AI_SUPABASE_SERVICE_ROLE_KEY v JS/Modal_Assistent_AI/.env'
    )
}

export const supabase = createClient(AI_SUPABASE_URL, AI_SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
})
