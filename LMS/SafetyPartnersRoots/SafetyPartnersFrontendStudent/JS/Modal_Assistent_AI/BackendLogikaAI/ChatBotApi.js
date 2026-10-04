// ChatBotApi.js
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

function lokalniFallback(dotaz) {
    const normalizovanyDotaz = dotaz.toLowerCase().trim()
    const nejlepsiShoda = questionsAndAnswers.find(qa =>
        qa.question.toLowerCase().includes(normalizovanyDotaz) || normalizovanyDotaz.includes(qa.question.toLowerCase())
    )
    return nejlepsiShoda?.answer ?? 'Stále se ještě učím, na tohle zatím neznám odpověď.'
}
