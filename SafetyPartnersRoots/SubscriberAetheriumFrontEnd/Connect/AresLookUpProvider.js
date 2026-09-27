// ============================================================
// AresLookup.js — Automatické doplnění údajů z ARES
// Aetherium Core Enterprise | Registrační formulář
// ============================================================

const PROVIDER_ARES_API_BASE = "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty"

// AresLookup.js
//const PROVIDER_ARES_API_BASE = "/api/ares"

// ============================================================
// VALIDACE IČO
// ============================================================

/**
 * Ověří, zda je IČO validní (8 číslic + kontrolní součet)
 * @param {string} ico
 * @returns {boolean}
 */
export function validateIco(ico) {
    const cleaned = ico.replace(/\s/g, "")

    if (!/^\d{8}$/.test(cleaned)) return false;

    // Kontrolní součet dle české legislativy
    const digits = cleaned.split("").map(Number)
    const weights = [8, 7, 6, 5, 4, 3, 2]
    const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0)
    const remainder = sum % 11;

    let checkDigit
    if (remainder === 0) checkDigit = 1
    else if (remainder === 1) checkDigit = 0
    else checkDigit = 11 - remainder

    return checkDigit === digits[7]
}

// ============================================================
// FETCH DAT Z ARES
// ============================================================

/**
 * Načte data ekonomického subjektu z ARES API
 * @param {string} ico — IČO firmy (8 číslic)
 * @returns {Promise<Object>} — parsovaná data nebo vyhodí chybu
 */
export async function fetchAresData(ico) {
    const cleaned = ico.replace(/\s/g, "").padStart(8, "0")

    if (!validateIco(cleaned)) {
        throw new AresError("INVALID_ICO", "IČO není platné. Zadejte 8číselné IČO.")
    }

    const url = `${PROVIDER_ARES_API_BASE}/${cleaned}`

    let response;




    try {
        response = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" },
    cache: "no-store"   // vynutí čerstvý request, ignoruje uloženou 404 odpověď z dřívějška
});

    } catch (networkError) {
        throw new AresError("NETWORK_ERROR", "Nepodařilo se spojit s ARES. Zkontrolujte připojení k internetu.")
    }

    if (response.status === 404) {
        throw new AresError("NOT_FOUND", "Subjekt s tímto IČO nebyl nalezen v ARES.")
    }

    if (!response.ok) {
        throw new AresError("API_ERROR", `ARES vrátil chybu: ${response.status}`)
    }

    const raw = await response.json()
    return parseAresResponse(raw)
}

// ============================================================
// PARSOVÁNÍ ODPOVĚDI
// ============================================================

/**
 * Převede surovou ARES odpověď na čistý objekt pro formulář
 * @param {Object} data — raw JSON z ARES API
 * @returns {Object} — normalizovaná data
 */
function parseAresResponse(data) {
    // Sestavení adresy sídla
    const sidlo = data.sidlo ?? {}
    const adresniCasti = [
        sidlo.nazevUlice,
        sidlo.cisloDomovni ? `${sidlo.cisloDomovni}${sidlo.cisloOrientacni ? `/${sidlo.cisloOrientacni}` : ""}` : null,
        sidlo.nazevObce,
        sidlo.psc ? formatPsc(sidlo.psc) : null,
    ].filter(Boolean);

    const textovaAdresa = sidlo.textovaAdresa ?? adresniCasti.join(", ") ?? ""

    // Datum vzniku — formát DD.MM.RRRR
    const datumVzniku = data.datumVzniku
        ? formatDate(data.datumVzniku)
        : ""

    // Datová schránka — první nalezená
    const datoveSchranky = data.datoveSchranky ?? []
    const datovaSchranka = datoveSchranky.length > 0
        ? datoveSchranky[0].identifikator ?? ""
        : ""

    // Spisová značka — z rejstříkových zápisů
    const zaznamy = data.zaznamy ?? []
    const spisovaZnacka = zaznamy.length > 0
        ? zaznamy[0].spisovaZnacka ?? ""
        : ""

    // Právní forma — kód + název
    const pravniForma = data.pravniForma?.nazev ?? ""

    // Stav subjektu
    const stavSubjektu = data.stavSubjektu?.nazev ?? "Aktivní"

    return {
        ico:            data.ico ?? "",
        dic:            data.dic ?? "",
        nazevFirmy:     data.obchodniJmeno ?? "",
        pravniForma,
        sidloSpolecnosti: textovaAdresa,
        datumZalozeni:  datumVzniku,
        stavSubjektu,
        spisovaZnacka,
        datovaSchranka,
    };
}

// ============================================================
// VYPLNĚNÍ FORMULÁŘE
// ============================================================

/**
 * Vyplní DOM elementy formuláře daty z ARES
 * @param {Object} data — výstup z parseAresResponse()
 */
