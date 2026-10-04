//FRONTEND: Nastavení textArea pro počítání znaků a zobrazení počtu znaků v reálném čase

const MAX_LENGTH = 300
const WARNING_THRESHOLD = 0.9 // 90 % limitu = vizuální varování

function initCompanyDescriptionCounter(){
    const textArea = document.getElementById('CompanyTextId')
    const counter = document.getElementById('CharCounterId')

    if(!textArea || !counter){
        console.warn('CompanyDescriptionCounter: textarea nebo counter element nenalezen')
        return
    }

    //FRONTEND: VLastní logika přepočtu - vtažená do pojemnované funkce
    function updateCounter(){
        const currentLength = textArea.value.length
        counter.textContent = `${currentLength} / ${MAX_LENGTH}`

        if(currentLength >= MAX_LENGTH * WARNING_THRESHOLD){
            counter.classList.add('CharCounter--warning')

        } else {
            counter.classList.remove('CharCounter--warning')

        }
    }

    textArea.addEventListener('input', updateCounter)

updateCounter()
}

export { initCompanyDescriptionCounter }

initCompanyDescriptionCounter()
