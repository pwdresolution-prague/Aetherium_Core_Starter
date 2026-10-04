// SeedTrainingData.js
// LOGIKA: Spouštěj ručně (`npm run seed`) až když budeš chtít nahrát trénovací data.
//         Env se načte automaticky přes DocumentSaver → SupabaseConnectAssistent → LoadEnv.js.
import { sestavitPolozkyProEmbedding } from './TrainingDataNormalizer.js'
import { saveDocument } from './DocumentSaver.js'

async function main() {
    const polozky = sestavitPolozkyProEmbedding()
    console.log(`SeedTrainingData: k uložení ${polozky.length} položek...`)

    let uspesne = 0
    for (const polozka of polozky) {
        try {
            await saveDocument({
                text: polozka.content,
                domain: polozka.domain,
                refId: polozka.refId,
                nadpis: polozka.nadpis,
                odpoved: polozka.odpoved,
            })
            uspesne++
        } catch (chyba) {
            console.error(`SeedTrainingData: nepodařilo se uložit položku ${polozka.refId} (${polozka.nadpis}):`, chyba.message)
        }
    }

    console.log(`SeedTrainingData: hotovo, uloženo ${uspesne}/${polozky.length}.`)
}

main()
