// BackendServer.js
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
