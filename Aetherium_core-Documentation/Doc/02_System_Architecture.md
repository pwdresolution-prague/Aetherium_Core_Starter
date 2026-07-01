<!--TODO: Technická dokumentace: Automatizace firemních údajů (ARES Lookup) -->
<p>

1. Účel modulu
Tento modul zajišťuje asynchronní propojení mezi uživatelským rozhraním AetheriumCore a veřejným rejstříkem ARES. Cílem je minimalizovat manuální chyby při zadávání firemních údajů a zrychlit proces registrace subjektu do LMS
.
2. Logika napojení (Event Listener)
Modul implementuje „posluchače“ (Event Listener) na vstupní pole pro IČO (ičoId).
Trigger: Událost blur (ztráta fokusu) nebo detekce 8. číslice v poli input.
Asynchronní fetch: Skript provede požadavek na API ARES. Pokud je pro přístup vyžadován API klíč, musí být uložen v souboru .env s prefixem VITE_ (např. VITE_ARES_API_KEY), aby byl dostupný v klientském bundle
.
Ošetření chyb: V případě neexistujícího IČO skript vizuálně upozorní uživatele a pole pro název firmy ponechá editovatelné pro manuální zápis.

3. Doplňovací datová struktura
Při úspěšném získání dat z ARES modul automaticky mapuje JSON odpověď na dříve definované konstanty formuláře:
data.obchodniJmeno ➔ nazevFirmy.value (název-firmyId)
data.sidlo.textovaAdresa ➔ sidloSpol.value (sídlo-společnostiId)
data.pravniForma ➔ pravniForma.value (právní-formaId)
data.datumVzniku ➔ datumSpol.value (datum-založeníId)
data.stav ➔ stavSubjekt.value (stav-subjektuId)

4. Architektonické začlenění (Vite Context)
Integrace: Podle doporučené struktury pro Vite projekty je tento modul považován za součást lib/ (integrační zóna pro vnější svět) nebo utils/ (čisté funkce pro transformaci dat)
.
Zapouzdření: Modul je navržen tak, aby splňoval „litmus test“ zapouzdření – jeho případné odstranění nesmí způsobit pád hlavní aplikace, pouze deaktivuje funkci automatického doplňování
.
Bezpečnost: Veškerá data získaná tímto modulem jsou považována za dočasná (v paměti prohlížeče), dokud nedojde k úspěšnému MFA ověření a následnému odeslání do Supabase pod ochranou RLS politik
.
5. Souvislost s databází
Data doplněná tímto modulem jsou následně připravena pro metodu .insert() do tabulky profiles. Sloupec ico v Supabase slouží jako sekundární identifikátor subjektu v rámci LMS Aetherium-Core
