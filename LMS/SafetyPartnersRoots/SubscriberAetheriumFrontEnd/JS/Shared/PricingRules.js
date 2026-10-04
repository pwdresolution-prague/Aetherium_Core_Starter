//FRONTEND: Sdílená sekce mezi Subscriber a Payment


// Jediné místo, kde se počítá cena a DPH. Shrnutí ho použije pro orientační
// odhad ("kolik to asi bude stát"), Platba ho použije pro finální částku.
// Když se změní cena za studenta nebo sazba DPH, mění se JEN tenhle soubor.
// DŮLEŽITÉ: tohle je pořád frontendový výpočet. Slouží k zobrazení, ne jako
// zdroj pravdy pro to, kolik se skutečně strhne — jakmile vznikne platební
// brána, částku musí přepočítat server (Edge Function / DB funkce) ze stejných
// vstupů (počet platných studentů), protože klientskou hodnotu jde v prohlížeči
// změnit.
// ============================================================

// Jediné místo s cenovým pravidlem na FRONTENDU. Slouží jen k ZOBRAZENÍ.
// Zdrojem pravdy je server (SQL funkce calculate_order_amounts), která počítá ze stejných vstupů.
export const PRICING_CONFIG = {
    pricePerStudentMinor: 49000, // 490 Kč v haléřích, bez DPH
    vatRate: 0.21,
    currency: 'CZK',
}

export function resolveVatRate(registration) {
    return PRICING_CONFIG.vatRate // TODO: reverse-charge, neplátce DPH...
}

// Všechny peněžní hodnoty jsou v HALÉŘÍCH (celá čísla), žádná desetinná čísla.
export function calculateOrder(registration, studentCount) {
    const vatRate = resolveVatRate(registration)
    const pricePerStudent = PRICING_CONFIG.pricePerStudentMinor
    const subtotal = studentCount * pricePerStudent
    const vatAmount = Math.round(subtotal * vatRate)
    return {
        studentCount, pricePerStudent, vatRate,
        subtotal, vatAmount, total: subtotal + vatAmount,
        currency: PRICING_CONFIG.currency,
    }
}

// Přijímá haléře, zobrazí koruny
export function formatMoney(amountMinor, currency = PRICING_CONFIG.currency) {
    return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency }).format(amountMinor / 100)
}
