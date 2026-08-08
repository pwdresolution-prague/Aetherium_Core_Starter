//TODO: Připojení Dialogu k Editační části systému  Můj profil, v sekci formulář 
// 
//COMMENT: Připojení

function initEditModal(triggerEls, dialogEl) {
    if (!dialogEl) {
        console.warn('initEditModal: Chybí dialog element')
        return
    }

    const openModal = () => {
        dialogEl.showModal()
    }

    triggerEls.forEach((triggerEl) => {
        if (!triggerEl) {
            console.warn('initEditModal: Chybí trigger element')
            return
        }

        triggerEl.addEventListener('click', openModal)

        triggerEl.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openModal()
            }
        })
    })

    // COMMENT: Zavření jen když klik padne MIMO vnitřní <article> obsah
    // (na rozdíl od event.target === dialogEl, který zahrnuje i padding dialogu)
    dialogEl.addEventListener('click', (event) => {
        const contentEl = dialogEl.querySelector('article')
        if (contentEl && !contentEl.contains(event.target)) {
            dialogEl.close()
        }
    })
}

function initCloseModal(profileDialog) {
    const closeModal = document.getElementById('closeModal')

    if (!closeModal) {
        console.warn('initCloseModal: Chybí element closeModal')
        return
    }

    closeModal.addEventListener("click", () => {
        profileDialog.close()
    })
}

function initCloseModalPassword(passwordDialog) {
    const closeModalPassword = document.getElementById('closeModalPassword')

    if (!closeModalPassword) {
        console.warn('initCloseModal: Chybí element closeModal')
        return
    }

    closeModalPassword.addEventListener("click", () => {
        passwordDialog.close()
    })

}



// COMMENT: Inicializace pro oba dialogy v EditProfile sekci
document.addEventListener('DOMContentLoaded', () => {
    const profileTrigger = document.querySelector('.editProfileText')
    const profileImgButton = document.querySelector('.eIProfile')
    const profileDialog = document.getElementById('editProfileModalId')
    initEditModal([profileTrigger, profileImgButton], profileDialog)

    const passwordTrigger = document.querySelector('.editPasswordText')
    const passwordImgButton = document.querySelector('.eIPassword')
    const passwordDialog = document.getElementById('editPasswordModalId')
    initEditModal([passwordTrigger, passwordImgButton], passwordDialog)


initCloseModal(profileDialog)
initCloseModalPassword(passwordDialog)

})













