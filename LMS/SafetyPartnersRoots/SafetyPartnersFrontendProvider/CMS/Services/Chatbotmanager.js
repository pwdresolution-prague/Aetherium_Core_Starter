
import { sanitizeHTML } from '../../../utils/security.client.js'
import { zeptatSeAsistenta } from
  '../../../SafetyPartnersFrontendStudent/JS/Modal_Assistent_AI/ChatBotApi.js'

const { odpoved } = await zeptatSeAsistenta(safeMessage, { audience: 'admin' })
// ... zbytek beze změny

//TODO: Link na Elementy
const chatbotModal = document.getElementById("ChatBotModal")
const chatbotOpen = document.getElementById("ChatBotOpen")
const chatbotClose = document.querySelector(".chatbot-close")
const chatHistory = document.getElementById("chathistory")
const userInput = document.getElementById("userInput")
const sendButton = document.getElementById("SendMessage")
let chatbotData = {}




//TODO: Inicializace Fuse.js
const options = {
    keys: ['question'],
    threshold: 0.4
}

const fuse = new Fuse(questionsAndAnswers, options)
console.log('Fuse je inicializován s trénovacími daty')



//TODO: Funkce pro normalizaci Textu
function normalizeText(text) {
    return text
        .toLowerCase() //Všechna písmena malá
        .trim()     //Odstraní mezery na začátku a na konci
        .replace(/[.,!?¿¡]/g, "")  //Odtsraní tečky a čárky, vykřičníky a otazníky


}



//TODO: ZOBRAZENÍ===========================================================================

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

//Fuzy vyhledávání pomocí fuse.js

let botReply = 'Stále se ještě učím'

const result = fuse.search(safeMessage)

if(result.length > 0){
    const bestMatch = result[0].item
    botReply = bestMatch.answer

}else{
    console.log('Omlouvám se, ale nenašel jsem shodu s trénovacími daty')
}


//TODO: Odpověď Chatbota
const botMsg = document.createElement("p")
botMsg.textContent = "ChatBot: " + botReply
chatHistory.appendChild(botMsg)

//TODO: Scroll dolů
chatHistory.scrollTop = chatHistory.scrollHeight

//TODO: Mazání textového pole
userInput.value = ""


})











