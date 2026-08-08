
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

console.log("Test_URL:", supabaseUrl)
console.log("Test_AnonKey:", supabaseAnonKey)

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase  // ← default export, ne named!

async function testConnection() {
    const { data, error } = await supabase.from('profiles').select('*').limit(1)
    if (error) {
        console.error('Chyba_připojení:', error.message)
    } else {
        console.log('Správné_připojení:', data)
    }
}

testConnection()





