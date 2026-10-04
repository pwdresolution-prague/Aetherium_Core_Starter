1. LlamaIndex (TypeScript / JavaScript)

Základní instalace:

npm install llamaindex

Nebo pokud chceš nejnovější verzi:

npm install @llamaindex/core

Poznámka: podle verze LlamaIndex se názvy balíčků mění. llamaindex je dnes nejjednodušší cesta pro Node.js.

2. Ollama
Ubuntu
curl -fsSL https://ollama.com/install.sh | sh

Potom ověření:

ollama --version

Spuštění služby:

ollama serve

Stažení modelu například:

ollama pull llama3.1:8b

nebo

ollama pull qwen3:8b

nebo

ollama pull mistral

Vyzkoušení:

ollama run llama3.1:8b
3. Node.js klient pro Ollamu

Pokud bude tvůj LMS komunikovat s Ollamou:

npm install ollama

Použití:

import ollama from 'ollama';

const response = await ollama.chat({
    model: 'llama3.1:8b',
    messages: [
        {
            role: 'user',
            content: 'Ahoj'
        }
    ]
});

console.log(response.message.content);