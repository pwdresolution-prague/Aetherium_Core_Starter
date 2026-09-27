// AsistentApi.js
// LOGIKA: Express router se třemi endpointy, které dohromady tvoří "datovou spojnici"
//         mezi Dokumentací a ChatBot asistentem:
//
//   GET  /api/dokumentace/navody        -> návody pro Dokumentaci, poskládané automaticky
//                                           z tréninkových dat asistenta (viz TrainingDataNormalizer)
//   POST /api/ai/dokumentace-search     -> sémantické hledání pro DokuemntaceApi.js (hledatDokumentaci)
//   POST /api/ai/chatbot-query          -> sémantické hledání pro ChatBotApi.js (zeptatSeAsistenta)
//
// Obě AI cesty volají STEJNOU funkci searchDocuments() nad STEJNOU tabulkou v Supabase,
// jen s jiným filtrem `domains` -> žádná data se nezadávají ručně na dvou místech.
import { Router } from 'express'
import { searchDocuments } from './SearchDocument.js'
import { sestavitNavodyZTrenovacichDat, vytvoritNavodId } from './TrainingDataNormalizer.js'
import { mockNavody } from '../../DokumentaceLogika/DokuemntaceData.js'

const router = Router()

const DOMENY_DOKUMENTACE = ['chatbot_qa'] // COMMENT: zatím jen platformové Q&A, fakta (např. svářečská škola) níže
const DOMENY_CHATBOT = ['chatbot_qa', 'chatbot_fact']
const PRAH_SHODY = 0.7

// LOGIKA: Ruční mockNavody + automaticky poskládané návody z ChatBot dat, bez duplicit podle id.
router.get('/api/dokumentace/navody', (req, res) => {
    const automaticke = sestavitNavodyZTrenovacichDat()
    const rucniId = new Set(mockNavody.map(n => n.id))
    const spojeno = [...mockNavody, ...automaticke.filter(n => !rucniId.has(n.id))]
    res.json(spojeno)
})

router.post('/api/ai/dokumentace-search', async (req, res) => {
    const { dotaz } = req.body ?? {}
    if (!dotaz) return res.status(400).json({ chyba: 'Chybí "dotaz" v těle požadavku.' })

    try {
        const shody = await searchDocuments(dotaz, { domains: DOMENY_DOKUMENTACE, threshold: PRAH_SHODY, limit: 8 })

        // LOGIKA: Mapování na PŘESNĚ ten tvar, který DokuemntaceLogika.js už umí vykreslit
        // (viz sestavitPlochouSadu / vykreslitVysledkyHledani). `id` je odvozené ze stejné
        // funkce jako v /api/dokumentace/navody výše, takže klik na výsledek najde správnou kartu.
        const vysledky = shody.map(polozka => ({
            typ: 'navod',
            zalozka: 'navody',
            id: vytvoritNavodId(polozka.nadpis),
            nadpis: polozka.nadpis,
            text: polozka.odpoved,
        }))

        res.json({ vysledky })
    } catch (chyba) {
        console.error('AsistentApi: dokumentace-search selhalo', chyba)
        res.status(502).json({ chyba: 'AI vyhledávání je momentálně nedostupné.' })
    }
})

router.post('/api/ai/chatbot-query', async (req, res) => {
    const { dotaz } = req.body ?? {}
    if (!dotaz) return res.status(400).json({ chyba: 'Chybí "dotaz" v těle požadavku.' })

    try {
        const shody = await searchDocuments(dotaz, { domains: DOMENY_CHATBOT, threshold: PRAH_SHODY, limit: 1 })

        if (!shody.length) {
            return res.json({ odpoved: 'Stále se ještě učím, na tohle zatím neznám odpověď.', zdroj: 'ai', shoda: null })
        }

        const [nejlepsi] = shody
        res.json({ odpoved: nejlepsi.odpoved, zdroj: 'ai', shoda: nejlepsi.similarity })
    } catch (chyba) {
        console.error('AsistentApi: chatbot-query selhalo', chyba)
        res.status(502).json({ chyba: 'AI asistent je momentálně nedostupný.' })
    }
})

export default router
