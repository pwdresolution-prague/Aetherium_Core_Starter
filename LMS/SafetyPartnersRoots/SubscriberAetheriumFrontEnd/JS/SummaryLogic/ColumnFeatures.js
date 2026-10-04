import { normalize } from './Normalize.js'
import cz_First_Names from './cz_First_Names.js'
import cz_Last_Names from './cz_Last_Names.js'          // <-- přidat

export const CLASSES = ['firstName', 'lastName', 'email', 'phone', 'unknown']
export const FEATURE_COUNT = 10

const CZ_FIRST_NAMES = new Set(cz_First_Names)
const CZ_LAST_NAMES = new Set(cz_Last_Names)             // <-- přidat

const SURNAME_SUFFIX = /(ova|sky|ska|ek|ik|ka|ny|ly|ec)$/

const isFirstName = (s) => {
    const n = normalize(s)
    if (CZ_FIRST_NAMES.has(n)) return true
    const tokens = n.split(/[\s-]+/).filter(Boolean)
    return tokens.length > 1 && tokens.every((t) => CZ_FIRST_NAMES.has(t))
}

const isLastName = (s) => {                               // <-- přidat
    const n = normalize(s)
    return CZ_LAST_NAMES.has(n) || SURNAME_SUFFIX.test(n)
}

const isSingleCapitalizedWord = (s) =>
    /^\p{Lu}\p{Ll}+$/u.test(s) || /^\p{Lu}{2,}$/u.test(s)

export function extractFeatures(values) {
    const sample = values.slice(0, 100)
    const v = sample.map((x) => String(x ?? '').trim()).filter(Boolean)
    const n = v.length || 1
    const ratio = (fn) => v.filter(fn).length / n
    const digits = (s) => s.replace(/\D/g, '')

    return [
        ratio((s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)),
        ratio((s) => /^[\d\s+\-()]+$/.test(s) && digits(s).length >= 9 && digits(s).length <= 15),
        ratio(isFirstName),
        ratio(isLastName),                                 // <-- místo SURNAME_SUFFIX inline
        ratio(isSingleCapitalizedWord),
        ratio((s) => s.includes(' ')),
        ratio((s) => /\d/.test(s)),
        ratio((s) => s.includes('@')),
        Math.min(v.reduce((a, s) => a + s.length, 0) / n / 30, 1),
        1 - v.length / Math.max(values.length, 1),
    ]
}
