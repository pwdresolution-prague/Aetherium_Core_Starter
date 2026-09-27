//FRONTEND: Otevření modalové okna
// 
const modalWindowDashboard = document.getElementById('CMS_ModalId')
const courseButton = document.getElementById('MakeModalWindowId')
const courseButtonEdit = document.getElementById('EditModalWindowId')




//COMMENT: showModal() vytvoří při dialogu atribut open a tím vznikne 
// top layer a vykreslí hodnotu ::backdrop
// 
export function openModal() {
    modalWindowDashboard.showModal()
}

//COMMENT: zavření modalu
// 
export function closeModal() {
    modalWindowDashboard.close()
}

modalWindowDashboard.addEventListener('click', (event) => {
    if(event.target === modalWindowDashboard) {
        closeModal()
    }
})

//COMMENT: Napojení tlačítka na modalové okno 

courseButton.addEventListener('click', () => {
    openModal()
})

courseButtonEdit.addEventListener('click', () => {
    openModal()
})


//COMMNET: Kliknutí mimo a tím zavření
modalWindowDashboard.addEventListener('click', (event) => {
    if(event.target === modalWindowDashboard) {
        closeModal()
    }
})

//COMMENT: Zavírací funkce 
function initCloseModal() {
    const closeModal = document.getElementById('closeModalCMS')

    if (!closeModal) {
        console.warn('initCloseModal: Chybí element closeModal')
        return
    }

    closeModal.addEventListener("click", () => {
        modalWindowDashboard.close()
    })
}









initCloseModal()
