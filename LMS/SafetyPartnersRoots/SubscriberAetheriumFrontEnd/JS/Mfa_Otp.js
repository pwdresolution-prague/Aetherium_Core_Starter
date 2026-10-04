import supabase from "../Connect/SupabaseConnect";
import { formatPhoneStrict  } from "./SanitizeFormProvider";

// ==============================================================
//TODO: Mfa_Otp.js - ověření telefonu přes supabase Auth (sms_Otp)
//LOGIKA: modul neví o submitBtn/GDPR checkboxu. Jen se hlásí ven
//Změna stavu ověření (onOtpVerifiedChange) a čte se přes isOtpVerified().
//===========================================================================

const telefonInput     = document.getElementById('telefonní-číslo')
const otpInput         = document.getElementById('mfa-otp')
const sendOtpButton    = document.getElementById('sendOtpBtn')

const OTP_LENGTH       = 6
const COOLDOWN_S       = 60          // Supabase: min. odstup mezi SMS na stejné číslo
const LABEL_SEND       = 'Odeslat ověřovací kód'
const LABEL_RESEND     = 'Odeslat kód znovu'
const LABEL_VERIFIED   = 'Telefon ověřen ✓'

const otpStatus = document.createElement('span')
otpStatus.id = 'otp-status'
otpInput.parentNode.insertBefore(otpStatus, otpInput.nextSibling)

let phoneForOtp   = ''       // číslo, na které byl kód skutečně odeslán
let verifiedPhone = null     // číslo, které prošlo verifyOtp (null = neověřeno)
let verifying     = false    // guard proti dvojímu volání verifyOtp
let cooldownTimer = null
let onChange      = () => {}

// COMMENT: vnější kód si zaregistruje callback; volá se jen při skutečné změně stavu
export function onOtpVerifiedChange(callback) { onChange = callback }
export function isOtpVerified() { return verifiedPhone !== null }
/** Ověřené číslo v E.164 — submit ho musí porovnat s aktuální hodnotou pole. */
export function getVerifiedPhone() { return verifiedPhone }

function setVerified(phone) {
    const was = verifiedPhone !== null
    verifiedPhone = phone
    if (was !== (phone !== null)) onChange(phone !== null)
}

// ============================================================
// Počáteční stav: kód nejde zadat, dokud není odeslán
// ============================================================
otpInput.disabled = true
otpInput.setAttribute('inputmode', 'numeric')
otpInput.setAttribute('autocomplete', 'one-time-code')
otpInput.setAttribute('maxlength', String(OTP_LENGTH))

// ============================================================
// Pomocné funkce
// ============================================================
function showOtpStatus(state, message) {
    otpStatus.textContent = message
    otpStatus.className = `otp-status otp-status--${state}`
}

function stopCooldown() {
    clearInterval(cooldownTimer)
    cooldownTimer = null
}

function startCooldown(seconds = COOLDOWN_S) {
    stopCooldown()
    let left = seconds
    sendOtpButton.disabled = true
    const tick = () => {
        if (left <= 0) {
            stopCooldown()
            sendOtpButton.disabled = false
            sendOtpButton.textContent = LABEL_RESEND
            return
        }
        sendOtpButton.textContent = `Odeslat znovu za ${left} s`
        left--
    }
    tick()
    cooldownTimer = setInterval(tick, 1000)
}

function humanError(error) {
    if (error?.status === 429 || /rate_limit/i.test(error?.code ?? '')) {
        return 'Příliš mnoho pokusů. Zkuste to prosím za chvíli.'
    }
    return 'Kód se nepodařilo odeslat. Zkontrolujte číslo a zkuste to znovu.'
}

/** Číslo se změnilo po odeslání/ověření → dosavadní kód i ověření už neplatí. */
function resetVerification(message) {
    stopCooldown()
    phoneForOtp = ''
    setVerified(null)
    otpInput.value = ''
    otpInput.disabled = true
    otpInput.classList.remove('ares-success')
    sendOtpButton.disabled = false
    sendOtpButton.textContent = LABEL_SEND
    showOtpStatus(message ? 'error' : 'idle', message ?? '')
}

