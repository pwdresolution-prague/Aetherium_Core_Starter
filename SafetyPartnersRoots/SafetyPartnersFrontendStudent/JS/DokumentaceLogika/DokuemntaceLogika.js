//LOGIKA: Tento kod později napojit na muj Aetherium core Asistent...
//LOGIKA: Kartotéka – vlevo zavřený seznam položek aktivní záložky, vpravo detail JEDNÉ
//        vybrané položky (jako vytažená karta). Stránka se nikdy neposouvá, roluje
//        jen samotný seznam (.DokList) nebo detail (.DokDetail), pokud je obsah delší.

import { sanitizeHTML } from '../../../utils/security.client.js'
import { kategorieOblasti } from './DokuemntaceData.js'
import {
    nacistNavody,
    nacistLegislativuStudent,
    nacistMaterialy,
    hledatDokumentaci,
    zaznamenatStazeniMaterialu,
} from './DokuemntaceApi.js'
import { eventTypes } from '../Student_Dashboard_Logika/eventLogic.js'

const tabButtons = document.querySelectorAll('.DokTabButton')
const kartoteka = document.querySelector('.DokKartoteka')
const listEl = document.getElementById('DokList')
const detailEl = document.getElementById('DokDetail')

const searchInput = document.getElementById('DokumentaceSearchInput')

let data = { navody: [], legislativa: [], materialy: [] }
let aktivniZalozka = "navody"

// LOGIKA: vybraná položka pro každou záložku zvlášť – při přepnutí záložky se
//         pamatuje, co bylo naposledy otevřené (ale nezobrazí se, dokud se tam uživatel nevrátí)
const vybranaPolozka = { navody: null, legislativa: null, materialy: null }

const initialyTypu = { navody: "N", legislativa: "§", materialy: "M" }
const popiskyTypu = { navod: "Návod", legislativa: "Legislativa", material: "Materiál ke stažení" }

function zapsatUdalost(typ, meta = {}) {
    const definice = eventTypes[typ] ?? { label: typ }
    const udalost = { id: crypto.randomUUID(), type: typ, label: definice.label, created_at: new Date().toISOString(), meta }
    try {
        const historie = JSON.parse(localStorage.getItem("sp_student_events") ?? "[]")
        historie.unshift(udalost)
        localStorage.setItem("sp_student_events", JSON.stringify(historie.slice(0, 200)))
    } catch (chyba) {
        console.warn("Dokumentace: událost se nepodařilo persistovat.", chyba)
    }
}

//LOGIKA: Přepínání záložek – přerenderuje levý seznam, detail se zachová podle
//        toho, co bylo u dané záložky naposledy otevřené (nebo zůstane prázdný) ===
function prepnoutZalozku(nazev) {
    aktivniZalozka = nazev
    kartoteka.dataset.mode = "obsah"
    searchInput.value = ""

    tabButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === nazev))

    vykreslitSeznam()
    vykreslitDetail()
}

tabButtons.forEach(btn => {
    btn.addEventListener("click", () => prepnoutZalozku(btn.dataset.tab))
})

//LOGIKA: Otevření jedné položky – ostatní se automaticky "zavřou" (single-select) ===
function otevritPolozku(zalozka, id) {
    vybranaPolozka[zalozka] = id

    if (zalozka === aktivniZalozka) {
        vykreslitSeznam()
        vykreslitDetail()
    }

    if (zalozka === "navody") {
        const navod = data.navody.find(n => n.id === id)
        zapsatUdalost("documentation_guide_opened", { id, nadpis: navod?.nadpis })
    }
}

//LOGIKA: Vykreslení levého sloupce (zavřený seznam) pro aktivní záložku =============
function vykreslitSeznam() {
    const seznam = data[aktivniZalozka] ?? []
    listEl.innerHTML = ""

    if (seznam.length === 0) {
        listEl.innerHTML = `<p class="DokListEmpty">Zatím žádné položky.</p>`
        return
    }

    seznam.forEach(polozka => {
        const { id, titulek, meta } = popisPolozky(aktivniZalozka, polozka)
        const aktivni = vybranaPolozka[aktivniZalozka] === id

        const radek = document.createElement("button")
        radek.type = "button"
        radek.className = "DokListRow"
        radek.dataset.active = String(aktivni)
        radek.setAttribute("aria-expanded", String(aktivni))
        radek.innerHTML = `
            <span class="DokListRowIcon">${initialyTypu[aktivniZalozka]}</span>
            <span class="DokListRowBody">
                <span class="DokListRowTitle">${sanitizeHTML(titulek)}</span>
                <span class="DokListRowMeta">${sanitizeHTML(meta)}</span>
            </span>
            <span class="DokListRowChevron" aria-hidden="true"></span>
        `
        radek.addEventListener("click", () => otevritPolozku(aktivniZalozka, id))
        listEl.appendChild(radek)
    })
}

