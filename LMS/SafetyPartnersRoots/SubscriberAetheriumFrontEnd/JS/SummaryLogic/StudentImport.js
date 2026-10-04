// ============================================================
// JS/SummaryLogic/StudentImport.js
// ------------------------------------------------------------
// SEKCE: Subscriber — import studentů (Summary.html)
//
// Zpracuje nahrané CSV/XLSX: rozpozná sloupce (hlavičky + ML klasifikátor +
// ruční doplnění), rozdělí řádky na platné / chybné / duplicitní a CELÝ tenhle
// výsledek uloží přes AetheriumClientStore.js — ne jen platné řádky.
//
// OPRAVENO oproti původní verzi: handleFile() dřív ukládal do sessionStorage
// jen result.valid. Chybné řádky a počet duplicit existovaly jen v paměti pro
// jednorázové vykreslení výsledku a při odchodu ze stránky zmizely beze stopy —
// i jejich původní hodnoty. Teď se ukládá vše přes setImport().
// ============================================================

import Papa from 'papaparse'
import { extractFeatures } from './ColumnFeatures.js'
import { setImport, getImport } from '../Shared/AetheriumClientStore.js'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_ROWS = 5000

const FIELD_ALIASES = {
    firstName: ['jmeno', 'first name', 'firstname', 'name'],
    lastName: ['prijmeni', 'last name', 'lastname', 'surname'],
    email: ['email', 'e-mail', 'mail'],
    phone: ['telefon', 'tel', 'mobil', 'phone'],
}

const FIELD_OPTIONS = [
    { value: '', label: 'Ignorovat' },
    { value: 'firstName', label: 'Jméno' },
    { value: 'lastName', label: 'Příjmení' },
    { value: 'email', label: 'E-mail' },
    { value: 'phone', label: 'Telefon' },
]

const normalize = (s) =>
    String(s).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()

//TODO: ================== načtení souboru =======================================
async function parseCsv(file) {
    const buf = await file.arrayBuffer()
    let text = new TextDecoder('utf-8').decode(buf)
    if (text.includes('\uFFFD')) text = new TextDecoder('windows-1250').decode(buf)
    text = text.replace(/^\uFEFF/, '')
    return Papa.parse(text, { header: true, skipEmptyLines: true }).data
}

async function parseSheet(file) {
    const XLSX = await import('xlsx')
    const wb = XLSX.read(await file.arrayBuffer())
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' })
}

async function readRows(file) {
    if (file.size > MAX_SIZE) throw new Error('Soubor je větší než 5 MB')
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'csv') return parseCsv(file)
    if (['xlsx', 'xls'].includes(ext)) return parseSheet(file)
    throw new Error('Nepodporovaný typ souboru')
}

//TODO: =============================== Mapování ==================================
function buildHeaderMap(row) {
    const map = {}
    for (const key of Object.keys(row)) {
        const n = normalize(key)
        for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
            if (aliases.includes(n)) map[key] = field
        }
    }
    return map
}

const FIELDS = ['firstName', 'lastName', 'email', 'phone']
const MIN_CONFIDENCE = 0.6

// Vrací mapu z hlaviček + ML odhad, plus seznam dosud nejistých sloupců pro ruční doplnění.
async function buildColumnMap(rows) {
    const map = buildHeaderMap(rows[0])
    const columnKeys = Object.keys(rows[0])
    let probsByColumn = {}
    let classes = []

    const freeAfterHeaders = columnKeys.filter((k) => !(k in map))
    if (freeAfterHeaders.length) {
        try {
            const { predictColumns } = await import('./ColumnModel.js')
            const { CLASSES } = await import('./ColumnFeatures.js')
            classes = CLASSES
            const probs = await predictColumns(freeAfterHeaders.map((k) => rows.map((r) => r[k])))
            freeAfterHeaders.forEach((key, i) => { probsByColumn[key] = probs[i] })

            const mapped = new Set(Object.values(map))
            const missing = FIELDS.filter((f) => !mapped.has(f))
            for (const field of missing) {
                const idx = CLASSES.indexOf(field)
                let best = -1, bestP = MIN_CONFIDENCE, bestKey = null
                freeAfterHeaders.forEach((key) => {
                    const p = probsByColumn[key][idx]
                    if (p > bestP && !(key in map)) { bestP = p; bestKey = key }
                })
                if (bestKey) map[bestKey] = field
            }
        } catch (err) {
            console.warn('Klasifikátor sloupců není dostupný, používám jen hlavičky:', err)
        }
    }

    // Sloupce, které ani hlavičky, ani model jednoznačně nepřiřadily
    const stillFree = columnKeys.filter((k) => !(k in map))
    return { map, stillFree, probsByColumn, classes }
}

