//TODO: Modal Visit  ==================================================
import supabase from "../Connect/SupabaseClient.js"
//TODO: //TODO: Skript pro výběr typu návštěvy a zobrazení příslušných částí formuláře

//TODO: Uchopení modalu přes Select ======================================
export const selectButton = document.querySelector(".visitTypeButton")

//TODO: Hodnoty menu ==================================================
export const firstVisitSection = document.querySelector(".FirstVisit")
export const returningVisitSection = document.querySelector(".ReturningVisit")

//TODO: Modalové okno =======================================================
const modalOver = document.querySelector(".modalOverlay")
export const options = document.querySelectorAll(".optionSelect1, .optionSelect2")
const closeModalButtonSection = document.querySelector(".closeButtonSection")




selectButton.addEventListener("mousedown", function (e) {
    e.preventDefault()
    modalOver.classList.add("active")

})

//TODO:  Výběr hodnoty z modalu  ===================================================
export let modalValue = ""

options.forEach(option => { //Funkce for'Each alokace na veškeré option elementy
    option.addEventListener("click", function() {

        modalValue = this.dataset.value

        selectButton.value = modalValue

        modalOver.classList.remove("active")

        // trigger change event (důležité pro backend a validaci )
        selectButton.dispatchEvent(new Event("change"))




            


    })
    
});



//TODO: Uzavření modalu klikem mimo okno ======================

modalOver.addEventListener("click", function(e) {
    if(e.target === modalOver ) {
        modalOver.classList.remove("active")
    }

})

closeModalButtonSection.addEventListener('click', () => {
    modalOver.style.display = 'none'
})



// ============================================================================================================================================================



//TODO: Section pro Obchodní podmínky a GDPR dokumnet s Modalovým zobrazením

const modal = document.querySelector('.modal');
const openModalButton = document.getElementById("openTerms")
const closeModalButton = document.getElementById('closeTerms')

openModalButton.addEventListener('click', () => {
    modal.style.display = 'block'
})

closeModalButton.addEventListener('click', () => {
    modal.style.display = 'none'
})

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none'
    }
})


