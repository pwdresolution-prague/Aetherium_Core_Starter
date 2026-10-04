# Aetherium Core — Index dokumentace

**Verze dokumentace:** 1.0.0-temp (dočasná kompletní mapa systému)
**Datum generování:** 2026-09-29
**Zdroj:** analýza repozitáře `pwdresolution-prague/Aetherium_Core_Starter` + existující Doc/
**Status projektu:** Ve vývoji (MVP Starter)

---

## Jak číst tuto dokumentaci

Tato sada popisuje **aktuální stav kódu a architektury** Aetherium Core LMS (Safety Partners / PWD Resolution).
Je určena pro:

- orientaci ve vývoji
- napojení chatbota (znalost prostředí LMS)
- další návrh funkcí a priorit
- onboarding (Admin / Student / Subscriber)

Dokumentace je **dočasná a popisná** — neodráží finální produkční kontrakty, ale to, co systém reálně obsahuje nebo má rozpracované.

---

## Obsah

| Soubor | Téma |
|--------|------|
| [01_Project_Overview.md](./01_Project_Overview.md) | Vize, účel, stack, topologie |
| [02_System_Architecture.md](./02_System_Architecture.md) | Architektura vrstev, složky, tok dat |
| [03_User_Roles.md](./03_User_Roles.md) | Role, práva, vstupní body |
| [04_Business_Logic.md](./04_Business_Logic.md) | Obchodní logika, objednávky, lifecycle |
| [05_Automation_Workflows.md](./05_Automation_Workflows.md) | ARES + MFA/OTP + registrace + import |
| [06_AI_Systems.md](./06_AI_Systems.md) | Chatbot, Fuse.js, ML klasifikátor sloupců |
| [07_Security.md](./07_Security.md) | Auth, RLS, sanitizace, telemetrie/GDPR |
| [08_Database_Architecture.md](./08_Database_Architecture.md) | Tabulky, jsonb, Storage, Edge |
| [09_API_Integrations.md](./09_API_Integrations.md) | ARES, Supabase, Twilio, budoucí API |
| [10_Legislative_Module.md](./10_Legislative_Module.md) | Legislativa, certifikáty, expirace |
| [11_Frontend_Logic.md](./11_Frontend_Logic.md) | Student frontend, dashboard, stránky |
| [12-Course_Data_structure.md](./12-Course_Data_structure.md) | Struktura kurzu a stránek |
| [13-FrontendAdminLogic.md](./13-FrontendAdminLogic.md) | Admin/CMS, editor, telemetrie |
| [14_Features_Overview.md](./14_Features_Overview.md) | Kompletní přehled funkcí podle rolí |
| [reports/](./reports/) | Denní zápisky (historické) |

---

## Hlavní větve kódu (repo)

```
Aetherium_Core_Starter/
├── SafetyPartnersRoots/          ← hlavní frontend aplikace
│   ├── AdminLogin/
│   ├── StudentLogin/
│   ├── AetheriumCoreEnterprise/  ← registrace firmy (ARES, MFA, platby)
│   ├── SubscriberAetheriumFrontEnd/
│   ├── SafetyPartnersFrontendProvider/  ← Admin CMS
│   ├── SafetyPartnersFrontendStudent/
│   └── utils/
├── supabase/                     ← Edge Functions + config
├── PWD_LMS_Kernel/               ← jádro / AI (většina zatím prázdná)
├── Aetherium_core-Documentation/
├── Návrhy_databáze/              ← Excel návrhy schémat
└── Aetherium_MobileApp/          ← návrh mobilní app
```

---

## Rychlý přehled stavů

| Oblast | Stav |
|--------|------|
| Registrace + ARES | Implementováno (frontend) |
| MFA/OTP (telefon) | Implementováno (Supabase Auth) |
| CMS Editor kurzů | Rozpracováno (TipTap + page types) |
| Student UI stránky | UI + částečná logika |
| Chatbot Fuse.js | Funguje na trénovacích FAQ datech |
| Import studentů CSV/XLSX | Implementováno (+ ML mapování sloupců) |
| Edge: create-students-from-order | Implementováno |
| Telemetrie Admin dashboard | Grafy (Chart.js), data zatím mock/TODO |
| Kernel AI (Predikce, Dataset) | Složky existují, soubory prázdné |
| Certifikáty Storage bucket | Zmíněno v reportech (Certificates) |
| RLS politiky | Předpokládány v Edge Function, detail v DB |

---

*Dokumentace generována jako dočasný textový obraz systému pro další vývoj a výuku chatbota.*
