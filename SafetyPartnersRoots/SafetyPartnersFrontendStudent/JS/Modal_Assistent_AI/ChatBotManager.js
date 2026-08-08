import { sanitizeHTML } from '../../../utils/security.client'


//TODO: Link na Elementy 
const chatbotModal = document.getElementById("ChatBotModal")
const chatbotOpen = document.getElementById("ChatBotOpen")
const chatbotClose = document.querySelector(".chatbot-close")
const chatHistory = document.getElementById("chathistory")
const userInput = document.getElementById("userInput")
const sendButton = document.getElementById("SendMessage")
const chatBotThinking = document.getElementById("chatBotThinkingId")

let chatbotData = {}

//Funkce pro komunikaci s AI BACKENDEM:
// 






//TODO: ZOBRAZENÍ===========================================================================

//FRONTEND: Zobrazení modalu Chatbota

//TODO: Otevření modalu
chatbotOpen.addEventListener("click" ,function(){
    chatbotModal.style.display = "block"
})
//TODO: Zavření přes křížek
chatbotClose.addEventListener("click", function(){
    chatbotModal.style.display = "none"
})
//TODO: Zavření klikem mimo okno
window.onclick = function(event){
    if(event.target == chatbotModal){
        chatbotModal.style.display = "none"
    }
}
//TODO: FUNKCE============================================================

sendButton.addEventListener("click", function(){
    const rawMessage = userInput.value.trim()
    if(rawMessage === "") return


const safeMessage = sanitizeHTML(rawMessage)


//TODO: Přidání uživatelského dotazu do historie 
const userMsg = document.createElement("p")
userMsg.textContent = "Ty: " + safeMessage
chatHistory.appendChild(userMsg)

//TODO: Mazání textového pole
// 
userInput.value = ""

chatBotThinking.hidden = false


setTimeout(() => {
    

//Fuzy vyhledávání pomocí fuse.js

let botReply = 'Stále se ještě učím'

const result = fuse.search(safeMessage)

if(result.length > 0){
    const bestMatch = result[0].item
    botReply = bestMatch.answer

}else {
    console.log('Omlouvám se, ale nenašel jsem shodu s trénovacími daty')
}


//TODO: Odpověď Chatbota
const botMsg = document.createElement("p")
botMsg.textContent = "ChatBot: " + botReply
chatHistory.appendChild(botMsg)

chatBotThinking.hidden = true

//TODO: Scroll dolů
chatHistory.scrollTop = chatHistory.scrollHeight




}, 3000) //FRONTEND: Zpoždění 3 sekundy pro simulaci "přemýšlení" Chatbota
})

