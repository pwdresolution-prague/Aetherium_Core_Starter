import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.AI_SUPABASE_URL,
  process.env.AI_SUPABASE_SERVICE_ROLE_KEY
)

export { supabase }
