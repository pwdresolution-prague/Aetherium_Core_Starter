//FRONTEND: Centralizace
//COMMENT: Soubory pro centralizaci dat - Jediné místo sběru dat
//          ProviderAetherium.js
//          FormToPaySubscriber.js
//          StudentImport.js
//          PamentSubscriber.js

const KEYS = Object.freeze({
    registration: 'aetherium.registration', //FRONTEND: Veškerá data z aetherium formu - IČO, DIČ...
    import: 'aetherium.import',             //FRONTEND: Kompletní výsledek importu CSV
    order: 'aetherium.order',               //FRONTEND: Finální objednávka, těsně před platbou
})


const NEVER_PERSIST = new Set(['hesloId', 'potvrzení-hesla', 'mfa-otp'])

function readJson(key) {
    try {
        return JSON.parse(sessionStorage.getItem(key) ?? 'null')

    } catch {
        console.warn(`[Store] Poškozená data pod klíčem "${key}", ignoruji.`)

        return null
    }
}

 function writeJson(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value))

 }

//=====================================================================================================================
 //FRONTEND: REGISTRACE FORMULÁŘE IndexSubscriber.html

 //SanitizedValues = výstup validateForm() z ValidateForm.js
//(objekt: id pole formuláře - sanitizovaná hodnota, např { ičoId: '12345678' })
export function setRegistration(sanitizedValues) {
    const safeValues = Object.fromEntries(
        Object.entries(sanitizedValues).filter(([id]) => !NEVER_PERSIST.has(id))

    )
    writeJson(KEYS.registration, {
        values: safeValues,
        savedAt: new Date().toISOString(),
    })
}


//COMMENT: Vrací pole hodnot (id pole - hodnota), nebo null, pokud form ještě neproběhl
export function getRegistration() {
    return readJson(KEYS.registration)?.values ?? null
}

//==========================================================================================================================
//FRONTEND: IMPORT - kompletní výsledek nahraného CSV/XLSX ze Summary.html
// payload:
//   fileName    — název nahraného souboru
//   valid       — [{ firstName, lastName, email, phone }]  ← Toto se fakturuje
//   invalid     — [{ row, errors, raw }]
//   duplicates  — počet řádků vyřazených jako duplicitní e-mail

export function setImport(payload) {
    writeJson(KEYS.import, {
        ...payload,
        savedAt: new Date().toISOString(),
    })
}
export function getImport() {
    return readJson(KEYS.import)
}

//FRONTEND: Kolik se reálně fakturuje studentů...
export function getBillableStudentCount() {
    return getImport()?.valid?.length ?? 0
}


//FRONTEND: OBJEDNÁVKA Sestaví ji PaymentSubscriber.js těsně před platbou

export function setPendingOrder(order) {
    writeJson(KEYS.order, order)
}


export function getPendingOrder() {
    return readJson(KEYS.order)

}

//COMMENT: Volá se po úspěšné dokončené platbě( Jakmile bude brána napojená)
export function clearAll() {
    Object.values(KEYS).forEach((key) => sessionStorage.removeItem(key))

}
