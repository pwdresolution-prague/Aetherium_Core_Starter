import { sanitizeHTML } from '../../../utils/security.client'

// TODO: Link na Elementy
const chatHistory = document.getElementById("chathistory")
const userInput = document.getElementById("userInput")
const sendButton = document.getElementById("SendMessage")
const chatBotThinking = document.getElementById("chatBotThinkingId")

// FUNKCE PRO KOMUNIKACI S AI BACKENDEM
async function askAiBot(message) {
    try {
        // Volání tvého Fastify/Express API
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: message })
        });

        const data = await response.json();
        return data.answer;
    } catch (error) {
        console.error('Chyba při komunikaci s AI:', error);
        return 'Omlouvám se, ale nepodařilo se mi spojit s mozkem systému.';
    }
}

// TODO: EVENT LISTENER
sendButton.addEventListener("click", async function() {
    const rawMessage = userInput.value.trim()
    if(rawMessage === "") return

    const safeMessage = sanitizeHTML(rawMessage)

    // Přidání uživatelského dotazu
    const userMsg = document.createElement("p")
    userMsg.textContent = "Ty: " + safeMessage
    chatHistory.appendChild(userMsg)

    userInput.value = ""
    chatBotThinking.hidden = false // Zobrazení indikátoru přemýšlení

    // Získání odpovědi z vektorové databáze přes backend
    const botReply = await askAiBot(safeMessage);

    // Odpověď Chatbota
    const botMsg = document.createElement("p")
    botMsg.textContent = "ChatBot: " + botReply
    chatHistory.appendChild(botMsg)

    chatBotThinking.hidden = true
    chatHistory.scrollTop = chatHistory.scrollHeight
})
