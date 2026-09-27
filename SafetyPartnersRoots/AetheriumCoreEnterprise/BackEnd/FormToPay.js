// FRONTEND: Přenos potvrzených dat z registračního formuláře (IndexAetherium.html)
// na souhrnnou stránku (Summary.html) před přechodem k platbě
//
//
const STORAGE_KEY = "aetheriumSummaryData"

//LOGIKA: FormToPay.js zakládá na sessionStorage z hotového validateForm()
// v ScriptAetherium.js jenž se stará o zabalení a přenos dat na stránku Summary.html
//
//
//



//LOGIKA: Technické pole id ('ičoId', 'název-firmyId') nejsou čitelná pro uživatele v souhrnu — tahle mapa je převádí na srozumitelné popisky.
const FIELD_LABELS = {
    "ičoId": "IČO",
    "dicId": "DIČ",
    "název-firmyId": "Název firmy",
    "právní-formaId": "Právní forma",
    "sídlo-společnostiId": "Sídlo společnosti",
    "datum-založeníId": "Datum založení",
    "stav-subjektuId": "Stav subjektu",
    "spisová-značkaId": "Spisová značka",
    "datová-schránkaId": "Datová schránka",
    "Obor-podnikání": "Segment trhu",
    "telefonní-číslo": "Telefonní číslo",
    "emailId": "Email",
    "adresa": "Adresa provozovny",
    "BOZPId": "BOZP — počet školení",
    "BOZPVPId": "BOZP — vedoucí pracovníci",
    "POId": "Požární ochrana",
    "POVPId": "Požární ochrana — vedoucí pracovníci",
    "ŘidičiReferentiId": "Řidiči referenti",
    "PrvníPomocId": "První pomoc",
    "PráceVeVýškáchId": "Práce ve výškách",
}

//LOGIKA: Heslo a MFA kod je z souhrnu FIELD_LABELS vyjmutý z důvodu bezpečnostního rizika uložení
// v DOMu, jelikož by došlo při nahlížení v DevTools k zobrazení citlivých údajů.
//

const HIDDEN_FIELDS = new Set(["hesloId", "potvrzení-hesla", "mfa-otp"])

//LOGIKA: Tahle funkce se spustí VŽDY, když se FormToPay.js načte — ale
//jen na Summary.html najde container #summaryContent. Na IndexAetherium.html
//container neexistuje, takže funkce potichu skončí (return) a nic se nestane.
//Díky tomu může být stejný <script> tag načtený na obou stránkách bez konfliktu.


export function saveForPayment(sanitizedValues) {
    const safeToStore = Object.fromEntries(
        Object.entries(sanitizedValues).filter(([id]) => !HIDDEN_FIELDS.has(id))
    )

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeToStore))
    window.location.href = '../HTML/Summary.html'
}



function renderSummary() {
    const container = document.getElementById('summaryContent')
    if (!container)
         return

    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
        container.innerHTML = `<p class="Obsah">Nebyla nalezena žádná data k zobrazení. Vraťte se prosím na registrační formulář.</p>`
        return
    }

    let data
    try {
        data = JSON.parse(raw)

    } catch {
        container.innerHTML = `<p class="Obsah">Data se nepodařilo načíst. Zkuste registraci znovu.</p>`
        return
}
    //LOGIKA: Filter vynechá skrytá pole a prázdné hodnoty např. Nepovinná okna jako
    // Dič pokud není vyplněno a souhrn tak nezahltí prázdnými řádky
    //

    const rows = Object.entries(data)
    .filter(([id, value]) => !HIDDEN_FIELDS.has(id) && value)
    .map(([id, value]) => {
        const label = FIELD_LABELS[id] ?? id
        return `<tr><td class="SummaryLabel">${label}</td><td class="SummaryValue">${value}</td></tr>`
    })
    .join("")

    container.innerHTML = `<table class="SummaryTable">
            <tbody>${rows}</tbody>
        </table>
        <button class="ContinueToPayment" id="continueToPayment">Pokračovat k platbě</button>
    `


}

renderSummary()
