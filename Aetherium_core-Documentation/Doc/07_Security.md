# 07 — Security

**Stav:** Dočasná bezpečnostní mapa z kódu a legislativních formulací (2026-09-29)

---

## 1. Autentizace

| Mechanismus | Implementace |
|-------------|--------------|
| E-mail / heslo | Supabase Auth (`signInWithPassword`, `signUp`, `resetPasswordForEmail`) |
| SMS OTP | `signInWithOtp({ phone })` + `verifyOtp` (Twilio přes Supabase) |
| Session | `refreshSession`, JWT v Authorization headeru |
| Role v metadata | např. `{ role: 'student' }` při `createUser` |

Soubory Connect: `SupabaseConnect.js` v Enterprise, Subscriber, Student, Kernel.

Env (client):

- `VITE_SUPABASE_URL`  
- `VITE_SUPABASE_ANON_KEY`  

Service role klíč **pouze** v Edge Function (Deno env), nikdy ve frontendu.

---

## 2. Row Level Security (RLS)

Z Edge Function a dokumentace:

- Zápis do `profiles` omezen na řádek odpovídající `auth.uid()`  
- Politika `orders_select_own` — volající vidí jen své objednávky (subscriber_id / client_id)  
- Service role obchází RLS **až po** ověření ownership caller klientem  

TODO: kompletní seznam politik pro `students`, `courses`, `certificates` v DB dokumentaci.

---

## 3. Sanitizace a validace vstupu

| Oblast | Nástroj / soubor |
|--------|------------------|
| HTML | DOMPurify (dependency) |
| Formuláře | `SanitizeForm.js`, `ValidateForm.js` |
| IČO | kontrolní součet v `AresLookup.js` |
| Telefon | `formatPhoneStrict`, libphonenumber-js |
| Hesla | @zxcvbn-ts (síla hesla) |
| Schémata | Zod |

`utils/security.client.js` — minimální klientský security helper.

---

## 4. ARES data

- Data z ARES jsou **dočasná v prohlížeči** do úspěšného MFA a insertu  
- Odstranění ARES modulu nesmí shodit aplikaci (zapouzdření)  

---

## 5. Edge Function bezpečnostní model

1. Bez `Authorization` → 401  
2. Caller client s JWT → čtení order pod RLS  
3. Až poté admin client se `SERVICE_ROLE_KEY`  
4. Vytváření uživatelů jen pro ověřenou zaplacenou objednávku  

---

## 6. Telemetrie vs. biometrie (GDPR)

Doporučené formulace (z legislativního dokumentu):

> Systém vyhodnocuje integritu studia pomocí analýzy **interakčních vzorců** (telemetrie prokliků, čas na modulech, frekvence navigace, časové razítko testů).  
> **Nesbírá, neukládá ani nezpracovává** fyzické biometrické údaje (obličej, otisky, hlas).

> Sběr provozní telemetrie slouží k ověření aktivní účasti, zamezení obcházení výukového plánu a generování podkladů pro certifikaci.

> Zpracování v souladu s minimalizací dat a Zero Data Retention pro AI rozhraní. Data na serverech v EU, neposkytována třetím stranám mimo smluvní rámec.

---

## 7. Otevřené / TODO

- Kompletní audit RLS politik  
- Rate limiting na OTP a ARES  
- CSP a security headers ve Vite buildu  
- Rotace service role a monitoring Edge logů  
- 2FA pro Admin (FAQ zmínka o QR / autentizační aplikaci)  

---

*Související: [09_API_Integrations.md](./09_API_Integrations.md), [10_Legislative_Module.md](./10_Legislative_Module.md)*
