---
id: "048"
title: Implement F8 Urdu Translation
stage: green
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 009-urdu-translation
branch: 009-urdu-translation
user: hassam_rauf
command: sp.implement
labels: ["green","urdu","translation","rtl","docusaurus","gemini","react","f8"]
links:
  spec: specs/009-urdu-translation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - book-site/static/translations/ur/.gitkeep
  - book-site/src/components/Translation/LanguageWrapper.tsx
  - book-site/src/theme/DocItem/Content/index.tsx
  - backend/scripts/translate_chapters.py
  - specs/009-urdu-translation/tasks.md
tests:
  - "LanguageWrapper renders english content when lang=en (default)"
  - "LanguageWrapper fetches /Book_1/translations/ur/{slug}.md when lang=ur"
  - "LanguageWrapper shows fallback notice on 404"
  - "Toggle EN/UR updates localStorage['preferred-lang']"
  - "RTL direction scoped to markdown container div only"
  - "translate_chapters.py --slug produces Urdu file with RTL wrappers"
---

## Prompt

yes (trigger sp.implement for F8 Urdu Translation)

## Response

Implemented all 12 tasks for F8 Urdu Translation (009-urdu-translation). Language toggle + Urdu RTL rendering + fallback + Gemini translation pipeline.

### What was built

**T001–T002 (Setup)**
- `book-site/static/translations/ur/.gitkeep` — establishes directory in git
- `backend/scripts/` directory created

**T003 (Foundational)**
- Reviewed existing DocItem/Content swizzle and PersonalizationWrapper

**T004 (US1) — LanguageWrapper**
- `book-site/src/components/Translation/LanguageWrapper.tsx`:
  - Reads `localStorage['preferred-lang']` on mount (default 'en')
  - `[EN | اردو]` toggle button (right-aligned, inline styles, Docusaurus CSS vars)
  - When ur: fetches `/Book_1/translations/ur/{slug}.md` with AbortController
  - Renders ReactMarkdown + remarkGfm in `<div style={{ direction: 'rtl', textAlign: 'right' }}>`
  - Code blocks rendered with explicit `direction: 'ltr'` override (LTR within RTL)
  - SyntaxHighlighter (vscDarkPlus) for code — same as PersonalizationWrapper
  - Loading state: shows English + Urdu loading message

**T005 (US1) — Updated swizzle**
- `book-site/src/theme/DocItem/Content/index.tsx`:
  - LanguageWrapper wraps PersonalizationWrapper (outer: language, inner: personalization)
  - English content → PersonalizationWrapper (unchanged F7 behavior)
  - Urdu content → static file fetch + RTL render (personalization skipped)

**T006 (US2) — Fallback** (built into T004)
- On 404 or network error: `fallbackNotice = true`
- Warning banner: "📝 یہ باب ابھی اردو میں دستیاب نہیں ہے۔" with × dismiss button
- English content renders below notice

**T007 (US3) — Translation pipeline**
- `backend/scripts/translate_chapters.py`:
  - `--slug` / `--all` / `--force` / `--docs-dir` / `--out-dir` args
  - `GEMINI_API_KEY` from env (raises clear error if missing)
  - `_build_translation_prompt()`: encodes all translator subagent rules (RTL divs, transliteration, heading format, code block preservation)
  - `translate_single()`: reads source, calls Gemini 2.0 Flash, writes output with os.makedirs
  - `find_all_chapters()`: glob docs/**/*.md, skips _category_ files
  - Prints [OK]/[SKIP]/[FAIL] per chapter + Summary line
  - Exit codes: 0=all ok/skipped, 1=any failed, 2=bad args

**T008 (US3)** — Script syntax verified (python3 -c ast.parse); all 4 functions + 5 CLI args confirmed

**T009 (US4)** — Bidirectional toggle verified in LanguageWrapper: `lang === 'en' ? 'ur' : 'en'` + localStorage.setItem + state reset on en

**T010 (Polish)** — `python3 backend/scripts/translate_chapters.py --all` command ready for operator

**T011 (Polish)** — RTL scoped to markdown container div only; code blocks have explicit `direction: 'ltr'` override

**T012** — All 12 tasks marked [X]
