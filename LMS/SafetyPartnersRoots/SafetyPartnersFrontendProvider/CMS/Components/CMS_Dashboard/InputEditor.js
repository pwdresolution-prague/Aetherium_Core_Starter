//FRONTEND: Vstupní paramatry Editoru
console.log('InputEditor.js se načetl')

import { initTiptapEditor, setEditorContent, renderToolbarIcons } from '../CMS_Dashboard/EditorToolbar.js'
import { PAGE_TYPES, createEmpty } from '../CMS_Dashboard/PageTypesLogic/PageTypes.js'

const inputCourseTitle = document.getElementById('InputTitleId')
const courseTypeSelect = document.getElementById('SelectCourseId')

const courseState = {
    title: '',
    type: null,
    pages: [],
    currentPageIndex: 0,
}

inputCourseTitle.addEventListener('input', (e) => { courseState.title = e.target.value })
courseTypeSelect.addEventListener('change', (e) => { courseState.type = e.target.value })

const pageOutline = document.getElementById('PageOutlineId')
const backwardButton = document.getElementById('BackwardButtonId')
const addPageButton = document.getElementById('AddPageButtonId')
const addPageMenu = document.getElementById('AddPageMenuId')
const forwardButton = document.getElementById('ForwardButtonId')

const editorToolbar = document.getElementById('EditorToolbarId')
const editorContent = document.getElementById('EditorContentId')
const structuredContent = document.getElementById('StructuredPageContentId')

//COMMENT: Naplní menu "+" tlačítka podle registru PAGE_TYPES — přidáš typ do registru, objeví se tu automaticky
function renderAddPageMenu() {
    addPageMenu.innerHTML = ''
    Object.entries(PAGE_TYPES).forEach(([key, config]) => {
        const item = document.createElement('li')
        item.className = 'AddPageMenuItem'
        item.textContent = `${config.icon} ${config.label}`
        item.addEventListener('click', () => {
            addPage(key)
            addPageMenu.hidden = true
        })
        addPageMenu.appendChild(item)
    })
}

addPageButton.addEventListener('click', () => {
    addPageMenu.hidden = !addPageMenu.hidden
})

//COMMENT: Zavření menu klikem mimo něj
document.addEventListener('click', (e) => {
    const wrapper = document.querySelector('.AddPageMenuWrapper')
    if (!addPageMenu.hidden && wrapper && !wrapper.contains(e.target)) {
        addPageMenu.hidden = true
    }
})

function addPage(type) {
    const newPage = createEmpty(type)
    if (!newPage) return
    courseState.pages.push(newPage)
    courseState.currentPageIndex = courseState.pages.length - 1
    renderOutline()
    renderCurrentPage()
}

function goBackward() {
    if (courseState.currentPageIndex <= 0) return
    courseState.currentPageIndex--
    renderOutline()
    renderCurrentPage()
}

function goForward() {
    if (courseState.currentPageIndex >= courseState.pages.length - 1) return
    courseState.currentPageIndex++
    renderOutline()
    renderCurrentPage()
}

//COMMENT: Přepne viditelnost mezi Tiptap editorem ("content") a generickým kontejnerem strukturovaných typů
function toggleView(isContentType) {
    editorToolbar.hidden = !isContentType
    editorContent.hidden = !isContentType
    structuredContent.hidden = isContentType
}

//COMMENT: Centrální bod přepínání — jediné místo, které rozhoduje, jak se stránka vykreslí
function renderCurrentPage() {
    const page = courseState.pages[courseState.currentPageIndex]

    if (!page) {
        toggleView(true)
        setEditorContent('')
        structuredContent.innerHTML = ''   // ← přidat, jen pro jistotu/čistotu
        return
    }

    if (page.type === 'content') {
        toggleView(true)
        setEditorContent(page.data.html)
    } else {
        toggleView(false)
        const config = PAGE_TYPES[page.type]
        if (!config?.render) {
            console.warn(`renderCurrentPage: Typ "${page.type}" nemá render funkci`)
            return
        }
        config.render(structuredContent, page.data)
    }
}

//COMMENT: Vykreslí outline — číslo/ikonu podle typu, aby bylo na první pohled poznat, co je co
function renderOutline() {
    pageOutline.innerHTML = ''

    courseState.pages.forEach((page, index) => {
        const pageButton = document.createElement('button')
        pageButton.type = 'button'
        pageButton.className = 'OutlinePageButton'
        if (index === courseState.currentPageIndex) pageButton.classList.add('active')

        const icon = PAGE_TYPES[page.type]?.icon ?? ''
        const pageNumber = document.createElement('span')
        pageNumber.className = 'OutlinePageNumber'
        pageNumber.textContent = `${icon} ${index + 1}`
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

function deletePage(index) {
    courseState.pages.splice(index, 1)
    if (courseState.currentPageIndex >= courseState.pages.length) {
        courseState.currentPageIndex = courseState.pages.length - 1
    }
    renderOutline()
    renderCurrentPage()
}

backwardButton.addEventListener('click', goBackward)
forwardButton.addEventListener('click', goForward)

const conceptSave = document.getElementById('SaveCreationId')
const confirmSelect = document.getElementById('ConfirmCreationId')

function buildCoursePayload(status) {
    return {
        title: courseState.title,
        type: courseState.type,
        pages: courseState.pages,
        status,
    }
}

async function saveConcept() {
    const payload = buildCoursePayload('draft')
    console.log('Ukládám koncept', payload)
    //SUPABASE: sem přijde insert/update volání funkce
}

//COMMENT: Validace před publikací — teď zohledňuje KAŽDÝ typ stránky, ne jen text
function validatePages() {
    for (const page of courseState.pages) {
        if (page.type === 'content' && !page.data.html?.trim()) {
            return `Stránka je prázdná (typ: Textový obsah)`
        }
        if ((page.type === 'question_single' || page.type === 'question_multi')) {
            if (!page.data.text?.trim()) return 'Otázka nemá znění'
            if (!page.data.answers.some((a) => a.correct)) return 'Otázka nemá označenou správnou odpověď'
        }
        if (page.type === 'true_false' && !page.data.text?.trim()) {
            return 'Tvrzení je prázdné'
        }
        if (page.type === 'open_answer' && !page.data.text?.trim()) {
            return 'Otevřená otázka nemá znění'
        }
        if (page.type === 'media' && !page.data.mediaUrl?.trim()) {
            return 'Chybí URL média'
        }
    }
    return null
}

async function publishCourse() {
    if (!courseState.title || !courseState.type || courseState.pages.length === 0) {
        console.warn('Nelze publikovat - chybí název, typ nebo stránky')
        return
    }

    const validationError = validatePages()
    if (validationError) {
        console.warn('Nelze publikovat:', validationError)
        return // TODO: zobrazit chybu vizuálně u konkrétní stránky
    }

    const payload = buildCoursePayload('published')
    console.log('Publikuji', payload)
    //SUPABASE: sem přijde insert/update volání funkce
}

conceptSave.addEventListener('click', saveConcept)
confirmSelect.addEventListener('click', publishCourse)

document.addEventListener('DOMContentLoaded', () => {
    const handleEditorContentUpdate = (html) => {
        const currentPage = courseState.pages[courseState.currentPageIndex]
        if (currentPage && currentPage.type === 'content') {
            currentPage.data.html = html
        }
    }

    initTiptapEditor(handleEditorContentUpdate)
    renderToolbarIcons()
    renderAddPageMenu()
})
