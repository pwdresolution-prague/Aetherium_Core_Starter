# 06 — AI Systems

**Stav:** Popis aktuálních a plánovaných AI komponent (2026-09-29)

---

## 1. Chatbot asistent (Student)

**Umístění:**  
`SafetyPartnersFrontendStudent/JS/Modal_Assistent_AI/`

| Soubor | Role |
|--------|------|
| `ChatBotFuseTrainData.js` | Trénovací FAQ data (`questionsAndAnswers`) |
| `BackendLogikaAI/TrainingDataNormalizer.js` | Normalizace textu |
| `BackendLogikaAI/EmbeddingObal.js` | Obal pro embeddingy (připraveno) |
| `BackendLogikaAI/SupabaseConnectAssistent.js` | Napojení na Supabase |

**Aktuální engine:** Fuse.js (fuzzy search nad otázkami)

- Threshold a klíče nastaveny v dokumentaci/reportech (typicky `keys: ['question']`, `threshold: 0.4`)  
- Normalizace: lower-case, trim, odstranění interpunkce  
- ~75 FAQ položek: kurzy, testy, certifikáty, účet, podpora, technické problémy  

**Plánovaný posun:**

1. Fuse.js (hotovo)  
2. Doplnění dat z FAQ / CMS do Supabase  
3. Menší model / LangChain + embeddingy (TensorFlow.js USE v dependencies)  
4. Chatbot zná prostředí LMS díky této dokumentaci  

---

## 2. ML klasifikátor sloupců (Import studentů)

**Účel:** Automaticky rozpoznat, který sloupec CSV/XLSX je jméno, příjmení, e-mail, telefon.

| Komponenta | Umístění |
|------------|----------|
| Features | `SummaryLogic/ColumnFeatures.js` |
| Model predict | `SummaryLogic/ColumnModel.js` |
| Model assets | `public/models/column-classifier/` |
| Integrace | `StudentImport.js` → `buildColumnMap` |

Flow:

1. Alias match na hlavičky  
2. Pro nerozpoznané sloupce: `predictColumns` (min. confidence 0.6)  
3. Ruční UI pro zbývající  
4. Korekce se ukládají (features + label) pro budoucí trénink — **bez PII**  

---

## 3. Kernel AI (PWD_LMS_Kernel)

Složka `PWD_LMS_Kernel/src/Ai/`:

| Soubor | Stav |
|--------|------|
| Data.js | prázdný |
| Dataset.js | prázdný |
| Predikce.js | prázdný |
| model.js | prázdný |
| reprot.js | prázdný |

`Supabase.js` v Kernelu je naplněn (~1.2 KB).  
Jádro (`Jádro.js`, `Pravidla.js`, `audit.js`) zatím prázdné — připravená struktura pro budoucí centrální AI/pravidla.

---

## 4. Závislosti v package.json (AI-related)

- `@langchain/core`, `@langchain/openai`  
- `@tensorflow/tfjs`, `@tensorflow/tfjs-node`  
- `@tensorflow-models/universal-sentence-encoder`  
- `fuse.js`  
- `danfojs-node`, `numeric`, `mathjs`  

---

## 5. Behaviorální telemetrie (Admin)

`TelemetryLogic.js` → sekce „Behaviorální biometrie“:

- skóre integrity studia (trend)  
- události: ztráta pozornosti, paste detekce, podezřelý vzorec  
- rhythm / dwell time  

**Důležité (GDPR):** systém **nesbírá** fyzickou biometrii (obličej, otisky, hlas).  
Jde o provozní telemetrii interakcí — viz [07_Security.md](./07_Security.md) a [10_Legislative_Module.md](./10_Legislative_Module.md).

---

## 6. Doporučení pro chatbota LMS

Aby asistent uměl vést Studenta i Admina:

1. Indexovat tuto dokumentaci (markdown) jako knowledge base  
2. Mapovat FAQ kategorie na role (Student / Admin / Subscriber)  
3. Postupně nahrazovat statické odpovědi dynamickými daty z Supabase (stav kurzu, expirace certifikátu…)  

---

*Související: [14_Features_Overview.md](./14_Features_Overview.md), [11_Frontend_Logic.md](./11_Frontend_Logic.md)*
