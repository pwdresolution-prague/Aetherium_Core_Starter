import { isValidIco, isValidDic, formatPhoneStrict, sanitizeText } from '../JS/SanitizeFormProvider.js'

//COMMENT: Centrální konfigurace pravidel pro každé pole formuláře
//LOGIKA: Namísto validace v souboru ScriptAetherium, je vytvořena tabulka
//          "ičoId" => pravidlo  - Přidání /  změna pole
//  = úprava jednoho řádku nikoliv celé pole
//

export const FIELD_RULES = {
    "ičoId":                { required: true, validate: isValidIco },
    "dicId":                { required: false, validate: isValidDic }, // ← required: false, sedí s HTML
    "název-firmyId":        { required: true, minLength: 2, maxLength: 120 },
    "sídlo-společnostiId":  { required: true, minLength: 5, maxLength: 200 },
    "telefonní-číslo":      { required: true, validate: (v) => formatPhoneStrict(v) !== null },
    "emailId":                { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    "hesloId":                { required: true, minLength: 8, maxLength: 64 },
    "potvrzení-hesla":      { required: true },
}

export function validateField(id, rawValue) {
    const sanitizeRule = FIELD_RULES[id]
    // Surová hodnota. Escapuje se až při výpisu do HTML. Heslo se neořezává (mezery jsou jeho součást).
    const isSecret = id === 'hesloId' || id === 'potvrzení-hesla'
    const sanitizeValue = isSecret ? String(rawValue ?? '') : String(rawValue ?? '').trim()

    if (!sanitizeRule) return { valid: true, value: sanitizeValue, error: null }

    if (sanitizeRule.required && sanitizeValue.length === 0) {
        return { valid: false, value: sanitizeValue, error: 'Toto pole je povinné' }
    }

    // LOGIKA: Jen při vynechání DIČ
    //
    if (!sanitizeRule.required && sanitizeValue.length === 0) {
        return { valid: true, value: sanitizeValue, error: null }
    }

    if (sanitizeRule.minLength && sanitizeValue.length < sanitizeRule.minLength) {
        return { valid: false, value: sanitizeValue, error: `Minimální délka je ${sanitizeRule.minLength} znaků` }
    }
    if (sanitizeRule.maxLength && sanitizeValue.length > sanitizeRule.maxLength) {
        return { valid: false, value: sanitizeValue, error: `Maximální délka je ${sanitizeRule.maxLength} znaků` }
    }
    if (sanitizeRule.pattern && !sanitizeRule.pattern.test(sanitizeValue)) {
        return { valid: false, value: sanitizeValue, error: "Neplatný formát" }
    }
    if (sanitizeRule.validate && !sanitizeRule.validate(sanitizeValue)) {
        return { valid: false, value: sanitizeValue, error: "Neplatná hodnota" }
    }

    return { valid: true, value: sanitizeValue, error: null }
}



//TODO: ==============================================================================================================
//
// ======================== ČTI POZORNĚ ====================================================================


//COMMENT: Validace hodnoty
//LOGIKA: Nejdříve Sanitizace ořízne HTML entitu,  required,
//         délku, vlastní validate nebo regex pattern
// COMMENT: výstup z formu pak vrací vždy value, valid, error...catch((Value je už sanitizované
// takže se nevolá znovu SanititzeText()
//

//LOGIKA: Jen v případě zahrnutí DIČ ================================================================================
/*
export function validateField(id, rawValue) {
    const sanitizeRule = FIELD_RULES[id]
    const sanitizeValue = sanitizeText(rawValue)

    if(!sanitizeRule) return { valid: true, value: sanitizeValue, error: null }

    if (sanitizeRule.required && sanitizeValue.length === 0) {
        return { valid: false, value: sanitizeValue, error: 'Toto pole je povinné'}
    }
    if(sanitizeRule.minLength && sanitizeValue.length < sanitizeRule.minLength) {
        return { valid: false, value: sanitizeValue, error: `Minimální délka je ${sanitizeRule.minLength} znaků`}
    }
    if(sanitizeRule.maxLength && sanitizeValue.length > sanitizeRule.maxLength) {
        return { valid: false, value: sanitizeValue, error: `Maximální délka je ${sanitizeRule.maxLength} znaků`}

    }
    if(sanitizeRule.pattern && !sanitizeRule.pattern.test(sanitizeValue)) {
        return { valid: false, value: sanitizeValue, error: "Neplatný formát"}
    }
    if(sanitizeRule.validate && !sanitizeRule.validate(sanitizeValue)) {
        return { valid: false, value: sanitizeValue, error: "Neplatná hodnota"}
    }

    return { valid: true, value: sanitizeValue, error: null }


 }
*/


//LOGIKA: Jen v případě vynechání DIČ




     //LOGIKA: Iteruji všechny prvky formuláře (FormEl.elements),
    // Především přes klíč FIELD_RULES, tudíž neprojde žádné pole bez Sanitizace
    //
    //
export function validateForm(formEl) {
    const errors = {}
    const sanitizedValues = {}
    let isValid = true

    for (const el of formEl.elements) {
        if(!el.id || el.type === "submit" || el.type === "button") continue

        const result = validateField(el.id, el.value)
        sanitizedValues[el.id] = result.value

        if(!result.valid) {
            isValid = false
            errors[el.id] = result.error
        }
    }

    //TODO:
    if (sanitizedValues["hesloId"] && sanitizedValues["potvrzení-hesla"] &&
        sanitizedValues["hesloId"] !== sanitizedValues["potvrzení-hesla"]) {
        isValid = false
        errors["potvrzení-hesla"] = "Hesla se neshodují."




        }

    return { isValid, errors, sanitizedValues }

}
