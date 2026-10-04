import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Fail-fast: pokud chybí proměnná, chci chybu hned, ne záhadné 401 později
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Chybí VITE_SUPABASE_URL nebo VITE_SUPABASE_PUBLISHABLE_KEY v .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
