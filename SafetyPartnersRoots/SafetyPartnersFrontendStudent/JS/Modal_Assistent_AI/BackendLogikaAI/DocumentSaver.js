// DocumentSaver.js
// LOGIKA: Ukládání jedné znalostní položky (věta/otázka+odpověď/fakt) do Supabase
//         i s embeddingem. OPRAVA oproti původní verzi: přidána metadata (domain, refId,
//         nadpis) a UPSERT podle (domain, ref_id) – díky tomu jde SeedTrainingData.js
//         spouštět opakovaně (např. po úpravě JSON tréninkových dat) a nevznikají duplicity.
//
// `domain` rozlišuje, ke které "korpuse" položka patří, a používá se pak jako filtr
// v match_documents (viz Backend_Structure/supabase_schema.sql):
//   "dokumentace_navod" | "dokumentace_legislativa" | "dokumentace_material" -> hledání v Dokumentaci
//   "chatbot_qa" | "chatbot_fact"                                            -> hledání v ChatBotovi

import { supabase } from './SupabaseConnectAssistent.js'
import { getEmbedding } from './EmbeddingObal.js'

export async function saveDocument({ text, domain, refId, nadpis = null, odpoved = null }) {
    if (!text || !domain || !refId) {
        throw new Error('saveDocument: text, domain a refId jsou povinné.')
    }

    const embedding = await getEmbedding(text)

    const { data, error } = await supabase
        .from('documents')
        .upsert(
            // COMMENT: `content` je text, na kterém se počítal embedding (typicky otázka/fakt).
            //          `odpoved` je to, co se skutečně vrátí uživateli (u faktů stejné jako content).
            { domain, ref_id: refId, nadpis, content: text, odpoved: odpoved ?? text, embedding },
            { onConflict: 'domain,ref_id' }
        )
        .select()

    if (error) throw error
    return data[0]
}
