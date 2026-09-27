// BackendServer.js
// LOGIKA: Malý Express server jen pro AI vrstvu (embedding + Supabase hledání).
//         Port 3001 sedí na proxy nastavenou v JS/FrontendConfig.js ('/api' -> localhost:3001),
//         takže z Vite dev serveru fetch('/api/...') doletí sem beze změny na frontendu.
//
// Spuštění:  node JS/Modal_Assistent_AI/BackendLogikaAI/BackendServer.js
// Potřebné env proměnné: AI_SUPABASE_URL, AI_SUPABASE_SERVICE_ROLE_KEY (viz README_AI_Propojeni.md)
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'
// COMMENT: .env u tebe leží v JS/Modal_Assistent_AI/.env (o úroveň výš než tento soubor) -
//          proto cesta natvrdo, ať to funguje bez ohledu na to, odkud `node ...` spouštíš.
config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })

import express from 'express'
import cors from 'cors'
import asistentApi from './AsistentApi.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use(asistentApi)

const PORT = process.env.AI_BACKEND_PORT ?? 3001
app.listen(PORT, () => {
    console.log(`Aetherium AI backend běží na http://localhost:${PORT}`)
})
