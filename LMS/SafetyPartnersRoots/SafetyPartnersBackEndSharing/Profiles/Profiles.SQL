-- =====================================================================
-- MIGRACE 001: profiles
-- Aetherium Core Enterprise - zakladni identitni tabulka
-- =====================================================================
-- Spoustet v Supabase Dashboard -> SQL Editor -> New query
-- Muzes spustit cely soubor najednou, nebo krok po kroku (doporucuju
-- na zacatek, at vidis co presne kazdy prikaz udela).
-- =====================================================================


-- ---------------------------------------------------------------------
-- KROK 1: vlastni ENUM typ pro roli uzivatele
-- ---------------------------------------------------------------------
-- Proc: ENUM je uzavreny seznam povolenych hodnot. Kdybys misto nej
-- pouzil obycejny "text", nic by ti nezabranilo zapsat treba 'adnim'
-- (preklep) a databaze by to klidne prijala. S ENUM typem PostgreSQL
-- takovy zapis rovnou odmitne chybou uz na urovni databaze - driv,
-- nez se spatna hodnota vubec dostane do tveho JS kodu.
--
-- Musi se vytvorit DRIV nez tabulka, protoze tabulka ho pouziva jako
-- datovy typ sloupce "role".
-- ---------------------------------------------------------------------
create type user_role as enum ('admin', 'subscriber', 'client', 'student');


-- ---------------------------------------------------------------------
-- KROK 2: samotna tabulka profiles
-- ---------------------------------------------------------------------
create table public.profiles (

    -- id NENI vlastni nezavisly primarni klic (zadne "serial"/"identity").
    -- Preberi stejne uuid, jake Supabase Auth vygeneruje v auth.users
    -- pri registraci. "references auth.users(id)" vytvari cizi klic,
    -- "on delete cascade" znamena: kdyz se smaze uzivatel v auth.users,
    -- automaticky se smaze i jeho radek tady - zadne osirele zaznamy.
    id            uuid primary key references auth.users(id) on delete cascade,

    -- Zakladni role - vyuziva ENUM z kroku 1. Default 'client', protoze
    -- nejcastejsi zpusob vzniku uctu bude verejna registrace klienta.
    role  user_role not null default 'client',

    -- Explicitni bezpecnostni pojistka navic k roli. RLS politiky se
    -- budou ptat na TOHLE pole (jednoznacny boolean), ne na text role -
    -- tak se nedá obejit preklepem ani budouci zmenou enumu.
    is_super_admin   boolean not null default false,

    -- Odkaz na budouci tabulku tenants. POZOR: tabulka tenants jeste
    -- neexistuje, takze sem zatim NEDAVAME "references tenants(id)".
    -- Sloupec vytvorime uz ted (at nemusime pozdeji menit strukturu),
    -- ale cizi klic (FK constraint) pridame separatnim ALTER TABLE
    -- prikazem az v dalsim kroku, kdyz budeme delat tenants. U admina
    -- zustane vzdy NULL - nepatri zadnemu tenantovi.
    tenant_id     uuid,

    -- Kopie emailu z auth.users.email - usnadni ti to SQL dotazy, at
    -- nemusis pokazde JOINovat do schematu auth jen kvuli vypsani mailu.
    email                  text not null unique,

    full_name              text,
    phone                  text,
    avatar_url             text,

    -- jsonb = JSON ulozeny binarne primo v Postgresu. Umoznuje pridavat
    -- jemna opravneni BEZ zmeny struktury tabulky, napr.
    -- {"can_delete_tenants": true} - hodi se, az budes mit vic adminu.
    permissions            jsonb not null default '{}'::jsonb,

    -- Umoznuje ucet deaktivovat bez mazani (DELETE by zpretrhal historii
    -- - certifikaty, event log apod. by ztratily sveho autora).
    is_active              boolean not null default true,

    mfa_enabled            boolean not null default false,

    -- Ochrana proti brute-force utoku na prihlaseni.
    failed_login_attempts  integer not null default 0,
    locked_until           timestamptz,

    last_login_at          timestamptz,
    last_login_ip          inet,          -- PostgreSQL ma vlastni typ pro IP adresy

    -- GDPR / compliance
    terms_accepted_at      timestamptz,
    gdpr_consent_at        timestamptz,

    -- Auditni sloupce
    created_at             timestamptz not null default now(),
    updated_at             timestamptz not null default now(),

    -- Odkazuje samo na sebe (na jiny radek stejne tabulky) - kdo tento
    -- ucet zalozil. U uplne prvniho admina (tebe) zustane NULL, protoze
    -- jsi koren cele hierarchie a nikdo te nezalozil.
    created_by             uuid references public.profiles(id)
);


