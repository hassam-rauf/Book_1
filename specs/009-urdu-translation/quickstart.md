# Quickstart: Urdu Translation (F8)

## Prerequisites

- `GEMINI_API_KEY` set in `backend/.env`
- All 19 English chapters present in `book-site/docs/`
- `python -m pip install google-generativeai` (already in requirements.txt)

---

## Scenario 1: Translate a Single Chapter

```bash
cd backend
python scripts/translate_chapters.py --slug module-1/ch01-intro-physical-ai
```

**Expected output**:
```
[INFO] Translating module-1/ch01-intro-physical-ai...
[OK]   TRANSLATED: module-1/ch01-intro-physical-ai (12 code blocks preserved, 3420 words)
Summary: 1 translated, 0 skipped, 0 failed
```

**Expected file**: `book-site/static/translations/ur/module-1/ch01-intro-physical-ai.md`

**Verify Urdu content**:
```bash
head -20 book-site/static/translations/ur/module-1/ch01-intro-physical-ai.md
# Should show Urdu frontmatter (title in Urdu) and RTL div wrapper
```

---

## Scenario 2: Translate All Chapters

```bash
cd backend
python scripts/translate_chapters.py --all
```

**Expected summary**: `Translated: 19, Skipped: 0, Failed: 0`

**Verify**: `ls book-site/static/translations/ur/**/*.md | wc -l` → 19

---

## Scenario 3: Skip Existing, Force Re-translate

```bash
# Second run — should skip all existing
python scripts/translate_chapters.py --all
# Output: Translated: 0, Skipped: 19, Failed: 0

# Force re-translate a single chapter
python scripts/translate_chapters.py --slug module-1/ch01-intro-physical-ai --force
# Output: Translated: 1, Skipped: 0, Failed: 0
```

---

## Scenario 4: Student Toggles to Urdu

1. Start Docusaurus dev server: `cd book-site && npm start`
2. Open `http://localhost:3000/Book_1/docs/module-1/ch01-intro-physical-ai`
3. Click the `[ EN | UR ]` toggle → `UR` becomes highlighted
4. **Expected**: Chapter body switches to Urdu text, rendered right-to-left
5. Code blocks remain in English with no Urdu characters
6. Navigate to a different chapter — it also loads in Urdu (preference persisted)
7. Reload page — still in Urdu

---

## Scenario 5: Fallback for Untranslated Chapter

1. Set language to Urdu (toggle or `localStorage.setItem('preferred-lang', 'ur')`)
2. Navigate to a chapter with no Urdu file in `book-site/static/translations/ur/`
3. **Expected**: English content shown + dismissible "This chapter is not yet translated to Urdu" notice
4. Toggle back to English → notice disappears; English content shown normally

---

## Scenario 6: Language Preference Persists Across Sessions

1. Toggle to Urdu
2. Close browser tab, reopen `http://localhost:3000/Book_1/docs/module-1/ch01-intro-physical-ai`
3. **Expected**: Page loads in Urdu without needing to toggle again
4. Check: `localStorage.getItem('preferred-lang')` → `"ur"`

---

## Verification Checklist

- [ ] All 19 Urdu files exist in `book-site/static/translations/ur/`
- [ ] Each file has `<div dir="rtl">` wrapper for prose sections
- [ ] Code blocks in translated files contain no Urdu characters
- [ ] Toggle persists in localStorage across navigations and reloads
- [ ] Fallback notice shown for chapters without Urdu files
- [ ] RTL layout does not affect sidebar, navbar, or footer
- [ ] Switching EN→UR→EN works without page reload errors
