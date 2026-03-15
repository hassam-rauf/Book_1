# Implementation Plan: Urdu Translation (F8)

**Branch**: `009-urdu-translation` | **Date**: 2026-03-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-urdu-translation/spec.md`

## Summary

Pre-generate Urdu translations of all 19 textbook chapters via a Python CLI that calls Gemini 2.0 Flash directly. Store translated markdown files in `book-site/static/translations/ur/`. Add a `LanguageWrapper` React component that reads the student's language preference from `localStorage` and swaps the chapter body to Urdu (rendered RTL with `react-markdown`) when selected — wrapping the existing `PersonalizationWrapper` in the swizzled `DocItem/Content`.

## Technical Context

**Language/Version**: Python 3.11 (translation script) + TypeScript/React (Docusaurus frontend)
**Primary Dependencies**: `google-generativeai` (Gemini, already in requirements.txt), `react-markdown` + `remark-gfm` (already in book-site), `glob` (stdlib)
**Storage**: `book-site/static/translations/ur/` — static files served by Docusaurus/GitHub Pages; no database
**Testing**: Manual verification (quickstart.md scenarios); no automated test suite
**Target Platform**: Docusaurus 3.9.2 on GitHub Pages; Python 3.11 script runs locally/in CI
**Performance Goals**: Language toggle < 1s (static file fetch, ~50KB per chapter); batch translation ~30s/chapter (Gemini)
**Constraints**: Free-tier Gemini API (rate limits); static files must be < 100MB total; RTL applies to body only
**Scale/Scope**: 19 chapters, ~3000–5000 words each; single operator runs translation; N concurrent students reading

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | spec.md + plan.md + tasks.md before any code |
| II. Smallest Viable Diff | ✅ PASS | New files only: 1 script, 1 component, 1 config line, static files |
| III. Content Accuracy First | ✅ PASS | Translation accuracy is AI-generated; technically correct code blocks preserved |
| IV. Provider-Agnostic Service Layer | ✅ PASS | Translation script uses Gemini via `genai` import only in script itself; no service layer needed (one-shot script, not a service) |
| V. Free-Tier Resilient | ✅ PASS | Gemini free tier; no new services; static files on GitHub Pages (free); translation is a one-time operation |
| VI. Security by Default | ✅ PASS | `GEMINI_API_KEY` via env var; no user input to LLM; no path traversal (slug sanitized) |
| VII. Subagent Reusability | ✅ PASS | Translator subagent exists; translation script replicates its prompt rules (subagents are CLI-only, cannot be called from Python) |

**Post-design re-check**: All gates PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/009-urdu-translation/
├── plan.md              ✅ This file
├── research.md          ✅ 6 decisions documented
├── data-model.md        ✅ Urdu file entity + file tree
├── quickstart.md        ✅ 6 test scenarios
├── contracts/
│   └── translation-pipeline.md  ✅ CLI + LanguageWrapper contracts
└── tasks.md             # Created by /sp.tasks (next)
```

### Source Code (repository root)

```text
backend/
└── scripts/
    └── translate_chapters.py    # NEW: Translation pipeline CLI

book-site/
├── static/
│   └── translations/
│       └── ur/                  # NEW: Pre-generated Urdu markdown files
│           ├── intro.md
│           ├── module-1/*.md    (5 chapters)
│           ├── module-2/*.md    (2 chapters)
│           ├── module-3/*.md    (3 chapters)
│           ├── module-4/*.md    (3 chapters)
│           ├── capstone/*.md    (1 chapter)
│           └── appendices/*.md  (5 chapters)
└── src/
    ├── components/
    │   └── Translation/
    │       └── LanguageWrapper.tsx   # NEW: Language toggle + Urdu renderer
    └── theme/
        └── DocItem/
            └── Content/
                └── index.tsx         # MODIFY: wrap with LanguageWrapper
```

**Structure Decision**: Web application (Docusaurus frontend + Python backend script). New files only — no modifications to existing backend services. The `DocItem/Content` swizzle already exists (F7) and will be updated to add `LanguageWrapper` as the outer wrapper.

## Architecture Decisions

### AD-1: Static File Delivery (not Docusaurus i18n)

Urdu files stored in `book-site/static/translations/ur/` and served as static assets. **Not** using Docusaurus i18n locale `ur` because:
- i18n requires a second build pass, doubling CI time
- i18n uses URL-based locale switching (`/ur/docs/...`) which changes URLs
- Static file approach reuses the F7 swizzle pattern with zero Docusaurus config changes
- `book-site/static/` files are accessible at `/Book_1/translations/ur/...` on GitHub Pages

### AD-2: LanguageWrapper Wraps PersonalizationWrapper

Component hierarchy in `DocItem/Content/index.tsx`:
```
LanguageWrapper
  ├── [if ur] → fetch static Urdu file → react-markdown with RTL
  └── [if en] → PersonalizationWrapper (F7)
                  └── defaultContent = <Content {...props} />
```
This keeps the two features orthogonal: English content may be personalized; Urdu content is pre-translated only.

### AD-3: Translation Script Calls Gemini Directly

`translate_chapters.py` calls `genai.GenerativeModel("gemini-2.0-flash").generate_content(prompt)` with a prompt encoding all translator subagent rules. Translator subagent is Claude Code CLI-only and cannot be called from Python.

### AD-4: RTL via Inline Style on Markdown Container

```tsx
<div style={{ direction: 'rtl', textAlign: 'right', fontFamily: 'serif' }}>
  <ReactMarkdown ...>{urduContent}</ReactMarkdown>
</div>
```
Scoped to chapter body only; sidebar/navbar/footer remain LTR.

### AD-5: Language Preference Key

`localStorage` key: `preferred-lang`, values: `"en"` | `"ur"`, default: `"en"`.

## Data Flow

### Translation Pipeline (one-time operator operation)

```
backend/scripts/translate_chapters.py
  ↓ reads
book-site/docs/{module}/{slug}.md  (English source)
  ↓ calls
Gemini 2.0 Flash API (translation prompt)
  ↓ writes
book-site/static/translations/ur/{module}/{slug}.md  (Urdu output)
```

### Student Reading Urdu Chapter (runtime)

```
Student opens chapter URL
  ↓
LanguageWrapper mounts
  ↓ reads
localStorage['preferred-lang'] → 'ur'
  ↓ fetches
GET /Book_1/translations/ur/{module}/{slug}.md  (static file)
  ↓ 200 OK → render with react-markdown + RTL style
  ↓ 404     → fallback to PersonalizationWrapper (English)
```

## Complexity Tracking

No constitution violations — no entries required.
