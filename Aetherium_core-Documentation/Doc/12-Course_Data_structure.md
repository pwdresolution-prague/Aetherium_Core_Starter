# 12 — Course Data Structure

**Stav:** Struktura kurzu dle CMS editoru (2026-09-29)  
**Zdroj:** `PageTypes.js`, `InputEditor.js`

---

## 1. Course state (editor)

```js
courseState = {
  title: string,           // InputTitleId
  type: string | null,     // SelectCourseId
  pages: Page[],
  currentPageIndex: number
}
```

Payload při uložení:

```js
{
  title,
  type,
  pages,
  status: 'draft' | 'published'
}
```

---

## 2. Page objekt

```js
{
  id: string,      // crypto.randomUUID()
  type: PageType,
  data: object     // dle typu
}
```

---

## 3. PAGE_TYPES registr

| type | Label | Icon | data (createEmpty) |
|------|-------|------|---------------------|
| `content` | Textový obsah | 📝 | `{ html: '' }` — TipTap |
| `question_single` | Otázka – jedna správná | ☑️ | otázka + 4 answers |
| `question_multi` | Otázka – více správných | ✅ | otázka + 4 answers |
| `true_false` | Ano / Ne | ✍️ | `{ text, correct: true }` |
| `open_answer` | Otevřená otázka | ✍️ | `{ text, sampleAnswer }` |
| `media` | Obrázek / Video | 🖼️ | `{ mediaUrl, mediaType: 'image', caption }` |

### Answers struktura (single / multi)

```js
{
  text: '',
  answers: [
    { id: uuid, text: '', correct: false },
    // default 4 položky
  ]
}
```

---

## 4. Renderování

- `content` → TipTap (`setEditorContent`, toolbar)  
- ostatní typy → `PAGE_TYPES[type].render(container, page.data)`  
  - SingleChoiceRenderer, MultiChoiceRenderer  
  - TrueFalseRenderer, OpenAnswerRenderer, MediaRenderer  

Přidání nového typu = nový renderer + jeden záznam do `PAGE_TYPES`.

---

## 5. Validace před publikací

| Typ | Pravidlo |
|-----|----------|
| content | `html` nesmí být prázdné |
| question_single / multi | text otázky + alespoň jedna `correct` |
| true_false | text tvrzení |
| open_answer | text otázky |
| media | `mediaUrl` |

Kurzy bez title / type / pages nelze publikovat.

---

## 6. Student-side meta (z dřívějších návrhů)

Příklad absencí / pokusů:

```js
{
  courseId: "...",
  meta: {
    score: 100,
    attempt: 1,
    duration_seconds: 450,
    status: "active",
    is_recertification: true
  }
}
```

---

## 7. TODO

- Persist do Supabase (insert/update z `saveConcept` / `publishCourse`)  
- Verzování kurzů  
- Vazba na legislativní šablony a certifikáty  

---

*Související: [13-FrontendAdminLogic.md](./13-FrontendAdminLogic.md), [04_Business_Logic.md](./04_Business_Logic.md)*
