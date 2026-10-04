// ChatBotApi.js
// LOGIKA: Stejný vzor jako DokuemntaceApi.js -> hledatDokumentaci(). Frontend (prohlížeč)
//         nikdy nesmí volat TensorFlow/Supabase přímo (service role klíč, tfjs-node je jen
//         pro Node), proto se vždycky jde přes tenhle fetch na backend /api/ai/chatbot-query.
//         Nahrazuje předchozí Fuse.js hledání – lokální fallback (offline/výpadek AI backendu)
//         teď dělá jen jednoduché "includes" hledání v questionsAndAnswers, žádná externí knihovna.
import { questionsAndAnswers } from './ChatBotFuseTrainData.js'

export const CHATBOT_CONFIG = {
    dotazEndpoint: '/api/ai/chatbot-query',
}

export async function zeptatSeAsistenta(dotaz) {
    try {
        const odpoved = await fetch(CHATBOT_CONFIG.dotazEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dotaz }),
        })
        if (!odpoved.ok) throw new Error(`AI asistent: vrátil stav ${odpoved.status}`)
        const { odpoved: text, zdroj, shoda } = await odpoved.json()
        return { odpoved: text, zdroj, shoda }
    } catch (chyba) {
        console.warn('ChatBot: AI backend nedostupný, použit lokální fallback.', chyba)
        return { odpoved: lokalniFallback(dotaz), zdroj: 'fallback', shoda: null }
    }
}

// LOGIKA: Nouzová odpověď bez backendu – prosté hledání podle obsažení textu,
//         stejný princip jako lokalniFallbackHledani v DokuemntaceLogika.js.
function lokalniFallback(dotaz) {
    const normalizovanyDotaz = dotaz.toLowerCase().trim()
    const nejlepsiShoda = questionsAndAnswers.find(qa =>
        qa.question.toLowerCase().includes(normalizovanyDotaz) || normalizovanyDotaz.includes(qa.question.toLowerCase())
    )
    return nejlepsiShoda?.answer ?? 'Stále se ještě učím, na tohle zatím neznám odpověď.'
}