//TODO: ============================== Ruční doplnění ==================================
function sampleValues(rows, key, count = 3) {
    return rows.map((r) => String(r[key] ?? '').trim()).filter(Boolean).slice(0, count).join(', ')
}

// Zobrazí panel s <select> pro každý nejistý sloupec a čeká na potvrzení uživatelem.
// Vrací Promise<Map<sloupec, field>> — field je '' pro "Ignorovat".
function askManualMapping(rows, missingFields, stillFree, probsByColumn, classes) {
    return new Promise((resolve) => {
        const box = document.getElementById('importMappingId')
        box.hidden = false
        box.replaceChildren()

        const intro = document.createElement('p')
        intro.className = 'MappingSample'
        intro.textContent = `Chybí: ${missingFields.map((f) => FIELD_OPTIONS.find((o) => o.value === f)?.label).join(', ')}. Přiřaďte prosím zbylé sloupce:`
        box.append(intro)

        const selects = []
        stillFree.forEach((key) => {
            const row = document.createElement('div')
            row.className = 'MappingRow'

            const name = document.createElement('div')
            name.className = 'MappingColumnName'
            name.textContent = key
            row.append(name)

            const sample = document.createElement('div')
            sample.className = 'MappingSample'
            sample.textContent = sampleValues(rows, key)
            row.append(sample)

            const select = document.createElement('select')
            select.className = 'MappingSelect'
            select.dataset.key = key
            FIELD_OPTIONS.forEach(({ value, label }) => {
                const opt = document.createElement('option')
                opt.value = value
                opt.textContent = label
                select.append(opt)
            })

            // Předvyplnění nejpravděpodobnějším odhadem modelu, pokud existuje
            const probs = probsByColumn[key]
            if (probs && classes.length) {
                const bestIdx = probs.indexOf(Math.max(...probs))
                const guess = classes[bestIdx]
                if (FIELDS.includes(guess)) select.value = guess
            }

            row.append(select)
            box.append(row)
            selects.push(select)
        })

        const confirm = document.createElement('button')
        confirm.type = 'button'
        confirm.className = 'MappingConfirm'
        confirm.textContent = 'Potvrdit mapování'
        confirm.addEventListener('click', () => {
            const result = new Map()
            selects.forEach((s) => { if (s.value) result.set(s.dataset.key, s.value) })
            box.hidden = true
            box.replaceChildren()
            resolve(result)
        })
        box.append(confirm)
    })
}

//TODO: =============================== Validace ==================================
function normalizePhone(raw) {
    const p = String(raw).replace(/[\s\-()]/g, '')
    if (!p) return ''
    if (/^\d{9}$/.test(p)) return '+420' + p
    if (/^00\d+$/.test(p)) return '+' + p.slice(2)
    return p
}

function validateRows(rows, headerMap) {
    const valid = [], invalid = [], seen = new Set()
    let duplicates = 0

    rows.forEach((raw, i) => {
        const s = {}
        for (const [key, field] of Object.entries(headerMap)) s[field] = String(raw[key] ?? '').trim()
        s.email = (s.email ?? '').toLowerCase()
        s.phone = normalizePhone(s.phone ?? '')

        const errors = []
        if (!s.firstName) errors.push('chybí jméno')
        if (!s.lastName) errors.push('chybí příjmení')
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email)) errors.push('neplatný e-mail')
        if (s.phone && !/^\+\d{9,15}$/.test(s.phone)) errors.push('neplatný telefon')

        // OPRAVENO: dřív se u chybných řádků ukládalo jen číslo řádku + chyby —
        // samotné hodnoty (jméno, e-mail...) se ztratily. `raw` je originální
        // řádek ze souboru, aby šlo chybu později opravit bez nového nahrání.
        if (errors.length) { invalid.push({ row: i + 2, errors, raw }); return }
        if (seen.has(s.email)) { duplicates++; return }
        seen.add(s.email)
        valid.push(s)
    })

    return { valid, invalid, duplicates }
}

