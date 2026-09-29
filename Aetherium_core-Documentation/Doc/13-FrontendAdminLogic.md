# 13 — Frontend Admin Logic (Provider CMS)

**Stav:** Mapa Admin/CMS frontendu (2026-09-29)  
**Kořen:** `SafetyPartnersRoots/SafetyPartnersFrontendProvider/`

---

## 1. CMS Views (HTML)

| View | Účel |
|------|------|
| `CMS/Views/CMS.html` | Hlavní CMS / editor |
| `CMS/Views/Dashboard.html` | Admin dashboard |
| `CMS/Views/UživateléAOprávnění.html` | Uživatelé a práva |
| `CMS/Views/CertifkátyCMS.html` | Certifikáty |
| `CMS/Views/Legislativa.html` | Legislativa |
| `CMS/Views/NastaveníCMS.html` | Nastavení |
| `CMS/Views/Notifikace.html` | Notifikace / expirace |
| `CMS/Views/Analytika.html` | Analytika |
| `CMS/Views/Audit_Log.html` | Audit log |

---

## 2. CMS Editor kurzů

**Vstupní orchestrace:** `CMS/Components/CMS_Dashboard/InputEditor.js`

| Prvek | ID / chování |
|-------|----------------|
| Název kurzu | `#InputTitleId` → `courseState.title` |
| Typ kurzu | `#SelectCourseId` → `courseState.type` |
| Outline stránek | `#PageOutlineId` — čísla + ikony typů, mazání |
| Navigace | Backward / Forward |
| Přidat stránku | menu z `PAGE_TYPES` (`#AddPageMenuId`) |
| TipTap | toolbar + `#EditorContentId` pro type `content` |
| Structured | `#StructuredPageContentId` pro otázky/media |
| Uložit koncept | `#SaveCreationId` → draft |
| Publikovat | `#ConfirmCreationId` → validace + published |

Související:

- `EditorToolbar.js` — TipTap init, ikony  
- `PageTypesLogic/PageTypes.js` — registr typů  
- `ResizableImage.js`, `FilesInput.js` — média  

Detail dat: [12-Course_Data_structure.md](./12-Course_Data_structure.md)

---

## 3. Dashboard a telemetrie

**Soubory:**

- `CMS/Components/Dashboard.js`  
- `CMS/Components/Admin_Dashboard_Logika/TelemetryLogic.js`  

### Grafy (Chart.js)

| Funkce | Obsah |
|--------|--------|
| `renderAttendanceCharts` | timeline online, role (Student/Client/Subscriber), zařízení, avg session |
| `renderCourseCharts` | top kurzy, completion doughnut, enrollments 7 dní, avg completion days |
| `renderContentCharts` | typy obsahu, storage MB, growth 30 dní, recent list |
| `renderBiometryCharts` | score trend, events (pozornost/paste/vzorec), rhythm dwell, flagged list |

Paleta: primary `#FF6700`, secondary `#f7b733`, danger `#E24B4A`.  
Instance grafů se drží v `Map` a při re-render se `destroy()` (prevence „Canvas already in use“).

Data jsou připravena na napojení ze Supabase; v aktuálním kódu jde o strukturu očekávaných objektů.

---

## 4. Signál chodu systému

Z reportů (červen 2026): Admin rozhraní signalizace on/off pro databázi, API a autorizaci — HTML/JS/CSS propojení pro monitoring stavu.

---

## 5. TODO Admin

- Skutečné Supabase insert/update z editoru  
- Live data do telemetrie místo mock struktur  
- Propojení Notifikace → expirační job  
- Sjednocení práv Developer vs Admin vs Client v UI  

---

*Související: [11_Frontend_Logic.md](./11_Frontend_Logic.md), [06_AI_Systems.md](./06_AI_Systems.md)*
