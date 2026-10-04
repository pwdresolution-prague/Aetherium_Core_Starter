//FRONTEND: Sdílená sekce mezi Subscriber a Payment

import { Currency } from "lucide";

// Jediné místo, kde se počítá cena a DPH. Shrnutí ho použije pro orientační
// odhad ("kolik to asi bude stát"), Platba ho použije pro finální částku.
// Když se změní cena za studenta nebo sazba DPH, mění se JEN tenhle soubor.
// DŮLEŽITÉ: tohle je pořád frontendový výpočet. Slouží k zobrazení, ne jako
// zdroj pravdy pro to, kolik se skutečně strhne — jakmile vznikne platební
// brána, částku musí přepočítat server (Edge Function / DB funkce) ze stejných
// vstupů (počet platných studentů), protože klientskou hodnotu jde v prohlížeči
// změnit.
// ============================================================


//LOGIKA: SAZBA DPH
export const PRICING_CONFIG = {
    pricePerStudent: 490, //Kč bez DPH za jednoho studenta //COMMENT: doplnit reálnou cenu
    vatRate: 0.21,
    Currency: 'CZK',
}

//LOGIKA: Sazba DPH je vlastní funkce
//Obchodní pravidlo se mění časem, reverse-charge při DIČ z jiného členského Státu EU
//Současně pokud platforma je plátcem DPH


export function resolveVatRate(registration) {
    //TODO: Sem přichází skutečně definované pravidlo
    return PRICING_CONFIG.vatRate
}

//LOGIKA: Kompletní rozpad ceny
export function calculateOrder(registration, studentCount) {
    const vatRate = resolveVatRate(registration)
    const pricePerStudent = PRICING_CONFIG.pricePerStudent
    const subtotal = studentCount * pricePerStudent
    const vatAmount = Math.round(subtotal * vatRate)
    const total = subtotal + vatAmount

    return {
        studentCount,
        pricePerStudent,
        vatRate,
        subtotal,
        vatAmount,
        total,
        Currency: PRICING_CONFIG.Currency,

    }
}


export function formatMoney(amount, currency = PRICING_CONFIG.currency) {
    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,

    }).format(amount)
}
