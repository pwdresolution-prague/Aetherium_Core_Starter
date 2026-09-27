import { mockNavody, mockLegislativaStudent, mockMaterialy } from './DokuemntaceData.js'

export const DOKUMENTACE_CONFIG = {
    internalApiBases: "/api/dokumentace",
    legislativaApiBases: "/api/legislativa",
    aiSearchEndpoint: "/api/ai/dokumentace-search", // TODO: sem napojíš svůj AI model
    chacheTtlMs: 1000 * 60 * 30,
}

async function bezpecnyLoading(url, fallbackData, popis) {
    try {
        const odpoved = await fetch(url)
        if (!odpoved.ok) throw new Error(`API: Vrátilo stav ${odpoved.status}`)
        return { data: await odpoved.json(), zdroj: "api" }
    } catch (chyba) {
        console.warn(`Dokumentace: ${popis} nedostupné, použita mock data`, chyba)
        return { data: fallbackData, zdroj: "mock" }
    }
}

export async function nacistNavody() {
    return bezpecnyLoading(`${DOKUMENTACE_CONFIG.internalApiBases}/navody`, mockNavody, "návody")
}

export async function nacistLegislativuStudent() {
    return bezpecnyLoading(`${DOKUMENTACE_CONFIG.legislativaApiBases}/predpisy`, mockLegislativaStudent, "legislativa")
}

export async function nacistMaterialy() {
    return bezpecnyLoading(`${DOKUMENTACE_CONFIG.internalApiBases}/materialy`, mockMaterialy, "materiály")
}

export async function zaznamenatStazeniMaterialu(materialId) {
    try {
        const odpoved = await fetch(`${DOKUMENTACE_CONFIG.internalApiBases}/materialy/${materialId}/stazeno`, {
            method: "POST",
        })
        if (!odpoved.ok) throw new Error(`API: vrátilo stav ${odpoved.status}`)
        return { uspech: true }
    } catch (chyba) {
        console.warn("Dokumentace: stažení materiálů se nepodařilo zaznamenat na server", chyba)
        return { uspech: false, chyba: chyba.message }
    }
}

// LOGIKA: jediné místo pro napojení AI modelu – vrací stejný tvar {vysledky, zdroj},
// který DokuemntaceLogika.js už umí zpracovat (viz `vysledky ?? lokalniFallbackHledani(dotaz)`)
export async function hledatDokumentaci(dotaz) {
    try {
        const odpoved = await fetch(DOKUMENTACE_CONFIG.aiSearchEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dotaz }),
        })
        if (!odpoved.ok) throw new Error(`AI vyhledávání: vrátilo stav ${odpoved.status}`)
        const { vysledky } = await odpoved.json()
        return { vysledky, zdroj: "ai" }
    } catch (chyba) {
        console.warn("Dokumentace: AI vyhledávání nedostupné, použit lokální fallback", chyba)
        return { vysledky: null, zdroj: "fallback" }
    }
}
