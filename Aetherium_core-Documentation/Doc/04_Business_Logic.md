# 04 — Business Logic

**Stav:** Dočasný popis obchodní logiky z kódu a README (2026-09-29)

---

## 1. Obchodní model (Starter)

- B2B SaaS LMS  
- Poskytovatel (Subscriber / Admin) prodává školení firmám (Client)  
- Firmám se účtuje počet studentů / kurzů (objednávka)  
- Studenti jsou založeni až **po zaplacení** objednávky  
- Výstup: absolvování, testy, PDF certifikáty, periodická re-certifikace  

---

## 2. Lifecycle objednávky a studentů

```
Registrace subjektu (Enterprise / Subscriber)
        │
        ▼
Vyplnění formuláře + ARES + MFA OTP
        │
        ▼
Výběr rozsahu (počet studentů / kurzy)  →  orders (pending)
        │
        ▼
Platba  →  orders.status = 'paid'
        │
        ▼
Import studentů (CSV/XLSX)  nebo ruční seznam
        │
        ▼
Edge Function: create-students-from-order
   - ověření ownership (RLS)
   - kontrola student_count
   - auth.admin.createUser + students insert
        │
        ▼
Studenti se přihlásí → kurzy → testy → certifikáty
        │
        ▼
Expirace certifikátů → notifikace (2 m … 1 den) → re-certifikace
```

Klíčové podmínky z Edge Function:

- `order.status === 'paid'` jinak HTTP 409  
- `students.length <= order.student_count` jinak 409  
- chyba u jednoho e-mailu **neshodí** celý import (stejná filozofie jako `valid/invalid` ve StudentImport)

---

## 3. Registrace firmy (Enterprise)

Účel: získat identifikaci klienta a predikci rozsahu školení.

Fragmenty formuláře (README + kód):

1. **IČO** → ARES auto-fill (název, sídlo, právní forma, datum vzniku, stav, DIČ, spisová značka, datová schránka)  
2. **Kontaktní a standardní údaje** (telefon s OTP, e-mail, …)  
3. **Rozsah** — predikce počtu nových systémových uživatelů / kurzů / testů / certifikátů  
4. **Souhlasy** (GDPR) + odeslání po ověřeném OTP  

Data se připravují pro `profiles` insert; kurzy mohou být jako `jsonb`.

---

## 4. Import studentů (Subscriber)

Soubor: `StudentImport.js`

- Max 5 MB, max 5000 řádků  
- Formáty: CSV (UTF-8 / windows-1250), XLSX/XLS  
- Povinná pole: firstName, lastName, email; phone volitelné  
- Mapování sloupců:  
  1. aliasy hlaviček (jmeno, prijmeni, email, telefon…)  
  2. ML klasifikátor (`ColumnModel` + features)  
  3. ruční UI pro nejisté sloupce  
- Výstup: `valid`, `invalid` (včetně `raw`), `duplicates`  
- Ukládá se celé přes `setImport()` (přežije reload)  
- Korekce mapování se ukládají lokálně pro budoucí trénink (bez PII)

---

## 5. Kurzy a publikace (Admin CMS)

`InputEditor.js` + `PAGE_TYPES`:

- Stav kurzu v editoru: `title`, `type`, `pages[]`, `currentPageIndex`  
- Uložení konceptu: `status: 'draft'`  
- Publikace: `status: 'published'` po validaci  
- Validace: prázdný content, otázka bez textu / bez správné odpovědi, media bez URL  

Typy stránek: viz [12-Course_Data_structure.md](./12-Course_Data_structure.md)

Napojení na Supabase insert/update je v kódu zatím **TODO** (console.log payload).

---

## 6. Certifikáty a expirace

Z README a reportů:

- Automatizovaný expirační cyklus: upozornění **2 měsíce, 30, 14, 7, 2, 1 den** před expirací  
- Admin přehled: Client / téma / Student  
- Storage bucket: `Certificates`  
- Student: sekce „Moje certifikáty“, stažení PDF, unikátní ID pro ověření  

---

## 7. Monetizace (orientačně)

- Platba vázaná na objednávku (`FormToPay`, `PaymentSubscriber`, `AetheriumPaymentMethod`)  
- Po `paid` se odemyká zakládání studentů  
- Detaily platební brány v kódu nejsou plně zdokumentované (soubory existují, část logiky prázdná)

---

## 8. Otevřené body

- Finální ceník a produktové plány (Starter vs vyšší)  
- Automatické generování přihlašovacích údajů Client mailem  
- Propojení draft/published kurzů se Student „Moje kurzy“  
- Pravidla re-certifikace (`is_recertification` v datech kurzu)  

---

*Související: [05_Automation_Workflows.md](./05_Automation_Workflows.md), [08_Database_Architecture.md](./08_Database_Architecture.md)*
