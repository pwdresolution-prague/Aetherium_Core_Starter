//TODO: Section pro Obchodní podmínky a GDPR dokumnet s Modalovým zobrazením

const modal = document.querySelector('.modalSubscriberGdpr')
const openModalButton = document.getElementById("openTerms")
const closeModalButton = document.getElementById('closeTerms')

openModalButton.addEventListener('click', () => {
    modal.classList.add('open')
})

closeModalButton.addEventListener('click', () => {
    modal.classList.remove('open')
})

window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.classList.remove('open')
    }
})
