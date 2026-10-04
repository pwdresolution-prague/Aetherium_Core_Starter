// ============================================================
// JS/PasswordStatus.js
// ------------------------------------------------------------
// Živý stav hesla pod polem — oranžová = neověřeno, zelená = ověřeno, červená = chyba.
//
// ZMĚNA: stavové řádky jsou při vstupu na stránku SKRYTÉ. Objeví se až ve chvíli,
// kdy uživatel do příslušného pole začne psát, a zmizí, když pole zase vyprázdní.
// Formulář tedy působí čistě a upozornění přijde až ve chvíli, kdy je k užitku.
//
// LOGIKA: pravidla (min/max délka) se čtou z FIELD_RULES v ValidateForm.js,
// takže zobrazení a skutečná validace při odeslání nemůžou jít proti sobě.
// Modul nic neukládá a heslo nikam neposílá — jen čte hodnotu z polí.
// ============================================================

import { FIELD_RULES } from './ValidateForm.js'

const passwordInput = document.getElementById('hesloId')
const confirmInput  = document.getElementById('potvrzení-hesla')

if (passwordInput && confirmInput) {
    const MIN = FIELD_RULES['hesloId'].minLength
    const MAX = FIELD_RULES['hesloId'].maxLength

    const passwordStatus = createStatus('password-status', passwordInput)
    const confirmStatus  = createStatus('password-confirm-status', confirmInput)

    function createStatus(id, afterEl) {
        const el = document.createElement('span')
        el.id = id
        el.hidden = true                       // skryté, dokud uživatel nezačne psát
        el.setAttribute('aria-live', 'polite')
        afterEl.insertAdjacentElement('afterend', el)
        return el
    }

    // state: 'pending' (oranžová) | 'success' (zelená) | 'error' (červená)
    function show(el, state, message) {
        el.hidden = false
        el.textContent = message
        el.className = `pw-status pw-status--${state}`
    }
    const hide = (el) => { el.hidden = true; el.textContent = '' }

    function passwordState(value) {
        if (value.length < MIN) return { ok: false, state: 'pending', msg: `Min. ${MIN} znaků (zatím ${value.length}/${MIN})` }
        if (value.length > MAX) return { ok: false, state: 'error',   msg: `Heslo je příliš dlouhé (max. ${MAX} znaků)` }
        return { ok: true, state: 'success', msg: '✓ Heslo splňuje požadavky' }
    }

    function update() {
        const pw      = passwordInput.value
        const confirm = confirmInput.value
        const pwState = passwordState(pw)

        if (pw.length === 0) hide(passwordStatus)
        else show(passwordStatus, pwState.state, pwState.msg)

        if (confirm.length === 0) {
            hide(confirmStatus)
        } else if (pw !== confirm) {
            show(confirmStatus, 'pending', 'Hesla se zatím neshodují')
        } else if (!pwState.ok) {
            show(confirmStatus, 'pending', 'Hesla se shodují, ale heslo zatím nesplňuje požadavky')
        } else {
            show(confirmStatus, 'success', '✓ Hesla se shodují')
        }
    }

    ;['input', 'change'].forEach((evt) => {    // 'change' zachytí i předvyplnění z hesláře
        passwordInput.addEventListener(evt, update)
        confirmInput.addEventListener(evt, update)
    })
    update()   // při vstupu jsou pole prázdná → oba řádky zůstanou skryté
}
