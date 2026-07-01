<!--TODO: Technická dokumentace: Real-time Registrační Workflow (ARES + MFA/OTP)
<!--TODO: Tento dokument popisuje automatizovaný proces registrace subjektu v systému Aetherium-Core, <!--TODO: využívající externí integrace pro validaci dat a dvoufaktorové ověření. -->
<p>

1. Fáze: ARES (Automatické doplňování dat)
Vstup: Uživatel zadá identifikační číslo (IČO).
Technická realizace: JS funkce (umístěná v src/lib/ares.js dle modulární struktury
) zachytí událost input nebo blur. Pomocí fetch volá API ARES.
Výstup: Data (název firmy, sídlo, právní forma) jsou automaticky zapsána do odpovídajících polí formuláře pomocí DOM manipulace (např. nazevFirmy.value = data.obchodniJmeno).

2. Fáze: MFA/OTP Inicilalizace (SMS Handshake)
Vstup: Uživatel zadá telefonní číslo a vyžádá si ověření.
Technická realizace:
Volání metody supabase.auth.signInWithOtp() s parametrem phone
.
Konfigurace vyžaduje VITE_SUPABASE_URL a VITE_SUPABASE_ANON_KEY načtené přes import.meta.env
.
Služba Supabase skrze integrovaného poskytovatele (např. Twilio) odešle 6místný kód.

3. Fáze: Real-time OTP Validace
Technická realizace:
Event listener na poli mfa-otp sleduje délku vstupu.
Při detekci 6. číslice JS automaticky vyvolá metodu supabase.auth.verifyOtp()
.
Workflow:
Kontrola délky vstupu (if (input.value.length === 6)).
Asynchronní ověření proti Supabase Auth.
Při úspěchu: Vizuální potvrzení a odemknutí tlačítka submitModalButton.

4. Fáze: Perzistence dat a Bezpečnost (RLS)
Operace: Po úspěšném ověření a kliknutí na odeslat se data (včetně dat z ARES a vybraných kurzů) uloží do tabulky profiles.
Zabezpečení:
Uložení probíhá pod rolí anon s využitím veřejného klíče
.
Kritická podmínka: Bezpečnost dat je zajištěna politikami Row Level Security (RLS), které omezují zápis pouze na řádek odpovídající auth.uid() přihlášeného uživatele
.
Data o kurzech jsou ukládána jako objekt jsonb pro budoucí flexibilitu LMS.
