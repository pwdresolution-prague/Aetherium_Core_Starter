//FRONTEND: Centrální registr veškerých typů Kurzů a Testů

//LOGIKA: Přidání nového typu = nový renderer soubor + jeden záznam sem.

//TODO: Importy Funkcí v renderovací oblasti =====================================================
import { renderSingleChoiceEditor } from './SingleChoiceRenderer.js'
import { renderMultiChoiceEditor } from './MultiChoiceRenderer.js'
import { renderTrueFalseEditor } from './TrueFalseRenderer.js'
import { renderOpenAnswerEditor } from './OpenAnswerRenderer.js'
import { renderMediaEditor } from './MediaRenderer.js'



//FRONTEND: Funkce ===========================================

function createQuestionData(answerCount = 4) {
    return {
        text: '',
        answers: Array.from({ length: answerCount }, () => ({   // bylo "answer" (singular) — renderery čekají "answers"
            id: crypto.randomUUID(),
            text: '',
            correct: false,
        })),
    }
}


export const PAGE_TYPES = {
    content: {
        label: 'Textový obsah',
        icon: '📝',
        createEmpty: () => ({ html: ''}),
        render: null, //COMMENT: content řeší přímo InputEditor.js přes existující tiptap instanci
    },

    question_single: {
        label: 'Otázka - jedna správná',
        icon: '☑️',
        createEmpty: () => createQuestionData(4),
        render: renderSingleChoiceEditor,
    },

    question_multi: {
         label: 'Otázka - více správných',
         icon: '✅',
         createEmpty: () => createQuestionData(4),
         render: renderMultiChoiceEditor,
    },

    true_false: {
        label: 'Ano / Ne',
        icon: '✍️',
        createEmpty: () => ({ text: '', correct: true}),
        render: renderTrueFalseEditor,
    },

    open_answer: {
        label: 'Otevřená otázka',
        icon: '✍️',
        createEmpty: () => ({ text: '', sampleAnswer: ''}),
        render: renderOpenAnswerEditor,
    },

    media: {
    label: 'Obrázek / Video',
    icon: '🖼️',
    createEmpty: () => ({ mediaUrl: '', mediaType: 'image', caption: '' }), // bylo "medialUrl"
    render: renderMediaEditor,
    },

}

//COMMENT: Vytvoří novou stránku danného typu s prázdnou strukturou dat
export function createEmpty(type) {
    const config = PAGE_TYPES[type]
    if(!config) {
        console.warn(`createEmptyPage: Neznámý typ stránky "${type}"`)
        return null
    }
    return  {
        id: crypto.randomUUID(),
        type,
        data: config.createEmpty(),
    }
}
