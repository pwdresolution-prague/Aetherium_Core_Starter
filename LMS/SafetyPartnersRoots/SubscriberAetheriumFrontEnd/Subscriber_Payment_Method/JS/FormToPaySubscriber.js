// ============================================================
// JS/SummaryLogic/FormToPaySubscriber.js
// ------------------------------------------------------------
// SEKCE: Subscriber — shrnutí (Summary.html)
//
// Dvě úlohy:
//   1) saveForPayment() — volá ji ProviderAetherium.js po odeslání formuláře.
//      Uloží VŠECHNA sanitizovaná pole do AetheriumClientStore a přesměruje
//      na Summary.html.
//   2) renderSummary() — běží na Summary.html. Vykreslí firemní údaje,
//      k nim stav importu studentů (StudentImport.js) a orientační cenu
//      s DPH (PricingRules.js) — to je to "stanovení DPH při shrnutí",
//      o které jde. Na platbu se dá pokračovat, jen když existuje aspoň
//      jeden platný student — bez něj nemá platba co počítat.
//
// OPRAVENO oproti původní verzi: dřív si tenhle soubor psal do sessionStorage
// vlastním klíčem ('aetheriumSubscriberSummaryData'), nezávisle na
// StudentImport.js (klíč 'importedStudents'). Obě části o sobě navzájem
// nevěděly, takže shrnutí nemohlo zobrazit stav importu vedle firemních údajů.
// Teď obě jdou přes AetheriumClientStore.js.
// ============================================================

import { setRegistration, getRegistration, getImport, STORE_CHANGED } from '../Shared/AetheriumClientStore.js'
import { calculateOrder, formatMoney } from '../Shared/PricingRules.js'

// Mapa technických ID na čitelné popisky pro uživatele
const FIELD_LABELS = {
    'ičoId':                  'IČO',
    'dicId':                  'DIČ',
    'název-firmyId':          'Název firmy',
    'právní-formaId':         'Právní forma',
    'sídlo-společnostiId':    'Sídlo společnosti',
    'datum-založeníId':       'Datum založení',
    'stav-subjektuId':        'Stav subjektu',
    'spisová-značkaId':       'Spisová značka',
    'datová-schránkaId':      'Datová schránka',
    'telefonní-číslo':        'Telefonní číslo',
    'emailId':                'E-mail',
    'adresa':                 'Adresa provozovny',
    'Obor-podnikání':         'Obor podnikání',
    'početŠkoleníSubscriber': 'Predikovaný počet školení',
    'CompanyDescriptionName': 'Popis firmy',
    'účel':                   'Účel využití',

    // OPRAVENO: store (AetheriumClientStore.js) ukládá pod klíči datového modelu, ne pod id polí
    // formuláře — bez těchto řádků tabulka ukazovala syrové 'ico', 'companyName', 'seat'...
    'ico':             'IČO',
    'dic':             'DIČ',
    'companyName':     'Název firmy',
    'legalForm':       'Právní forma',
    'seat':            'Sídlo společnosti',
    'foundedAt':       'Datum založení',
    'entityStatus':    'Stav subjektu',
    'fileNumber':      'Spisová značka',
    'dataBox':         'Datová schránka',
    'phone':           'Telefonní číslo',
    'email':           'E-mail',
    'address':         'Adresa provozovny',
    'businessField':   'Obor podnikání',
    'sector':          'Segment',
    'expectedCourses': 'Predikovaný počet školení',
    'description':     'Popis firmy',
    'purpose':         'Účel využití',
}

// Tohle pole se ukládat smí, jen se nemá zobrazovat v tabulce shrnutí
// (heslo a OTP jsou vyfiltrované už uvnitř setRegistration, sem se vůbec nedostanou)
const SKIP_IN_TABLE = new Set(['gdprCheckbox'])

