import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { join, dirname } from 'node:path'

config({ path: join(dirname(fileURLToPath(import.meta.url)), '..', '.env') })
