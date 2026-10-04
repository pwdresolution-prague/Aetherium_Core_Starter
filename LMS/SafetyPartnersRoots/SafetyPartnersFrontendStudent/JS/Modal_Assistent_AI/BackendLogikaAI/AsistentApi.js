
import { Router } from 'express'
import { searchDocuments } from './SearchDocument.js'
import { sestavitNavodyZTrenovacichDat, vytvoritNavodId } from './TrainingDataNormalizer.js'
import { mockNavody } from '../../DokumentaceLogika/DokuemntaceData.js'
import { supabase } from './SupabaseConnectAssistent.js'

const router = Router()

const DOMENY_DOKUMENTACE = ['chatbot_qa']
const DOMENY_CHATBOT = ['chatbot_qa', 'chatbot_fact']
const PRAH_SHODY = 0.7

router.get('/api/ai/health', async (req, res) => {
    const stav = { databaze: false, funkce: false, pocetDokumentu: null }

    const { count, error: dbChyba } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
    if (dbChyba) {
        return res.status(503).json({ ...stav, chyba: `documents: ${dbChyba.message}` })
    }
    stav.databaze = true
    stav.pocetDokumentu = count

    const sonda = Array(512).fill(0)
    sonda[0] = 1
    const { error: rpcChyba } = await supabase.rpc('match_documents', {
        query_embedding: sonda,
        match_threshold: 0.99,
        match_count: 1,
        domain_filter: null,
    })
    if (rpcChyba) {
        return res.status(503).json({ ...stav, chyba: `match_documents: ${rpcChyba.message}` })
    }
    stav.funkce = true

    res.json(stav)
})

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
        const shody = await searchDocuments(dotaz, {
            domains: DOMENY_DOKUMENTACE,
            threshold: PRAH_SHODY,
            limit: 8,
        })

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
        const shody = await searchDocuments(dotaz, {
            domains: DOMENY_CHATBOT,
            threshold: PRAH_SHODY,
            limit: 1,
        })

        if (!shody.length) {
            return res.json({
                odpoved: 'Stále se ještě učím, na tohle zatím neznám odpověď.',
                zdroj: 'ai',
                shoda: null,
            })
        }

        const [nejlepsi] = shody
        res.json({ odpoved: nejlepsi.odpoved, zdroj: 'ai', shoda: nejlepsi.similarity })
    } catch (chyba) {
        console.error('AsistentApi: chatbot-query selhalo', chyba)
        res.status(502).json({ chyba: 'AI asistent je momentálně nedostupný.' })
    }
})

export default router
