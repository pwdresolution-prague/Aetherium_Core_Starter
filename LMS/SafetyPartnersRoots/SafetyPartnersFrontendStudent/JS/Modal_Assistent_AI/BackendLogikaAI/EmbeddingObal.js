// EmbeddingObal.js
// LOGIKA: Tenký obal nad TensorFlow USE modelem. BĚŽÍ POUZE NA BACKENDU (Node),
//         protože @tensorflow/tfjs-node potřebuje nativní binárku – nikdy ho
//         needituj do prohlížeče (ChatBotManager.js apod.).
// OPRAVA: Původně byly getEmbedding/getEmbeddings deklarované UVNITŘ loadModel(),
//         takže byly nedosažitelné a export vracel undefined. Teď jsou na úrovni
//         modulu a model se cachuje v proměnné `model` (lazy-load, jen jednou).

import '@tensorflow/tfjs-node' // COMMENT: Registruje Node backend pro tfjs, musí se importovat dřív než model
import * as use from '@tensorflow-models/universal-sentence-encoder'

let model = null // COMMENT: Cache – model se stáhne/nahraje jen při prvním volání

async function loadModel() {
    if (!model) {
        model = await use.load()
        console.log('USE / Model pro embeddingy načten')
    }
    return model
}

// LOGIKA: Jeden text -> jeden vektor (512 čísel)
export async function getEmbedding(text) {
    const nactenyModel = await loadModel()
    const embedding = await nactenyModel.embed([text])
    const pole = await embedding.array()
    return pole[0]
}

// LOGIKA: Víc textů najednou (dávkově) -> pole vektorů, stejné pořadí jako na vstupu.
//         Používá se v SeedTrainingData.js, aby se neposílal request po jednom.
export async function getEmbeddings(texty) {
    const nactenyModel = await loadModel()
    const embedding = await nactenyModel.embed(texty)
    const pole = await embedding.array()
    return pole
}
