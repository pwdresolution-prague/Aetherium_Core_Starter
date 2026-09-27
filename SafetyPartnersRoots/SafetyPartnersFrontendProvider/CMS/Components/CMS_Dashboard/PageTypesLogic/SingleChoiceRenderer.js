//TODO: Jedna správná odpověď =========================================================================

export function renderSingleChoiceEditor(container, data) {
    container.innerHTML = ''
    const groupName = `single-${crypto.randomUUID()}`

    const label = document.createElement('label')
    label.className = 'QuestionLabel'
    label.textContent = 'Znění otázky'

    const questionInput = document.createElement('textarea')
    questionInput.className = 'QuestionTextInput'
    questionInput.value = data.text
    questionInput.placeholder = 'Napište otázku...'
    questionInput.addEventListener('input', (e) => { data.text = e.target.value})

    container.append(label, questionInput)

    const answersWrapper = document.createElement('div')
    answersWrapper.className = 'AnswersWrapper'

    data.answers.forEach((answer, index) => {
        const row = document.createElement('div')
        row.className = 'AnswerRow'

        const radio = document.createElement('input')
        radio.type = 'radio'
        radio.name = groupName
        radio.className = 'AnswerRadio'
        radio.checked = answer.correct
        //LOGIKA: Výběr nově správné otázky
        radio.addEventListener('change', () => {
            data.answers.forEach((a) => { a.correct = false})
            answer.correct = true
        })

        const answerInput = document.createElement('input')
        answerInput.type = 'text'
        answerInput.className = 'AnswerTextInput'
        answerInput.value = answer.text
        answerInput.placeholder = `Odpověď ${index + 1}`
        answerInput.addEventListener('input', (e) => { answer.text = e.target.value })

        row.append(radio, answerInput)
        answersWrapper.appendChild(row)

    })

    container.appendChild(answersWrapper)

}