-- ---------------------------------------------------------------------
-- KROK 3: trigger, ktery sam aktualizuje "updated_at" pri kazde zmene
-- ---------------------------------------------------------------------
-- Proc trigger a ne staci DEFAULT now()? DEFAULT se vyhodnoti jen JEDNOU,
-- v okamziku INSERTu. Pri UPDATE uz se nijak sam neprepise. Bez triggeru
-- bys musel na "updated_at = now()" pamatovat rucne v kazdem UPDATE
-- prikazu v JS kodu - a to se drive nebo pozdeji nekde zapomene.
--
-- Funkce se spusti "BEFORE UPDATE" (jeste pred samotnym zapisem zmeny)
-- a prepise hodnotu v radku, ktery se prave zapisuje (NEW).
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger trg_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- KROK 4: funkce is_admin() pro pouziti v RLS politikach
-- ---------------------------------------------------------------------
-- Proc samostatna funkce a ne primo dotaz v politice? Kdybys v RLS
-- politice NA TABULCE profiles napsal primo
-- "using (select is_super_admin from profiles where id = auth.uid())",
-- vznikne nekonecna rekurze - politika na profiles by se dotazovala
-- do profiles, ktera ma zase svou politiku... Reseni: SECURITY DEFINER
-- funkce. Bezi s opravnenim toho, kdo funkci VYTVORIL (ty, jako
-- vlastnik databaze), ne toho, kdo ji VOLA - takze uvnitr funkce RLS
-- neplati a rekurze nehrozi.
-- "stable" rika Postgresu, ze funkce v ramci jednoho dotazu vzdy vrati
-- stejny vysledek - umoznuje to optimalizaci.
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_super_admin = true
  );
$$;


-- ---------------------------------------------------------------------
-- KROK 5: Row Level Security (RLS)
-- ---------------------------------------------------------------------
-- Bez zapnuti RLS by (mimo Supabase service_role) kdokolik s pravem
-- SELECT videl VSECHNY radky tabulky - to u tabulky s osobnimi udaji
-- absolutne nechces. Jakmile RLS zapnes, plati "default deny" - nikdo
-- nevidi nic, dokud mu to nejaka POLICY vyslovne nepovoli.
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

-- Kazdy prihlaseny uzivatel smi videt SVUJ VLASTNI radek.
create policy "profiles_select_own"
    on public.profiles
    for select
    using (auth.uid() = id);

-- Kazdy prihlaseny uzivatel smi upravit SVUJ VLASTNI radek
-- (napr. zmena telefonu, avataru).
create policy "profiles_update_own"
    on public.profiles
    for update
    using (auth.uid() = id);

-- Admin (is_super_admin = true) vidi a upravuje UPLNE VSECHNY radky -
-- vyuziva funkci z kroku 4, takze zadna rekurze.
create policy "profiles_admin_full_access"
    on public.profiles
    for all
    using (public.is_admin());


-- ---------------------------------------------------------------------
-- KROK 6 (jen informativni - NESPOUSTET, dokud nebude existovat tenants)
-- ---------------------------------------------------------------------
-- Az vytvorime tabulku tenants, pridame cizi klic na tenant_id timhle
-- prikazem (ALTER TABLE misto zmeny CREATE TABLE - takhle se to dela
-- v realnem projektu, kde tabulky vznikaji postupne v case):
--
-- alter table public.profiles
--     add constraint fk_profiles_tenant
--     foreign key (tenant_id) references public.tenants(id);
-- ---------------------------------------------------------------------


