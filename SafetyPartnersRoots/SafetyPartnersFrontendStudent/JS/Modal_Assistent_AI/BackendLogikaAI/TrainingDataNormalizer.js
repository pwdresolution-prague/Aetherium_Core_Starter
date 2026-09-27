// TrainingDataNormalizer.js
// LOGIKA: TOHLE JE TA "DATOVÁ SPOJNICE" mezi ChatBot asistentem a Dokumentací.
//
// Čte VŠECHNA tréninková data, která už pro ChatBota máš (obě JSON_* složky
// vedle tohoto souboru + starý pole `questionsAndAnswers` z ChatBotFuseTrainData.js)
// a převede je do jednoho společného tvaru. Z toho tvaru pak:
//   - SeedTrainingData.js  -> naplní Supabase (embeddingy) pro sémantické hledání,
//   - AsistentApi.js       -> poskládá "Návody" pro Dokumentaci automaticky,
//     takže se nic nepíše ručně na dvou místech.
//
// Nové soubory stačí přidat do libovolné složky "JSON*" vedle tohoto modulu –
// nic dalšího se v kódu měnit nemusí.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { questionsAndAnswers as fuseTrenovaciData } from '../ChatBotFuseTrainData.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

// KROK 1: najít všechny "JSON*" složky vedle tohoto souboru (JSON, JSON_Svářečská_škola, ...) ===
function najitSlozkyJSON() {
    return readdirSync(__dirname)
        .filter(nazev => nazev.startsWith('JSON') && statSync(join(__dirname, nazev)).isDirectory())
        .map(nazev => join(__dirname, nazev))
}

// KROK 2: bezpečné načtení + parsování jednoho souboru ==========================================
// COMMENT: Některé soubory mají na začátku volný "//" komentář (není to platné JSON),
//          a jeden soubor (Training_data_000.JSON) je rozpracovaný a strukturálně rozbitý.
//          Proto: 1) odstraníme řádkové komentáře, 2) zkusíme JSON.parse,
//          3) když to selže, vytáhneme aspoň otázky/odpovědi regexem (nouzový fallback),
//          ať se rozpracovaná data neztratí, jen se nezařadí pod žádné téma.
function bezpecneNacistSoubor(cesta) {
    const surovyText = readFileSync(cesta, 'utf-8')
    const bezKomentaru = surovyText
        .split('\n')
        .filter(radek => !radek.trim().startsWith('//'))
        .join('\n')
        .trim()

    if (!bezKomentaru) return { obsah: null, fallback: [] }

    try {
        return { obsah: JSON.parse(bezKomentaru), fallback: [] }
    } catch {
        return { obsah: null, fallback: extrahovatRegexem(bezKomentaru) }
    }
}

