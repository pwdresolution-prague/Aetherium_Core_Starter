//=========================================================================================================
//FRONTEND: Subscriber_Payment_Method
//============================================================================================================

//Sekce Payment - Samostatná část LMS

// Poslední článek řetězce Formulář → Shrnutí → Import → Platba. V tomhle
// bodě se z "podržených" surových dat (registrace + platní studenti z
// importu) poprvé počítá  objektivní hodnoty — konkrétní částka k úhradě.

import { buildCheckoutSnapshot } from '../../JS/Shared/CheckoutModel.js'
import { formatMoney } from '../../JS/Shared/PricingRules.js'
import { getImport, getOrderId, setPendingOrder } from '../../JS/Shared/AetheriumClientStore.js'
import { el, kvRows } from '../../JS/Shared/Dom.js'
import { registrationApi } from './RegistrationApi.js'

//LOGIKA: Veškeré chyby vždy vedou zpět ke shrnutí čili Summary.html

function showBlockingError(message) {
    const box = document.getElementById('paymentSummaryId')
    if (!box) return
    box.innerHTML = `
    <p class="PaymentError">
    ${message}<br>
    <a href="../Html/Summary.html" class="PaymentBackLink">- Zpět na shrnutí</a>
    </p>`
document.getElementById('pricingBreakdownId').replaceChildren()


}
function renderCompanySummary(c) {
    const box = document.getElementById('paymentSummaryId')
    const tbody = el('tbody')
    kvRows(tbody, [
        ['Firma',  c.companyName ?? '—'],
        ['IČO',    c.ico ?? '—'],
        ['DIČ',    c.dic || '— (neplátce DPH)'],
        ['Sídlo',  c.seat ?? '—'],
        ['E-mail', c.email ?? '—'],
        ['Telefon', c.phone ?? '—'],
    ])
    const table = el('table', 'PaymentTable')
    table.append(tbody)
    box.replaceChildren(el('h3', 'PaymentSectionTitle', 'Odběratel'), table)
}

function renderPricingBreakdown(order) {
    const box = document.getElementById('pricingBreakdownId')
    box.innerHTML = `
        <h3 class="PaymentSectionTitle">💳 Kalkulace platby</h3>
        <table class="PaymentTable">
            <tbody>
                <tr class="PaymentRow">
                    <td class="PaymentLabel">Počet studentů (import)</td>
                    <td class="PaymentValue">${order.studentCount}</td>
                </tr>
                <tr class="PaymentRow">
                    <td class="PaymentLabel">Cena za studenta</td>
                    <td class="PaymentValue">${formatMoney(order.pricePerStudent)}</td>
                </tr>
                <tr class="PaymentRow">
                    <td class="PaymentLabel">Mezisoučet</td>
                    <td class="PaymentValue">${formatMoney(order.subtotal)}</td>
                </tr>
                <tr class="PaymentRow">
                    <td class="PaymentLabel">DPH (${Math.round(order.vatRate * 100)} %)</td>
                    <td class="PaymentValue">${formatMoney(order.vatAmount)}</td>
                </tr>
                <tr class="PaymentRow PaymentTotalRow">
                    <td class="PaymentLabel">Celkem k úhradě</td>
                    <td class="PaymentValue PaymentTotal">${formatMoney(order.total)}</td>
                </tr>
            </tbody>
        </table>
        <button type="button" class="PaymentPayButton" id="payButtonId">Zaplatit ${formatMoney(order.total)} →</button>
        <p class="PaymentNote">Konečnou částku vždy ověří platební brána po napojení na server.</p>
    `
}



function bindPayButton(order) {
    const btn = document.getElementById('payButtonId')
    btn?.addEventListener('click', async () => {
        btn.disabled = true                         // ochrana proti dvojkliku
        try {
            const students = getImport()?.valid ?? []
            const res = await registrationApi.confirmOrder(getOrderId(), students)

            // Server je zdroj pravdy: pokud se liší od zobrazené částky, platbu nepouštíme
            if (res.total_minor !== order.total) {
                throw new Error('Částka se po přepočtu na serveru liší. Zkontrolujte shrnutí.')
            }
            setPendingOrder({ ...order, createdAt: new Date().toISOString() })
            window.location.assign(res.payment_url)
        } catch (e) {
            btn.disabled = false
            alert(e.message)   // později nahradit hláškou v UI
        }
    })
}



function init() {
    const snap = buildCheckoutSnapshot()
    if (!snap.ok) {
        showBlockingError(snap.reason === 'NO_REGISTRATION'
            ? 'Nebyla nalezena žádná registrace'
            : 'Nebyl nalezen žádný platný import studentů')
        return
    }
    renderCompanySummary(snap.company)
    renderPricingBreakdown(snap.order)
    bindPayButton(snap.order)       // bindPayButton z minula beze změny
}
init()
