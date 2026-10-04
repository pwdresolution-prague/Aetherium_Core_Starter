alert("JS naběhl, je spuštěn")
console.log('ENV Test:', import.meta.env)

//TODO: PŘIPOJENÍ K SUPABASE A ULOŽENÍ PROMĚNÝCH DO ENV SOUBORU....
import { createClient } from '@supabase/supabase-js'


//TODO: Vite verze připojení Envu
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

//TODO: Test připojení 
console.log("Test Url", import.meta.env.VITE_SUPABASE_URL)
console.log("Test anonkey", import.meta.env.VITE_SUPABASE_ANON_KEY)



//TODO: Node verze připojení Envu s poznámkou že node nepřečte diakritiku takže je potřeba relativní cesta DOM/UTF-8
//const supabaseUrl = process.env.SUPABASE_URL
//const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

import.meta.env.VITE_SUPABASE_URL
import.meta.env.VITE_SUPABASE_ANON_KEY


async function testConnection(){
    const { data, error } = await supabase.from('profiles').select('*').limit(1)
    console.log("Test ověření připojení")


    if(error){
        console.error('Chyba Připojení', error.message)
        } else{
            console.log('Správné připojení', data)
        }
    }
testConnection()





