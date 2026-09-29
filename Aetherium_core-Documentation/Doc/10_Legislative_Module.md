# 10 — Legislative Module

**Stav:** Dočasný popis legislativních a compliance prvků (2026-09-29)

---

## 1. Účel modulu

Podpora **legislativního a profesního vzdělávání** (BOZP, odborné způsobilosti, periodická školení) s důrazem na:

- prokazatelnost absolvování  
- certifikáty s expirací  
- auditovatelnost  
- soulad s GDPR při telemetrii a AI  

Admin UI: `SafetyPartnersFrontendProvider/CMS/Views/Legislativa.html`

---

## 2. Certifikáty

- Generování / uložení v Storage bucketu **Certificates**  
- Student: sekce certifikátů, stažení PDF, historie  
- Unikátní ID pro ověření pravosti (FAQ chatbot)  
- Typická platnost (z FAQ): cca 2 roky — liší se dle kurzu  
- Flag `is_recertification` v meta datech absolvování  

### Expirační notifikace (Admin)

Intervaly před koncem platnosti:

| Interval |
|----------|
| 2 měsíce |
| 30 dní |
| 14 dní |
| 7 dní |
| 2 dny |
| 1 den |

Přehled: Client × téma × Student.

---

## 3. GDPR a telemetrie

### Behaviorální telemetrie ≠ fyzická biometrie

Systém smí vyhodnocovat:

- prokliky, čas na modulech  
- frekvenci navigace  
- časová razítka testů  
- detekci paste / ztráty pozornosti (Admin grafy)

Systém **nesmí** sbírat:

- obličej, otisky prstů, hlasové nahrávky  

Doporučené smluvní formulace jsou v historickém obsahu legislativního dokumentu a v [07_Security.md](./07_Security.md).

### Minimalizace a AI

- Data minimisation  
- Zero Data Retention pro AI rozhraní (kde je to deklarováno)  
- Uložení v EU  
- ML korekce importu bez PII (jen features + label)

---

## 4. ARES a obchodní identifikace

- IČO jako sekundární identifikátor subjektu v LMS  
- Validace kontrolním součtem dle české praxe  
- Automatické doplnění z veřejného rejstříku snižuje chybovost registrace  

---

## 5. Audit

- Admin pohled `Audit_Log.html`  
- Kernel plánuje `audit.js` (zatím prázdný)  
- Cíl: prokazatelnost změn kurzů, uživatelů a certifikací pro firemní klienty  

---

## 6. TODO

- Napojení legislativních dokumentů na konkrétní kurzy  
- Automatické generování podkladů pro certifikaci z telemetrie  
- Právní texty do UI (souhlasy, privacy) centralizovaně  

---

*Související: [04_Business_Logic.md](./04_Business_Logic.md), [07_Security.md](./07_Security.md)*
