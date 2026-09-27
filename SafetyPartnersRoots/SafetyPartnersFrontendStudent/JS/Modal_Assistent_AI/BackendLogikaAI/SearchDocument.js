// SearchDocument.js
// OPRAVA: Původně tu byly duplicitní řádky (require i import na stejné věci) - ponechána
//         jen ESM varianta, ať sedí se zbytkem projektu (Vite/ESM na frontendu).
// LOGIKA: Jediné místo, kudy Dokumentace i ChatBot chodí pro sémantické vyhledávání.
//         `domains` říká, ve které korpuse hledat (viz DocumentSaver.js komentář).
import { supabase } from './SupabaseConnectAssistent.js'
import { getEmbedding } from './EmbeddingObal.js'

export async function searchDocuments(query, { domains, threshold = 0.7, limit = 5 } = {}) {
    const queryEmbedding = await getEmbedding(query)

    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        domain_filter: domains ?? null, // COMMENT: null = hledej napříč vším
    })

    if (error) throw error
    return data
}
