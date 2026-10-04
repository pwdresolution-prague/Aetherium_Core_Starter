//TODO: samostatná stránka s obrázkem nebo videem, bez otázky

import { openModal } from '../FilesModal.js'

export function renderMediaEditor(container, data) {
    container.innerHTML = ''

    const typeLabel = document.createElement('label')
    typeLabel.className = 'QuestionLabel'
    typeLabel.textContent = 'Typ média'

    const typeSelect = document.createElement('select')
    typeSelect.className = 'MediaTypeSelect'
    ;[['image', 'Obrázek'], ['video', 'Video']].forEach(([value, text]) => {
        const opt = document.createElement('option')
        opt.value = value
        opt.textContent = text
        opt.selected = data.mediaType === value
        typeSelect.appendChild(opt)
    })

    //COMMENT: Tlačítko, které otevře STEJNÝ drag&drop modal jako vkládání obrázku v Tiptapu
    const pickButton = document.createElement('button')
    pickButton.type = 'button'
    pickButton.className = 'MediaPickButton'
    pickButton.textContent = '📁 Vybrat soubor z počítače'

    const urlLabel = document.createElement('label')
    urlLabel.className = 'QuestionLabel'
    urlLabel.textContent = 'URL média'

    const urlInput = document.createElement('input')
    urlInput.type = 'text'
    urlInput.className = 'AnswerTextInput'
    urlInput.value = data.mediaUrl
    urlInput.placeholder = 'https://... nebo vyberte soubor tlačítkem výše'
    urlInput.addEventListener('input', (e) => {
        data.mediaUrl = e.target.value
        renderPreview()
    })

    const captionLabel = document.createElement('label')
    captionLabel.className = 'QuestionLabel'
    captionLabel.textContent = 'Popisek (Nepovinný)'

    const captionInput = document.createElement('input')
    captionInput.type = 'text'
    captionInput.className = 'AnswerTextInput'
    captionInput.value = data.caption
    captionInput.placeholder = 'Popisek k obrázku/videu...'
    captionInput.addEventListener('input', (e) => { data.caption = e.target.value })

    //COMMENT: Kontejner pro živý náhled — bez tohohle nikdy neuvidíš, co jsi reálně vybral
    const previewWrapper = document.createElement('div')
    previewWrapper.className = 'MediaPreviewWrapper'

    function renderPreview() {
        previewWrapper.innerHTML = ''
        if (!data.mediaUrl) return

        if (data.mediaType === 'video') {
            const video = document.createElement('video')
            video.src = data.mediaUrl
            video.controls = true
            video.className = 'MediaPreviewElement'
            previewWrapper.appendChild(video)
        } else {
            const img = document.createElement('img')
            img.src = data.mediaUrl
            img.alt = data.caption || ''
            img.className = 'MediaPreviewElement'
            previewWrapper.appendChild(img)
        }
    }

    typeSelect.addEventListener('change', (e) => {
        data.mediaType = e.target.value
        renderPreview()
    })

    pickButton.addEventListener('click', () => {
        //LOGIKA: Stejný globální most jako u Tiptap obrázku — FilesInput.js po výběru
        // souboru vždy zavolá právě tuhle proměnnou, ať už ji nastavil kdokoliv naposledy
        window.handleEditorImageSelected = (fileUrl) => {
            data.mediaUrl = fileUrl
            urlInput.value = fileUrl
            renderPreview()
        }
        openModal()
    })

    container.append(
        typeLabel, typeSelect,
        pickButton,
        urlLabel, urlInput,
        captionLabel, captionInput,
        previewWrapper
    )

    renderPreview()
}
