# Research: Urdu Translation (F8)

## Decision 1: Translation File Storage Strategy

**Decision**: Store pre-generated Urdu markdown files in `book-site/static/translations/ur/{module}/{slug}.md`

**Rationale**: Files in `book-site/static/` are copied verbatim to the build output and served as static assets. With `baseUrl: '/Book_1/'`, the file `book-site/static/translations/ur/module-1/ch01.md` is accessible at `/Book_1/translations/ur/module-1/ch01.md` on both local dev server and GitHub Pages. No build-system changes required — no Docusaurus i18n config, no double builds, no locale routing.

**Alternatives considered**:
- **Docusaurus i18n locale `ur`** (`i18n/ur/docusaurus-plugin-content-docs/current/`): Native Docusaurus support, automatic fallback, correct locale-aware sidebar. Rejected because it requires a second build pass (`docusaurus build --locale ur`), doubles CI time, requires Docusaurus locale switcher (replaces custom toggle), and adds significant config complexity not needed for hackathon MVP.
- **FastAPI endpoint serving Urdu content**: Adds a new backend route that reads files from disk and returns markdown. Rejected because the static file approach achieves the same result with zero backend changes and better CDN cacheability.

---

## Decision 2: Frontend Language Toggle Architecture

**Decision**: `LanguageWrapper` component wrapping the existing `PersonalizationWrapper` in the swizzled `DocItem/Content`. Language preference stored in `localStorage` under key `preferred-lang`.

**Rationale**: F7 already swizzles `DocItem/Content` and the `PersonalizationWrapper` handles transparent content replacement via `react-markdown`. `LanguageWrapper` sits outside `PersonalizationWrapper` in the component tree: when Urdu is selected, it fetches the static Urdu markdown file, renders it with `react-markdown` + RTL styling, and skips `PersonalizationWrapper`. When English is selected, `PersonalizationWrapper` runs as before (personalized or default). This keeps the two features orthogonal — Urdu content is pre-translated (not personalized), English content may be personalized.

**Alternatives considered**:
- **Wrap PersonalizationWrapper inside LanguageWrapper** (chosen): Clean separation — language is outer concern, personalization is inner. Urdu content bypasses personalization (correct: we don't personalize Urdu).
- **Integrate language into PersonalizationWrapper**: Rejected — would tangle two independent concerns and make PersonalizationWrapper much harder to reason about.
- **URL-based language switching (redirect to /docs/urdu/{slug})**: Rejected — breaks the "same URL" requirement (SC-001) and breaks the back button.
- **Docusaurus `useLocale` hook**: Only available with Docusaurus i18n setup; rejected with Approach B.

---

## Decision 3: Translation Pipeline — Gemini Direct vs. Translator Subagent

**Decision**: Python script `backend/scripts/translate_chapters.py` calls Gemini 2.0 Flash API directly with a translation prompt that replicates the translator subagent's rules.

**Rationale**: Translator subagent (`.claude/agents/translator.md`) is a Claude Code CLI agent — it cannot be called programmatically from Python. Identical pattern to F7's PersonalizerService which calls Gemini directly instead of using the personalizer subagent. The translation prompt encodes all rules from the translator subagent: preserve code blocks, translate prose to Urdu, add transliterations on first use, use `<div dir="rtl">` wrappers.

**Alternatives considered**:
- **Claude Code CLI subprocess** (`subprocess.run(['claude', '--agent', 'translator', ...])`): Technically possible but unreliable (requires auth, session management, no structured output). Rejected.
- **Claude Anthropic API (anthropic SDK)**: Would work but violates constitution principle "No OpenAI SDK imports (Gemini substitution is project-wide)" — by extension, no Anthropic SDK since Gemini is the designated LLM. Rejected.
- **Gemini direct** (chosen): Consistent with existing project, already configured, free tier available.

---

## Decision 4: RTL Rendering

**Decision**: Apply `direction: rtl; text-align: right;` via inline styles on the markdown container div inside `LanguageWrapper`. Do NOT apply RTL globally.

**Rationale**: Scoped to the chapter content area only. Sidebar, navbar, footer, code blocks remain LTR. Using inline styles (not CSS classes) avoids needing to modify `custom.css` or add new CSS files. The `div` wrapping `<ReactMarkdown>` receives `style={{ direction: 'rtl', textAlign: 'right' }}` when `lang === 'ur'`.

**Alternatives considered**:
- **`dir="rtl"` attribute on HTML element**: Works but requires `dangerouslySetInnerHTML` or DOM manipulation in React; inline style is cleaner for the container div.
- **Global CSS class `.urdu-chapter`**: Cleaner but requires a CSS file change and class injection. Rejected for simplicity.
- **Docusaurus `dir="rtl"` on `<html>`**: Would flip entire page including sidebar/navbar. Rejected.

---

## Decision 5: Fallback Strategy

**Decision**: Fetch Urdu static file → if 404 or network error, silently render English content (via `PersonalizationWrapper`) with a dismissible "Translation not available" notice.

**Rationale**: Same graceful-fallback pattern as F7. The `fetch()` returns 404 for untranslated chapters; the catch block falls through to English rendering. Zero user-facing errors.

**Alternatives considered**:
- **Check for file existence at build time**: Would require a build step to generate a manifest of available translations. Rejected as over-engineering.
- **Show error state**: Rejected — poor UX per spec FR-004/FR-005.

---

## Decision 6: Translation Script Output Path

**Decision**: Script writes to `book-site/static/translations/ur/{module}/{slug}.md`. Chapter slug is derived from the docs path (e.g., `module-1/ch01-intro-physical-ai`).

**Rationale**: Translator subagent spec says `book-site/docs/urdu/<original-slug>.md` but that would create false doc pages in Docusaurus. `static/` is the correct place for files that should be served verbatim without Docusaurus processing.

**Translation prompt rules** (from translator subagent, adapted for Gemini):
1. Translate all prose to Urdu
2. Keep all code blocks exactly as-is (no translation)
3. Keep technical terms in English with Urdu transliteration in parentheses on first use
4. Translate headings with original English in parentheses
5. Wrap prose sections in `<div dir="rtl">` ... `</div>`, code blocks outside wrappers
6. Preserve all markdown structure: heading hierarchy, lists, bold, italic, links
7. Frontmatter: keep keys in English, translate `title` and `description` values to Urdu
8. Return ONLY the translated markdown — no commentary