//LOGIKA: Krátký popis položky pro řádek v seznamu (podle typu záložky) ==============
function popisPolozky(zalozka, polozka) {
    if (zalozka === "navody") {
        return { id: polozka.id, titulek: polozka.nadpis, meta: `${polozka.kroky.length} kroky · ${polozka.aktualizovano}` }
    }
    if (zalozka === "legislativa") {
        const oblastLabel = kategorieOblasti.find(o => o.key === polozka.oblast)?.label ?? "Ostatní"
        return { id: polozka.id, titulek: polozka.nazev, meta: `${polozka.cisloPredpisu} · ${oblastLabel}` }
    }
    const oblastLabel = kategorieOblasti.find(o => o.key === polozka.kategorie)?.label ?? "Ostatní"
    return { id: polozka.id, titulek: polozka.nazev, meta: `${polozka.typ} · ${polozka.velikost} · ${oblastLabel}` }
}

//LOGIKA: Vykreslení pravého sloupce (detail JEDNÉ otevřené položky) =================
function vykreslitDetail() {
    const id = vybranaPolozka[aktivniZalozka]
    if (!id) {
        detailEl.innerHTML = `
            <div class="DokDetailEmpty">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h11l5 5v11H4z"></path><path d="M15 4v5h5"></path></svg>
                <p>Vyberte položku ze seznamu vlevo.</p>
            </div>
        `
        return
    }

    if (aktivniZalozka === "navody") return vykreslitDetailNavod(id)
    if (aktivniZalozka === "legislativa") return vykreslitDetailLegislativa(id)
    return vykreslitDetailMaterial(id)
}

function vykreslitDetailNavod(id) {
    const navod = data.navody.find(n => n.id === id)
    if (!navod) return
    detailEl.innerHTML = `
        <article class="DokDetailCard">
            <div class="DokDetailHead">
                <div>
                    <h3 class="DokDetailTitle">${sanitizeHTML(navod.nadpis)}</h3>
                </div>
                <span class="DokDetailBadge">Návod</span>
            </div>
            <ol class="DokDetailSteps">
                ${navod.kroky.map(krok => `<li>${sanitizeHTML(krok)}</li>`).join("")}
            </ol>
            <span class="DokDetailMeta">Aktualizováno: ${navod.aktualizovano}</span>
        </article>
    `
}

function vykreslitDetailLegislativa(id) {
    const predpis = data.legislativa.find(l => l.id === id)
    if (!predpis) return
    const oblastLabel = kategorieOblasti.find(o => o.key === predpis.oblast)?.label ?? "Ostatní"
    detailEl.innerHTML = `
        <article class="DokDetailCard">
            <div class="DokDetailHead">
                <div>
                    <h3 class="DokDetailTitle">${sanitizeHTML(predpis.nazev)}</h3>
                    <span class="DokDetailSub">${sanitizeHTML(predpis.cisloPredpisu)}</span>
                </div>
                <span class="DokDetailBadge">${sanitizeHTML(oblastLabel)}</span>
            </div>
            <p class="DokDetailShrnuti">${sanitizeHTML(predpis.shrnuti || "")}</p>
            <div class="DokDetailFooter">
                <span>Poslední změna: ${predpis.posledniZmena ?? "-"}</span>
                ${predpis.odkaz ? `<a href="${predpis.odkaz}" target="_blank" rel="noopener">Zobrazit ve zdroji</a>` : ""}
            </div>
        </article>
    `
}

