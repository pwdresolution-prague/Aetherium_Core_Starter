function mustGet(id) {
    const node = document.getElementById(id)
    if (!node) throw new Error(`Chybí prvek #${id} v PaymentIndex.html`)
    return node
}
