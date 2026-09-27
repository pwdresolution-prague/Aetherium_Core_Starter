import { setImageSelectedCallback, closeModal } from "./FilesModal.js"

const fileDropZone = document.getElementById('FileDropZoneId')
const fileInput = document.getElementById('FileInputHiddenId')

function isImage(file) {
    return file && file.type.startsWith('image/')

}

function handleFile(file) {
    if (!file) return

    if (!isImage(file)) {
        alert('Vybrte prosím obrázek')
        return 
    }

    const imageUrl = URL.createObjectURL(file)

    if (typeof window.handleEditorImageSelected === 'function') {
        window.handleEditorImageSelected(imageUrl, file)
    }

    closeModal()

}

//FRONTEND: Sekce funkcionalit v rámci práce s vybíráním souboru, 
//TODO: Zde napojit kod pro uchycení a uložení souboru do SUPABASE: 
fileDropZone?.addEventListener('click', () => {
    fileInput?.click()

})

fileInput?.addEventListener('change', (event) => {
    const file = event.target.files?.[0]

    handleFile(file)
    //COMMENT: Umožní znovu vybrat stejný soubor
    event.target.value = ''

})

fileDropZone?.addEventListener('dragover', (event) => {
    event.preventDefault()
    fileDropZone.classList.add('dragover')
})

fileDropZone?.addEventListener('dragleave', () => {
    fileDropZone.classList.remove('dragover')
})

fileDropZone?.addEventListener('drop', (event) => {
    event.preventDefault()
    fileDropZone.classList.remove('dragover')

    const file = event.dataTransfer.files?.[0]
    handleFile(file)
})

