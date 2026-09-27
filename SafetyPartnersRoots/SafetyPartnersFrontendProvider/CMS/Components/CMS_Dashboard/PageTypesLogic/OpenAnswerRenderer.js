//TODO: otevřená otázka bez auto-vyhodnocení, provider zadá vzorovou odpověď pro ruční kontrolu


export function renderOpenAnswerEditor(container, data) {
    container.innerHTML = ''

    const label = document.createElement('label')
    label.className = 'QuestionLabel'
    label.textContent = 'Znění otázky'


    const questionInput = document.createElement('textarea')
    questionInput.className = 'QuestionTextInput'
    questionInput.value = data.text
    questionInput.placeholder = 'Napište otázku...'
    questionInput.addEventListener('input', (e) => { data.text = e.target.value })

    const sampleLabel = document.createElement('label')
    sampleLabel.className = 'QuestionLabel'
    sampleLabel.textContent = 'Vzorová odpověď pro ruční hodnocení'

    const sampleInput = document.createElement('textarea')
    sampleInput.className = 'QuestionTextInput'
    sampleInput.value = data.sampleAnswer
    sampleInput.placeholder = 'Jakou čekáte odpověď...'
    sampleInput.addEventListener('input', (e) => { data.sampleAnswer = e.target.value })

    container.append(label, questionInput, sampleLabel, sampleInput)




}