function extrahovatRegexem(text) {
    const vysledky = []
    const regex = /"question"\s*:\s*"((?:[^"\\]|\\.)*)"\s*,\s*"answer"\s*:\s*"((?:[^"\\]|\\.)*)"/g
    let shoda
    while ((shoda = regex.exec(text)) !== null) {
        vysledky.push({
            tema: null,
            typ: 'qa',
            otazka: odescapovat(shoda[1]),
            odpoved: odescapovat(shoda[2]),
        })
    }
    return vysledky
}

function odescapovat(text) {
    return text.replace(/\\"/g, '"').replace(/\\n/g, ' ').trim()
}

// KROK 3: rozpoznání tvaru dat a převod na jednotné položky {tema, typ, otazka, odpoved} =========
function normalizovatObsah(obsah) {
    if (!obsah) return []
    const polozky = []
    const seznam = Array.isArray(obsah) ? obsah : [obsah]

    for (const prvek of seznam) {
        if (!prvek || typeof prvek !== 'object') continue

        // Tvar A: { etapa, tema, data: [{question, answer}] }  (většina Training_data_0XX.JSON)
        if (Array.isArray(prvek.data)) {
            for (const qa of prvek.data) {
                if (!qa?.question || !qa?.answer) continue
                polozky.push({ tema: prvek.tema ?? prvek.Sekce ?? null, typ: 'qa', otazka: qa.question, odpoved: qa.answer })
            }
            continue
        }

        // Tvar B: volná dvojice { question, answer } mimo etapu (výskyt v Training_data_000.JSON)
        if (prvek.question && prvek.answer) {
            polozky.push({ tema: null, typ: 'qa', otazka: prvek.question, odpoved: prvek.answer })
            continue
        }

        // Tvar C: welding/"knowledge_blocks" -> { topic, facts: [{fact, source}] }
        if (Array.isArray(prvek.knowledge_blocks)) {
            for (const blok of prvek.knowledge_blocks) {
                for (const f of blok.facts ?? []) {
                    if (!f?.fact) continue
                    polozky.push({ tema: blok.topic ?? prvek.training_set ?? null, typ: 'fact', otazka: null, odpoved: f.fact })
                }
            }
            continue
        }

        // Tvar D: Chatbot.JSON -> { "Kategorie": { "otázka": "odpověď", ... } }
        for (const [kategorie, obsahKategorie] of Object.entries(prvek)) {
            if (obsahKategorie && typeof obsahKategorie === 'object' && !Array.isArray(obsahKategorie)) {
                for (const [otazka, odpoved] of Object.entries(obsahKategorie)) {
                    if (typeof odpoved !== 'string') continue
                    polozky.push({ tema: kategorie, typ: 'qa', otazka, odpoved })
                }
            }
        }
    }

    return polozky
}

// KROK 4: sesbírat úplně všechno (JSON soubory + starý in-code dataset) ==========================
export function nacistVsechnaTrenovaciData() {
    let vsechnyPolozky = []

    for (const slozka of najitSlozkyJSON()) {
        const soubory = readdirSync(slozka).filter(f => f.toLowerCase().endsWith('.json'))
        for (const soubor of soubory) {
            const { obsah, fallback } = bezpecneNacistSoubor(join(slozka, soubor))
            if (obsah) {
                vsechnyPolozky.push(...normalizovatObsah(obsah))
            } else if (fallback.length) {
                console.warn(`TrainingDataNormalizer: ${soubor} nešel naparsovat celý, použit nouzový výtah otázek/odpovědí.`)
                vsechnyPolozky.push(...fallback)
            } else {
                console.warn(`TrainingDataNormalizer: ${soubor} přeskočen (žádná použitelná data – asi jen rozpracovaná poznámka).`)
            }
        }
    }

    // Starý dataset z ChatBotFuseTrainData.js (dřív pro Fuse.js) – bereme jako další zdroj,
    // ať se ani tahle data neztratí a nemusí se přepisovat.
    for (const qa of fuseTrenovaciData) {
        vsechnyPolozky.push({ tema: null, typ: 'qa', otazka: qa.question, odpoved: qa.answer })
    }

    // Odstranění přesných duplicit (v datech jsou, viz id 20/21 a 55/56 v ChatBotFuseTrainData.js)
    const videno = new Set()
    vsechnyPolozky = vsechnyPolozky.filter(polozka => {
        const klic = `${polozka.typ}::${(polozka.otazka ?? '').toLowerCase()}::${polozka.odpoved.toLowerCase()}`
        if (videno.has(klic)) return false
        videno.add(klic)
        return true
    })

    return vsechnyPolozky.map(polozka => ({ ...polozka, refId: vytvoritRefId(polozka) }))
}

// COMMENT: Stabilní ID nezávislé na pořadí v poli -> díky tomu funguje UPSERT
//          v DocumentSaver.js a opakované spuštění SeedTrainingData.js nevytváří duplicity.
function vytvoritRefId(polozka) {
    const zaklad = `${polozka.typ}:${polozka.tema ?? ''}:${polozka.otazka ?? ''}:${polozka.odpoved}`
    return createHash('sha1').update(zaklad).digest('hex').slice(0, 16)
}

// COMMENT: Sdílené odvození id "návodu" z tématu – MUSÍ dávat stejný výsledek na obou místech,
//          kde se používá (seznam návodů níže i mapování výsledků hledání v AsistentApi.js),
//          jinak by kliknutí na výsledek hledání neotevřelo správnou kartu.
export function vytvoritNavodId(tema) {
    return `chatbot-${createHash('sha1').update(tema).digest('hex').slice(0, 10)}`
}

// KROK 5a: tvar pro embedding/Supabase (chatbot i dokumentace čerpají ze stejné funkce) =========
export function sestavitPolozkyProEmbedding() {
    return nacistVsechnaTrenovaciData().map(polozka => ({
        refId: polozka.refId,
        domain: polozka.typ === 'fact' ? 'chatbot_fact' : 'chatbot_qa',
        nadpis: polozka.tema ?? (polozka.typ === 'fact' ? 'Bezpečnostní fakta' : 'Obecné dotazy'),
        // COMMENT: embeduje se text, na který se bude dotaz podobat -> u Q&A je to samotná
        //          otázka (uživatel se ptá podobně), odpověď se posílá zvlášť v `odpoved`.
        content: polozka.typ === 'fact' ? polozka.odpoved : polozka.otazka,
        odpoved: polozka.odpoved,
    }))
}

// KROK 5b: automatické "Návody" pro Dokumentaci, seskupené podle tématu ==========================
// LOGIKA: Tohle nahrazuje ruční psaní návodů do DokuemntaceData.js pro obsah, který
//         už jednou existuje jako ChatBot Q&A. Ruční mockNavody zůstávají navíc vedle toho
//         (typicky pro obsah, co v ChatBotovi vůbec není).
export function sestavitNavodyZTrenovacichDat() {
    // COMMENT: fallback "Obecné dotazy" MUSÍ být stejný řetězec jako v sestavitPolozkyProEmbedding(),
    //          jinak by se id návodu z výsledku hledání a id v tomto seznamu rozešly.
    const qaPolozky = nacistVsechnaTrenovaciData()
        .filter(p => p.typ === 'qa')
        .map(p => ({ ...p, tema: p.tema ?? 'Obecné dotazy' }))
    const podleTematu = new Map()

    for (const polozka of qaPolozky) {
        if (!podleTematu.has(polozka.tema)) podleTematu.set(polozka.tema, [])
        podleTematu.get(polozka.tema).push(polozka)
    }

    return [...podleTematu.entries()].map(([tema, polozky]) => ({
        id: vytvoritNavodId(tema),
        nadpis: tema,
        kategorie: 'platforma',
        kroky: polozky.map(p => `${p.otazka} — ${p.odpoved}`),
        aktualizovano: new Date().toISOString().slice(0, 10),
        zdroj: 'chatbot-asistent', // COMMENT: značka, že položka vznikla automaticky z AI asistenta
    }))
}