// Lidsky čitelné názvy pro hodnoty <select> elementů
const SELECT_LABELS = {
    'manufacturing':      'Výroba a strojírenství',
    'construction':       'Stavebnictví a architektura',
    'it':                 'Informační technologie a software',
    'healthcare':         'Zdravotnictví a farmacie',
    'finance':            'Finance a bankovnictví',
    'education':          'Vzdělávání a školství',
    'transportation':     'Doprava a logistika',
    'retail':             'Obchod a maloobchod',
    'hospitality':        'Cestovní ruch a pohostinství',
    'media':              'Média a zábava',
    'agriculture':        'Zemědělství a potravinářství',
    'legal':              'Právo a právní služby',
    'government':         'Veřejná správa a neziskový sektor',
    'telecommunications': 'Telekomunikace a IT infrastruktura',
    'real-estate':        'Nemovitosti a správa nemovitostí',
    'consulting':         'Poradenství a konzultační služby',
    'environment':        'Životní prostředí a udržitelnost',
    'research':           'Výzkum a vývoj',
    'other':              'Jiné',
    'interní':            'Interní školení vlastních zaměstnanců',
    'reselling':          'Prodej a distribuce školení',
    'doubleComb':         'Interní i externí kombinace',
}

// ------------------------------------------------------------
// 1) Uložení formuláře → přesměrování na shrnutí
// ------------------------------------------------------------
export function saveForPayment(sanitizedValues) {
    setRegistration(sanitizedValues)
    window.location.href = '../Html/Summary.html'
}

// ------------------------------------------------------------
// 2) Vykreslení shrnutí (běží jen na Summary.html)
// ------------------------------------------------------------
export function renderSummary() {
    const container = document.getElementById('summaryContent')
    if (!container) return // na formulářové stránce tenhle prvek neexistuje — tiché ukončení

    const data = getRegistration()
    if (!data) {
        container.innerHTML = `
            <p class="SummaryError">
                Nebyla nalezena žádná data k zobrazení.<br>
                <a href="../Html/IndexSubscriber.html" class="SummaryBackLink">← Zpět na formulář</a>
            </p>`
        return
    }

    const rows = Object.entries(data)
        .filter(([id, value]) => !SKIP_IN_TABLE.has(id) && value !== '' && value != null)
        .map(([id, value]) => {
            const label = FIELD_LABELS[id] ?? id
            const displayValue = SELECT_LABELS[value] ?? value
            return `
                <tr class="SummaryRow">
                    <td class="SummaryLabel">${label}</td>
                    <td class="SummaryValue">${displayValue}</td>
                </tr>`
        })
        .join('')

    container.innerHTML = `
        <div class="SummarySection">
            <h3 class="SummarySectionTitle">📋 Přehled registrace</h3>
            <table class="SummaryTable">
                <tbody>${rows}</tbody>
            </table>
        </div>

        <div class="SummarySection">
            <h3 class="SummarySectionTitle">✅ Ověření</h3>
            <table class="SummaryTable">
                <tbody>
                    <tr class="SummaryRow">
                        <td class="SummaryLabel">Telefonní ověření</td>
                        <td class="SummaryValue SummaryVerified">✓ Ověřeno přes OTP</td>
                    </tr>
                    <tr class="SummaryRow">
                        <td class="SummaryLabel">Souhlas s podmínkami</td>
                        <td class="SummaryValue SummaryVerified">✓ Odsouhlaseno</td>
                    </tr>
                </tbody>
            </table>
        </div>

        ${renderImportAndPricingStatus(data)}

        <div class="SummaryActions">
            <a href="../Html/IndexSubscriber.html" class="SummaryBackButton">← Upravit údaje</a>
            <button class="SummaryContinueButton" id="continueToPayment" ${canPayNow() ? '' : 'disabled'}>
                Pokračovat k platbě →
            </button>
        </div>
    `

    // Posluchač navěšen AŽ TEĎ — tlačítko vzniklo zápisem do innerHTML výše
    document.getElementById('continueToPayment')?.addEventListener('click', () => {
        if (!canPayNow()) return
        window.location.href = '../Subscriber_Payment_Method/PaymentIndex.html'
    })
}

