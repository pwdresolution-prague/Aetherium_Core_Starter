//=========================================================================================================
//FRONTEND: Subscriber_Payment_Method
//============================================================================================================

//Sekce Payment - Samostatná část LMS

// Poslední článek řetězce Formulář → Shrnutí → Import → Platba. V tomhle
// bodě se z "podržených" surových dat (registrace + platní studenti z
// importu) poprvé počítá  objektivní hodnoty — konkrétní částka k úhradě.

import { getRegistration, getImport, setPendingOrder } from '../JS/Aetheriumclientstore .js'
import  { calculateOrder, formatMoney } from '../JS/PricingRules.js'

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
function renderCompanySummary(company) {
    const box = document.getElementById('paymentSummaryId')
    box.innerHTML = `
    <h3 class="PaymentSectionTitle">Odběratel</h3>
    <table class="PaymentTable">
        <tbody>
            <tr class="PaymentRow">
                <td class="PaymentLabel">Firma</td>
                <td class="PaymentValue">${company['název-firmyId'] ?? '-'}</td>
            </tr>
                <tr class="PaymentRow">
                    <td class="PaymentLabel">IČO</td>
                    <td class="PaymentValue">${company['ičoId'] ?? '-'}</td>
                </tr>
                    <td class="PaymentLabel">DIČ</td>
                    <td class="PaymentValue">${company['dicId'] || '— (neplátce DPH)'}</td>}
            </tr>
                <tr class="PaymentRow">
                    <td class="PaymentLabel">E-mail</td>
                    <td class="PaymentValue">${company['emailId'] ?? '-'}</td>
                </tr>
            <tbody>
        </table>



    `
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



function bindPayButton(order, company) {
    document.getElementById('payButtonId')?.addEventListener('click', () => {
        //TODO: Tady vzniká objednávka v AetheriumClientStore
        //COMMENT: SKutečné vytvoření platby (GoPay/COmgate/Stripe) samostatný modul
        //Platby s idempotency_key.
        const pendingOrder = {
            ...order,
            company:  {
                ico: company['ičoId'] ?? null,
                dic: company['dicId'] ?? null,
                companyName:  company['název-firmyId'] ?? null,
                email: company['emailId'] ?? null,

            },
            createdAt: new Date().toISOString(),

        }
        setPendingOrder(pendingOrder)

        console.info('[Payment] Objednávka připravena k platbě', pendingOrder)
        //TODO: až vznikne platební brána  - window.location.href = '<gateway-redirect>'
        alert('Platební brána zatím není napojena. Objednávka je připravena ke kontrole')

    })
}



function init() {
    const company =  getRegistration()
    if (!company) {
        showBlockingError('Nebyla nalezena žádná registrace')
        return
    }

    //LOGIKA: K fakturaci se počítají jen Platné řádky (import.valid - chybné)
    // duplicitní studenty systém podržel a neplatí se za ně...
    const studentCount = getImport()?.valid?.length ?? 0
    if (studentCount === 0) {
        showBlockingError('Nebyl nalezený žádný platný import studentů')
        return

    }

    const order = calculateOrder(company, studentCount)

    renderCompanySummary(company)
    renderPricingBreakdown(order)
    bindPayButton(order, company)
}


init()
