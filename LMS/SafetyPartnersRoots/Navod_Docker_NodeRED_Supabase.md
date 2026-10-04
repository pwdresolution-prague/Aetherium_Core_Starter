# Propojení Docker + Node-RED + Supabase (VS Code)

Návod je pro lokální vývoj. Výchozí hesla a porty platí pro lokální Supabase (`supabase start`).

---

## 0. Předpoklady

```bash
docker --version          # Docker musí běžet
docker ps                 # nesmí vypsat chybu o oprávnění
node --version            # Node.js 18+
```

Pokud `docker ps` hlásí "permission denied" (Linux):

```bash
sudo usermod -aG docker $USER
# pak se odhlaste a znovu přihlaste
```

Doporučená rozšíření ve VS Code: **Docker** (ms-azuretools.vscode-docker), **Supabase** (volitelně), **Remote - Containers** (volitelně).

---

## 1. Spuštění Supabase lokálně

V kořeni repozitáře (tam, kde je složka `supabase/` s `config.toml`):

```bash
cd ~/Documents/Projekty_Podnikání/LMS
npx supabase --version
npx supabase start          # první spuštění stáhne image, chvíli trvá
npx supabase status         # vypíše všechny URL a klíče
```

Z `status` si uložte:

| Položka | Typická hodnota |
|---|---|
| API URL | `http://127.0.0.1:54321` |
| DB URL | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio | `http://127.0.0.1:54323` |
| anon key | (z výpisu) |
| service_role key | (z výpisu, **nikdy necommitovat**) |

Užitečné příkazy:

```bash
npx supabase stop                 # zastavení
npx supabase db reset             # znovu aplikuje migrace a seed
npx supabase functions serve      # lokální Edge Functions (např. create-students-from-order)
```

Zjistěte si `project_id` z `supabase/config.toml` (řádek `project_id = "..."`). Bude se hodit v bodě 2, varianta B.

---

## 2. Node-RED v Dockeru

### 2.1 Soubor `.env` (v .gitignore!)

Vytvořte `.env` vedle `docker-compose.yml`:

```env
SUPABASE_DB_HOST=host.docker.internal
SUPABASE_DB_PORT=54322
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=postgres
SUPABASE_URL=http://host.docker.internal:54321
SUPABASE_SERVICE_ROLE_KEY=DOPLNIT_Z_SUPABASE_STATUS
```

Ověřte, že je ignorovaný:

```bash
echo ".env" >> .gitignore
git check-ignore -v .env
```

### 2.2 `docker-compose.yml`

```yaml
services:
  nodered:
    image: nodered/node-red:latest
    container_name: nodered
    restart: unless-stopped
    ports:
      - "1880:1880"
    env_file:
      - .env
    extra_hosts:
      - "host.docker.internal:host-gateway"   # nutné na Linuxu
    volumes:
      - nodered_data:/data

volumes:
  nodered_data:
```

### 2.3 Spuštění

```bash
docker compose up -d
docker compose logs -f nodered     # Ctrl+C ukončí sledování logu
```

Editor: <http://localhost:1880>

### 2.4 Instalace PostgreSQL nodu

```bash
docker exec -it nodered npm install node-red-contrib-postgresql
docker compose restart nodered
```

(Alternativa: v editoru Menu → Manage palette → Install → `node-red-contrib-postgresql`.)

### 2.5 Import flow

1. Editor → Menu → Import → vyberte `Node_red_Flow_1.json` (a případně `Flow2_Certifikaty_SMS.json`).
2. Otevřete konfigurační node PostgreSQL a nastavte:

| Pole | Hodnota |
|---|---|
| Host | `${SUPABASE_DB_HOST}` (nebo `host.docker.internal`) |
| Port | `54322` |
| Database | `postgres` |
| User | `postgres` |
| Password | `postgres` |
| SSL | vypnuto (lokálně) |

3. Deploy.

Poznámka: proměnné `${...}` v polích fungují u většiny polí, ale u hesla (credentials) to ověřte testem. Pokud nefunguje, zadejte hodnotu ručně v editoru. Node-RED ji uloží šifrovaně do `flows_cred.json` v `/data`.

### 2.6 Varianta B: připojení přes síť Supabase (místo host.docker.internal)

Pokud `host.docker.internal` nefunguje, připojte Node-RED do sítě Supabase:

```bash
docker network ls | grep supabase
# např. supabase_network_<project_id>

docker network connect supabase_network_<project_id> nodered
```

Pak je host DB `supabase_db_<project_id>` a port `5432` (ne 54322).

---

## 3. Test spojení

```bash
# DB dostupná z hostitele
docker exec -it supabase_db_<project_id> psql -U postgres -c "select now();"

# DB dostupná z Node-RED kontejneru
docker exec -it nodered sh -c 'nc -zv host.docker.internal 54322'
```

V Node-RED: inject → postgresql node s dotazem `select now();` → debug. Pokud vrátí čas, spojení funguje.

---

## 4. Práce ve VS Code

```bash
code .
```

- Panel **Docker** (ikona velryby): vidíte kontejnery `nodered` a `supabase_*`, pravým tlačítkem Logs / Attach Shell / Restart.
- Terminál (Ctrl+`): všechny příkazy výše.
- Volitelně `.vscode/tasks.json` pro jedním klikem spuštěný start:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start vše",
      "type": "shell",
      "command": "npx supabase start && docker compose up -d"
    },
    {
      "label": "Stop vše",
      "type": "shell",
      "command": "docker compose down && npx supabase stop"
    }
  ]
}
```

Spouští se přes Ctrl+Shift+P → "Tasks: Run Task".

---

## 5. Export flow zpět do repozitáře

```bash
docker cp nodered:/data/flows.json ./LMS/SafetyPartnersRoots/SafetyPartnersBackEndSharing/NODE_RED/flows_export.json
```

Nebo v editoru: Menu → Export → All flows → Download.

**Před commitem zkontrolujte**, že export neobsahuje hesla ani klíče natvrdo:

```bash
grep -nEi 'password|service_role|eyJhbGci|auth_token|apikey' flows_export.json
```

Soubor `flows_cred.json` nikdy necommitujte.

---

## 6. Produkce (Supabase Cloud)

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase db push                          # nahraje migrace
npx supabase functions deploy create-students-from-order
```

Připojení z Node-RED do cloudu:
- Supabase Dashboard → Project Settings → Database → Connection string.
- Použijte **pooler** (Session/Transaction), SSL zapnuto.
- Údaje dejte do `.env` na serveru, ne do flow.

---

## 7. Rychlý přehled příkazů

```bash
npx supabase start              # Supabase nahoru
npx supabase status             # URL a klíče
docker compose up -d            # Node-RED nahoru
docker compose logs -f nodered  # log
docker compose down             # Node-RED dolů
npx supabase stop               # Supabase dolů
```

## 8. Časté problémy

| Problém | Řešení |
|---|---|
| `ECONNREFUSED` z Node-RED | Supabase neběží, nebo špatný host/port. Zkuste `host.docker.internal:54322` nebo variantu B. |
| `host.docker.internal` neexistuje | Chybí `extra_hosts` v compose (Linux). |
| Port 54322/54321 obsazený | `npx supabase stop`, případně změňte porty v `supabase/config.toml`. |
| Po restartu zmizely flow | Chybí volume `nodered_data`. |
| `permission denied` u Dockeru | `sudo usermod -aG docker $USER` a nové přihlášení. |
