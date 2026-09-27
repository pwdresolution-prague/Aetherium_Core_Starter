// SupabaseConnectAssistent.js
// LOGIKA: BĚŽÍ POUZE NA BACKENDU – SERVICE_ROLE_KEY nikdy nesmí jít do frontendu/prohlížeče,
//         proto se tento soubor importuje jen z BackendServer.js / AsistentApi.js / SeedTrainingData.js.
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
    process.env.AI_SUPABASE_URL,
    process.env.AI_SUPABASE_SERVICE_ROLE_KEY
)
