//FRONTEND: Otázka kde smí být více správných odpovědí

export function renderMultiChoiceEditor(container, data) {
    container.innerHTML = ''

    const label = document.createElement('label')
    label.className = 'QuestionLabel'
    label.textContent = 'Znění otázky'

    const questionInput = document.createElement('textarea')
    questionInput.className = 'QuestionTextInput'
    questionInput.value = data.text
    questionInput.placeholder = 'Napište otázku...'
    questionInput.addEventListener('input', (e) =>  { data.text = e.target.value })

    container.append(label, questionInput)

    const answersWrapper = document.createElement('div')
    answersWrapper.className = 'AnswersWrapper'

    data.answers.forEach((answer, index) => {
        const row = document.createElement('div')
        row.className = 'AnswerRow'

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.className = 'AnswerCheckbox'
        checkbox.checked = answer.correct
        checkbox.addEventListener('change', (e) => { answer.correct = e.target.checked })

        const answerInput = document.createElement('input')
        answerInput.type = 'text'
        answerInput.className = 'AnswerTextInput'
        answerInput.value = answer.text
        answerInput.placeholder = `Odpověď ${index + 1}`   // backticky!
        answerInput.addEventListener('input', (e) => { answer.text = e.target.value })

        row.append(checkbox, answerInput)
        answersWrapper.appendChild(row)


    })

    container.appendChild(answersWrapper)

}
