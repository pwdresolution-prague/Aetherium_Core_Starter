import { value } from "../../SafetyPartnersBackEndSharing/Connect/InnitialVisitAeForm"
import { AetheriumForm } from "../Connect/InnitialVisitAeForm"
import { supabase } from "../../StudentLogin/JS/SupabaseConnectEnv"




                //TODO: Kontrola funkce submitRegistration

async function submitRegistration(formData) {
    try {
        const response = await fetch("/api/registration", {
            method: "POST",
            headers: { "Content-type": "aplication/json"}, 
            body: JSON.stringify({
                visitType: formData.get("visitType"), //First-Visit / Returning-Visit
                companyName: formData.get("companyNAme"),
                ico: formData.get("ico"),
                email: formData.get("email"),
                services: formData.get("services") //TODO: Typy Kurzů - BOZP, POVP

            }),
        })
        






        
        if(!response.ok) throw new Error(await response.text())

            const data = await response.json()

        // Data OTP required === True => zobrazí OTP modal
        async function OtpControl()
        //TODO: Vytvořit funkci showOtpModal
        showOtpModal(dataOtpRequired)  

    } catch(err) {
        console.log("chyba registrace", err)
    }
}




