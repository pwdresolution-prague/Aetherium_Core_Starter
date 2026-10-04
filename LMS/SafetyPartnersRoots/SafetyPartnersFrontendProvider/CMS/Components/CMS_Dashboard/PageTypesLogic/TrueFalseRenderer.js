export function renderTrueFalseEditor(container, data) {
    container.innerHTML = ''

    const label = document.createElement('label')
    label.className = 'QuestionLabel'
    label.textContent = 'Tvrzení'

    const statementInput = document.createElement('textarea')
    statementInput.className = 'QuestionTextInput'
    statementInput.value = data.text
    statementInput.placeholder = 'Napište tvrzení, které bude student hodnotit...'
    statementInput.addEventListener('input', (e) => { data.text = e.target.value })

    container.append(label, statementInput)

    const toggleRow = document.createElement('div')
    toggleRow.className = 'TrueFalseRow'
    const groupName = `truefalse-${crypto.randomUUID()}`

    const trueLabel = document.createElement('label')
    trueLabel.className = 'TrueFalseOption'
    const trueRadio = document.createElement('input')
    trueRadio.type = 'radio'
    trueRadio.className = 'AnswerRadio'   // ← přidat
    trueRadio.name = groupName
    trueRadio.checked = data.correct === true
    trueRadio.addEventListener('change', () => { data.correct = true })
    trueLabel.append(trueRadio, document.createTextNode(' Pravda'))

    const falseLabel = document.createElement('label')
    falseLabel.className = 'TrueFalseOption'
    const falseRadio = document.createElement('input')
    falseRadio.type = 'radio'
    falseRadio.className = 'AnswerRadio'   // ← přidat
    falseRadio.name = groupName
    falseRadio.checked = data.correct === false
    falseRadio.addEventListener('change', () => { data.correct = false })
    falseLabel.append(falseRadio, document.createTextNode(' Nepravda'))

    toggleRow.append(trueLabel, falseLabel)
    container.appendChild(toggleRow)
}
