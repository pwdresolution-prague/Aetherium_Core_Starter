// ProviderAetherium.js
import supabase from '../Connect/SupabaseConnect.js'                              // ← PŘIDÁNO               // ← PŘIDÁNO
import { initAresLookup } from '../Connect/AresLookUpProvider.js'
import { validateForm } from '../JS/ValidateForm.js'
import { saveForPayment } from './SummaryLogic/FormToPaySubscriber.js'   // místo ../BackEnd/FormToPay.js
import { onOtpVerifiedChange, isOtpVerified, getVerifiedPhone } from './Mfa_Otp.js'
import { sanitizeText, isValidIco, isValidDic, formatPhoneStrict } from './SanitizeFormProvider.js'                     // ← PŘIDÁNO až bude soubor hotový

// ============================================================
// Formulář — datové uložiště
// ============================================================
const AetheriumSubscriberForm = document.getElementById('AetheriumSubscriberForm')

// Rozepsaný formulář: nikdy nepersistovat tajemství
const NEVER_SAVE = new Set(['hesloId', 'potvrzení-hesla', 'mfa-otp', 'gdprCheckbox'])
;['hesloId', 'potvrzení-hesla', 'mfa-otp'].forEach((k) => sessionStorage.removeItem(k))  // úklid po starých pokusech


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
onOtpVerifiedChange((verified) => {
    console.log('[Subscriber] OTP stav:', verified ? '✓ ověřen' : '✗ neověřen')
})

// ============================================================
// Ukládání formuláře do sessionStorage
// ============================================================

// Ukládání formuláře do sessionStorage
// LOGIKA: Po F5 / hard refreshi (navigation type 'reload' nebo 'back_forward')
// se rozepsaný formulář smaže úplně celý. Při běžném příchodu na stránku
// (např. tlačítko "Upravit údaje" ze Shrnutí) se hodnoty dál obnovují.
// Chceš mazat VŽDY? Dej: const WIPE = true
// ============================================================
const navType = performance.getEntriesByType('navigation')[0]?.type
const WIPE = navType === 'reload' || navType === 'back_forward'

const formInputs = [...document.querySelectorAll('#AetheriumSubscriberForm input')]
    .filter((i) => i.id && !NEVER_SAVE.has(i.id))

if (WIPE) {
    formInputs.forEach((i) => sessionStorage.removeItem(i.id))
    AetheriumSubscriberForm.reset()   // inputy, select, textarea i checkboxy zpět na výchozí
    submitBtn.disabled = true         // GDPR odškrtnuto → odeslání zablokované
    submitBtn.classList.remove('active')
} else {
    formInputs.forEach((input) => {
        const saved = sessionStorage.getItem(input.id)
        if (saved) input.value = saved
    })
}

formInputs.forEach((input) => {
    input.addEventListener('input', () => {
        sessionStorage.setItem(input.id, input.value)
    })
})

// Návrat tlačítkem Zpět může stránku vzít z bfcache bez znovunačtení skriptů —
// v tom případě ji načteme znovu, a tím se spustí mazání výše.
window.addEventListener('pageshow', (e) => { if (e.persisted) location.reload() })

// ============================================================
// Submit handler
// ============================================================
// Viditelná zpráva pod tlačítkem — dřív všechny chyby končily jen v konzoli
const submitStatus = document.createElement('p')
submitStatus.id = 'submit-status'
submitStatus.setAttribute('role', 'alert')
submitBtn.insertAdjacentElement('afterend', submitStatus)
const say = (msg) => { submitStatus.textContent = msg; console.warn('[Submit]', msg) }

let submitting = false

AetheriumSubscriberForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (submitting) return
    say('')

    // Krok 1 — telefon musí být ověřen a shodovat se s polem
    if (!isOtpVerified() || getVerifiedPhone() !== formatPhoneStrict(telefonniCislo.value.trim())) {
        say('Nejdřív ověřte telefonní číslo kódem.')
        return
    }

    // Krok 2 — validace polí
    const { isValid, errors, sanitizedValues } = validateForm(AetheriumSubscriberForm)
    if (!isValid) {
        console.warn('[Submit] chyby polí:', errors)
        say('Opravte pole: ' + Object.keys(errors).join(', '))
        return
    }

    submitting = true
    submitBtn.disabled = true
    try {
        // Krok 3 — heslo jde přímo do Supabase Auth a nikam se neukládá
        const { error } = await supabase.auth.updateUser({ password: heslo.value })
        if (error) {
            console.error('[Submit] updateUser:', error.code, error.message)
            say(error.code === 'same_password'
                ? 'Toto heslo už je u tohoto čísla nastavené — zadejte jiné (při testech).'
                : 'Heslo se nepodařilo nastavit: ' + error.message)
            return
        }

        // Krok 4 — uložit do store a přejít na shrnutí
        saveForPayment(sanitizedValues)   // whitelist ve store heslo a OTP stejně nepustí
    } catch (err) {
        console.error('[Submit] neočekávaná chyba:', err)
        say('Neočekávaná chyba: ' + (err?.message ?? err))
    } finally {
        submitting = false
        submitBtn.disabled = !gdprCheckbox.checked
    }
})


initAresLookup()
