//FRONTEND: Modalové okno pro Import drag&drop souborů
import { createElement, Paperclip } from  'lucide'

const DragAndDropModal = document.getElementById('FilesInputModalId')
const DragModalButton = document.getElementById('DragModalButtonId')


let onImageSelected = null

//LOGIKA: Definice ikony propsané na modalové okno CMS
function renderDragButtonIcon() {
if  (!DragAndDropModal) return 

    const svg = createElement(Paperclip)
    svg.setAttribute('width', '15')
    svg.setAttribute('height', '15')
    svg.setAttribute('aria-hidden', 'true')

    DragModalButton.appendChild(svg)

}

renderDragButtonIcon()

export function setImageSelectedCallback(callback) {
    onImageSelected = callback
}



//TODO: Funkce pro otevření a zavřen í modalu
// 
export function openModal() {
    DragAndDropModal.showModal()
    
    const btnRect = DragModalButton.getBoundingClientRect()
    const modalRect = DragAndDropModal.getBoundingClientRect()

    const originX = btnRect.left - modalRect.left 
    const originY = modalRect.height

    DragAndDropModal.style.transformOrigin = `${originX}px ${originY}px`




    }

export function closeModal() {
    DragAndDropModal.close()

}


//FRONTEND: Napojení tlačítka na modalové okno 
//
DragModalButton.addEventListener('click', () => {
    openModal()

})



//TODO: Click a zavíárací funkce na modalu 
// 
DragAndDropModal.addEventListener('click', (event) => {
    if (event.target === DragAndDropModal) {
        closeModal()
    }
})



function initCloseModal() {
    const closeModalDrag = document.getElementById('closeFilesModalId')

    if (!closeModalDrag) {
        console.warn('initCloseModal: Chybí element closeModal')
        return 
    }
    
    closeModalDrag.addEventListener('click', () => {
        DragAndDropModal.close()
    })
}

initCloseModal()