function vykreslitDetailMaterial(id) {
    const material = data.materialy.find(m => m.id === id)
    if (!material) return
    const oblastLabel = kategorieOblasti.find(o => o.key === material.kategorie)?.label ?? "Ostatní"
    detailEl.innerHTML = `
        <article class="DokDetailCard">
            <div class="DokDetailHead">
                <div>
                    <h3 class="DokDetailTitle">${sanitizeHTML(material.nazev)}</h3>
                    <span class="DokDetailSub">${material.typ} · ${material.velikost}</span>
                </div>
                <span class="DokDetailBadge">${sanitizeHTML(oblastLabel)}</span>
            </div>
            <span class="DokDetailMeta">Aktualizováno: ${material.aktualizovano}</span>
            <br>
            <a class="DokDetailDownload" href="${material.odkaz}" download data-material-id="${material.id}">Stáhnout materiál</a>
        </article>
    `

    detailEl.querySelector(".DokDetailDownload")?.addEventListener("click", async () => {
        await zaznamenatStazeniMaterialu(material.id)
        zapsatUdalost("documentation_material_downloaded", { id: material.id, nazev: material.nazev })
    })
}

//LOGIKA: Sjednocení všech tří zdrojů do jedné ploché sady (pro AI hledání i pro fallback) ====
function sestavitPlochouSadu() {
    return [
        ...data.navody.map(n => ({ typ: "navod", zalozka: "navody", id: n.id, nadpis: n.nadpis, text: n.kroky.join(" ") })),
        ...data.legislativa.map(l => ({ typ: "legislativa", zalozka: "legislativa", id: l.id, nadpis: `${l.cisloPredpisu} – ${l.nazev}`, text: l.shrnuti })),
        ...data.materialy.map(m => ({ typ: "material", zalozka: "materialy", id: m.id, nadpis: m.nazev, text: m.typ })),
    ]
}

//LOGIKA: Nouzové lokální hledání (bez AI modelu / bez backendu) – jen jednoduchá shoda v textu ====
function lokalniFallbackHledani(dotaz) {
    const normalizovanyDotaz = dotaz.toLowerCase().trim()
    return sestavitPlochouSadu().filter(polozka =>
        polozka.nadpis.toLowerCase().includes(normalizovanyDotaz) ||
        polozka.text.toLowerCase().includes(normalizovanyDotaz)
    )
}

//LOGIKA: Výsledky hledání se zobrazí ve stejné kartotéce – jako plný seznam,
//        kliknutím se rovnou přepne na záložku a otevře konkrétní karta v detailu ===
function vykreslitVysledkyHledani(vysledky) {
    kartoteka.dataset.mode = "hledani"
    listEl.innerHTML = ""

    if (vysledky.length === 0) {
        listEl.innerHTML = `<p class="DokListEmpty">Nic jsme nenašli. Zkuste jiný výraz.</p>`
        return
    }

    listEl.innerHTML = `<p class="DokListGroupLabel">Výsledky hledání</p>`
    vysledky.forEach(polozka => {
        const radek = document.createElement("button")
        radek.type = "button"
        radek.className = "DokListRow"
        radek.innerHTML = `
            <span class="DokSearchResultBadge">${popiskyTypu[polozka.typ] ?? polozka.typ}</span>
            <span class="DokListRowBody">
                <span class="DokListRowTitle">${sanitizeHTML(polozka.nadpis)}</span>
            </span>
            <span class="DokListRowChevron" aria-hidden="true"></span>
        `
        radek.addEventListener("click", () => {
            otevritPolozku(polozka.zalozka, polozka.id)
            prepnoutZalozku(polozka.zalozka)
        })
        listEl.appendChild(radek)
    })
}

//LOGIKA: Reakce na psaní do vyhledávače – dotaz jde na AI model, s lokálním fallbackem ====
let hledaniTimeout = null
searchInput.addEventListener("input", event => {
    const dotaz = event.target.value.trim()
    clearTimeout(hledaniTimeout)

    if (dotaz === "") {
        kartoteka.dataset.mode = "obsah"
        vykreslitSeznam()
        return
    }

    hledaniTimeout = setTimeout(async () => {
        const { vysledky, zdroj } = await hledatDokumentaci(dotaz)
        vykreslitVysledkyHledani(vysledky ?? lokalniFallbackHledani(dotaz))
        zapsatUdalost("documentation_search_performed", { dotaz, zdroj })
    }, 300)
})

//LOGIKA: Inicializace hubu Dokumentace ==================================================
async function init() {
    const [navody, legislativa, materialy] = await Promise.all([
        nacistNavody(),
        nacistLegislativuStudent(),
        nacistMaterialy(),
    ])

    data = { navody: navody.data, legislativa: legislativa.data, materialy: materialy.data }

    prepnoutZalozku("navody")
}

init()
