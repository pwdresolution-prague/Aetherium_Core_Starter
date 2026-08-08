const tensorFlowContainer = require('@tensorflow/tfjs-node')
const useRequire = require('@tensorflow-models/universal-sentence-encoder')




let model = null //COMMENT: Zde je příkladný vzor že v modelu načtení ještě není obsah...

async function loadModel(){
    if(!model) {
        model = await useRequire.load()
        console.log('USE / Uživatelský model načten')
    }
    return model //COMMENT: Vrací se model díky funkci return 

        // loadModel = Příjem reference o nových datech
    async function getEmbedding(text){ //COMMENT: Embedding = Vkládání 
        const modelConst = await loadModel() //COMMENT: Ukládá se díky await do async loadModel
        const embedding = await modelConst.embed([text])
        const array = await embedding.array() // 512 vektorových pozic k měření a provedení matematické operace
        return array[0]



    }

    async function getEmbeddings(textSecond) {
        const modelConstTwo = await loadModel() //COMMENT: Znovuuložení do funkce v module Scope
        const embeddingTwo = await modelConstTwo.embed([textSecond])
        const arrayTwo = await embeddingTwo.arrayTwo()
        return arrayTwo //COMMENT: Pole vektorů, jeden pro každý text


    }



}


//COMMENT: Standartní ESmodules Export pro import vzor :
//  
// import { getEmbedding, getEmbeddings } from './BackendLogikaAI/EmbeddingObal.js'
module.exports = { getEmbedding, getEmbeddings }






