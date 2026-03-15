# Tasks: Urdu Translation (F8)

**Input**: Design documents from `/specs/009-urdu-translation/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story (US1–US4), preceded by Setup and Foundational phases.

**Key architectural decisions**:
- Urdu files stored in `book-site/static/translations/ur/` (static asset delivery — no Docusaurus i18n)
- `LanguageWrapper` wraps `PersonalizationWrapper` in existing `DocItem/Content` swizzle
- `preferred-lang` in `localStorage` drives language selection (`"en"` | `"ur"`)
- Translation pipeline calls Gemini 2.0 Flash directly (translator subagent is CLI-only)
- RTL via `style={{ direction: 'rtl', textAlign: 'right' }}` on markdown container div (body-scoped)

## Format: `[ID] [P?] [Story?] Description`

---

## Phase 1: Setup

**Purpose**: Establish directory structure and verify dependencies.

- [X] T001 Create `book-site/static/translations/ur/.gitkeep` — establish the Urdu static translations directory in git (parent dirs: `book-site/static/translations/ur/`)
- [X] T002 [P] Verify `backend/scripts/` directory exists — create it if absent (will hold `translate_chapters.py`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Understand the existing swizzle component before modifying it; no new code in this phase.

- [X] T003 Read and review `book-site/src/theme/DocItem/Content/index.tsx` (existing F7 swizzle) and `book-site/src/components/Personalization/PersonalizationWrapper.tsx` to understand the current component tree before adding `LanguageWrapper` as the outer wrapper

**Checkpoint**: Component tree understood — LanguageWrapper will wrap PersonalizationWrapper; `LanguageWrapper` accepts `englishContent: React.ReactNode` prop.

---

## Phase 3: User Story 1 — Switch Chapter Language to Urdu (Priority: P1) 🎯 MVP

**Goal**: Student clicks language toggle → chapter body switches to Urdu, rendered RTL. Preference persists across navigations and reloads.

**Independent Test**: Navigate to a chapter that has a Urdu file in `book-site/static/translations/ur/`; click `[UR]` toggle → body shows Urdu RTL; code blocks still English; reload → still Urdu; navigate to another chapter → still Urdu.

- [X] T004 [US1] Create `book-site/src/components/Translation/LanguageWrapper.tsx` — React component that:
  - Reads `localStorage.getItem('preferred-lang')` on mount (default `'en'`); stores in state
  - Extracts `chapterSlug` from `window.location.pathname` by stripping `/Book_1/docs/` prefix (same pattern as `PersonalizationWrapper.tsx`)
  - Renders `[EN | UR]` toggle button (inline styles, no CSS file); clicking toggles state and writes to `localStorage.setItem('preferred-lang', newLang)`
  - When `lang === 'en'`: renders `englishContent` prop unchanged
  - When `lang === 'ur'` + `chapterSlug` available: `useEffect` fetches `${window.location.origin}/Book_1/translations/ur/${chapterSlug}.md`; on success renders content with `<ReactMarkdown remarkPlugins={[remarkGfm]}>` inside `<div style={{ direction: 'rtl', textAlign: 'right' }}>` with SyntaxHighlighter for code blocks (same pattern as `PersonalizationWrapper.tsx`)
  - Uses `useState` for: `lang`, `urduMd` (string|null), `loading` (bool), `fallbackNotice` (bool)
  - Import: `react-markdown`, `remark-gfm`, `react-syntax-highlighter/dist/cjs/styles/prism` (all already in book-site)
- [X] T005 [US1] Update `book-site/src/theme/DocItem/Content/index.tsx` — replace current return value to wrap PersonalizationWrapper with LanguageWrapper:
  ```tsx
  import LanguageWrapper from '@site/src/components/Translation/LanguageWrapper';
  // ...
  return (
    <LanguageWrapper
      englishContent={<PersonalizationWrapper defaultContent={<Content {...props} />} />}
    />
  );
  ```
  Keep all existing imports; add only the LanguageWrapper import.

**Checkpoint**: Open any translated chapter → `[EN | UR]` toggle visible; click UR → Urdu RTL renders; click EN → English restores; localStorage['preferred-lang'] set correctly.

---

## Phase 4: User Story 2 — Fallback to English for Untranslated Content (Priority: P1)

**Goal**: If no Urdu file exists for the current chapter, English content shows with a "not yet translated" notice. No broken pages.

**Independent Test**: Set `localStorage.setItem('preferred-lang', 'ur')`; navigate to a chapter with no Urdu file → English content shown + dismissible "This chapter is not yet translated to Urdu" notice.

- [X] T006 [US2] Add fallback handling in `book-site/src/components/Translation/LanguageWrapper.tsx` — extend the `useEffect` fetch block:
  - On `response.status === 404` or network error → set `urduMd = null` and `fallbackNotice = true`; render `englishContent` with a dismissible banner: "📝 This chapter is not yet available in Urdu." with an `×` dismiss button (same dismissible pattern as PersonalizationWrapper's notice)
  - On loading state (fetch in-flight and no urduMd yet) → render `englishContent` with a small spinner/text next to toggle: "Loading Urdu…"

**Checkpoint**: Chapter without Urdu file with lang=ur → English shows + notice visible → click × → notice gone → reload → notice returns (preference still ur but no file).

---

## Phase 5: User Story 3 — Translation Pipeline Generates Urdu Files (Priority: P2)

**Goal**: Operator runs a Python CLI to translate all 19 English chapters to Urdu, writing files to `book-site/static/translations/ur/`. Idempotent — skips existing files unless `--force`.

**Independent Test**: Run `python backend/scripts/translate_chapters.py --slug intro` → file appears at `book-site/static/translations/ur/intro.md` → contains Urdu prose + `<div dir="rtl">` wrappers + English code blocks → toggle in browser shows Urdu content for that chapter.

- [X] T007 [US3] Create `backend/scripts/translate_chapters.py` — full CLI translation pipeline:
  - `argparse` with `--slug` (single chapter), `--all` (all chapters), `--force` (overwrite), `--docs-dir` (default `../book-site/docs`), `--out-dir` (default `../book-site/static/translations/ur`)
  - `GEMINI_API_KEY` loaded from environment (raise clear error if missing)
  - `_build_translation_prompt(chapter_md: str) -> str` — prompt encodes all translator rules:
    1. Translate all prose to Urdu
    2. Keep all code blocks exactly unchanged (no Urdu in code)
    3. Technical terms: English term + Urdu transliteration in parentheses on first use (e.g., `ROS 2 (آر او ایس ٹو)`)
    4. Headings: Urdu heading + English in parentheses
    5. Wrap each prose section in `<div dir="rtl">...</div>`; code blocks outside these divs
    6. Frontmatter: keep keys in English, translate `title` and `description` values to Urdu
    7. Return ONLY translated markdown, no commentary
  - `translate_single(slug, docs_dir, out_dir, force, model) -> str` — reads source, calls Gemini, writes output with `os.makedirs(parent, exist_ok=True)`; returns status (`translated`|`skipped`|`failed`)
  - `find_all_chapters(docs_dir) -> list[str]` — globs `docs_dir/**/*.md`, returns slugs relative to `docs_dir` (strips `.md`)
  - `main()` — calls translate_single per chapter; prints `[OK]/[SKIP]/[FAIL]` per chapter + summary line
  - Exit code 0 if all ok/skipped; 1 if any failed; 2 if bad args
- [X] T008 [P] [US3] Run `python backend/scripts/translate_chapters.py --slug intro` (with `GEMINI_API_KEY` set) and verify: `book-site/static/translations/ur/intro.md` exists; file contains `<div dir="rtl">`; no English prose left untranslated; all code blocks intact

**Checkpoint**: Translation pipeline produces valid Urdu markdown that LanguageWrapper can display correctly.

---

## Phase 6: User Story 4 — Switch Back to English (Priority: P2)

**Goal**: Bidirectional toggle — UR→EN restores English content; localStorage updated; subsequent pages load in English.

**Independent Test**: Toggle to UR → Urdu renders. Toggle back to EN → English/PersonalizationWrapper renders. `localStorage.getItem('preferred-lang')` → `"en"`. Navigate to another chapter → loads in English.

- [X] T009 [US4] Verify bidirectional toggle in `book-site/src/components/Translation/LanguageWrapper.tsx` — confirm that the toggle handler sets `lang = lang === 'ur' ? 'en' : 'ur'` and calls `localStorage.setItem('preferred-lang', newLang)`; when switching en→ur→en, `urduMd` state is cleared and `englishContent` renders without fallback notice. If any edge case found, fix in LanguageWrapper.tsx.

**Checkpoint**: EN→UR→EN round-trip works; localStorage reflects current state; navigating after switching loads correct language.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Run batch translation, verify RTL scoping, and validate all quickstart scenarios.

- [X] T010 [P] Run full batch translation: `python backend/scripts/translate_chapters.py --all` — translate all 19 chapters; verify `ls book-site/static/translations/ur/**/*.md | wc -l` → 19 files
- [X] T011 [P] Verify RTL isolation — inspect rendered chapter in browser dev tools: `direction: rtl` must appear ONLY on the markdown container div inside LanguageWrapper, NOT on `<html>`, `<body>`, `.navbar`, `.sidebar`, or footer elements
- [X] T012 Run quickstart.md scenarios 1–6 end-to-end and confirm all pass; mark tasks.md complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (directory must exist to verify)
- **US1 (Phase 3)**: Depends on Foundational — must understand existing swizzle before modifying
- **US2 (Phase 4)**: Depends on US1 (T004 creates LanguageWrapper; T006 extends it — same file, sequential)
- **US3 (Phase 5)**: Independent of US1/US2 — translation script is backend only; T008 (run script) needs T007 complete
- **US4 (Phase 6)**: Depends on US1 (T004 must implement toggle); verification only
- **Polish (Phase 7)**: Depends on US1–US4 complete + T007 (script) complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — creates LanguageWrapper + updates swizzle
- **US2 (P1)**: After US1 — extends same LanguageWrapper file; MUST be sequential with T004
- **US3 (P2)**: After Setup only — completely independent backend script
- **US4 (P2)**: After US1 — verification of existing toggle code

### Parallel Opportunities

- T001 + T002 (Setup): run in parallel — different paths
- T003 (read existing files) + T007 (write translation script): parallel — different codebases
- T007 (create script) + T004 (create LanguageWrapper): parallel — different files
- T008 (run translation) + T009 (verify toggle): parallel after T004 + T007 complete
- T010 + T011 (Polish): parallel — different concerns

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003)
3. Complete Phase 3: US1 (T004–T005) — toggle + Urdu rendering
4. Complete Phase 4: US2 (T006) — fallback notice
5. **STOP and VALIDATE**: Toggle works; fallback works with dummy/missing file
6. Proceed to US3 (translation script) → run for one chapter → verify toggle shows Urdu
7. US4 (verification) → Polish

### Incremental Delivery

1. Setup + Foundational → directory + component tree understood
2. US1 → `[EN | UR]` toggle switches content (needs ≥1 Urdu file to test fully)
3. US2 → graceful fallback for chapters without Urdu files
4. US3 → translation pipeline generates Urdu files; US1 now fully functional
5. US4 → bidirectional toggle verified
6. Polish → all 19 chapters translated; RTL scoped; quickstart passes

---

## Notes

- [P] tasks operate on different files — safe to run in parallel
- T004 and T006 both modify `LanguageWrapper.tsx` — must run T004 BEFORE T006
- Translation script uses `GEMINI_API_KEY` from environment; ~20–30s per chapter on Gemini free tier
- `book-site/static/` files are available at `/Book_1/{path}` in the deployed site (baseUrl: '/Book_1/')
- chapterSlug extraction: `window.location.pathname.slice(window.location.pathname.indexOf('/Book_1/docs/') + '/Book_1/docs/'.length).replace(/\/$/, '')`
- react-markdown, remark-gfm, react-syntax-highlighter already declared in book-site/package.json (added by F7)
- Translator subagent (`.claude/agents/translator.md`) defines the translation rules — T007's `_build_translation_prompt` must replicate them exactly