//TODO: ==================== Korekce pro budoucí trénink ==================
// Ukládá jen číselné příznaky sloupce + zvolený štítek — žádná jména ani e-maily.
// TODO: napojit na Supabase (tabulka column_corrections, RLS podle tenant_id).
function saveCorrections(rows, corrections) {
    if (!corrections.size) return
    const entries = [...corrections.entries()].map(([key, field]) => ({
        features: extractFeatures(rows.map((r) => r[key])),
        label: field,
        source: 'manual-mapping',
        savedAt: new Date().toISOString(),
    }))
    const existing = JSON.parse(localStorage.getItem('columnCorrections') ?? '[]')
    localStorage.setItem('columnCorrections', JSON.stringify([...existing, ...entries]))
}

async function processRows(rows) {
    if (rows.length === 0) throw new Error('Soubor neobsahuje žádná data')
    if (rows.length > MAX_ROWS) throw new Error(`Maximum je ${MAX_ROWS} řádků`)

    const { map, stillFree, probsByColumn, classes } = await buildColumnMap(rows)

    const mapped = new Set(Object.values(map))
    const missingFields = FIELDS.filter((f) => !mapped.has(f))

    let finalMap = map
    if (missingFields.length && stillFree.length) {
        const manual = await askManualMapping(rows, missingFields, stillFree, probsByColumn, classes)
        saveCorrections(rows, manual)
        finalMap = { ...map }
        manual.forEach((field, key) => { finalMap[key] = field })
    }

    if (!Object.values(finalMap).includes('email')) {
        throw new Error('Nenalezen sloupec s e-mailem')
    }

    return validateRows(rows, finalMap)
}

//TODO: ============================== Náhled ==================================
function renderResult({ valid, invalid, duplicates, fileName }) {
    const box = document.getElementById('importResultId')
    box.hidden = false
    box.replaceChildren()

    if (fileName) {
        const f = document.createElement('p')
        f.textContent = `Soubor: ${fileName}`
        box.append(f)
    }

    const stats = document.createElement('p')
    stats.textContent = `Platných: ${valid.length} · Chybných: ${invalid.length} · Duplicit: ${duplicates}`
    box.append(stats)

    invalid.slice(0, 5).forEach(({ row, errors }) => {
        const p = document.createElement('p')
        p.className = 'ImportError'
        p.textContent = `Řádek ${row}: ${errors.join(', ')}`
        box.append(p)
    })
}

function showError(msg) {
    const box = document.getElementById('importResultId')
    box.hidden = false
    box.replaceChildren()
    const p = document.createElement('p')
    p.className = 'ImportError'
    p.textContent = msg
    box.append(p)
}

//TODO: ======================== Init ===========================
async function handleFile(file) {
    try {
        const result = await processRows(await readRows(file))

        // Uloží se VŠECHNO, co import vyprodukoval — platné i chybné řádky
        // i počet duplicit — aby se s tím dalo pracovat na Shrnutí i Platbě
        // a přežilo to reload stránky.
        setImport({
            fileName: file.name,
            valid: result.valid,
            invalid: result.invalid,
            duplicates: result.duplicates,
        })

        renderResult({ ...result, fileName: file.name })
    } catch (err) {
        showError(err.message)
    }
}

export function initStudentImport() {
    const zone = document.getElementById('importDropZoneId')
    const input = document.getElementById('importFileId')
    if (!zone || !input) return

    input.addEventListener('change', async () => {
        if (input.files[0]) await handleFile(input.files[0])
        input.value = ''
    })

    zone.addEventListener('dragover', (e) => {
        e.preventDefault()
        zone.classList.add('is-over')
    })
    zone.addEventListener('dragleave', () => zone.classList.remove('is-over'))
    zone.addEventListener('drop', (e) => {
        e.preventDefault()
        zone.classList.remove('is-over')
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
    })
}

initStudentImport()

// LOGIKA: po reloadu (F5) je import uložený ve store, ale panel byl prázdný —
// výsledek posledního importu se teď vrátí zpět do panelu
const savedImport = getImport()
if (savedImport) renderResult(savedImport)
