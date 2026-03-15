# Contract: Translation Pipeline CLI

## Command

```bash
python backend/scripts/translate_chapters.py [--slug <slug>] [--all] [--force] [--docs-dir <path>] [--out-dir <path>]
```

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `--slug` | No* | — | Translate a single chapter (e.g., `module-1/ch01-intro-physical-ai`) |
| `--all` | No* | — | Translate all chapters found in `--docs-dir` |
| `--force` | No | false | Overwrite existing Urdu files |
| `--docs-dir` | No | `../book-site/docs` | Path to English chapter docs (relative to script location) |
| `--out-dir` | No | `../book-site/static/translations/ur` | Output directory for Urdu files |

*Either `--slug` or `--all` must be provided.

## Behavior

### Single Chapter (`--slug`)

1. Read `{docs-dir}/{slug}.md`
2. If `{out-dir}/{slug}.md` exists and `--force` not set → skip, print `SKIPPED: {slug} (already exists)`
3. Call Gemini 2.0 Flash with translation prompt
4. Write output to `{out-dir}/{slug}.md`, creating parent directories as needed
5. Print `TRANSLATED: {slug} ({N} code blocks preserved)`

### All Chapters (`--all`)

1. Glob `{docs-dir}/**/*.md` to find all chapter files
2. For each chapter, apply single-chapter logic
3. Print summary: `Translated: N, Skipped: M, Failed: P`

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All requested translations completed (or skipped) |
| 1 | One or more translations failed (Gemini error, file error) |
| 2 | Invalid arguments |

## Output Format (stdout)

```
[INFO] Translating module-1/ch01-intro-physical-ai...
[OK]   TRANSLATED: module-1/ch01-intro-physical-ai (12 code blocks preserved, 3420 words)
[SKIP] SKIPPED: module-1/ch02-ros2-fundamentals (file exists, use --force to overwrite)
[FAIL] FAILED: module-2/ch06-gazebo-simulation (Gemini quota exceeded)
---
Summary: 1 translated, 1 skipped, 1 failed
```

## Environment Variables Required

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Gemini API key (same as backend) |

---

# Contract: Language Toggle Frontend Component

## Component: `LanguageWrapper`

### Props

```typescript
interface LanguageWrapperProps {
  englishContent: React.ReactNode;  // PersonalizationWrapper + default content
}
```

### Behavior

1. **On mount**: Read `localStorage.getItem('preferred-lang')` → `'en'` (default) or `'ur'`
2. **Language toggle button**: Shows current language; clicking toggles and updates `localStorage`
3. **If `lang === 'en'`**: Render `englishContent` (PersonalizationWrapper runs normally)
4. **If `lang === 'ur'`**:
   a. Extract `chapterSlug` from `window.location.pathname` (strip `/Book_1/docs/` prefix)
   b. Fetch `GET /Book_1/translations/ur/{chapterSlug}.md` (static file)
   c. **On success (200)**: Render content with `react-markdown` inside `<div style={{ direction: 'rtl', textAlign: 'right' }}>`
   d. **On 404 or error**: Render `englishContent` + dismissible "This chapter is not yet translated to Urdu" notice
5. **Rendering states**:
   - Loading: show `englishContent` with loading spinner next to toggle button
   - Loaded Urdu: show Urdu markdown with RTL wrapper + toggle button
   - Fallback: show `englishContent` + "not yet translated" notice + toggle button

### Static File URL Pattern

```
GET /Book_1/translations/ur/{chapter_slug}.md

Examples:
  /Book_1/translations/ur/intro.md
  /Book_1/translations/ur/module-1/ch01-intro-physical-ai.md
  /Book_1/translations/ur/appendices/a1-hardware-setup.md
```

**Response on success**: `200 OK`, `Content-Type: text/markdown` (or `text/plain`)
**Response when not translated**: `404 Not Found` → fallback to English

### Language Toggle Button UI

```
[ EN | UR ]  — shows current selection highlighted
```

- Position: above the chapter content, right-aligned
- English selected: "EN" bold/highlighted, "UR" dimmed
- Urdu selected: "UR" bold/highlighted, "EN" dimmed
- No external icons, minimal styling using existing Docusaurus CSS variables
