# 01 — Project Overview

**AETHERIUM CORE — STARTER**
**Verze:** 1.0.0 Starter | **Status:** Ve vývoji | **UI/UX:** Aetherium Blue Shade 2024–2026
**Organizace:** PWD Resolution (Posh web developer) · Praha
**Produktové jméno v kódu:** Safety Partners LMS / Aetherium Core

---

## 1. Vize a účel

**Aetherium Core** je B2B SaaS e-learningová platforma (LMS) pro komerční, legislativní a profesní vzdělávání.

Cílové segmenty (Starter plán):

- specializovaná školící centra
- lokální autoškoly a odborné kurzy
- firmy vyžadující periodická školení a certifikace
- poskytovatelé legislativních / BOZP kurzů

Platforma není vázána na jeden typ školení — obsah je konfigurovatelný (kurzy, testy, certifikáty, legislativa).

Licenční model je stupňovaný; aktuální větev je **Starter** s důrazem na škálování malých a středních projektů.

---

## 2. Topologie rolí (RBAC multi-tenant)

Čtyři bazální zóny přístupu:

| Role | Popis (stručně) |
|------|-----------------|
| **ADMIN** | Plná kontrola systému, CMS, telemetrie, uživatelé, legislativa |
| **SUBSCRIBER** | Poskytovatel služeb / partner — registrace, objednávky, import studentů |
| **CLIENT** | Firma / objednatel školení — správa svých studentů v rámci tenantu |
| **STUDENT** | Koncový uživatel — kurzy, testy, certifikáty, chatbot |

Detail práv: [03_User_Roles.md](./03_User_Roles.md)

Vstupní portály v kódu:

- `StudentLogin/` — Manager 1, Manager 2, Student
- `AdminLogin/` — Developer Control, Admin Control, Client Control

---

## 3. Technologický stack

### Frontend (SafetyPartnersRoots)

| Technologie | Účel |
|-------------|------|
| HTML5 / CSS3 / Vanilla JS | Základ UI bez heavy frameworku |
| **Vite** | Build a dev server |
| Lucide | Ikony |
| GSAP | Animace |
| Lenis | Smooth scroll |
| Chart.js | Telemetrie a reporty |
| Babylon.js | 3D / imerzivní prvky (připraveno) |
| TipTap | Headless WYSIWYG pro CMS editor |
| Quill | Doplňkový textový editor |
| Fuse.js | Fuzzy search chatbot (FAQ) |
| TensorFlow.js + Universal Sentence Encoder | Sémantika / budoucí AI |
| Danfo.js, Numeric, mathjs | Datové a matematické operace |
| DOMPurify | Sanitizace HTML |
| Zod | Validace schémat |
| PapaParse + SheetJS (xlsx) | CSV / Excel import |
| @zxcvbn-ts | Síla hesel |
| libphonenumber-js | Normalizace telefonů |
| axios | HTTP klient |
| LangChain (+ OpenAI adapter) | Orchestrace LLM (připraveno) |

### Backend / infrastruktura

| Technologie | Účel |
|-------------|------|
| **Supabase** | Auth, PostgreSQL, RLS, Storage, Realtime |
| Supabase Edge Functions (Deno/TS) | Serverová logika (např. hromadné založení studentů) |
| Twilio (přes Supabase Auth) | SMS OTP / MFA |
| ARES API (ares.gov.cz) | Automatické doplnění firemních údajů z IČO |

### Ostatní

- `PWD_LMS_Kernel/` — plánované jádro (AI, pravidla, audit) — většina souborů zatím prázdná
- Mobilní app: návrh ve složce `Aetherium_MobileApp/` (Android / iOS plán)

---

## 4. Hlavní funkční oblasti (shrnutí)

1. **Registrace subjektu** — formulář Enterprise + ARES + MFA OTP + uložení do profiles
2. **Subscriber flow** — shrnutí objednávky, import studentů (CSV/XLSX + ML mapování), platby
3. **Admin CMS** — editor kurzů (stránky: text, otázky, media), dashboard, telemetrie
4. **Student prostředí** — kurzy, testy, dokumentace, certifikáty, profil, chatbot
5. **Legislativa a certifikáty** — expirace, notifikace, Storage bucket Certificates
6. **AI asistent** — Fuse.js FAQ; plán rozšíření na model + Supabase data

Kompletní mapa funkcí: [14_Features_Overview.md](./14_Features_Overview.md)

---

## 5. Desktop-first

Systém je primárně desktopový. Tablet/smartphone mají omezené zobrazení; mobilní přístup je plánován přes nativní/hybridní aplikaci.

---

## 6. Související dokumenty

- [02_System_Architecture.md](./02_System_Architecture.md)
- [08_Database_Architecture.md](./08_Database_Architecture.md)
- [09_API_Integrations.md](./09_API_Integrations.md)