// LOGIKA: K platbě se dá přejít, jen když existuje aspoň jeden fakturovatelný
// (platný) student z importu — cena se počítá z jejich počtu.
function canPayNow() {
    return (getImport()?.valid?.length ?? 0) > 0
}

// LOGIKA: Propojuje shrnutí s importním panelem vedle něj a rovnou ukazuje
// orientační cenu s DPH — přesně to místo, kde se DPH "stanovuje" ještě
// před přechodem na platební sekci.
function renderImportAndPricingStatus(registration) {
    const imported = getImport()
    if (!imported) {
        return `
            <div class="SummarySection" id="summaryImportCard">
                <h3 class="SummarySectionTitle">📥 Import studentů</h3>
                <p class="SummaryError">Zatím nenahráno. Nahrajte CSV/XLSX v panelu vpravo →</p>
            </div>`
    }

    const { valid, invalid, duplicates, fileName } = imported
    const studentCount = valid?.length ?? 0

    const pricingRows = studentCount > 0
        ? (() => {
            const order = calculateOrder(registration, studentCount)
            return `
                    <tr class="SummaryRow">
                        <td class="SummaryLabel">Cena za studenta (bez DPH)</td>
                        <td class="SummaryValue">${formatMoney(order.pricePerStudent)}</td>
                    </tr>
                    <tr class="SummaryRow">
                        <td class="SummaryLabel">DPH (${Math.round(order.vatRate * 100)} %)</td>
                        <td class="SummaryValue">${formatMoney(order.vatAmount)}</td>
                    </tr>
                    <tr class="SummaryRow">
                        <td class="SummaryLabel">Odhad celkem k úhradě</td>
                        <td class="SummaryValue SummaryVerified">${formatMoney(order.total)}</td>
                    </tr>`
        })()
        : ''

    return `
        <div class="SummarySection" id="summaryImportCard">
            <h3 class="SummarySectionTitle">📥 Import studentů</h3>
            <table class="SummaryTable">
                <tbody>
                    <tr class="SummaryRow">
                        <td class="SummaryLabel">Soubor</td>
                        <td class="SummaryValue">${fileName ?? '—'}</td>
                    </tr>
                    <tr class="SummaryRow">
                        <td class="SummaryLabel">Platných studentů</td>
                        <td class="SummaryValue">${studentCount}</td>
                    </tr>
                    <tr class="SummaryRow">
                        <td class="SummaryLabel">Chybných řádků</td>
                        <td class="SummaryValue">${invalid?.length ?? 0}</td>
                    </tr>
                    <tr class="SummaryRow">
                        <td class="SummaryLabel">Duplicit</td>
                        <td class="SummaryValue">${duplicates ?? 0}</td>
                    </tr>
                    ${pricingRows}
                </tbody>
            </table>
        </div>`
}

// ------------------------------------------------------------
// 3) Automatická aktualizace shrnutí
// ------------------------------------------------------------
renderSummary()

// a) Cokoli se zapíše do store (např. dokončený import studentů) → shrnutí, cena
//    a tlačítko „Pokračovat k platbě“ se hned přepočítají
window.addEventListener(STORE_CHANGED, (e) => {
    renderSummary()

    // Po dokončeném importu karta s počtem studentů a částkou na chvíli zazáří
    // a doscrolluje se na ni — je hned vidět, že se přepočítala
    if (e.detail?.key === 'aetherium.import') {
        const card = document.getElementById('summaryImportCard')
        if (!card) return
        card.classList.add('SummaryFlash')
        card.addEventListener('animationend', () => card.classList.remove('SummaryFlash'), { once: true })
        if (window.lenis) window.lenis.scrollTo(card, { offset: -120 })
        else card.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
})

// b) Návrat tlačítkem „Zpět“ z platby/formuláře: prohlížeč může stránku obnovit
//    z paměti (bfcache) se starým obsahem — při takovém návratu načteme data znovu
window.addEventListener('pageshow', (e) => { if (e.persisted) renderSummary() })
