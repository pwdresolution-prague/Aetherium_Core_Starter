import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error('Chybí SUPABASE_URL nebo SUPABASE_SECRET_KEY v .env');
}

export const supabaseAdmin = createClient(url, secretKey, {
  auth: {
    autoRefreshToken: false, // na serveru není uživatelská session
    persistSession: false,
  },
});
