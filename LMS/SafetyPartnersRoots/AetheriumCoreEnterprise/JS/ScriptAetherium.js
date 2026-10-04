// ScriptAetherium.js — importy VŽDY nahoru!
import { firstVisitSection, returningVisitSection } from "../JS/ModalWindow.js"
import { initAresLookup } from "../Connect/AresLookup.js"
import supabase from "../Connect/SupabaseConnect.js"
import { sanitizeText, isValidIco, isValidDic, formatPhoneStrict } from "../JS/SanitizeForm.js"
import { validateForm } from "../JS/ValidateForm.js"
import { saveForPayment } from '../BackEnd/FormToPay.js'



// ============================================================
// Formulář — datové uložiště
// ============================================================
const AetheriumForm = document.getElementById("AetheriumCoreEnterpriseForm")

const ico          = document.getElementById("ičoId")
const dic           = document.getElementById("dicId")
const nazevFirmy    = document.getElementById("název-firmyId")
const pravniForma   = document.getElementById("právní-formaId")
const sidloSpol     = document.getElementById("sídlo-společnostiId")
const datumSpol     = document.getElementById("datum-založeníId")
const stavSubjekt   = document.getElementById("stav-subjektuId")
const spisovaZnacka = document.getElementById("spisová-značkaId")
const datovaSchranka = document.getElementById("datová-schránkaId")

const mfaOtp         = document.getElementById("mfa-otp")
const segmentTrhu    = document.getElementById("Obor-podnikání")
const telefonniCislo = document.getElementById("telefonní-číslo")
const email          = document.getElementById("emailId")
const heslo          = document.getElementById("hesloId")
const potvrzeniHesla = document.getElementById("potvrzení-hesla")

const bozpId   = document.getElementById("BOZPId")
const bozpVpId = document.getElementById("BOZPVPId")
const poId     = document.getElementById("POId")
const pvVpId   = document.getElementById("POVPId")
const rrId     = document.getElementById("ŘidičiReferentiId")
const ppId     = document.getElementById("PrvníPomocId")
const pvvId    = document.getElementById("PráceVeVýškáchId")

// ============================================================
// Supabase — uložení firmy
// ============================================================
async function ulozFirmu(data) {
    // Validace PŘED odesláním na Supabase — zabrání
    // uložení nesmyslných/nebezpečných dat do DB
    if (!isValidIco(data.ico)) {
        console.error("Neplatné IČO:", data.ico)
        return false
    }
    if (data.dic && !isValidDic(data.dic)) {
        console.error("Neplatné DIČ:", data.dic)
        return false
    }

    const { error } = await supabase
        .from("profiles")
        .insert({
            ico: data.ico.trim(),
            nazev: sanitizeText(data.nazevFirmy), // ochrana pro pozdější výpis v dashboardu
            dic: data.dic?.trim() ?? null,
        })

    if (error) {
        console.error("Chyba při ukládání:", error)
        return false
}

return true

}
// ============================================================
//TODO:  GDPR Checkbox → aktivace Submit buttonu
// ============================================================
const gdprCheckbox = document.getElementById("gdprCheckbox")
const submitBtn    = document.getElementById("submitBtn")

gdprCheckbox.addEventListener("change", function() {
    submitBtn.disabled = !this.checked
    submitBtn.classList.toggle("active", this.checked)
})

// ============================================================
// GDPR Modal — zavření klikem mimo okno
// ============================================================
const gdprModal = document.querySelector(".modal")

window.addEventListener("click", (e) => {
    if (e.target === gdprModal) {
        gdprModal.style.display = "none"
    }
})

// ============================================================
//TODO: GDPR Modal — reset checkboxu při zavření
// ============================================================
document.getElementById("closeTerms").addEventListener("click", () => {
    gdprModal.style.display = "none"
})

// ============================================================
// Ukládání formuláře do sessionStorage
// ============================================================
const formInputs = document.querySelectorAll("#AetheriumCoreEnterpriseForm input")

formInputs.forEach(input => {
    const saved = sessionStorage.getItem(input.id)
    if (saved) input.value = saved
})

formInputs.forEach(input => {
    input.addEventListener("input", () => {
        sessionStorage.setItem(input.id, input.value)
    })
})

AetheriumForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const { isValid, errors, sanitizedValues } = validateForm(AetheriumForm)

    if (!isValid) {
        console.warn("Formulář obsahuje chyby:", errors)
        return // TODO: zobrazit chyby u polí
    }

    const saved =await ulozFirmu({
        ico: sanitizedValues["ičoId"],
        dic: sanitizedValues["dicId"],
        nazevFirmy: sanitizedValues["název-firmyId"],
    })
    if (!saved) return
    //sessionStorage.clear()
    //
    saveForPayment(sanitizedValues)
})

initAresLookup()
