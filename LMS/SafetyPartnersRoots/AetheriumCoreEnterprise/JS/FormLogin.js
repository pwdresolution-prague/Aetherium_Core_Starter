//FRONTEND: Připojení souboru IndexAetherium FormLogin.js pro zpracování přihlášení uživatele
//
import  supabase  from "../Connect/SupabaseConnect.js"

const loginFormAetherium   = document.getElementById("loginFormAetherium")
const returningVisitButton = document.querySelector(".optionSelect2[data-value='ReturningVisit']")
const emailModalInput      = document.getElementById("emailModalInput")
const loginPasswordInput   = document.getElementById("loginPasswordInput")
const submitModalButton    = document.getElementById("submitModalButton")   // ← přesunuto sem, modulový scope

submitModalButton.addEventListener("click", () => {
    loginFormAetherium.classList.toggle("login-form-active", true)
})

loginFormAetherium.addEventListener("submit", async (event) => {
    event.preventDefault()

    const email    = emailModalInput.value.trim()
    const password = loginPasswordInput.value.trim()

    submitModalButton.disabled = true

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) throw error

        console.log("Přihlášení proběhlo úspěšně:", data.user)
        window.location.href = '../../SafetyPartnersFrontendAdmin/CMS/Views/Dashboard.html'

    } catch (err) {
        console.log("Chyba při přihlášení:", err.message)
    } finally {
        submitModalButton.disabled = false
    }
})
