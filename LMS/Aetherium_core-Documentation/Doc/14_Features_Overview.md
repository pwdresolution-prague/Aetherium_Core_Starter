# 14 — Features Overview (kompletní dočasný přehled)

**Účel:** Textový obraz funkcí LMS pro vývoj, dokumentaci a výuku chatbota.  
**Datum:** 2026-09-29 · **Zdroj:** kód + README + Doc

Legenda stavu: ✅ implementováno · 🚧 rozpracováno · 📋 plán / UI only

---

## A. Autentizace a registrace

| Funkce | Stav | Kde |
|--------|------|-----|
| Přihlášení e-mail/heslo | 🚧 | Supabase Auth, Login portály |
| Registrace Student / Manager úrovně | 🚧 | StudentLogin |
| Admin / Developer / Client login | 🚧 | AdminLogin |
| Registrace firmy (Enterprise formulář) | ✅ | AetheriumCoreEnterprise |
| ARES auto-fill z IČO | ✅ | AresLookup.js |
| Validace IČO (kontrolní součet) | ✅ | AresLookup.js |
| SMS OTP (odeslání + ověření 6 číslic) | ✅ | Mfa_Otp.js + Supabase |
| Reset hesla | 📋 | Supabase metoda připravena |
| 2FA (QR / authenticator) | 📋 | FAQ chatbot zmínka |
| Session refresh | 📋 | Supabase client |

---

## B. Role a multi-tenant

| Funkce | Stav |
|--------|------|
| Role Admin / Subscriber / Client / Student | ✅ koncept + metadata |
| RLS ownership objednávek | ✅ Edge Function |
| Vytvoření Client z Admin | 📋 README |
| Generování credentials mailem | 📋 README |

---

## C. Subscriber / objednávky / platby

| Funkce | Stav | Kde |
|--------|------|-----|
| Shrnutí objednávky | 🚧 | Summary.html + JS |
| Výběr rozsahu studentů / kurzů | 🚧 | formuláře Enterprise/Subscriber |
| Import studentů CSV/XLSX | ✅ | StudentImport.js |
| Mapování sloupců (alias + ML + ruční) | ✅ | ColumnModel + UI |
| Validace / duplicity e-mailů | ✅ | StudentImport.js |
| Platba objednávky | 🚧 | Payment* soubory |
| Edge: založení studentů po paid | ✅ | supabase/Index.ts |
| Limit student_count | ✅ | Edge validace |

---

## D. Admin CMS — kurzy a obsah

| Funkce | Stav | Kde |
|--------|------|-----|
| Editor názvu a typu kurzu | ✅ | InputEditor.js |
| Stránky: text (TipTap) | ✅ | content + EditorToolbar |
| Stránky: single/multi choice | ✅ | PAGE_TYPES + renderery |
| Stránky: true/false, open answer | ✅ | PAGE_TYPES |
| Stránky: media (url, caption) | ✅ | MediaRenderer |
| Outline, add/delete, navigace | ✅ | InputEditor.js |
| Uložit draft | 🚧 | payload ready, Supabase TODO |
| Publikovat + validace | 🚧 | validace ✅, persist TODO |
| Upload obrázků do editoru | 🚧 | reporty + FilesInput |
| CMS views (legislativa, certifikáty, …) | 🚧 | HTML views existují |

---

## E. Admin dashboard a telemetrie

| Funkce | Stav |
|--------|------|
| Dashboard layout | 🚧 |
| Grafy návštěvnosti (čas, role, zařízení) | ✅ struktura Chart.js |
| Grafy kurzů (top, completion, enrollments) | ✅ |
| Grafy obsahu (typ, storage, growth) | ✅ |
| Behaviorální skóre / flagged list | ✅ struktura |
| Live data ze Supabase | 📋 |
| Signál on/off DB/API/Auth | 🚧 reporty |

---

## F. Student prostředí

| Funkce | Stav | Sekce |
|--------|------|-------|
| Dashboard | 🚧 | Index.html |
| Seznam / detail kurzů | 🚧 | Kurzy.html |
| Testy (spuštění, pokusy) | 🚧 | Testy.html |
| Dokumentace / materiály | 🚧 | Dokumentace + JS logika |
| Certifikáty (seznam, stažení) | 🚧 | Certifikaty.html |
| Reporty / historie | 🚧 | Reporty.html |
| Můj profil | 🚧 | MujProfil.html |
| Nastavení, podpora | 🚧 | HTML pages |
| Chatbot FAQ (Fuse.js) | ✅ | ChatBotFuseTrainData + modal |

---

## G. Certifikáty a legislativa

| Funkce | Stav |
|--------|------|
| Storage bucket Certificates | 🚧 report |
| PDF certifikát po testu | 📋 FAQ + vize |
| Expirační notifikace (2m…1d) | 📋 README + Notifikace UI |
| Admin přehled expirací | 📋 |
| Legislativní dokumenty v CMS | 🚧 Legislativa.html |
| Ověření certifikátu podle ID | 📋 FAQ |

---

## H. AI a automatizace

| Funkce | Stav |
|--------|------|
| Fuse.js chatbot | ✅ |
| FAQ dataset (~75 Q&A) | ✅ |
| ML column classifier import | ✅ |
| TensorFlow USE / LangChain | 📋 dependencies |
| Kernel AI (Predikce, Dataset) | 📋 prázdné soubory |
| Embedding pipeline chatbota | 🚧 EmbeddingObal.js |

---

## I. Integrace

| Integrace | Stav |
|-----------|------|
| Supabase Auth + DB + Storage | ✅ základ |
| ARES API | ✅ |
| Twilio SMS (přes Supabase) | ✅ OTP flow |
| Edge Functions Deno | ✅ create-students |
| Platební brána | 🚧 UI |
| Mobilní app | 📋 návrh Aetherium_MobileApp |

---

## J. Bezpečnost a compliance

| Funkce | Stav |
|--------|------|
| RLS profiles / orders | 🚧 / ✅ částečně |
| Service role jen na serveru | ✅ Edge |
| DOMPurify, sanitizace formulářů | ✅ |
| Validace IČO / telefonu / hesla | ✅ |
| GDPR formulace telemetrie | 📋 dokumenty |
| Audit log UI | 🚧 |

---

## Prioritní mezery pro chatbot knowledge

1. Přesné názvy menu a „kam kliknout“ ve Student a Admin UI  
2. Stav kurzu studenta (zapsán / rozpracován / hotovo / expirováno)  
3. Pravidla pokusů u testů a minimální skóre (FAQ říká 60 %)  
4. Kontakt na podporu (FAQ: support@SafetyPartners.cz)  

Tento dokument + ostatní markdowny tvoří základ knowledge base pro Aetherium Assistenta.

---

*Konec dočasného přehledu funkcí 1.0.0-temp*