export function fillFormFromAres(data) {
    const fieldMap = {
        "dicId":                    data.dic,
        "název-firmyId":            data.nazevFirmy,
        "právní-formaId":           data.pravniForma,
        "sídlo-společnostiId":      data.sidloSpolecnosti,
        "datum-založeníId":         data.datumZalozeni,
        "stav-subjektuId":          data.stavSubjektu,
        "spisová-značkaId":         data.spisovaZnacka,
        "datová-schránkaId":        data.datovaSchranka,
    };

    for (const [id, value] of Object.entries(fieldMap)) {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`[ARES] Element #${id} nenalezen v DOM.`)
            continue;
        }

        el.value = value ?? ""

        // Vizuální feedback — pole se "rozsvítí" po vyplnění
        if (value) {
            el.classList.add("ares-filled")
            el.classList.remove("ares-error")
        }
    }
}

// ============================================================
// UI FEEDBACK
// ============================================================

/**
 * Zobrazí stav načítání / úspěchu / chyby u IČO pole
 * @param {"loading"|"success"|"error"|"idle"} state
 * @param {string} [message]
 */
export function setAresStatus(state, message = "") {
    const icoInput   = document.getElementById("ičoId");
    const statusEl   = document.getElementById("ares-status"); // volitelný element

    // CSS třídy na input
    icoInput?.classList.remove("ares-loading", "ares-success", "ares-error");
    if (state !== "idle") icoInput?.classList.add(`ares-${state}`);

    // Textový status (pokud máš element #ares-status ve formuláři)
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `ares-status ares-status--${state}`;
        statusEl.hidden = state === "idle";
    }
}

// ============================================================
// HLAVNÍ HANDLER — připojení na IČO input
// ============================================================

/**
 * Inicializuje ARES lookup — zavolej po načtení DOMu
 * Automaticky se spustí po zadání validního IČO (blur event)
 */
export function initAresLookup() {
    const icoInput = document.getElementById("ičoId");

    if (!icoInput) {
        console.error("[ARES] Element #ičoId nenalezen. initAresLookup() přeskočen.");
        return;
    }

    // Spustit při opuštění pole (blur)
    icoInput.addEventListener("blur", handleAresLookup);

    // Spustit při stisku Enter přímo v poli
    icoInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAresLookup();
        }
    });

    // Vyčistit status při novém psaní
    icoInput.addEventListener("input", () => {
        setAresStatus("idle");
        clearAresFills();
    });

    console.log("[ARES] Lookup inicializován na #ičoId");
}

/**
 * Interní handler — orchestruje celý flow fetch → fill → feedback
 */
async function handleAresLookup() {
    const icoInput = document.getElementById("ičoId");
    const ico = icoInput?.value?.trim() ?? "";

    if (!ico) return;

    // Formátová validace ještě před fetchem
    if (!validateIco(ico.padStart(8, "0"))) {
        setAresStatus("error", "Neplatné IČO — zadejte 8 číslic.");
        return;
    }

    try {
        setAresStatus("loading", "Načítám data z ARES…");

        const data = await fetchAresData(ico);

        fillFormFromAres(data);
        setAresStatus("success", `✓ Nalezeno: ${data.nazevFirmy}`);

        console.log("[ARES] Data úspěšně načtena:", data);

    } catch (error) {
        console.error("[ARES] Chyba:", error);

        if (error instanceof AresError) {
            setAresStatus("error", error.userMessage);
        } else {
            setAresStatus("error", "Neočekávaná chyba při komunikaci s ARES.");
        }
    }
}

/**
 * Vymaže ARES-vyplněná pole (při změně IČO)
 */
function clearAresFills() {
    document.querySelectorAll(".ares-filled").forEach(el => {
        el.value = "";
        el.classList.remove("ares-filled");
    });
}

// ============================================================
// CUSTOM ERROR TŘÍDA
// ============================================================

class AresError extends Error {
    /**
     * @param {string} code — interní kód chyby
     * @param {string} userMessage — zpráva pro uživatele
     */
    constructor(code, userMessage) {
        super(userMessage);
        this.name = "AresError";
        this.code = code;
        this.userMessage = userMessage;
    }
}

// ============================================================
// POMOCNÉ FUNKCE
// ============================================================

/**
 * Formátuje datum z ISO (2005-03-14) na CZ formát (14.03.2005)
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    return `${day}.${month}.${year}`;
}

/**
 * Formátuje PSČ — přidá mezeru (12345 → 123 45)
 * @param {string|number} psc
 * @returns {string}
 */
function formatPsc(psc) {
    const str = String(psc).replace(/\s/g, "");
    return str.length === 5 ? `${str.slice(0, 3)} ${str.slice(3)}` : str;
}
