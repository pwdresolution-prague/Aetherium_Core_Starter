import { supabase } from './db.js';

const { data, error } = await supabase.from('companies').select('*').limit(5);

if (error) {
  console.error('Chyba dotazu:', error.message);
} else {
  console.log('Data:', data);
}
