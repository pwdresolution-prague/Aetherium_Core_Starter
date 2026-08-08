// SupabaseConnect.js — BEZ dotenv
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://ngkeopgrbyqpodzxlgkx.supabase.co",  
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5na2VvcGdyYnlxcG9kenhsZ2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzgwNDEsImV4cCI6MjA5NTMxNDA0MX0.Fa58F4CH6yfFAaJ7mFT5cdTuz_NwmzySKknIu3cgYAE"                               
);

export default supabase;