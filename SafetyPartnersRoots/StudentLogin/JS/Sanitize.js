import { sanitizeHTML } from "../../utils/security.client"
import { supabase } from "../../StudentLogin/JS/SupabaseConnectEnv"

//TODO: Obcházení registrace ------------------

//const DEV_MODE = true
//const MOCK_USER_ID = 'Ručně vytvořené ID'






// -- POMOCNÉ FUNKCE ---
const phoneRegex = new RegExp(/^\+?(420|421)?\s?\d{3}\s?\d{3}\s?\d{3}$/)

function normalizePhone(rawPhone) {
    let phone = rawPhone.replace(/\s/g, '').replace(/-/g, '')
    if (phone.startsWith('+')) return phone
    if (phone.startsWith('420') || phone.startsWith('421')) return '+' + phone
    if (phone.length === 9) return '+420' + phone
    return phone
    }

// ---------- LOGIN  ----------------------

const loginForm = document.getElementById("loginForm")
if(loginForm) {
    loginForm.addEventListener('submit', async function(event){
        event.preventDefault()
        const email = document.getElementById("loginEmailInput").value.trim()
        const password = document.getElementById("loginPasswordInput").value.trim()

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password

        })

        if(error) {
            console.error('Chyba přihlášení', error.message)

        } else {
            console.log('Login úspěšný')
            window.location.href = '/SafetyPartnersFrontendStudent/Html/Index.html'

        }

    })    
}

// --- SIGNUP --------------------

const signUpForm = document.getElementById('signupForm')
if(signUpForm) {
    signUpForm.addEventListener("submit", async function(event) {
        event.preventDefault()

        const rawName = document.getElementById("signupNameInput").value.trim()
        const rawEmail = document.getElementById("signupEmailInput").value.trim()
        const rawPhone = document.getElementById("signupPhoneInput").value.trim()
        const password = document.getElementById("signupPasswordInput").value
        const passwordAgain = document.getElementById("signupPasswordAgainInput").value


        //1.validace ---------
        if(password !== passwordAgain) {
            console.warn('Hesla se neshodují')
            return
        }

        const phone = normalizePhone(rawPhone)
        const safeName = sanitizeHTML(rawName)
        const safeEmail = sanitizeHTML(rawEmail)

        console.log('Data jsou připravena k odeslání...')

        //VOLBA A: EMAIL + HESLO (AKTIVNÍ) ---
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: safeEmail,
            password: password,
            options: {
                data: { //METADATA pro profil
                    full_name: safeName,
                    phone: phone
                }
            }
        })

        /* // --- VOLBA B: PHONE OTP (ZAKOMENTOVÁNO) ---
        // PRO TENHLE KOD MUSÍ BÝT V SUPABASE PHONE PROVIDER
        const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
            phone: phone
        })

        */

        if(authError) {
            console.error('Chyba při registraci (Auth):', authError.message)
            return
        }
        //2. Vožení do tabulky PROFILES
        // authData.user může být null, pokud je vyžadováno potvrzení emailu,
        // proto v Dashboardu VYPNOUT "Confirm Email"
        const userId = authData.user?.id
        
        if(userId) {
            const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
                id: userId,
                name: safeName,
                email: safeEmail,
                phone: phone,
                role: 'Student'
            }])
        if(profileError) {
            console.error('Chyba při vytváření profilu', profileError.message)

        }else {
            console.log('Registrace i profil je Ok')
            window.location.href = '/SafetyPartnersFrontendStudent/Html/Index.html'

        }
        
        }else {
            console.log('Uživatel vytvořen, čeká se na potvrzení (Pokud není vytvořen v databázi)')
        }
    })

}









