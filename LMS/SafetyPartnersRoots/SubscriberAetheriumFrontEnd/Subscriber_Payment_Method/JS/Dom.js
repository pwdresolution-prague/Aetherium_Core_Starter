export function el(tag, className, text) {
    const n = document.createElement(tag)
    if (className) n.className = className
    if (text != null) n.textContent = text      // textContent se nikdy neinterpretuje jako HTML
    return n
}

// rows = [[popisek, hodnota], ...]
export function kvRows(tbody, rows, c = { row: 'PaymentRow', label: 'PaymentLabel', value: 'PaymentValue' }) {
    for (const [label, value] of rows) {
        const tr = el('tr', c.row)
        tr.append(el('td', c.label, label), el('td', c.value, value))
        tbody.append(tr)
    }
}
