# 03 — User Roles & Permissions

**Stav:** Dočasná mapa rolí dle README + kódu (2026-09-29)

---

## 1. Čtyři bazální zóny (RBAC multi-tenant)

| Role | Kód / metadata | Popis |
|------|----------------|-------|
| **ADMIN** | admin / developer | Provozovatel platformy — CMS, telemetrie, uživatelé, legislativa, audit |
| **SUBSCRIBER** | subscriber | Partner / poskytovatel — registrace subjektů, objednávky, import studentů, platby |
| **CLIENT** | client | Firma objednávající školení — správa svých studentů v rámci tenantu |
| **STUDENT** | student (`user_metadata.role`) | Koncový student — kurzy, testy, certifikáty, chatbot |

Edge Function při zakládání studenta nastavuje:

```ts
user_metadata: { role: 'student' }
```

---

## 2. Vstupní portály (README + složky)

### StudentLogin

Společné UI větve pro:

| Úroveň | Kontrola dat | Poznámka |
|--------|--------------|----------|
| Manager 1 | Nejvyšší v této větvi | |
| Manager 2 | Střední | |
| Student | Základní student | |

Logo a vstup: registrace / přihlášení (červené logo dle README).

### AdminLogin

| Úroveň | Rozhraní |
|--------|----------|
| Developer Control | Plný vývojářský přístup |
| Admin Control | Administrace systému |
| Client Control | Klientské možnosti (sdílené UI prvky s Manager úrovněmi, odlišná práva) |

Podle README: **Admin a Student mají odlišné možnosti změn a dat**.  
Client v AdminLogin větvi vidí podobné možnosti jako Manager 1/2 ve StudentLogin větvi, ale s jinými právy.

---

## 3. Co která role reálně ovládá (z implementace)

### ADMIN (Provider CMS)

Cesta: `SafetyPartnersFrontendProvider/`

- CMS editor kurzů a testů (stránky, TipTap, publikace draft/published)
- Dashboard + telemetrie (Chart.js)
- Uživatelé a oprávnění
- Certifikáty CMS, Notifikace, Analytika, Audit log
- Legislativa
- Nastavení CMS

### SUBSCRIBER

Cesta: `SubscriberAetheriumFrontEnd/` + Enterprise registrace

- Registrační formulář (ARES, MFA)
- Shrnutí objednávky (`Summary.html`)
- Import studentů (CSV/XLSX)
- Platební flow (`Subscriber_Payment_Method/`)
- Po zaplacení: Edge Function založí studenty

### CLIENT

- Vzniká z Admin flow (README: Admin vytváří profil Client)
- Generované přihlašovací údaje mailem (plánováno)
- Správa studentů vázaných na `client_id`

### STUDENT

Cesta: `SafetyPartnersFrontendStudent/`

Stránky (HTML):

- Index (dashboard)
- Kurzy, Testy, Dokumentace
- Certifikáty, Reporty
- Můj profil, Uživatelé, Nastavení, Podpora
- Chatbot (Fuse.js FAQ)

---

## 4. Vazby v datech (z Edge Function a doc)

| Entita | Vazba |
|--------|-------|
| `orders` | `client_id`, `subscriber_id`, `student_count`, `status` |
| `students` | `id` = auth user id, `client_id`, `subscriber_id`, `order_id` |
| `profiles` | řádek vázaný na `auth.uid()` (RLS) |

Ownership objednávky se ověřuje přes caller JWT + RLS (`orders_select_own`) před použitím service_role.

---

## 5. TODO / otevřené

- Jednotný enum rolí napříč AdminLogin úrovněmi a RBAC v DB  
- Dokumentace přesných RLS politik pro každou tabulku  
- Mapování „Manager 1/2“ na Client/Subscriber v produkčním modelu  

---

*Související: [04_Business_Logic.md](./04_Business_Logic.md), [07_Security.md](./07_Security.md)*
