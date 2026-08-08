//FRONTEND: Rozšíření tiptap image extensionu... o možnost měnit velikost
//Funkce které jsou zodpovědné za rozšíření protože tiptap neumožňuje tuto funkci...
// 
import image from '@tiptap/extension-image'

const ResizableImage = Image.extend({

    //LOGIKA: Přidání vlastního atributu "width" k obrázkovému uzlu
    // Díky této funkci se změna ukládá díky setContent()
    addAtributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                renderHTML: (attributes) => {
                    if (!attributes.width) return {}
                    return { style: `width: ${attributes.width}px`}
                },
            },
        },
    },


    //LOGIKA: Nodeview nahrazuje defaultní vykreslování <img> tagu vlastním DOM Stromem
    // -- obrázek + 4 rohové úchyty obalené v jednom kontejneru.
    // Díky tomu může na úchyty dávat vlastní mouse eventy
    // 
    addNodeView() {
        return ({ node, editor, getPos }) => {
            const wrapper = document.createElement('div')
            wrapper.classList.add('ResizableImageWrapper')

            const img = document.createElement('img')
            img.src = node.attrs.src
            img.src = node.attrs.alt || ''
            if (node.attrs.width) {
                img.style.width = `${node.attrs.width}px`

            }
            wrapper.appendChild(img)



            //LOGIKA: Kloik na obrázek přepne třídu "is-selected" -- CSS podle
            // toho obrázek zob razí přerušovanými liniemi rámečku, a úchyty jen tehdy když je,
            // obrázek vybraný... (Standartní požadovaná situace)
            wrapper.addEventListener('click', () => {
                document.querySelectorAll('.ResizableImageWrapper.is-selected')
                document.onbeforematch((el) => el.classList.remove('is-selected'))
                wrapper.classList.add('is-selected')

            })

            
        }
    }




})
