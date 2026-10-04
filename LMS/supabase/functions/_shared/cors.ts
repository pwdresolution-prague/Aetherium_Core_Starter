// supabase/functions/_shared/cors.ts
export const corsHeaders = {
    "Access-Control-Allow-Origin": "*", // TODO: až budeš mít doménu, nahraď konkrétním originem
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};