// ============================================================
// Fáze 0 — změna telefonu invaliduje ověření
// BEZPEČNOST: bez tohohle by šlo ověřit číslo A, přepsat na B a odeslat.
// ============================================================
telefonInput.addEventListener('input', () => {
    const current = formatPhoneStrict(telefonInput.value.trim())
    if (verifiedPhone && current !== verifiedPhone) {
        resetVerification('Číslo se změnilo — ověřte ho prosím znovu.')
    } else if (phoneForOtp && current !== phoneForOtp) {
        resetVerification()
    }
})

// ============================================================
// Fáze A — odeslání OTP na telefon
// ============================================================
async function sendOtp() {
    if (sendOtpButton.disabled) return

    const phone = formatPhoneStrict(telefonInput.value.trim())
    if (!phone) {
        showOtpStatus('error', 'Zadejte platné telefonní číslo.')
        return
    }

    sendOtpButton.disabled = true
    showOtpStatus('loading', 'Odesílám kód...')

    try {
        const { error } = await supabase.auth.signInWithOtp({ phone })
        if (error) throw error

        phoneForOtp = phone                    // nastaví se až po úspěšném odeslání
        otpInput.value = ''
        otpInput.disabled = false
        otpInput.focus()
        showOtpStatus('success', '✓ Kód odeslán na ' + phone)
        startCooldown()

    } catch (error) {
        console.error('[OTP] Chyba odeslání:', error.code ?? '', error.message)
        showOtpStatus('error', humanError(error))
        if (error?.status === 429) startCooldown()
        else sendOtpButton.disabled = false
    }
}

sendOtpButton.addEventListener('click', sendOtp)

// ============================================================
// Fáze B — ověření ve chvíli, kdy je zadáno 6 číslic
// ============================================================
otpInput.addEventListener('input', async () => {
    otpInput.value = otpInput.value.replace(/\D/g, '').slice(0, OTP_LENGTH)
    const token = otpInput.value
    if (token.length !== OTP_LENGTH || verifying || !phoneForOtp) return

    verifying = true
    showOtpStatus('loading', 'Ověřuji kód...')

    try {
        const { error } = await supabase.auth.verifyOtp({
            phone: phoneForOtp,
            token,
            type: 'sms',
        })
        if (error) throw error

        stopCooldown()
        otpInput.classList.add('ares-success')
        otpInput.disabled = true
        sendOtpButton.disabled = true
        sendOtpButton.textContent = LABEL_VERIFIED
        showOtpStatus('success', '✓ Telefon ověřen!')
        setVerified(phoneForOtp)               // ← informuje ProviderAetherium.js

    } catch (error) {
        console.error('[OTP] Chyba ověření:', error.code ?? '', error.message)
        showOtpStatus('error', 'Nesprávný nebo expirovaný kód. Zkuste znovu.')
        otpInput.value = ''
        otpInput.focus()
    } finally {
        verifying = false
    }
})

// ============================================================
// Obnovení po reloadu stránky (při testování ušetří SMS)
// LOGIKA: Supabase drží session v localStorage. Pokud patří k číslu, které je
// právě ve formuláři a je potvrzené, nepotřebujeme nový kód.
// GoTrue vrací telefon bez '+' (např. 420777123456).
// ============================================================
async function restoreFromSession() {
    const { data } = await supabase.auth.getSession()
    const user = data?.session?.user
    if (!user?.phone || !user.phone_confirmed_at) return

    const sessionPhone = '+' + user.phone
    if (formatPhoneStrict(telefonInput.value.trim()) !== sessionPhone) return

    phoneForOtp = sessionPhone
    otpInput.classList.add('ares-success')
    otpInput.disabled = true
    sendOtpButton.disabled = true
    sendOtpButton.textContent = LABEL_VERIFIED
    showOtpStatus('success', '✓ Telefon už je ověřen.')
    setVerified(sessionPhone)
}

restoreFromSession().catch((e) => console.warn('[OTP] Obnovení session selhalo:', e.message))
