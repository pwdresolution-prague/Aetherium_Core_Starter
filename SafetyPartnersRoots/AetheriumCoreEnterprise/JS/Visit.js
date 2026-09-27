// Visit.js
import { selectButton, firstVisitSection, returningVisitSection, modalValue } from "../JS/ModalWindow.js"
import supabase from "../Connect/SupabaseConnect.js"

// ============================================================
// Elementy přihlašovacího formuláře
// ============================================================
const emailModalInput    = document.getElementById("emailModalInput")
const loginPasswordInput = document.getElementById("loginPasswordInput")
const submitModalButton  = document.getElementById("submitModalButton")

// ============================================================
//TODO:  Reakce na výběr typu návštěvy
// ============================================================
selectButton.addEventListener("change", handleVisitType)

function handleVisitType() {
    const value = selectButton.value

    // Skrýt obě sekce
    firstVisitSection.style.display = "none"
    returningVisitSection.style.display = "none"

    if (value === "FirstVisit") {
        firstVisitSection.style.display = "block"

    } else if (value === "ReturningVisit") {
        // Zobrazit login form v modalu
        document.querySelector(".modalOverlay").classList.add("active")
    }
}

// ============================================================
//TODO:  Login — přihlášení registrované společnosti
// ============================================================
document.getElementById("loginFormAetherium").addEventListener("submit", async function(e) {
    e.preventDefault()

    const email  = emailModalInput.value.trim()
    const heslo  = loginPasswordInput.value.trim()

    if (!email || !heslo) {
        alert("Vyplňte email a heslo.")
        return
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: heslo
        })

        if (error) throw error

        console.log("Přihlášen:", data.user)
        console.log("Role:", data.user.user_metadata?.role)

        // Přesměrování dle role
        redirectByRole(data.user)

    } catch (error) {
        console.error("Chyba přihlášení:", error.message)
        alert("Nesprávný email nebo heslo.")
    }
})

// ============================================================
//TODO: Přesměrování dle role
// ============================================================
function redirectByRole(user) {
    const role = user.user_metadata?.role

    switch (role) {
        case "admin":
            window.location.href = "/dashboard/admin"
            break
        case "manager":
            window.location.href = "/dashboard/manager"
            break
        case "employee":
            window.location.href = "/dashboard/employee"
            break
        default:
            console.warn("Neznámá role:", role)
            window.location.href = "/dashboard"
    }
}
