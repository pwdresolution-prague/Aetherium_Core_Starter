# 09 — API Integrations

**Stav:** Dočasný katalog integrací (2026-09-29)

---

## 1. ARES (veřejný rejstřík ČR)

| Položka | Hodnota |
|---------|---------|
| Base URL | `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty` |
| Metoda | GET `/{ico}` |
| Auth | Veřejné API (v kódu bez klíče; případný klíč by byl `VITE_ARES_API_KEY`) |
| Klient | `AresLookup.js` / `AresLookUpProvider.js` |
| Chyby | INVALID_ICO, NOT_FOUND (404), NETWORK_ERROR, API_ERROR |

Výstup normalizovaný pro formulář: ico, dic, nazevFirmy, pravniForma, sidloSpolecnosti, datumZalozeni, stavSubjektu, spisovaZnacka, datovaSchranka.

---

## 2. Supabase

### Client SDK

```js
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, anonKey)
```

Používané metody (z frontend dokumentace a kódu):

- `auth.signInWithPassword`  
- `auth.signUp`  
- `auth.signOut`  
- `auth.resetPasswordForEmail`  
- `auth.signInWithOtp` / `auth.verifyOtp`  
- `auth.refreshSession`  
- `from('profiles'|'orders'|'students').select/insert/...`  
- `auth.admin.createUser` (pouze Edge + service_role)

### Edge Function

- Runtime: Deno  
- Vstup: HTTP + CORS  
- Env: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`  
- Soubory: `supabase/Index.ts`, `supabase/Cors.ts`, `supabase/config.toml`

---

## 3. Twilio (SMS)

- Napojeno **přes Supabase Auth** phone provider  
- Frontend nevolá Twilio přímo  
- Konfigurace v Supabase Dashboard (ne v tomto repu)

---

## 4. Interní „API“ vzory frontendu

| Vzor | Popis |
|------|-------|
| Connect vrstva | `Connect/SupabaseConnect.js`, `Connect/AresLookup.js` |
| Store | `AetheriumClientStore.js` — session/local persistence importu |
| Event callback | `onOtpVerifiedChange` — oddělení MFA od submit logiky |

---

## 5. Budoucí / připravené

| Integrace | Stav |
|-----------|------|
| LangChain / OpenAI | dependency, zatím neprodukční flow |
| TensorFlow.js USE | dependency + column classifier model |
| Platební brána | UI soubory (`Payment*`, `FormToPay*`) — detail poskytovatele TODO |
| E-mail (generované credentials Client) | zmíněno v README, implementace TODO |

---

## 6. Bezpečnostní poznámky k integracím

- Anon klíč jen ve frontendu  
- Service role jen na serveru (Edge)  
- ARES odpovědi neošetřovat jako důvěryhodný vstup pro HTML bez sanitizace  
- CORS hlavičky v Edge (`corsHeaders`)  

---

*Související: [05_Automation_Workflows.md](./05_Automation_Workflows.md), [07_Security.md](./07_Security.md)*
