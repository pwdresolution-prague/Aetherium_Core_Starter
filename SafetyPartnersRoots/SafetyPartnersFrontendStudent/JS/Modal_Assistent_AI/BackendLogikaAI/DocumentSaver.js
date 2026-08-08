const { supabase  } = require('./SupabaseConnectAssistent.js')
const { getEmbedding } = require('./EmbeddingObal.js')



//COMMENT: ukládání pouze getEmbedding místo dalšího + getEmbeddings
//  getEmbeddings (množné číslo) potřebuji jen tehdy, kdybych chtěl dávkově (batch)
//  zpracovat víc textů najednou — třeba pole dokumentů [text1, text2, text3] a 
// dostat zpátky pole vektorů. To je jiná funkce s jinou signaturou (bere array, ne string), 
// a pokud jsem ji nikde nevolal, vypisuji pouze singulární hodnotu
// 
//  
// 
async function saveDocument(text) {
    const embedding = await getEmbedding(text)
        
        const { data, error } = await supabase
        .from ('documents')
        .insert({ content: text, embedding})
        .select()

        if(error) throw error 
        return data[0]

        
}
module.exports = { saveDocument }

