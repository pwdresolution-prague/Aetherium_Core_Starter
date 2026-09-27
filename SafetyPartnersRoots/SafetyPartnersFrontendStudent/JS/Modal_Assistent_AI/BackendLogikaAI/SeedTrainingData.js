// SeedTrainingData.js
// LOGIKA: Spouštěj ručně (`node BackendLogikaAI/SeedTrainingData.js`) pokaždé, když
//         přidáš/upravíš nějaký JSON soubor v JSON/ nebo JSON_Svářečská_škola/.
//         Skript vezme VŠECHNA data přes TrainingDataNormalizer.js, spočítá embeddingy
//         a uloží je (upsert) do Supabase. Díky `onConflict: domain,ref_id` v
//         DocumentSaver.js je bezpečné skript spouštět opakovaně – nevzniknou duplicity,
//         jen se přepíšou položky, které se změnily.
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

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
