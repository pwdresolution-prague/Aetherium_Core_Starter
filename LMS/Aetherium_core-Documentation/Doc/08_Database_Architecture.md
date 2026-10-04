# 08 — Database Architecture

**Stav:** Dočasný obraz z Edge Function, reportů a návrhů Excel (2026-09-29)  
**Backend:** Supabase (PostgreSQL) + Storage + Auth

---

## 1. Inicializace klienta

Frontend:

```js
createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
```

Test připojení: `from('profiles').select('*').limit(1)`.

Edge: dva klienty — anon+JWT (caller) a service_role (admin).

---

## 2. Identifikované tabulky / entity

### profiles

- Řádek vázaný na `auth.uid()`  
- Firemní údaje z ARES (včetně `ico` jako sekundární identifikátor)  
- RLS: zápis/čtení vlastní řádek  
- Trigger `handle_new_user()` zakládá základní řádek při vytvoření auth usera  

### orders

| Sloupec (z kódu) | Význam |
|------------------|--------|
| id | PK |
| status | např. `paid` (povinné pro import studentů) |
| client_id | firma |
| subscriber_id | poskytovatel |
| student_count | max. počet studentů v objednávce |

RLS: `orders_select_own` — ownership podle JWT.

### students

| Slupec | Význam |
|--------|--------|
| id | = auth.users.id |
| first_name, last_name | |
| phone, email | |
| client_id, subscriber_id, order_id | vazby |

Vkládáno Edge Function po `createUser`.

### courses / course pages (plánované z CMS)

Payload z editoru:

```js
{
  title: string,
  type: string,
  pages: [{ id, type, data }],
  status: 'draft' | 'published'
}
```

Struktura `data` dle typu stránky — viz [12-Course_Data_structure.md](./12-Course_Data_structure.md).  
V dokumentaci dříve zmíněno ukládání kurzů jako **jsonb**.

### certificates / Storage

- Bucket: **Certificates** (report 28_09_2026)  
- Meta (z dřívějších návrhů): score, attempt, duration_seconds, status, is_recertification  

### Ostatní (z UI a návrhů)

- Notifikace / expirace  
- Audit log  
- Legislativní dokumenty  
- column_corrections (plán pro ML korekce importu, RLS dle tenant)

Excel návrhy ve složce `Návrhy_databáze/`:

- `Návrh_Databáze_Levels.xlsx` / `..._OBOHACENO.xlsx`  
- `profiles_tabulka_vyuka.xlsx`  
- `registrace_tokeny_vyuka.xlsx`  

---

## 3. Auth schéma (Supabase)

- `auth.users` — správa přes Admin API v Edge  
- `email_confirm: true` při createUser z importu  
- OTP přes phone provider (Twilio)

---

## 4. Storage

| Bucket | Účel |
|--------|------|
| Certificates | PDF certifikáty studentů |

Další buckety (média kurzů, avatary) — TODO dle CMS media uploadu.

---

## 5. Princip datové minimalizace

- ARES data do DB až po MFA  
- ML korekce importu: jen features + label, ne jména/e-maily  
- Telemetrie: interakční vzorce, ne fyzická biometrie  

---

## 6. TODO

- Export finálního SQL / migration z Supabase  
- ER diagram (Draw.io soubory v repu: `SafetyPartners_LMS.drawio`)  
- Indexy na `ico`, `order_id`, e-mail studentů  
- Politik RLS pro všechny tabulky v jednom dokumentu  

---

*Související: [02_System_Architecture.md](./02_System_Architecture.md), [04_Business_Logic.md](./04_Business_Logic.md)*
