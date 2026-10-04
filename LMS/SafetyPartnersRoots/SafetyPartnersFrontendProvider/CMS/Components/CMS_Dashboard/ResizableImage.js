// ResizableImage.js
// FRONTEND: Rozšíření Tiptap Image extensionu o možnost měnit velikost tažením za rohové úchyty

import Image from '@tiptap/extension-image'

const ResizableImage = Image.extend({
    name: 'image',

    //LOGIKA: Přidání vlastního atributu "width" k obrázkovému uzlu.
    // parseHTML zajistí, že se width načte i při znovunačtení uloženého obsahu (setContent),
    // renderHTML ho zapíše zpět jako inline style při exportu HTML.
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: (element) => {
                    const width = element.style.width || element.getAttribute('width')
                    return width ? parseInt(width, 10) : null
                },
                renderHTML: (attributes) => {
                    if (!attributes.width) return {}
                    return { style: `width: ${attributes.width}px` }
                },
            },
        }
    },

    //LOGIKA: Nodeview nahrazuje defaultní vykreslování <img> tagu vlastním DOM stromem
    // -- obrázek + 4 rohové úchyty. Úchyty poslouchají mousedown → mousemove → mouseup
    // a na konci tažení zapíší novou šířku zpátky do dokumentu přes tr.setNodeMarkup.
    addNodeView() {
        return ({ node, getPos, editor }) => {
            const wrapper = document.createElement('div')
            wrapper.classList.add('ResizableImageWrapper')

            const img = document.createElement('img')
            img.src = node.attrs.src
            img.alt = node.attrs.alt || ''
            if (node.attrs.width) {
                img.style.width = `${node.attrs.width}px`
            }
            wrapper.appendChild(img)

            //COMMENT: 4 rohové úchyty pro resize
            ;['nw', 'ne', 'sw', 'se'].forEach((corner) => {
                const handle = document.createElement('span')
                handle.classList.add('ResizeHandle', `ResizeHandle--${corner}`)
                wrapper.appendChild(handle)

                handle.addEventListener('mousedown', (event) => {
                    event.preventDefault()
                    event.stopPropagation()

                    const startX = event.clientX
                    const startWidth = img.offsetWidth

                    function onMouseMove(moveEvent) {
                        //LOGIKA: Tažení za pravé úchyty (ne/se) zvětšuje doprava,
                        // tažení za levé (nw/sw) zvětšuje doleva -- proto se znaménko dělty liší
                        const delta = corner.includes('e')
                            ? moveEvent.clientX - startX
                            : startX - moveEvent.clientX
                        const newWidth = Math.max(40, startWidth + delta)
                        img.style.width = `${newWidth}px`
                    }

                    function onMouseUp() {
                        document.removeEventListener('mousemove', onMouseMove)
                        document.removeEventListener('mouseup', onMouseUp)

                        //LOGIKA: Teprve PO puštění myši zapíšeme finální width do dokumentu
                        // -- během tažení jen měníme vizuální styl, ať to netrhá historii Undo/Redo
                        if (typeof getPos === 'function') {
                            editor.commands.command(({ tr }) => {
                                tr.setNodeMarkup(getPos(), undefined, {
                                    ...node.attrs,
                                    width: img.offsetWidth,
                                })
                                return true
                            })
                        }
                    }

                    document.addEventListener('mousemove', onMouseMove)
                    document.addEventListener('mouseup', onMouseUp)
                })
            })

            //LOGIKA: Klik na obrázek ho označí (zobrazí úchyty přes CSS .is-selected),
            // klik mimo něj ho odznačí
            wrapper.addEventListener('click', (event) => {
                event.stopPropagation()
                document.querySelectorAll('.ResizableImageWrapper.is-selected')
                    .forEach((el) => el.classList.remove('is-selected'))
                wrapper.classList.add('is-selected')
            })

            document.addEventListener('click', (event) => {
                if (!wrapper.contains(event.target)) {
                    wrapper.classList.remove('is-selected')
                }
            })

            return {
                dom: wrapper,
                //LOGIKA: update() se volá, když se uzel změní zvenčí (např. Undo) --
                // bez něj by se vizuální šířka nesynchronizovala se stavem dokumentu
                update(updatedNode) {
                    if (updatedNode.type.name !== node.type.name) return false
                    if (updatedNode.attrs.width) {
                        img.style.width = `${updatedNode.attrs.width}px`
                    }
                    return true
                },
            }
        }
    },
})

export default ResizableImage
