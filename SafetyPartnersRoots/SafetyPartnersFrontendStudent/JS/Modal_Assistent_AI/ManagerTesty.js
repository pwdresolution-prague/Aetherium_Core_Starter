//TODO: Napojení tlačítek
document.querySelectorAll('.ModalButton').forEach(button => {
  button.addEventListener('click', () => {
    const title = button.getAttribute('data-title')
    const desc = button.getAttribute('data-desc')
    openModal(title, desc)
  })
})

//TODO: Tlačítka 
const buttons = document.querySelectorAll('.ModalButton')

//TODO: Modalové funkce
const modal = document.getElementById("ModalWindow")
const closeBtn = modal.querySelector(".Close")
const modalTitle = document.getElementById("ModalTitle")
const modalDescription = document.getElementById("ModalDescription") 

function openModal(title, description){
    modalTitle.textContent = title
    modalDescription.textContent = description
    modal.classList.remove('ModalHidden')
}

closeBtn.addEventListener('click', () =>{
    modal.classList.add('ModalHidden')    
})
modal.addEventListener('click', (Event) =>{
    if(Event.target === modal){
        modal.classList.add('ModalHidden')
    }
})