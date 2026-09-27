import { sanitizeHTML } from '../../../utils/security.client.js'
import { zeptatSeAsistenta } from './ChatBotApi.js'

//TODO: Link na Elementy
const chatbotModal = document.getElementById("ChatBotModal")
const chatbotOpen = document.getElementById("ChatBotOpen")
const chatbotClose = document.querySelector(".chatbot-close")
const chatHistory = document.getElementById("chathistory")
const userInput = document.getElementById("userInput")
const sendButton = document.getElementById("SendMessage")
const chatBotThinking = document.getElementById("chatBotThinkingId")

//TODO: ZOBRAZENÍ===========================================================================

//FRONTEND: Zobrazení modalu Chatbota

//TODO: Otevření modalu
chatbotOpen.addEventListener("click", function () {
    chatbotModal.style.display = "block"
})
//TODO: Zavření přes křížek
chatbotClose.addEventListener("click", function () {
    chatbotModal.style.display = "none"
})
//TODO: Zavření klikem mimo okno
window.onclick = function (event) {
    if (event.target == chatbotModal) {
        chatbotModal.style.display = "none"
    }
}

//TODO: FUNKCE============================================================
// OPRAVA: Původně tu bylo `fuse.search(...)`, ale proměnná `fuse` (Fuse.js) nikde
//         v souboru neexistovala – volání by vždy spadlo. Fuse.js se navíc už nepoužívá:
//         dotaz jde přes ChatBotApi.js na sdílený AI backend (TensorFlow embedding +
//         Supabase), se stejnou datovou základnou jako hledání v Dokumentaci.
//         Offline/výpadkový fallback řeší ChatBotApi.js sám (bez externí knihovny).

sendButton.addEventListener("click", async function () {
    const rawMessage = userInput.value.trim()
    if (rawMessage === "") return

    const safeMessage = sanitizeHTML(rawMessage)

    //TODO: Přidání uživatelského dotazu do historie
    const userMsg = document.createElement("p")
    userMsg.textContent = "Ty: " + safeMessage
    chatHistory.appendChild(userMsg)

    //TODO: Mazání textového pole
    userInput.value = ""
    chatBotThinking.hidden = false

    const { odpoved } = await zeptatSeAsistenta(safeMessage)

    //TODO: Odpověď Chatbota
    const botMsg = document.createElement("p")
    botMsg.textContent = "ChatBot: " + odpoved
    chatHistory.appendChild(botMsg)

    chatBotThinking.hidden = true

    //TODO: Scroll dolů
    chatHistory.scrollTop = chatHistory.scrollHeight
})
