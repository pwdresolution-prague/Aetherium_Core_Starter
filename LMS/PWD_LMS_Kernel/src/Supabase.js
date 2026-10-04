import dotenv from 'dotenv'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const kernelEnv = dotenv.config({ path: path.resolve('./.env.kernel')}).parsed

if(!process.env.KERNEL_SUPABASE_URL || !process.env.KERNEL_SUPABASE_SERVICE_ROLE_KEY){
    throw new error ('Chybějící proměnné prostředí supabase')
}

export async function kernelHealthCheck(){

    try {
        const { data, error } = await supabaseKernel
            .rpc('pg_sleep', { seconds: 0}) // Tiny ping na postgres


            if(error){
                return {
                    kernelData: null,
                    kernelError: error,
                    kernelConected: false

                }
            }
            return {
                
            }
    }
}

export const supabaseKernel = createClient(
    kernelEnv.KERNEL_SUPABASE_URL,
    kernelEnv.KERNEL_SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false }}
)

const kernelSupabaseUrl = kernelEnv.KERNEL_SUPABASE_URL
const kernelSupabaseKey = kernelEnv.KERNEL_SUPABASE_SERVICE_ROLE_KEY


//Test 
(async () => {
    const { kernelData, kernelError } = await testKernelConnection()
    console.log("kernelData", kernelData)
    console.log("kernelError", kernelError)

})






