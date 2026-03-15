# Feature Specification: Urdu Translation

**Feature Branch**: `009-urdu-translation`
**Created**: 2026-03-15
**Status**: Draft
**Input**: User description: "F8 Urdu Translation — translate all Physical AI textbook chapter content from English to Urdu."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Chapter Language to Urdu (Priority: P1)

An Urdu-speaking student opens a chapter and taps the language toggle. The chapter body reloads in Urdu, rendered right-to-left. Code blocks, technical terms, and frontmatter remain in English. The preference is saved so subsequent chapters also load in Urdu automatically.

**Why this priority**: Core user-facing value — without this, the translation feature is invisible to readers. All other stories depend on translated content existing and being accessible.

**Independent Test**: Navigate to any translated chapter, toggle language to Urdu → page body renders Urdu text right-to-left; code blocks stay in English; toggle state persists on page reload and across chapters.

**Acceptance Scenarios**:

1. **Given** a chapter is displayed in English, **When** the student clicks the Urdu language toggle, **Then** the chapter body switches to Urdu text rendered right-to-left within 1 second.
2. **Given** the student set language to Urdu, **When** they navigate to a different chapter, **Then** that chapter also displays in Urdu (preference persists).
3. **Given** the page is reloaded, **When** the student had previously selected Urdu, **Then** the chapter loads in Urdu without requiring the toggle again.
4. **Given** any chapter in Urdu, **When** the student inspects code blocks, **Then** code blocks remain in English with no Urdu characters in code.

---

### User Story 2 - Fallback to English for Untranslated Content (Priority: P1)

If a page has no Urdu translation yet, the English version is displayed transparently — no broken page, no missing content. A subtle notice informs the reader that this page is not yet translated.

**Why this priority**: Without graceful fallback, untranslated chapters cause broken UX. Required for a stable launch even if not all chapters are translated yet.

**Independent Test**: Toggle to Urdu on a chapter with no Urdu file → English content displays; a "not yet translated" notice is visible; no 404 or blank page.

**Acceptance Scenarios**:

1. **Given** a chapter has no Urdu translation, **When** the student's language preference is Urdu, **Then** the English content is shown with a notice saying translation is not yet available.
2. **Given** the fallback is displayed, **When** the student clicks the English toggle, **Then** the notice disappears and English content is shown normally.

---

### User Story 3 - Translation Pipeline Generates Urdu Files (Priority: P2)

An operator runs a translation job that reads all English chapter markdown files and produces corresponding Urdu markdown files. The job can be run chapter-by-chapter or for all chapters at once. Existing Urdu files are not overwritten unless forced.

**Why this priority**: Pre-requisite for US1, but separated because pipeline is an operational tool — the frontend toggle (US1) and fallback (US2) can be implemented and tested independently with manually created translation files.

**Independent Test**: Run the translation job for one chapter → a corresponding Urdu markdown file is written to the correct location → US1 toggle shows Urdu content for that chapter.

**Acceptance Scenarios**:

1. **Given** an English chapter file exists, **When** the translation job runs, **Then** a corresponding Urdu file is written preserving all markdown structure, with prose translated to Urdu and code blocks unchanged.
2. **Given** an Urdu file already exists, **When** the translation job runs without force flag, **Then** the existing file is not overwritten.
3. **Given** all 19 chapters exist, **When** the translation job runs for all chapters, **Then** 19 Urdu files are created without errors.
4. **Given** any translated file, **When** inspected, **Then** frontmatter keys remain in English, frontmatter values (title, description) are translated to Urdu, and technical terms (ROS 2, SLAM, NVIDIA, etc.) remain in English.

---

### User Story 4 - Switch Back to English (Priority: P2)

A student reading in Urdu wants to switch back to English. The toggle is bidirectional — Urdu → English and English → Urdu both work instantly.

**Why this priority**: Completes the bidirectional UX. Without this, students who switched to Urdu have no way back without clearing local storage.

**Independent Test**: Toggle to Urdu, then toggle back to English → English content displays immediately; preference is updated; subsequent page loads are in English.

**Acceptance Scenarios**:

1. **Given** the student is reading in Urdu, **When** they toggle to English, **Then** the chapter body reverts to English, left-to-right layout, within 1 second.
2. **Given** English is selected, **When** the student navigates to another chapter, **Then** all subsequent chapters load in English.

