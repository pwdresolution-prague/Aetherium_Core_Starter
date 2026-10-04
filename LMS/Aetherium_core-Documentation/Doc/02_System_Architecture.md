# 02 — System Architecture

**Stav:** Dočasná technická mapa (2026-09-29)  
**Repo:** `pwdresolution-prague/Aetherium_Core_Starter`

---

## 1. Vrstvy systému

```
┌─────────────────────────────────────────────────────────────┐
│  PREZENTAČNÍ VRSTVA (Frontend)                              │
│  AdminLogin | StudentLogin | Enterprise | Subscriber |      │
│  Provider CMS | Student App                                 │
│  HTML + CSS + Vanilla JS · Vite                              │
└──────────────────────────┬──────────────────────────────────┘
                           │ @supabase/supabase-js
                           │ fetch (ARES)
┌──────────────────────────▼──────────────────────────────────┐
│  INTEGRAČNÍ VRSTVA                                          │
│  Connect/ (AresLookup, SupabaseConnect)                     │
│  Edge Functions (Deno) — supabase/Index.ts                  │
│  Twilio (SMS OTP přes Supabase Auth)                        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  DATA + AUTH (Supabase)                                     │
│  PostgreSQL + RLS · Auth (OTP, session) · Storage           │
│  Tabulky: profiles, students, orders, courses, …            │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Složková mapa (zdroj kódu)

### SafetyPartnersRoots/ — hlavní aplikace

| Cesta | Účel |
|-------|------|
| `AdminLogin/` | Vstup Admin / Developer / Client |
| `StudentLogin/` | Vstup Student / Manager úrovně |
| `AetheriumCoreEnterprise/` | Registrace firmy: formulář, ARES, MFA, platby |
| `SubscriberAetheriumFrontEnd/` | Subscriber portál: formulář, import studentů, platba |
| `SafetyPartnersFrontendProvider/` | Admin CMS + Dashboard + telemetrie |
| `SafetyPartnersFrontendStudent/` | Student UI (kurzy, testy, chatbot, certifikáty…) |
| `utils/` | Vite config helper, security.client.js |
| `public/models/` | TensorFlow model (column-classifier) |

### Ostatní kořenové složky

| Cesta | Účel |
|-------|------|
| `supabase/` | `Index.ts` (Edge Function), `Cors.ts`, `config.toml` |
| `PWD_LMS_Kernel/` | Plánované jádro (Supabase.js naplněn; Ai/*, Jádro, Pravidla prázdné) |
| `Aetherium_core-Documentation/` | Tato dokumentace |
| `Návrhy_databáze/` | Excel návrhy (Levels, profiles, tokeny) |
| `Aetherium_MobileApp/` | Návrh mobilní aplikace |

---

## 3. Klíčové moduly a jejich umístění

### ARES Lookup

- `AetheriumCoreEnterprise/Connect/AresLookup.js`
- `SubscriberAetheriumFrontEnd/Connect/AresLookUpProvider.js`
- API: `https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}`
- Validace IČO (kontrolní součet), parse odpovědi, fill formuláře, UI stavy (loading/success/error)

### MFA / OTP

- `AetheriumCoreEnterprise/JS/Mfa_Otp.js` (obdobně Subscriber)
- `supabase.auth.signInWithOtp({ phone })` → `verifyOtp({ phone, token, type: 'sms' })`
- Callback `onOtpVerifiedChange` odemyká submit ve vyšším modulu

### Supabase klient

- `*/Connect/SupabaseConnect.js` — `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)`
- Env prefix `VITE_` kvůli Vite client bundle

### CMS Editor kurzů

- `SafetyPartnersFrontendProvider/CMS/Components/CMS_Dashboard/InputEditor.js`
- TipTap toolbar: `EditorToolbar.js`
- Typy stránek: `PageTypesLogic/PageTypes.js` + renderery (Single/Multi/TrueFalse/Open/Media)

### Import studentů

- `SubscriberAetheriumFrontEnd/JS/SummaryLogic/StudentImport.js`
- CSV (PapaParse) / XLSX (SheetJS)
- Mapování sloupců: aliasy + TensorFlow klasifikátor + ruční UI
- Edge Function: hromadné `auth.admin.createUser` + insert `students` po `orders.status = paid`

### Chatbot

- `SafetyPartnersFrontendStudent/JS/Modal_Assistent_AI/ChatBotFuseTrainData.js`
- Fuse.js nad FAQ polem `questionsAndAnswers`
- Plán: rozšíření o Supabase data a menší model

### Telemetrie (Admin)

- `Admin_Dashboard_Logika/TelemetryLogic.js` — Chart.js (návštěvnost, kurzy, obsah, behaviorální skóre)

---

## 4. Tok registrace subjektu (Enterprise)

1. Uživatel vyplní IČO → blur/Enter → ARES fetch → auto-fill polí  
2. Telefon → odeslání OTP (Supabase/Twilio) → ověření 6 číslic  
3. Validace formuláře (`ValidateForm.js`, `SanitizeForm.js`)  
4. Po úspěchu MFA: insert do `profiles` (RLS dle `auth.uid()`)  
5. Volitelně výběr kurzů / objednávka → platba → Edge založení studentů  

Detail workflow: [05_Automation_Workflows.md](./05_Automation_Workflows.md)

---

## 5. Edge Function — create-students-from-order

Soubor: `supabase/Index.ts`

1. OPTIONS → CORS  
2. Authorization header → caller client (anon + JWT)  
3. Načtení `orders` s RLS (`orders_select_own`) — musí být `status = paid`  
4. Kontrola `students.length <= order.student_count`  
5. Service role client → `auth.admin.createUser` + insert do `students`  
6. Výsledek po řádcích (ok / error), jedna chyba neshodí celý import  

---

## 6. Architektonické principy (z kódu a doc)

- **Zapouzdření** — ARES modul lze vypnout bez pádu aplikace  
- **Data z ARES dočasná** v prohlížeči do úspěšného MFA + insert  
- **RLS first** — zápisy vázané na `auth.uid()` / ownership objednávky  
- **Vite modularita** — Connect/ = vnější svět, utils/ = čisté funkce  
- **Page type registry** — nový typ stránky = renderer + záznam v `PAGE_TYPES`  

---

## 7. Související

- [08_Database_Architecture.md](./08_Database_Architecture.md)  
- [09_API_Integrations.md](./09_API_Integrations.md)  
- [07_Security.md](./07_Security.md)  
