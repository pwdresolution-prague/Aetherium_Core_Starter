import { CLASSES, extractFeatures } from "./ColumnFeatures.js"
import { trainAndDownload } from './ColumnModel.js'
import cz_First_Names from './cz_First_Names.js'
import cz_Last_Names from './cz_Last_Names.js'

const pick = (a) => a[Math.floor(Math.random() * a.length)]
const d = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')
const ascii = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// COMMENT: cz_First_Names/cz_Last_Names jsou už normalizované (malá písmena, bez diakritiky) —
// pro trénink to nevadí, model vidí jen číselné příznaky z extractFeatures, ne samotný text.
const FIRST = cz_First_Names
const LAST = cz_Last_Names

const gen = {
    firstName: () => pick(FIRST),
    lastName: () => pick(LAST),
    email: () => `${ascii(pick(FIRST))}.${ascii(pick(LAST))}${Math.random() < 0.3 ? d(2) : ''}@${pick(['seznam.cz', 'gmail.com', 'email.cz', 'firma.cz'])}`,
    phone: () => `${pick(['', '+420 ', '00420 '])}${pick(['6', '7'])}${d(2)} ${d(3)} ${d(3)}`,
    unknown: () => pick([
        () => d(4), () => pick(['Praha', 'Brno', 'Ostrava']), () => pick(['Svářeč', 'Řidič', 'Elektrikář']),
        () => `${pick(FIRST)} ${pick(LAST)}`,   // sloupec s celým jménem záměrně = unknown
    ])(),
}

export async function run(count = 3000) {
    const samples = Array.from({ length: count }, () => {
        const label = pick(CLASSES)
        const column = Array.from({ length: 30 }, () => (Math.random() < 0.1 ? '' : gen[label]()))
        return { features: extractFeatures(column), label }
    })
    await trainAndDownload(samples)
}

run()
