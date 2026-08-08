//FRONTEND: Napojení tiptap editoru na CMS Modal

import { openModal, setImageSelectedCallback } from '../CMS_Dashboard/FilesModal.js'

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import {
    createElement,
    Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
    Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
    List, ListOrdered, Quote, SquareCode, Minus,
    Link as LinkIcon, Image as ImageIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Undo2, Redo2, RemoveFormatting
} from 'lucide'

//FRONTEND: Konfigurace pro každé tlačítko toolbaru -- ikona i akce pohromadě
const TOOLBAR_COMMANDS = [
    { command: 'bold',      icon: Bold,          action: (editor) => editor.chain().focus().toggleBold().run() },
    { command: 'italic',    icon: Italic,        action: (editor) => editor.chain().focus().toggleItalic().run() },
    { command: 'strike',    icon: Strikethrough, action: (editor) => editor.chain().focus().toggleStrike().run() },
    { command: 'code',      icon: Code,          action: (editor) => editor.chain().focus().toggleCode().run() },
    { command: 'underline', icon: UnderlineIcon, action: (editor) => editor.chain().focus().toggleUnderline().run() },

    { command: 'heading1', icon: Heading1, action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run() },
    { command: 'heading2', icon: Heading2, action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { command: 'heading3', icon: Heading3, action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { command: 'heading4', icon: Heading4, action: (editor) => editor.chain().focus().toggleHeading({ level: 4 }).run() },
    { command: 'heading5', icon: Heading5, action: (editor) => editor.chain().focus().toggleHeading({ level: 5 }).run() },
    { command: 'heading6', icon: Heading6, action: (editor) => editor.chain().focus().toggleHeading({ level: 6 }).run() },

    { command: 'bulletList',     icon: List,        action: (editor) => editor.chain().focus().toggleBulletList().run() },
    { command: 'orderedList',    icon: ListOrdered, action: (editor) => editor.chain().focus().toggleOrderedList().run() },
    { command: 'blockquote',     icon: Quote,       action: (editor) => editor.chain().focus().toggleBlockquote().run() },
    { command: 'codeBlock',      icon: SquareCode,  action: (editor) => editor.chain().focus().toggleCodeBlock().run() },
    { command: 'horizontalRule', icon: Minus,       action: (editor) => editor.chain().focus().setHorizontalRule().run() },

    {
        command: 'link',
        icon: LinkIcon,
        action: (editor) => {
            if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run()
                return
            }
            const url = window.prompt('Zadejte URL odkazu')
            if (!url) return
            editor.chain().focus().setLink({ href: url }).run()
        }
    },

    {
        command: 'image',
        icon: ImageIcon,
        action: (editor) => {
        const selection = editor.state.selection

        window.handleEditorImageSelected = (imageUrl, file) => {
            editor
                .chain()
                .focus()
                .setImage({ 
                    src: imageUrl,
                    alt: 'Vložený obrázek'
                 })
                .run()

        openModal()
    }

    }
},

    { command: 'alignLeft',    icon: AlignLeft,    action: (editor) => editor.chain().focus().setTextAlign('left').run() },
    { command: 'alignCenter',  icon: AlignCenter,  action: (editor) => editor.chain().focus().setTextAlign('center').run() },
    { command: 'alignRight',   icon: AlignRight,   action: (editor) => editor.chain().focus().setTextAlign('right').run() },
    { command: 'alignJustify', icon: AlignJustify, action: (editor) => editor.chain().focus().setTextAlign('justify').run() },

    { command: 'undo', icon: Undo2, action: (editor) => editor.chain().focus().undo().run() },
    { command: 'redo', icon: Redo2, action: (editor) => editor.chain().focus().redo().run() },

    { command: 'clearFormatting', icon: RemoveFormatting, action: (editor) => editor.chain().focus().unsetAllMarks().clearNodes().run() },
]

const commandConfig = new Map(TOOLBAR_COMMANDS.map((entry) => [entry.command, entry]))

let tiptapEditor = null

//COMMENT: Vloží SVG ikony do toolbar tlačítek podle data-command atributu
function renderToolbarIcons() {
    document.querySelectorAll('.ToolbarButton').forEach((button) => {
        const command = button.dataset.command
        const config = commandConfig.get(command)

        if (!config) {
            console.warn(`renderToolbarIcons: Chybí konfigurace pro příkaz "${command}"`)
            return
        }

        const svg = createElement(config.icon)
        svg.setAttribute('width', '18')
        svg.setAttribute('height', '18')
        button.appendChild(svg)
    })
}

//COMMENT: Inicializace Tiptap instance napojené na editorovou plochu
//COMMENT: onContentUpdate je callback z InputEditor.js -- EditorToolbar.js nemusí znát courseState přímo
function initTiptapEditor(onContentUpdate) {
    const editorContent = document.getElementById('EditorContentId')

    if (!editorContent) {
        console.warn('initTiptapEditor: Chybí element EditorContentId')
        return
    }

    tiptapEditor = new Editor({
        element: editorContent,
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
            }),
            Image,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: '',
        onUpdate: ({ editor }) => {
            if (typeof onContentUpdate === 'function') {
                onContentUpdate(editor.getHTML())   // COMMENT: pošle aktuální HTML ven, ať si s ním InputEditor.js udělá, co potřebuje
            }
        },
    })

    initToolbarCommands()
}

//COMMENT: Napojení toolbaru tlačítek na Tiptap příkazy -- lookup v commandConfig, žádný switch
function initToolbarCommands() {
    const toolbar = document.getElementById('EditorToolbarId')

    if (!toolbar) {
        console.warn('initToolbarCommands: Chybí element EditorToolbarId')
        return
    }

    toolbar.addEventListener('click', (event) => {
        const button = event.target.closest('.ToolbarButton')
        if (!button || !tiptapEditor) return

        const command = button.dataset.command
        const config = commandConfig.get(command)

        if (!config) {
            console.warn(`initToolbarCommands: Neznámý příkaz "${command}"`)
            return
        }
        config.action(tiptapEditor)
    })
}

//COMMENT: Voláno při přepnutí stránky -- nahrazuje obsah editoru
function setEditorContent(content) {
    if (!tiptapEditor) return
    tiptapEditor.commands.setContent(content, false)
}

export { initTiptapEditor, setEditorContent, renderToolbarIcons }