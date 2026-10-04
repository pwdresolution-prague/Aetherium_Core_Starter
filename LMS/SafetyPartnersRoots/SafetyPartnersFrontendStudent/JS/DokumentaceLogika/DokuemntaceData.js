// DokumentaceData.js
//TODO: Záložní (fallback) data pro hub Dokumentace, dokud nejsou zapojené reálné API endpointy.
//IMPORTANT: Kategorie oblastí (kategorieOblasti) jsou sladěné s CMS sekcí Legislativa
//           (SafetyPartnersFrontendProvider/CMS/Components/Legislativa/MockLegislativaData.js),
//           aby se stejné klíče daly použít i tady pro filtrování a odkazování mezi produkty.

export const kategorieOblasti = [
    { key: "pracovnepravni", label: "Pracovněprávní vztahy" },
    { key: "bozp", label: "BOZP" },
    { key: "pozarni-ochrana", label: "Požární ochrana" },
    { key: "hygiena", label: "Ochrana veřejného zdraví" },
    { key: "chemicke-latky", label: "Chemické látky" },
    { key: "zivotni-prostredi", label: "Životní prostředí" },
    { key: "zavazne-havarie", label: "Prevence závažných havárií" },
]

//TODO: Záložka "Návody" – jak platforma funguje (navigační obsah, ne právní) ==============
export const mockNavody = [
    {
        id: "navod-zapis-kurz",
        nadpis: "Jak se zapsat do kurzu",
        kategorie: "platforma",
        kroky: [
            "V horním menu otevřete sekci Kurzy.",
            "Vyberte kurz podle své pracovní pozice nebo pokynu zaměstnavatele.",
            "Klikněte na Zahájit kurz – postup se automaticky uloží.",
        ],
        aktualizovano: "2026-08-14",
    },
    {
        id: "navod-test",
        nadpis: "Kdy a jak mohu udělat test",
        kategorie: "platforma",
        kroky: [
            "Test se odemkne až po dokončení všech kapitol kurzu.",
            "Na test máte omezený počet pokusů – vidíte je v detailu testu.",
            "Výsledek se zobrazí ihned po odeslání, i s procentuální úspěšností.",
        ],
        aktualizovano: "2026-08-14",
    },
    {
        id: "navod-certifikat",
        nadpis: "Kde najdu svůj certifikát",
        kategorie: "certifikace",
        kroky: [
            "Po úspěšném testu se certifikát vygeneruje automaticky (AI, formát PDF).",
            "Najdete ho v sekci Certifikáty, kde si ho i stáhnete.",
            "Platnost certifikátu vidíte přímo u dokumentu – blíží-li se expirace, systém vás upozorní.",
        ],
        aktualizovano: "2026-09-01",
    },
    {
        id: "navod-recertifikace",
        nadpis: "Co dělat, když mi končí platnost školení",
        kategorie: "certifikace",
        kroky: [
            "Cca 30 dní před expirací se vám v profilu zobrazí upozornění.",
            "Otevřete znovu příslušný kurz – systém ho označí jako 'opakované školení'.",
            "Po dokončení testu se vydá nový certifikát a starý se archivuje.",
        ],
        aktualizovano: "2026-07-02",
    },
]

//TODO: Záložka "Legislativa a normy" – čtecí pohled nad daty spravovanými v CMS ===========
//BUG: V produkci by toto mělo číst ze STEJNÉHO backendu/datasetu jako CMS Legislativa
//     (viz DokumentaceApi.js -> nacistLegislativuStudent), aby se data nezadávala duplicitně.
export const mockLegislativaStudent = [
    {
        id: "zakon-262-2006",
        cisloPredpisu: "262/2006 Sb.",
        nazev: "Zákoník práce",
        oblast: "pracovnepravni",
        posledniZmena: "2024-07-01",
        odkaz: "https://www.e-sbirka.cz/sb/2006/262",
        shrnuti: "Základní pracovněprávní vztahy, práva a povinnosti zaměstnavatelů a zaměstnanců.",
    },
    {
        id: "zakon-309-2006",
        cisloPredpisu: "309/2006 Sb.",
        nazev: "Zákon o zajištění dalších podmínek BOZP",
        oblast: "bozp",
        posledniZmena: "2023-01-01",
        odkaz: "https://www.e-sbirka.cz/sb/2006/309",
        shrnuti: "Požadavky na pracoviště, pracovní prostředky a organizaci práce z hlediska bezpečnosti.",
    },
    {
        id: "narizeni-361-2007",
        cisloPredpisu: "361/2007 Sb.",
        nazev: "Nařízení vlády o ochraně zdraví při práci",
        oblast: "bozp",
        posledniZmena: "2024-04-01",
        odkaz: "https://www.e-sbirka.cz/sb/2007/361",
        shrnuti: "Hygienické limity a podmínky ochrany zdraví na pracovišti.",
    },
    {
        id: "zakon-133-1985",
        cisloPredpisu: "133/1985 Sb.",
        nazev: "Zákon o požární ochraně",
        oblast: "pozarni-ochrana",
        posledniZmena: "2023-01-01",
        odkaz: "https://www.e-sbirka.cz/sb/1985/133",
        shrnuti: "Povinnosti v oblasti požární ochrany na pracovišti i mimo něj.",
    },
    {
        id: "zakon-258-2000",
        cisloPredpisu: "258/2000 Sb.",
        nazev: "Zákon o ochraně veřejného zdraví",
        oblast: "hygiena",
        posledniZmena: "2024-01-01",
        odkaz: "https://www.e-sbirka.cz/sb/2000/258",
        shrnuti: "Práva a povinnosti v oblasti ochrany a podpory veřejného zdraví.",
    },
]

//TODO: Záložka "Materiály ke stažení" – doplňkové podklady ke kurzům =====================
export const mockMaterialy = [
    {
        id: "material-checklist-bozp",
        nazev: "Checklist – vstupní kontrola pracoviště BOZP",
        kategorie: "bozp",
        typ: "PDF",
        velikost: "412 KB",
        aktualizovano: "2026-06-10",
        odkaz: "/materialy/checklist-bozp-vstupni-kontrola.pdf",
    },
    {
        id: "material-evakuace",
        nazev: "Evakuační plán – vzorový formulář",
        kategorie: "pozarni-ochrana",
        typ: "PDF",
        velikost: "298 KB",
        aktualizovano: "2026-05-22",
        odkaz: "/materialy/evakuacni-plan-vzor.pdf",
    },
    {
        id: "material-chemicke-karty",
        nazev: "Bezpečnostní listy – šablona pro chemické látky",
        kategorie: "chemicke-latky",
        typ: "DOCX",
        velikost: "88 KB",
        aktualizovano: "2026-04-18",
        odkaz: "/materialy/bezpecnostni-list-sablona.docx",
    },
    {
        id: "material-skoleni-zaznam",
        nazev: "Záznam o provedeném školení – tiskový formulář",
        kategorie: "pracovnepravni",
        typ: "PDF",
        velikost: "156 KB",
        aktualizovano: "2026-03-05",
        odkaz: "/materialy/zaznam-o-skoleni.pdf",
    },
]
