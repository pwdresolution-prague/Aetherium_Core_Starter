// COMMENT: Napojení generátoru hesla a indikátoru síly na formulář
import { checkPasswordStrength } from '../src_My_Profile/StrongPassword.js'
// Barvy a texty pro jednotlivé úrovně skóre zxcvbn (0-4)
const STRENGTH_LEVELS = {
    0: { percent: 10,  color: '#d9534f', label: 'Velmi slabé heslo' },
    1: { percent: 30,  color: '#e0793a', label: 'Slabé heslo' },
    2: { percent: 55,  color: '#e8c547', label: 'Průměrné heslo' },
    3: { percent: 80,  color: '#8bc34a', label: 'Silné heslo' },
    4: { percent: 100, color: '#4caf50', label: 'Velmi silné heslo' },
}

function generateStrongPassword(length = 16) {
    const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+'
    const randomValues = new Uint32Array(length)
    crypto.getRandomValues(randomValues)
    return Array.from(randomValues, (val) => charset[val % charset.length]).join('')
}

// COMMENT: Aktualizuje vizuální indikátor podle výsledku zxcvbn
function updateStrengthMeter(password, elements) {
    const { fillEl, labelEl } = elements

    if (!password) {
        fillEl.style.setProperty('--strength-percent', 0)
        labelEl.textContent = 'Zadejte heslo'
        labelEl.style.setProperty('--strength-color', '#ccc')
        return
    }

    // TODO: nahradit checkPasswordStrength() z modulu passwordStrength.js (zxcvbn-ts)
    const result = checkPasswordStrength(password)
    const level = STRENGTH_LEVELS[result.score]

    fillEl.style.setProperty('--strength-percent', level.percent)
    fillEl.style.setProperty('--strength-color', level.color)
    labelEl.style.setProperty('--strength-color', level.color)
    labelEl.textContent = level.label
}

// COMMENT: Inicializace komponenty — generátor, indikátor síly, zobrazení hesla
function initPasswordField() {
    const input = document.getElementById('PasswordInputChange')
    const generateBtn = document.getElementById('GeneratePasswordBtnId')
    const toggleBtn = document.getElementById('TogglePasswordVisibilityId')
    const fillEl = document.getElementById('StrengthBarFillId')
    const labelEl = document.getElementById('StrengthLabelId')

    if (!input || !fillEl || !labelEl) {
        console.warn('initPasswordField: Chybí některý z požadovaných elementů')
        return
    }

    const meterElements = { fillEl, labelEl }

    // Ruční zadávání hesla -> průběžné hodnocení síly
    input.addEventListener('input', () => {
        updateStrengthMeter(input.value, meterElements)
    })

    // Generování hesla -> vloží do inputu a rovnou přepočítá sílu
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            const generated = generateStrongPassword()
            input.value = generated
            input.type = 'text' // rovnou ukázat vygenerované heslo, ať uživatel vidí co se stalo
            updateStrengthMeter(generated, meterElements)
            input.dispatchEvent(new Event('input')) // COMMENT: kompatibilita s ValidateForm.js / FIELD_RULES posluchači
        })
    }

    // Zobrazit/skrýt heslo
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = input.type === 'password'
            input.type = isHidden ? 'text' : 'password'
            toggleBtn.setAttribute('aria-label', isHidden ? 'Skrýt heslo' : 'Zobrazit heslo')
        })
    }
}

// COMMENT: Kontrola shody hesla a potvrzení + propojení s tlačítkem Potvrdit
function initPasswordMatchCheck() {
    const passwordInput = document.getElementById('PasswordInputChange')
    const confirmInput = document.getElementById('PasswordAgainInputChange')
    const matchLabel = document.getElementById('PasswordMatchLabelId')
    const submitBtn = document.getElementById('ConfirmButtonId')

    if (!passwordInput || !confirmInput || !matchLabel) {
        console.warn('initPasswordMatchCheck: Chybí některý z požadovaných elementů')
        return
    }

    const checkMatch = () => {
        const password = passwordInput.value
        const confirm = confirmInput.value

        // Dokud uživatel nic nenapsal do potvrzovacího pole, nezobrazuj nic
        if (!confirm) {
            matchLabel.textContent = ''
            if (submitBtn) submitBtn.disabled = true
            return
        }

        const isMatch = password === confirm
        matchLabel.textContent = isMatch ? 'Hesla se shodují' : 'Hesla se neshodují'
        matchLabel.style.color = isMatch ? '#4caf50' : '#d9534f'

        // COMMENT: Potvrzovací tlačítko povoleno jen když se hesla shodují A heslo není prázdné
        if (submitBtn) submitBtn.disabled = !(isMatch && password.length > 0)
    }

    passwordInput.addEventListener('input', checkMatch)
    confirmInput.addEventListener('input', checkMatch)
}

// COMMENT: Zavolat spolu s inicializací password fieldu
document.addEventListener('DOMContentLoaded', () => {
    initPasswordField()
    initPasswordMatchCheck()
})

