// ProviderAetherium.js
import supabase from '../Connect/SupabaseConnect.js'                              // ← PŘIDÁNO
import { onOtpVerifiedChange, isOtpVerified } from './Mfa_Otp.js'                // ← PŘIDÁNO
import { initAresLookup } from '../Connect/AresLookUpProvider.js'
import { sanitizeText, isValidIco, isValidDic } from './SanitizeFormProvider.js'
import { validateForm } from '../JS/ValidateForm.js'
import { saveForPayment } from '../BackEnd/FormToPay.js'                          // ← PŘIDÁNO až bude soubor hotový

// ============================================================
// Formulář — datové uložiště
// ============================================================
const AetheriumSubscriberForm = document.getElementById('AetheriumSubscriberForm')

const ico             = document.getElementById('ičoId')
const dic             = document.getElementById('dicId')
const nazevFirmy      = document.getElementById('název-firmyId')
const pravniForma     = document.getElementById('právní-formaId')
const sidloSpol       = document.getElementById('sídlo-společnostiId')
const datumSpol       = document.getElementById('datum-založeníId')
const stavSubjekt     = document.getElementById('stav-subjektuId')
const spisovaZnacka   = document.getElementById('spisová-značkaId')
const datovaSchranka  = document.getElementById('datová-schránkaId')
const mfaOtp          = document.getElementById('mfa-otp')
const segmentTrhu     = document.getElementById('Obor-podnikání')
const telefonniCislo  = document.getElementById('telefonní-číslo')
const email           = document.getElementById('emailId')
const heslo           = document.getElementById('hesloId')
const potvrzeniHesla  = document.getElementById('potvrzení-hesla')

// ============================================================
// Supabase — uložení Subscribera
// ============================================================
async function ulozFirmu(data) {
    if (!isValidIco(data.ico)) {
        console.error('Neplatné IČO:', data.ico)
        return false                          // ← OPRAVENO: vrací false
    }
    if (data.dic && !isValidDic(data.dic)) {
        console.error('Neplatné DIČ:', data.dic)
        return false
    }

    const { error } = await supabase
        .from('profiles')
        .insert({
            ico:   data.ico.trim(),
            nazev: sanitizeText(data.nazevFirmy),
            dic:   data.dic?.trim() ?? null,
        })

    if (error) {
        console.error('Chyba při ukládání:', error)
        return false                          // ← OPRAVENO: vrací false při chybě
    }

    return true                               // ← OPRAVENO: vrací true při úspěchu
}

// ============================================================
// GDPR Checkbox → aktivace Submit buttonu
// ============================================================
const gdprCheckbox = document.getElementById('gdprCheckbox')
const submitBtn    = document.getElementById('submitBtn')

gdprCheckbox.addEventListener('change', function () {
    submitBtn.disabled = !this.checked
    submitBtn.classList.toggle('active', this.checked)
})

// ============================================================
// GDPR Modal — zavření
// ============================================================
document.getElementById('closeTerms').addEventListener('click', () => {
    document.querySelector('.modalSubscriberGdpr').classList.remove('open')
})

// ============================================================
// OTP — sledování stavu ověření telefonu
// LOGIKA: Mfa_Otp.js zavolá callback pokaždé, když se změní stav ověření.
// Tady si ho uložíme a použijeme při submit validaci.
// ============================================================
let phoneVerified = false

onOtpVerifiedChange((verified) => {
    phoneVerified = verified
    console.log('[Subscriber] OTP stav:', verified ? '✓ ověřen' : '✗ neověřen')
})

// ============================================================
// Ukládání formuláře do sessionStorage
// ============================================================
const formInputs = document.querySelectorAll('#AetheriumSubscriberForm input')

formInputs.forEach(input => {
    const saved = sessionStorage.getItem(input.id)
    if (saved) input.value = saved
})

formInputs.forEach(input => {
    input.addEventListener('input', () => {
        sessionStorage.setItem(input.id, input.value)
    })
})

// ============================================================
// Submit handler
// ============================================================
AetheriumSubscriberForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    //LOGIKA: Telefon musí být ověřen přes OTP před odesláním formuláře
    if (!phoneVerified) {
        console.warn('[Subscriber] Telefon není ověřen přes OTP')
        // TODO: zobrazit vizuální chybu u OTP pole
        return
    }

    const { isValid, errors, sanitizedValues } = validateForm(AetheriumSubscriberForm)

    if (!isValid) {
        console.warn('Formulář obsahuje chyby:', errors)
        // TODO: zobrazit chyby vizuálně u konkrétních polí
        return
    }

    const saved = await ulozFirmu({
        ico:       sanitizedValues['ičoId'],
        dic:       sanitizedValues['dicId'],
        nazevFirmy: sanitizedValues['název-firmyId'],
    })

    if (!saved) return

    saveForPayment(sanitizedValues)
})

initAresLookup()