-- =====================================================================
-- MIGRACE 002: automaticke zalozeni profilu pri registraci
-- Aetherium Core Enterprise
-- =====================================================================
-- Spoustet AZ PO uspesnem spusteni 001_create_profiles.sql
-- Supabase Dashboard -> SQL Editor -> New query
-- =====================================================================


-- ---------------------------------------------------------------------
-- KROK 7: funkce, ktera zalozi radek v public.profiles
-- ---------------------------------------------------------------------
-- Proc security definer? Tabulka auth.users je ve schematu "auth",
-- kam bezny prihlaseny uzivatel nema pravo zapisovat ani cist primo.
-- Trigger ale potrebuje mit moznost VLOZIT radek do public.profiles
-- hned v okamziku, kdy Supabase Auth (interne, na urovni systemu)
-- vytvari noveho uzivatele - v tu chvili jeste neexistuje "prihlaseny
-- uzivatel" se svym vlastnim opravnenim. security definer resi presne
-- tohle: funkce bezi s opravnenim toho, kdo ji VYTVORIL (ty, vlastnik
-- databaze), takze zapis do public.profiles projde bez ohledu na to,
-- kdo/co registraci spoustelo (tva Edge Function, admin API, atd.).
--
-- "set search_path = public" je bezpecnostni doporuceni k security
-- definer funkcim - bez neho by nekdo teoreticky mohl podstrcit
-- vlastni schema a funkci "unest" (tzv. search_path hijacking).
-- Timhle radkem si funkce natvrdo rekne "hledej tabulky jen ve schema
-- public", takze se to nemuze stat.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id, email, role)
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data ->> 'role', 'client')::user_role
    );
    return new;
end;
$$;


-- ---------------------------------------------------------------------
-- KROK 8: trigger na auth.users, ktery tu funkci spusti
-- ---------------------------------------------------------------------
-- "after insert on auth.users" - Supabase vyjimecne povoluje pridat
-- trigger i na system tabulku auth.users (bezne by sis na cizi schema
-- trigger nepridal). Spusti se u KAZDEHO noveho radku v auth.users,
-- tedy u kazde registrace bez ohledu na to, jakou cestou vznikla:
-- tva Edge Function (Client/Student registrace), supabase.auth.admin.
-- createUser() (kdyz zalozis Subscribera rucne), nebo i budouci
-- Google OAuth login.
--
-- "for each row" znamena, ze se funkce spusti zvlast pro kazdy nove
-- vlozeny radek (ne jednou za cely prikaz, kdyby jich vzniklo vic
-- najednou).
-- ---------------------------------------------------------------------
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();


-- =====================================================================
-- DULEZITE: jak tenhle trigger pouzivat z tve Edge Function
-- =====================================================================
-- 1) Edge Function zalozi uzivatele:
--
--    const { data, error } = await supabaseAdmin.auth.admin.createUser({
--        email: formData.email,
--        password: generatedPassword,
--        email_confirm: true,
--        user_metadata: { role: 'client' }   // <- trigger si to precte
--    })
--
--    Diky "raw_user_meta_data ->> 'role'" v KROKU 7 se rovnou zalozi
--    profil se spravnou roli (client/student/subscriber), misto aby
--    vsem defaultne padal 'client'. Kdyz "role" v metadatech chybi,
--    coalesce() spadne zpatky na 'client' jako bezpecny default.
--
-- 2) Trigger na pozadi OKAMZITE zalozi zakladni radek v profiles
--    (id, email, role) - ty uz do neho NIC rucne nevkladas.
--
-- 3) Edge Function hned nato dodela zbytek pres UPDATE, ne INSERT:
--
--    await supabaseAdmin.from('profiles')
--        .update({
--            tenant_id: subscriberIdFromLink,   // az bude tenants existovat
--            full_name: formData.companyName
--        })
--        .eq('id', data.user.id)
--
--    A samozrejme paralelne INSERT do specifické tabulky (clients,
--    students...) s firemnimi/osobnimi udaji, ktere v profiles vubec
--    nejsou (IČO, DIČ, client_id z tokenu, atd.).
-- =====================================================================
