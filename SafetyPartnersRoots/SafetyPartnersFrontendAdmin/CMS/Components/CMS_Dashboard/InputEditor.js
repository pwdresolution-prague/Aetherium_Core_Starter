//FRONTEND: Vstupní paramatry Editoru
console.log('InputEditor.js se načetl')

import { initTiptapEditor, setEditorContent, renderToolbarIcons } from '../CMS_Dashboard/EditorToolbar.js'

//COMMENT: Vstupní název kurzu, testu
const inputCourseTitle = document.getElementById('InputTitleId')

//COMMENT: Selektor
const courseTypeSelect = document.getElementById('SelectCourseId')

//FRONTEND: Centrální stav aktuálně zobrazeného kurzu
const courseState = {
    title: '',
    type: null, //COMMENT: Kurz nebo test
    pages: [], //COMMENT: pole objektů { id, content }
    currentPageIndex: 0 //COMMENT: Index aktuální zobrazené stránky
}

inputCourseTitle.addEventListener('input', (e) => {
    courseState.title = e.target.value
})

courseTypeSelect.addEventListener('change', (e) => {
    courseState.type = e.target.value
    console.log('Vybraný typ', courseState.type)
})

//COMMENT: Spodní část buttony
const pageOutline = document.getElementById('PageOutlineId')
const backwardButton = document.getElementById('BackwardButtonId')
const addPageButton = document.getElementById('AddPageButtonId')
const forwardButton = document.getElementById('ForwardButtonId')

function addPage() {
    const newPage = {
        id: crypto.randomUUID(),
        content: ''
    }
    courseState.pages.push(newPage)
    courseState.currentPageIndex = courseState.pages.length - 1 //Skoč na novou stránku
    renderOutline()
    renderCurrentPage()
}

//COMMENT: Přepnutí na předchozí stránku
function goBackward() {
    if (courseState.currentPageIndex <= 0) return
    courseState.currentPageIndex--
    renderOutline()
    renderCurrentPage()
}

//COMMENT: Přepnutí na následující stránku
function goForward() {
    if (courseState.currentPageIndex >= courseState.pages.length - 1) return
    courseState.currentPageIndex++
    renderOutline()
    renderCurrentPage()
}

//COMMENT: Vykreslí obsah aktuálně vybrané stránky do Tiptap editoru
function renderCurrentPage() {
    const page = courseState.pages[courseState.currentPageIndex]
    if (!page) {
        setEditorContent('')
        return
    }
    setEditorContent(page.content)
}

//COMMENT: Vykreslí outlinu - tlačítko pro každou stránku + tlačítko na smazání
function renderOutline() {
    pageOutline.innerHTML = ''

    courseState.pages.forEach((page, index) => {
        const pageButton = document.createElement('button')
        pageButton.type = 'button'
        pageButton.className = 'OutlinePageButton'

        if (index === courseState.currentPageIndex) {
            pageButton.classList.add('active')
        }

        const pageNumber = document.createElement('span')
        pageNumber.className = 'OutlinePageNumber'
        pageNumber.textContent = index + 1
        pageButton.appendChild(pageNumber)

        const deleteIcon = document.createElement('span')
        deleteIcon.className = 'OutlinePageDelete'
        deleteIcon.textContent = '×'
        pageButton.appendChild(deleteIcon)

        pageButton.addEventListener('click', () => {
            courseState.currentPageIndex = index
            renderOutline()
            renderCurrentPage()
        })

        deleteIcon.addEventListener('click', (e) => {
            e.stopPropagation()
            deletePage(index)
        })

        pageOutline.appendChild(pageButton)
    })
}

//COMMENT: Smaže stránku podle indexu a přepočítá currentPageIndex
function deletePage(index) {
    courseState.pages.splice(index, 1)

    if (courseState.currentPageIndex >= courseState.pages.length) {
        courseState.currentPageIndex = courseState.pages.length - 1
    }

    renderOutline()
    renderCurrentPage()
}

//COMMENT: Napojení na event listenery tlačítek
addPageButton.addEventListener('click', addPage)
backwardButton.addEventListener('click', goBackward)
forwardButton.addEventListener('click', goForward)

//COMMENT: Deklarace proměnných ==================================
const conceptSave = document.getElementById('SaveCreationId')
const confirmSelect = document.getElementById('ConfirmCreationId')

//BACKEND: Odesílání stavu do SUPABASE
function buildCoursePayload(status) {
    return {
        title: courseState.title,   // COMMENT: opraven překlep "tittle" -> "title"
        type: courseState.type,
        pages: courseState.pages,
        status: status
    }
}

//COMMENT: Uložení jako koncept - nevyžaduje kompletní vyplnění
async function saveConcept() {
    const payload = buildCoursePayload('draft')
    console.log('Ukládám koncept', payload)
    //SUPABASE: sem přijde insert/update volání funkce
}

//COMMENT: Publikace - mělo by vše validovat pokud je vyplněné
async function publishCourse() {
    if (!courseState.title || !courseState.type || courseState.pages.length === 0) {
        console.warn('Nelze publikovat - chybí název, typ nebo stránky')
        return
    }

    const payload = buildCoursePayload('published')
    console.log('Publikuji', payload)
    //SUPABASE: sem přijde insert/update volání funkce
}

conceptSave.addEventListener('click', saveConcept)
confirmSelect.addEventListener('click', publishCourse)

// COMMENT: Inicializace Tiptap editoru a jeho toolbar ikon po načtení DOM
document.addEventListener('DOMContentLoaded', () => {
    // COMMENT: Callback, který Tiptap zavolá při každé změně obsahu -- aktualizuje courseState
    // bez toho, aby EditorToolbar.js musel courseState znát nebo importovat
    const handleEditorContentUpdate = (html) => {
        const currentPage = courseState.pages[courseState.currentPageIndex]
        if (currentPage) {
            currentPage.content = html
        }
    }

    initTiptapEditor(handleEditorContentUpdate)
    renderToolbarIcons()
})