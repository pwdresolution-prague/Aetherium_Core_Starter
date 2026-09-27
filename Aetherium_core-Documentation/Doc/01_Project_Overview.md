**AETHERIUM CORE - STARTER**   — Minimum Viable Product - Project Overview
**Verze:**  1.0.0 Starter | Status: Ve vývoji | **UI/UX** - Aetherium Blue Shade 2024-2026


------------------------------------------------------------------------------------------------------------
1. Vize a účel E-learningové platformy **LMS**

**Aetherium Core** - starter, je modifikovatelný edukační ekosystém navržený jako B2B SaaS platforma.
Vývoj blueprintu, je schématicky vytvořen s predikcí široké oblasti vzdělávání tržních segmentů.

**Aetherium Core** - je koncipováno v stupňovaném licenčním modelu, který umožňuje při plánu **Starter**, funkční škálovaní malých projektů, specializovaných školících center, lokálních autoškol a poskytovatele odborných kurzů.

**Aetherium Core**  - v důsledku konfigurabilního obsahu není platforma omezena pouze, na jeden typ školení, ale pokrývá kompletní spektrum komerčního, legislativního i profesního vzdělávání.


------------------------------------------------------------------------------------------------------------
2. Architektura E-learningové platformy **LMS**

**První** základní vrstva modulární architektury, je postavena, na systémové topologii která disponuje 4. bazálními zónami: **Multi-Tenant Role-Based Access Control (RBAC)**

1. - ADMIN
2. - SUBSCRIBER
3. - CLIENT
4. - STUDENT

ODKAZ: [Role a Uživatelé](./03_User_Roles.md)



**Druhá** základní vrstva modulární architektury, je podrobný rozpis technologického FrontEnd stacku.
Základní webový Frontend Core & Build System garantující vysoký výkon a lehkou přenositelnost.
1. - **HTML5 / CSS3 / Vanilla JS:**
2. - **Vite**N
3. - **Lucide** - Moderní, konzistentní sada vektorových ikon.
4. - **GSAP** - Profesionální knihovna pro pokročilé a plynulé webové animace.
5. - **Lenis** - Knihovna pro plynulé a prémiové scrollování (smooth scrolling UI/UX).
6. - **Chart.js** - Vizualizační engine pro vykreslování analytických grafů a reportů.
7. - **Babylon.js** - Kompletní 3D renderovací engine pro pohlcující interaktivní a imerzivní výukové prvky.
8. - **TipTap Editor** - Headless WYSIWYG editor pro tvorbu a úpravu výukových textů, kurzů a poznámek.
9. - **Quill** Sekundární/doplňkový textový editor pro specifické formuláře a rozhraní.
10. - **LangChain** - Orchestrační framework pro integraci LLM modelů, AI agentů a řetězení promptů.
11. - **TensorFlow.js & Universal Sentence Encoder** - Sémantická analýza a sémantické vyhledávání.
12. - **Danfo.js & Numeric** - Pokročilé matematické operace, maticové výpočty a manipulace s datovými rámci (DataFrames) pro analytický procesing.
