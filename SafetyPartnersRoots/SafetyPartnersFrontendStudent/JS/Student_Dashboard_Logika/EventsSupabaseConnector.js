async function fetchEventsSupabaseConnector(userId) {
    const { data, error } = await supabase
        .from("vents")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20)

        if(error) {console.error(error); return []; }

        return data

        
    }


    fetchEventsSupabaseConnector("user_001").then(renderEvents)
    