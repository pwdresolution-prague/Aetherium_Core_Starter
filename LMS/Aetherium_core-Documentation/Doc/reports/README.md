Pořadí je důležité, protože každá vrstva závisí na té předchozí: **Supabase (DB) → Node-RED (potřebuje DB) → Vite (frontend)**. Pro každý krok je tu příkaz, kontrola a vysvětlení.

## 0) Docker musí běžet
Lokální Supabase běží v Dockeru:
```bash
docker info > /dev/null 2>&1 && echo "Docker OK" || sudo systemctl start docker
```

## 1) Supabase (terminál 1)
```bash
cd ~/Documents/Projekty_Podnikání/LMS
npx supabase start
```
Po startu vypíše URL a klíče. Důležité jsou:
- **API:** `http://127.0.0.1:54321`
- **DB:** `127.0.0.1:54322`, tu používá Node-RED
- **Studio:** `http://127.0.0.1:54323`

Zkontroluj stav:
```bash
npx supabase status
```
Pokud DB po restartu nemá tvé tabulky, je to proto, že jsi změny dělal ručně v editoru a nemáš je v migraci. U `registration_tokens` je to ošetřené souborem v `supabase/migrations/`. Při `supabase db reset` se ta migrace znovu aplikuje, ale testovací data a tenanti zmizí.

## 2) Node-RED (terminál 2)
Máš dvě cesty spuštění a **nesmí běžet obě**, jinak se rve o port 1880:

```bash
# Je už spuštěný přes systemd?
systemctl --user status nodered.service --no-pager | head -5
```

- **Pokud je `active (running)`**, nedělej nic dalšího, jen otevři `http://localhost:1880`. Unit je enabled, takže po přihlášení naskočí sám.
- **Pokud je neaktivní**, buď ho nastartuj službou (doporučuji, načte `.nodered.env` přes `EnvironmentFile`):
  ```bash
  systemctl --user start nodered.service
  journalctl --user -u nodered.service -f     # živý log, Ctrl+C ukončí jen sledování
  ```
  nebo ručně: `./start-nodered.sh` (pak ale službu nech vypnutou).

Ověř, že vidí proměnné a DB:
```bash
tr '\0' '\n' < /proc/$(pgrep -f node-red | head -1)/environ | grep -E 'TOKEN_API_KEY|TWILIO|REGISTRATION_URL' | sed 's/=.*/=***/'
```
Příkaz vypíše jen názvy, hodnoty maskuje. Měl bys vidět všechny čtyři proměnné.

## 3) Vite (terminál 3)
```bash
cd ~/Documents/Projekty_Podnikání/LMS
npm run dev
```
Obvykle běží na `http://localhost:5173`. To musí odpovídat `REGISTRATION_URL` v `.nodered.env`, protože se z něj skládá odkaz v SMS. Pokud Vite vybere jiný port (5174 apod.), je 5173 obsazený starým procesem:
```bash
ss -ltnp | grep -E ':5173|:1880|:54321|:54322'
```

## Rychlá kontrola, že vše spolu mluví
```bash
curl -s -o /dev/null -w "Supabase API: %{http_code}\n" http://127.0.0.1:54321/rest/v1/
curl -s -o /dev/null -w "Node-RED:     %{http_code}\n" http://localhost:1880/
curl -s -o /dev/null -w "Vite:         %{http_code}\n" http://localhost:5173/
```
`Supabase API` může vrátit 401 (chybí klíč), a to je v pořádku, znamená to, že běží. U ostatních dvou čekej 200.

## Zastavení na konci
```bash
npx supabase stop                      # zachová data
systemctl --user stop nodered.service  # jinak ho systemd po kill znovu nastartuje
# Vite: Ctrl+C v jeho terminálu
```

Až bude vše běžet, můžeme se pustit do registrační stránky, která token spotřebuje. Pošli mi soubor nebo funkci, kde se dnes zakládá firma (`tenants` / `subscribers`).


#GITHUB

# soubory, které by se přidaly a nejsou v .gitignore
git status --short | grep -E "node_modules|\.env|\.bak|\.DS_Store"

# tajné klíče v kódu a SQL
grep -rniE "service_role|secret|password\s*=|sk_live|sk_test|api[_-]?key" \
  --include=*.js --include=*.sql --include=*.toml --include=*.html . \
  --exclude-dir=node_modules --exclude-dir=.git | head -30

printf "node_modules/\n.env\n.env.*\n*.bak\n.DS_Store\n" >> .gitignore

cd ~/Documents/Projekty_Podnikání/LMS
git add -A
git status
git commit -m "style: new blue-theme form design, Oswald headings with Czech diacritics, hidden password hints"
git push origin main
