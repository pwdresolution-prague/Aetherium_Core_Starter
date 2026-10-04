import supabase from '../Connect/SupabaseConnect.js'
import { formatPhoneStrict } from './SanitizeFormProvider.js'

const telefonInput = document.getElementById('telefonní-číslo')
const otpInput = document.getElementById('mfa-otp')
const sendOtpButton = document.getElementById('sendOtpBtn')
const otpStatus = document.createElement('span')
otpStatus.id = 'otp-status'


otpInput.parentNode.insertBefore(otpStatus, otpInput.nextSibling)

let phoneForOtp = ""
let otpVerified = false
let onChange = () => {} //COMMENT: callback si nastaví volající soubor

//LOGIKA: Umožní vnějšímu kodu z ScriptAetherium si zaregistrovat a
// callbacknout funkci která volá pokaždé když se změní stav ověření telefonu.
// LOGIKA: modul neví o submitBtn/GdprCheckbox nic
// jen vždy zavoolá změnu ven a o vše se stará modul
//
export function onOtpVerifiedChange(callback) {
    onChange = callback
}

/** Aktuální stav ověření — čte se odkudkoliv, kde je to potřeba. */
export function isOtpVerified() {
    return otpVerified
}

// ============================================================
// Fáze A — odeslání OTP na telefon
// ============================================================
async function sendOtp() {
    const rawPhone = telefonInput.value.trim()
    const phone = formatPhoneStrict(rawPhone)

    if (!phone) {
        showOtpStatus("error", "Zadejte platné telefonní číslo.")
        return
    }

    phoneForOtp = phone

    try {
        showOtpStatus("loading", "Odesílám kód...")

        const { error } = await supabase.auth.signInWithOtp({ phone })
        if (error) throw error

        showOtpStatus("success", "✓ Kód odeslán na " + phone)
        otpInput.disabled = false
        otpInput.focus()

    } catch (error) {
        console.error("[OTP] Chyba odeslání:", error.message)
        showOtpStatus("error", "Chyba: " + error.message)
    }
}

sendOtpButton.addEventListener("click", sendOtp)

// ============================================================
// Fáze B — realtime ověření při 6. číslici
// ============================================================
otpInput.addEventListener("input", async function () {
    const token = this.value.trim()
    if (token.length !== 6) return

    try {
        showOtpStatus("loading", "Ověřuji kód...")

        const { data, error } = await supabase.auth.verifyOtp({
            phone: phoneForOtp,
            token,
            type: "sms",
        })
        if (error) throw error

        showOtpStatus("success", "✓ Telefon ověřen!")
        otpInput.classList.add("ares-success")

        otpVerified = true
        onChange(otpVerified)   // ← informuje ScriptAetherium.js o změně

        console.log("[OTP] Ověřen uživatel:", data.user)

    } catch (error) {
        console.error("[OTP] Chyba ověření:", error.message)
        showOtpStatus("error", "Nesprávný kód. Zkuste znovu.")
        otpInput.value = ""
        otpInput.focus()
    }
})

// ============================================================
// Pomocná funkce
// ============================================================
function showOtpStatus(state, message) {
    otpStatus.textContent = message
    otpStatus.className = `otp-status otp-status--${state}`
}
