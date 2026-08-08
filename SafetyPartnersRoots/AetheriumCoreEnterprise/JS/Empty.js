//FRONTEND: Rozšíření Tiptap Image extension o možnost měnit velikost přetažením rohových úchytů

import Image from '@tiptap/extension-image'

const ResizableImage = Image.extend({
    //LOGIKA: Přidáváme vlastní atribut "width" k obrázkovému uzlu.
    //Bez tohohle by se změna velikosti nikam neuložila -- Tiptap
    //by ji zapomněl při každém setContent() / reloadu stránky.
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                renderHTML: (attributes) => {
                    if (!attributes.width) return {}
                    return { style: `width: ${attributes.width}px` }
                },
            },
        }
    },

    //LOGIKA: NodeView nahrazuje výchozí vykreslování <img> tagu vlastním
    //DOM stromem -- obrázek + 4 rohové úchyty obalené v jednom kontejneru.
    //Díky tomu můžeme na úchyty věšet vlastní mouse eventy.
    addNodeView() {
        return ({ node, editor, getPos }) => {
            const wrapper = document.createElement('div')
            wrapper.classList.add('ResizableImageWrapper')

            const img = document.createElement('img')
            img.src = node.attrs.src
            img.alt = node.attrs.alt || ''
            if (node.attrs.width) {
                img.style.width = `${node.attrs.width}px`
            }
            wrapper.appendChild(img)

            //LOGIKA: Klik na obrázek přepne třídu "is-selected" -- CSS podle
            //ní zobrazí přerušovaný rámeček a úchyty jen tehdy, když je
            //obrázek vybraný, ne pořád (to by rušilo při psaní textu okolo)
            wrapper.addEventListener('click', () => {
                document
                    .querySelectorAll('.ResizableImageWrapper.is-selected')
                    .forEach((el) => el.classList.remove('is-selected'))
                wrapper.classList.add('is-selected')
            })

            const corners = ['nw', 'ne', 'sw', 'se']
            corners.forEach((corner) => {
                const handle = document.createElement('span')
                handle.classList.add('ImageResizeHandle', `handle-${corner}`)
                wrapper.appendChild(handle)

                //LOGIKA: Na mousedown si zapamatujeme startovní pozici myši
                //a startovní šířku obrázku. Při mousemove počítáme rozdíl
                //a podle toho, jestli je úchyt vlevo (w) nebo vpravo (e),
                //buď šířku zvětšujeme, nebo zmenšujeme opačným směrem.
                handle.addEventListener('mousedown', (event) => {
                    event.preventDefault()
                    event.stopPropagation()

                    const startX = event.clientX
                    const startWidth = img.offsetWidth

                    function onMouseMove(moveEvent) {
                        const diff = moveEvent.clientX - startX
                        const isRightHandle = corner.includes('e')
                        const newWidth = isRightHandle
                            ? startWidth + diff
                            : startWidth - diff

                        if (newWidth > 40) {
                            img.style.width = `${newWidth}px`
                        }
                    }

                    function onMouseUp() {
                        document.removeEventListener('mousemove', onMouseMove)
                        document.removeEventListener('mouseup', onMouseUp)

                        //LOGIKA: Až po puštění myši zapíšeme finální šířku
                        //do dokumentu přes tr.setNodeMarkup -- průběžné
                        //psaní do dokumentu při každém pixelu tažení by
                        //zbytečně zatěžovalo undo historii Tiptapu.
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

            return { dom: wrapper }
        }
    },
})

export default ResizableImage