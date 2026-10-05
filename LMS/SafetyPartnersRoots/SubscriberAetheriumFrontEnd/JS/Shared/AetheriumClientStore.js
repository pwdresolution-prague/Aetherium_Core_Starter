const SCHEMA_VERSION = 1
const TTL_MS = 2 * 60 * 60 * 1000   // data v session platí 2 hodiny

const KEYS = Object.freeze({
    registration: 'aetherium.registration',
    import:       'aetherium.import',
    order:        'aetherium.order',
    orderId:      'aetherium.orderId',
})

// WHITELIST: id pole formuláře → klíč v datovém modelu. Heslo, OTP a GDPR checkbox tu nejsou,
// takže se nedají uložit, ani kdyby někdo přidal další pole a zapomněl ho vyřadit.
const FIELD_MAP = Object.freeze({
    'ičoId': 'ico',                       'dicId': 'dic',
    'název-firmyId': 'companyName',       'právní-formaId': 'legalForm',
    'sídlo-společnostiId': 'seat',        'datum-založeníId': 'foundedAt',
    'stav-subjektuId': 'entityStatus',    'spisová-značkaId': 'fileNumber',
    'datová-schránkaId': 'dataBox',       'telefonní-číslo': 'phone',
    'emailId': 'email',                   'adresa': 'address',
    'Obor-podnikání': 'businessField',    'sectorSelectorId': 'sector',
    'početŠkoleníSubscriber': 'expectedCourses',
    'CompanyTextId': 'description',       'účelId': 'purpose',
})

function read(key) {
    try {
        const env = JSON.parse(sessionStorage.getItem(key) ?? 'null')
        if (!env || env.v !== SCHEMA_VERSION) return null            // stará verze dat = zahodit
        if (Date.now() - env.t > TTL_MS) { sessionStorage.removeItem(key); return null }
        return env.data
    } catch {
        sessionStorage.removeItem(key)
        return null
    }
}
// LOGIKA: každý zápis rozešle událost 'aetherium:store-changed'. Stránka (Shrnutí)
// na ni poslouchá a překreslí se sama — bez ručního F5. 'storage' událost tu nestačí,
// protože se v rámci stejné záložky nespouští.
export const STORE_CHANGED = 'aetherium:store-changed'
const write = (key, data) => {
    sessionStorage.setItem(key, JSON.stringify({ v: SCHEMA_VERSION, t: Date.now(), data }))
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(STORE_CHANGED, { detail: { key } }))
    }
}

// values = výstup validateForm() (id pole → hodnota). Uloží se jen to, co je ve FIELD_MAP.
export function setRegistration(values) {
    const model = {}
    for (const [fieldId, key] of Object.entries(FIELD_MAP)) {
        const v = values[fieldId]
        if (v != null && v !== '') model[key] = String(v)
    }
    write(KEYS.registration, model)
}
export const getRegistration = () => read(KEYS.registration)

export const setImport = (payload) => write(KEYS.import, payload)
export const getImport = () => read(KEYS.import)
export const getBillableStudentCount = () => getImport()?.valid?.length ?? 0
export const clearImport = () => sessionStorage.removeItem(KEYS.import)

export const setPendingOrder = (order) => write(KEYS.order, order)
export const getPendingOrder = () => read(KEYS.order)
export const setOrderId = (id) => write(KEYS.orderId, id)
export const getOrderId = () => read(KEYS.orderId)

export function clearAll() { Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k)) }
