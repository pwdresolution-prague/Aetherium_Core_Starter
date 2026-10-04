# 11 — Frontend Logic (Student & společné)

**Stav:** Mapa Student frontendu a sdílených vzorů (2026-09-29)

---

## 1. Student aplikace

**Kořen:** `SafetyPartnersRoots/SafetyPartnersFrontendStudent/`

### HTML stránky

| Soubor | Sekce |
|--------|-------|
| `Html/Index.html` | Dashboard studenta |
| `Html/Kurzy.html` | Kurzy |
| `Html/Testy.html` | Testy |
| `Html/Dokumentace.html` | Dokumentace / materiály |
| `Html/Certifikaty.html` | Certifikáty |
| `Html/Reporty.html` | Reporty |
| `Html/MujProfil.html` | Profil (největší student HTML) |
| `Html/Uzivatele.html` | Uživatelé |
| `Html/Nastaveni.html` | Nastavení |
| `Html/Podpora.html` | Podpora |

### JS logika (výběr)

| Cesta | Účel |
|-------|------|
| `JS/Student_Dashboard_Logika/eventLogic.js` | Eventy dashboardu |
| `JS/Student_Dashboard_Logika/EventsSupabaseConnector.js` | Supabase connector |
| `JS/DokumentaceLogika/DokuemntaceLogika.js` | Dokumentace sekce |
| `JS/DokumentaceLogika/DokuemntaceData.js` | Data dokumentace |
| `JS/Modal_Assistent_AI/ChatBotFuseTrainData.js` | FAQ data chatbota |
| `JS/Modal_Assistent_AI/BackendLogikaAI/*` | Normalizer, embedding, Supabase |

---

## 2. Login portály

### StudentLogin

- `HTML/LoginIndex.html`  
- CSS / JS pro přihlášení a registraci  
- Úrovně: Manager 1, Manager 2, Student  

### AdminLogin

- Oddělený vstup pro Developer / Admin / Client Control  

---

## 3. Enterprise & Subscriber (registrace a objednávka)

### AetheriumCoreEnterprise

| Modul | Soubor |
|-------|--------|
| ARES | `Connect/AresLookup.js` |
| Supabase | `Connect/SupabaseConnect.js` |
| MFA OTP | `JS/Mfa_Otp.js` |
| Validace | `JS/ValidateForm.js` |
| Sanitizace | `JS/SanitizeForm.js` |
| UI script | `JS/ScriptAetherium.js` |
| Modal | `JS/ModalWindow.js` |
| Smooth scroll | `JS/SmoothScrollForm.js` |
| Návštěvy | `JS/Visit.js` |
| HTML | `HTML/IndexAetherium.html`, `Summary.html` |
| Platby | `AetheriumPaymentMethod/`, `BackEnd/FormToPay.js` |

### SubscriberAetheriumFrontEnd

Obdobná struktura + navíc:

- `JS/SummaryLogic/StudentImport.js` — import CSV/XLSX  
- `JS/SummaryLogic/ColumnModel.js`, `ColumnFeatures.js`  
- `JS/ProviderAetherium.js`  
- `Subscriber_Payment_Method/`  

---

## 4. Sdílené frontend vzory

- **Vite** — `type: module`, `import.meta.env.VITE_*`  
- **Connect/** — jediná zóna pro vnější API  
- **Callback místo těsné vazby** — např. OTP modul nezná submit tlačítko, jen volá `onChange`  
- **UI stavy** — CSS třídy `ares-loading|success|error`, `otp-status--*`  
- **GSAP / Lenis** — animace a smooth scroll ve formulářích  

---

## 5. Chatbot UX

- Modal asistent ve Student UI  
- Odpovědi z Fuse.js nad `questionsAndAnswers`  
- Kategorie FAQ: kurzy, testy, certifikáty, účet, podpora, technické  

---

## 6. TODO frontend

- Dokončit napojení Student „Moje kurzy“ na published kurzy z CMS  
- Responzivita vs. desktop-first (README: mobil primárně app)  
- Sjednocení duplicitních ValidateForm / Mfa_Otp mezi Enterprise a Subscriber  

---

*Související: [13-FrontendAdminLogic.md](./13-FrontendAdminLogic.md), [06_AI_Systems.md](./06_AI_Systems.md)*