---

### Edge Cases

- What happens when a chapter file is partially translated (truncated Urdu file)? Display what exists; fallback logic applies if content is empty.
- How does the system handle Urdu text in search? Search indexes English content only; Urdu content is excluded from the RAG search index.
- What if the translation job produces an empty file? Treat as no translation — fallback to English applies.
- How are mathematical formulas and code-like inline content handled? Rendered as-is (untranslated) within the Urdu text flow.
- What about image alt-text? Alt text is translated to Urdu where present in the source markdown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a language toggle control visible on every chapter page that switches between English and Urdu.
- **FR-002**: System MUST persist the student's language preference across page navigations and browser reloads using browser local storage.
- **FR-003**: System MUST render Urdu chapter content right-to-left (RTL) without affecting navigation, sidebar, or header layout direction.
- **FR-004**: System MUST display English content as fallback when no Urdu translation exists for the current chapter.
- **FR-005**: System MUST show a non-intrusive notice when displaying English fallback to a student with Urdu preference.
- **FR-006**: Code blocks in translated chapters MUST remain in English with no Urdu characters inserted into code.
- **FR-007**: Frontmatter keys MUST remain in English; frontmatter values (title, description) SHOULD be translated to Urdu.
- **FR-008**: Technical terms (ROS 2, SLAM, NVIDIA, PyTorch, Isaac, etc.) MUST remain in English within Urdu prose.
- **FR-009**: The translation pipeline MUST read English chapter markdown and write a corresponding Urdu markdown file per chapter to a defined output location.
- **FR-010**: The translation pipeline MUST NOT overwrite an existing Urdu file unless an explicit force/overwrite flag is provided.
- **FR-011**: The translation pipeline MUST support translating a single chapter by slug or all chapters in batch.
- **FR-012**: Translated markdown MUST preserve all heading hierarchy, list structure, code blocks, and image references from the original.

### Key Entities

- **English Chapter File**: Source markdown at `book-site/docs/{module}/{slug}.md` — the authoritative content.
- **Urdu Chapter File**: Translated markdown stored in a parallel locale directory (`i18n/ur/docusaurus-plugin-content-docs/current/{module}/{slug}.md`); same slug, Urdu prose.
- **Language Preference**: Student's choice (en or ur) persisted in browser local storage; applied on every chapter page load.
- **Translation Job**: A runnable operator script that accepts chapter slug(s) or "all" and produces Urdu files; idempotent by default.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A student can switch between English and Urdu on any translated chapter in under 1 second (no full page reload required).
- **SC-002**: Language preference persists across 100% of page navigations and reloads within a session.
- **SC-003**: 100% of code blocks in translated chapters contain zero Urdu characters.
- **SC-004**: All 19 chapters can be translated by running a single batch command without errors.
- **SC-005**: Urdu chapters render correctly right-to-left in all major modern browsers (Chrome, Firefox, Safari, Edge).
- **SC-006**: Untranslated chapters display English fallback 100% of the time — no blank or broken pages when language is set to Urdu.
- **SC-007**: Translated markdown preserves 100% of heading structure, code blocks, and image references from the English original.

## Assumptions

- Urdu translation quality is AI-generated (not human-reviewed); acceptable for a hackathon MVP.
- Only chapter body prose is translated; UI chrome (navbar, sidebar labels, footer) remains in English.
- The translator subagent is already built (F9) and available as a callable tool for the translation pipeline.
- The translation pipeline is an operator-run script, not a student-facing feature — students do not trigger translation.
- Docusaurus i18n locale `ur` is used for file routing; a custom language toggle in the UI activates it.
- RTL applies to chapter body text only; sidebar, navbar, and footer remain LTR.
- Search (RAG chatbot) continues to use English content only — Urdu files are not ingested into the vector index.
- All 19 chapters are in scope for the batch translation job.

## Out of Scope

- Human review or editing of AI-generated Urdu translations.
- Translation of UI chrome elements (navbar labels, sidebar titles, footer).
- Urdu content in the RAG search index.
- Translation of any language other than Urdu.
- Real-time on-demand translation triggered by students.
- Urdu versions of the login, signup, or profile pages.
