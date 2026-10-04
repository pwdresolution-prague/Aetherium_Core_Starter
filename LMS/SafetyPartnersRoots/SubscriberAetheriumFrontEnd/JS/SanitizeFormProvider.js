/**COMMENT:
 * Sanitizace textového vstupu proti XSS útokům,
 * Logika escapuje HTML entity, takže ikdyž se hodnota
 * později omylem vypíše přes innerHTML, tak prohlížeč ji později
 * zobrazí jako text, ne jako použitelný kod
 *
 *
 */

export function sanitizeText(value) {
    if (typeof value !== "string") return ""
    return value
        .trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")

}

/**
 * Validace formátu IČO - 8 číslic
 */
export function isValidIco(ico) {
    return /^\d{8}$/.test(ico.trim())
}

/**
 * Validace DIČ - CZ +8 až 10 číslic.
 */
export function isValidDic(dic) {
    return /^CZ\d{8,10}$/i.test(dic.trim())
}

/**
 * Přísná validace telefonu na E.164 formát.
 */
export function formatPhoneStrict(phone) {
    const cleaned = phone.replace(/\s/g, "")
    let normalized = null

    if (cleaned.startsWith("+")) normalized = cleaned
    else if (cleaned.startsWith("00")) normalized = "+" + cleaned.slice(2)
    else if (/^[67]/.test(cleaned)) normalized = "+420" + cleaned

    if (normalized && /^\+\d{9,15}$/.test(normalized)) {
        return normalized
    }
    return null
}
