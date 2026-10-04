# 05 — Automation Workflows

**Stav:** Technický popis automatizací z implementace (2026-09-29)

---

## 1. Registrační workflow: ARES + MFA/OTP + persist

### Fáze A — ARES (automatické doplnění)

| Krok | Detail |
|------|--------|
| Vstup | IČO (8 číslic) |
| Trigger | `blur` na `#ičoId` nebo Enter |
| Validace | Kontrolní součet české legislativy (`validateIco`) |
| API | `GET https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/{ico}` |
| Mapování | obchodniJmeno → název firmy, sidlo → adresa, pravniForma, datumVzniku, stav, dic, spisovaZnacka, datovaSchranka |
| UI | stavy loading / success / error; třídy `ares-filled` |
| Soubor | `AetheriumCoreEnterprise/Connect/AresLookup.js` |

Při změně IČO se dříve vyplněná pole vyčistí (`clearAresFills`).

### Fáze B — MFA/OTP (SMS)

| Krok | Detail |
|------|--------|
| Vstup | Telefon (normalizace `formatPhoneStrict`) |
| Odeslání | `supabase.auth.signInWithOtp({ phone })` |
| Ověření | při 6. číslici `verifyOtp({ phone, token, type: 'sms' })` |
| Stav | `otpVerified` + callback `onOtpVerifiedChange` |
| Soubor | `AetheriumCoreEnterprise/JS/Mfa_Otp.js` |

Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Fáze C — Persist + RLS

- Po úspěšném OTP a submit: data (ARES + formulář + kurzy) → `profiles`  
- Zápis pod anon klíčem, omezený RLS na `auth.uid()`  
- Kurzy jako `jsonb` pro flexibilitu  

---

## 2. Workflow importu studentů

```
Soubor (CSV/XLSX)
    → parse (PapaParse / SheetJS)
    → mapování sloupců (aliasy → ML → ruční)
    → validace řádků (email, jméno, telefon)
    → setImport({ valid, invalid, duplicates })
    → po paid order: Edge Function create-students-from-order
```

Limity: 5 MB, 5000 řádků.  
Duplicity podle e-mailu. Neplatné řádky si drží `raw` pro opravu.

---

## 3. Edge Function workflow (hromadné založení)

Soubor: `supabase/Index.ts`

1. CORS preflight  
2. Vyžaduje `Authorization`  
3. Body: `{ orderId, students[] }`  
4. Caller client (JWT) načte order — RLS `orders_select_own`  
5. `status === 'paid'` a počet studentů ≤ `student_count`  
6. Service role: `createUser` + insert `students`  
7. Výsledek po e-mailech `{ email, ok, error? }`  

Filozofie: jedna chyba (např. e-mail už existuje) neblokuje zbytek.

---

## 4. Notifikace expirace certifikátů (plán / README)

Intervaly před expirací:

- 2 měsíce  
- 30 dní  
- 14 dní  
- 7 dní  
- 2 dny  
- 1 den  

Admin přehled podle Client / tématický okruh / Student.  
Implementace notifikačního jobu v tomto snapshotu není plně v kódu — je součástí vize a Admin sekce Notifikace.

---

## 5. CMS: draft → published

1. Editor drží `courseState` v paměti  
2. „Uložit koncept“ → payload `status: 'draft'` (TODO: Supabase)  
3. „Publikovat“ → validace všech stránek → `status: 'published'`  
4. Validace pokrývá content, single/multi choice, true/false, open answer, media  

---

## 6. Související

- [04_Business_Logic.md](./04_Business_Logic.md)  
- [09_API_Integrations.md](./09_API_Integrations.md)  
- [07_Security.md](./07_Security.md)  
