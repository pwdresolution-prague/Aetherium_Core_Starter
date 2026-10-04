### Aetherium*Core ###
#*PWD*-*Developers*-*LMS*-*Safety*-*Partners*-*Documentace*-*systému*#

<p>Tato dokumentace vznikla jakožto myšlenková mapa systému, zároveň slouží k popisu projektu, a jeho struktury.
Základ LMS systému (výuková aplikace + software) je postavený na Html5, CSS3, JavaScriptu, Red-node, , PostgreSQL, backend systému Supabase, dále systému Twillio pokud neproběhla změna plánu vývoje, a také ..............
Celý LMS stojí na Desktopovém zobrazení s omezením zobrazení na tablet a smartphone.
Právě pro výše zmíněné zařízení je k dispozici mobilní aplikace, s možností instalace pro Android, a iOS.

Náš systém vlastní také funkce jako ChatBot, Ai generátor PDF certifikátů, Zpracování dat, bussines intelligence.

Celý systém má hlavní větve... 
0 - Development logic and management
1 - Frontend Admin
2 - Frontend Student
3 - Student Login
4 - Admin Login
5 - Backend Sharing
6 - Utils
7 - Node.js

V celém nižší verzi systému jsou dvě vstupní Frontendové prostředí  = AdminLogin a StudentLogin.
Tyto prostředí, se od sebe liší výrazným způsobem, v StudentLogin Vás uvítá vstupní stránka s červeným logem, a nabídkou Registrace a Přihlášení... K dispozici jsou 3 úrovně přihlášení které se liší v kontrole dat a funkcí.
- seřazeno sestupně dle kontroly - 
1 - Manager 1
2 - Manager 2 úroveň 
3 - Student

V Dalším prostředí AdminLogin které ponechává identické logo je ovšem odlišné přihlášení které nabízí také 3 úrovně, 
ovšem ale liší se v kontrole dat a uživatelském rozhraní.
- seřazeno sestupně dle kontroly a rozhraní -
1 - Developer Control
2 - Admin Control
3 - Client Control

Tyto účty mají odlišná práva a Client vidí stejné možnosti rozhraní jako Manager 1 a Manager 2 v 1. větvi systému,
za předpokladu odlišných práv a kontroly dat. Pro srozumitelnost větev AdminLogin dle rozhraní mají společnou Developer a Admin. Další větev StudentLogin mají dle rozhraní společnou Client,Manager1, Manager2 a Student. Jak je nejspíše samozřejmé dle názvů úrovní přístupů, tak Admin a Student mají odlišné možnosti jakýchkoliv změn, zásahů, kontroly a dostupných dat pro uživatelský režim. 

Režim Admin nabízí vlastní plnou kontrolu nad celým systémem. Admin systém nabízí plně funkční a robustní redakční systém, s hlubokou možností editace kurzů, a testů. Celý systém je navržený k maximálním uživatelským preferencím, na základě potřeb managmentu a datové analýzy. Role admin, má v základním balíčku ovládání systému možnost, vytvořit profil "Client"... K vytvoření uživatelského účtu "Client", pro společnost která si žádá právě služby našeho systému, je zapotřebí vyplnit formulář.Náš systém posléze vygeneruje unikátní uživatelské přihlašovací údaje které budou dostupné formou generovaného mailu.

## Seznámení s Aetherium core Enterprise

Prvotní zobrazení klientského portálu, který je navržen primárně pro účely získání informačních údajů o klientovi/firmě. Formulář vytvořený za účelem, poskytnout straně poskytovatele a na druhé straně poptávající firmě či podnikateli, je rozdělen do 4 z hlediska množství a tématické struktury fragmentovaných obsahových sekcí. 
Základním údajem pro poskytnutí jakkoliv početného E-learningu v oblastech které se mění na základě profesní specializace našeho klienta, který v tuto chvíli je skutečným poskytovatelem Online řešení pro vaši společnost je identifikační číslo obchodníka. Tento údaj je za předpokladu korektního zadání do prvního pole dotazníku, při svém vyplnění podpořen, automatickou rozšiřující funkcí vyhledání příslušného numerického součíslí s ověřením průkaznosti aktivní společnosti. Tento způsob datového ověření našeho formuláře, je tvořen pomocí API konektivity k dostupné databázi portálu ARES, kde skrze serverové přemostění, backend logiku, a vzhledem k našemu způsobu vývoje i doznačné míry změny téměř celé znění obsahu čistého kodu. Dále tedy dle nyní konstntních podmínek nadstavbové funkce formuláře, jsme schopni získat značné množství dat na základě jednoho údaje. Druhá část fragmentace dotazníku, obsahuje běžné údaje které jsou dnes už nepostradatelným standartem běžného denního užití. Třetím a posledním fragmentem který si žádá uživatelské vstupní data, je konkretně obsahová část založená na vstupním vytvoření předběžné predikce cílového počtu nově vytvořených systémových uživatelů, v praxi řečeno se jedná o vytvoření objednávky na počet kurzů dle kategorie dále následné testy a výstupní pdf certifikát. 




## Automatizovaný expirační cyklus planosti dokumentů

Dále je v naší platformě integrovaný datový selektor, který v rámci nadstavbové funkce Administrativní sekce Notifikace zasílá v časově stanovených intervalech "2 měsíce", "30 dní", "14 dní", "7 dní", "2 dny", a "1 den", předběžná upozornění expirace platnosti certifikátu. Administrátor tak má selektivní přehled expiračních termínů pro Klient, Tématický okruh, Student. 
















## Pokračování specifikace / dokumentace konkretních části systému...

Aetherium core Enterprise

Po úspěšném absolvování registrace společnosti v zoně Enterprise, se nyní nacházíte v prezentační části, s možnostmi...








































































</p>
