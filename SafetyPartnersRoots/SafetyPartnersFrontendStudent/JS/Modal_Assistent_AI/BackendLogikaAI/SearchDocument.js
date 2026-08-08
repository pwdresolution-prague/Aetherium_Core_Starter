const { supabase } = require('./supabaseClient')
const { getEmbedding } = require('./embeddingService')

import { supabase } from './SupabaseConnectAssistent.js'
import { getEmbedding } from './EmbeddingObal.js'


async function searchDocuments(query, threshold = 0.7, limit = 5) {
    const queryEmbedding = await getEmbedding(query)

    const  { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit
    })
    if(error) throw error
    return data


}

module.exports = { searchDocuments }
