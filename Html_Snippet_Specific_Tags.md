## HTML Tagy – Specifické & Vzácné Elementy

Výborná otázka! Ano, HTML se stále vyvíjí (Living Standard přes WHATWG), takže nové věci přibývají. Pojďme na to systematicky.

---

### 🔷 RODIČOVSKÉ / STRUKTURÁLNÍ TAGY (specifické)

Tyhle jsou kontejnery se silnou sémantikou — **ne jen `<div>`**:

```html
<!-- DIALOG – nativní modál, má vlastní accessibility stack -->
<dialog id="mainModal" open>
  <!-- open atribut = viditelný, bez JS! -->
</dialog>

<!-- DETAILS + SUMMARY – nativní accordion bez JS -->
<details open>
  <summary>Klikni pro rozbalení</summary>
  <p>Obsah...</p>
</details>

<!-- FIELDSET – logická skupina formulářových prvků -->
<fieldset>
  <legend>Osobní údaje</legend>
</fieldset>

<!-- FIGURE + FIGCAPTION – sémantický wrapper pro media -->
<figure>
  <img src="..." alt="...">
  <figcaption>Popis obrázku</figcaption>
</figure>

<!-- ARTICLE – samostatný, znovu použitelný obsah -->
<article>
  <header>...</header>
  <footer>...</footer>
</article>

<!-- ASIDE – vedlejší obsah (sidebar, tooltip panel) -->
<aside aria-label="Info panel">...</aside>

<!-- MAIN – jeden per page, hlavní obsah -->
<main id="appRoot">...</main>

<!-- SEARCH – nový! HTML5.3 sémantický wrapper pro vyhledávání -->
<search role="search">
  <input type="search">
</search>

<!-- TEMPLATE – skrytý DOM fragment, klonuje se JS-em -->
<template id="cardTemplate">
  <div class="card">...</div>
</template>
```

---

### 🔶 INLINE & TEXTOVÉ TAGY (velmi specifické)

```html
<!-- MARK – zvýraznění (highlight), sémanticky jiné než <span> -->
<mark data-relevance="high">důležitý text</mark>

<!-- TIME – strojově čitelný čas -->
<time datetime="2025-06-22T14:30">dnes ve 14:30</time>

<!-- DATA – hodnota + strojová reprezentace -->
<data value="12345">Produkt Alpha</data>

<!-- METER – gauge, hodnota v rozsahu (ne progress!) -->
<meter min="0" max="100" low="30" high="80" optimum="90" value="72">
  72%
</meter>


<!--TODO: MATEMATICKÉ OPERACE ===================== >
<!-- PROGRESS – průběh operace -->
<progress max="100" value="45"></progress>

<!-- OUTPUT – výstup výpočtu, živý výsledek -->
<output name="result" for="inputA inputB">0</output>

<!-- VAR – proměnná v kódu nebo matematice -->
<var>x</var> = <var>y</var> + 1

<!-- KBD – keyboard input -->
<kbd>Ctrl</kbd> + <kbd>S</kbd>

<!-- SAMP – sample output z programu -->
<samp>Error 404: Not Found</samp>

<!-- BDI – izolace směru textu (Arabic/Hebrew mix) -->
<bdi>مرحبا</bdi>

<!-- WBR – optional line break hint -->
velmi<wbr>dlouhé<wbr>slovo

<!-- ABBR – zkratka s tooltipem -->
<abbr title="Learning Management System">LMS</abbr>
```

---

### 🔷 FORMULÁŘOVÉ TAGY (podceňované)

```html
<!-- DATALIST – nativní autocomplete dropdown -->
<input list="companies" id="company">
<datalist id="companies">
  <option value="Anthropic">
  <option value="Google">
</datalist>

<!-- OPTGROUP – skupiny v selectu -->
<select>
  <optgroup label="Kurzy">
    <option>BOZP základní</option>
  </optgroup>
</select>

<!-- INPUT speciální typy -->
<input type="color">           <!-- color picker -->
<input type="range" min="0" max="100">  <!-- slider -->
<input type="week">            <!-- week picker -->
<input type="month">           <!-- month picker -->
<input type="datetime-local">  <!-- date+time bez TZ -->

<!-- BUTTON s typem – důležité! -->
<button type="button">  <!-- NEVYMAŽE formulář -->
<button type="submit">
<button type="reset">
```

---

### 🔷 MEDIA & EMBEDDED TAGY

```html
<!-- PICTURE – responsivní obrázek s fallback -->
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.avif" type="image/avif">
  <img src="image.jpg" alt="fallback">
</picture>

<!-- VIDEO s tracks (titulky) -->
<video controls preload="metadata">
  <source src="video.mp4" type="video/mp4">
  <track kind="subtitles" src="cs.vtt" srclang="cs" label="Čeština">
</video>

<!-- CANVAS – 2D/WebGL kreslení -->
<canvas id="chartCanvas" width="800" height="400"></canvas>

<!-- OBJECT – embed PDF nebo jiný obsah -->
<object data="cert.pdf" type="application/pdf" width="100%" height="500px">
  <p>PDF není podporováno</p>
</object>
```

---

### 🔷 POKROČILÉ / NOVÉ TAGY (Living Standard)

```html
<!-- POPOVER API – nový! bez JS modál/tooltip (Chrome 114+) -->
<button popovertarget="myPop">Otevři</button>
<div id="myPop" popover>
  Obsah popoveru...
</div>

<!-- SLOT + SHADOW DOM (Web Components) -->
<template id="myComponent">
  <slot name="title">Default Title</slot>
  <slot name="content"></slot>
</template>

<!-- PORTAL – experimentální, iframe-like ale v DOM -->
<!-- zatím jen Chromium experimentální flag -->

<!-- SELECTLIST / SELECTMENU – navrhovaný nástupce <select> -->
<!-- stále ve fázi návrhu v Open UI -->
```

---

### ⚡ RELEVANCE PRO TVŮJ LMS / MODAL

Vzhledem k tomu co stavíš (real-time sběr dat do JS, modal přes 3/4 okna, formuláře):

```html
<!-- Tohle je základ tvého modalu místo div-ů: -->
<dialog id="enrollmentModal">
  <article>
    <header>
      <hgroup>
        <h2>Přihlášení ke kurzu</h2>
        <p>Vyplňte údaje</p>
      </hgroup>
    </header>

    <section aria-label="Firemní údaje">
      <fieldset>
        <legend>Firma</legend>
        <input list="aresCompanies" id="companyName">
        <datalist id="aresCompanies"></datalist>  <!-- ARES autocomplete! -->
        <output id="icoResult" for="companyName">–</output>
      </fieldset>
    </section>

    <section aria-label="Průběh registrace">
      <meter id="formCompletion" min="0" max="100" value="0"></meter>
      <progress id="submitProgress" max="100"></progress>
    </section>

    <footer>
      <button type="button" id="closeModal">Zrušit</button>
      <button type="submit">Odeslat</button>
    </footer>
  </article>
</dialog>
```

**Klíčová logika:**
- `<dialog>` má nativní `.showModal()` / `.close()` metody v JS — **žádný custom overlay**
- `<output>` je přímo navržen pro real-time propisy hodnot (tvůj use-case s ARES!)
- `<meter>` skvěle jako "completeness" indikátor formuláře
- `<datalist>` = autocomplete pro ARES bez knihovny
- `<hgroup>` = sémanticky správný wrapper pro nadpis + podnadpis

