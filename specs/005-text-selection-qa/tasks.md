# Tasks: Text-Selection Q&A (F5)

**Input**: Design documents from `/specs/005-text-selection-qa/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create F5 component folder and barrel export; no new dependencies required.

- [X] T001 Create directory `book-site/src/components/SelectionPopup/` and empty placeholder files: `SelectionPopup.tsx`, `SelectionChatPanel.tsx`, `SelectionPopup.module.css`, `index.ts`
- [X] T002 Create test file stubs `book-site/__tests__/SelectionPopup.test.tsx` and `book-site/__tests__/SelectionChatPanel.test.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extract `useChatStream` hook from ChatWidget so both ChatWidget and SelectionChatPanel can share SSE streaming logic. MUST complete before any user story work.

**⚠️ CRITICAL**: US1–US3 all depend on the shared hook and types extension.

- [X] T003 Create `book-site/src/components/ChatWidget/useChatStream.ts` — extract the `handleSubmit` + SSE streaming logic from `ChatWidget.tsx` into a custom hook with signature `useChatStream(backendUrl: string, selectedText?: string): { messages, loading, validationMsg, input, setInput, handleSubmit, updateAssistant }`. When `selectedText` is provided, prepend it as `context_passages[0]` with `score: 1.0`, `chapter_title: "Selected Text"`, `section_heading: document.title`.

- [X] T004 Refactor `book-site/src/components/ChatWidget/ChatWidget.tsx` to call `useChatStream(backendUrl)` instead of inline logic — behaviour must remain identical. Verify existing tests still pass.

- [X] T005 Add `SelectionState` TypeScript interface to `book-site/src/components/ChatWidget/types.ts`:
  ```ts
  export interface SelectionState {
    text: string;
    rect: DOMRect | null;
    isVisible: boolean;
  }
  ```

**Checkpoint**: `useChatStream` hook exists, ChatWidget still works, `SelectionState` type exported.

---

## Phase 3: User Story 1 — Ask About Selected Passage (Priority: P1) 🎯 MVP

**Goal**: Student highlights text → "Ask AI" popup appears → chat panel opens with context → streamed answer with citations.

**Independent Test**: Select 20+ chars on any chapter page → popup appears → click "Ask AI" → type question → answer streams with citations.

### Implementation for User Story 1

- [X] T006 [US1] Implement `book-site/src/components/SelectionPopup/SelectionPopup.tsx`:
  - Use `useState<SelectionState>` for selection state
  - Attach `mouseup` and `touchend` listeners to `document` via `useEffect`
  - On each event: call `window.getSelection()`, get selected text, check `text.trim().length >= 10`
  - Walk DOM ancestors of `anchorNode` — if any has `tagName === 'CODE'` or `tagName === 'PRE'`, suppress popup
  - Get `getBoundingClientRect()` from `selection.getRangeAt(0)`, compute popup position: centered above selection, clamped to viewport (left: clamp(rect.left + rect.width/2 - 48, 8, window.innerWidth - 104), top: rect.top + window.scrollY - 44)
  - On `selectionchange` or `mousedown` outside popup: clear selection state
  - Render: when `isVisible`, render a small pill button "Ask AI ✨" at computed position
  - Accept props: `backendUrl: string`, `onAskAI: (text: string) => void`

- [X] T007 [US1] Implement `book-site/src/components/SelectionPopup/SelectionChatPanel.tsx`:
  - Props: `selectedText: string`, `backendUrl: string`, `onClose: () => void`
  - Call `useChatStream(backendUrl, selectedText)` from Phase 2
  - Render: panel with header ("Ask about selection" + close button ✕), grey context block showing `selectedText` (max 3 lines, overflow hidden), `MessageList` (reused from F4), input form identical to ChatWidget
  - On mount: focus input
  - `selectedText` context block persists for entire panel session (US2 dependency)

- [X] T008 [US1] Implement `book-site/src/components/SelectionPopup/SelectionPopup.module.css`:
  - `.popup`: `position: absolute; z-index: 10000; background: var(--ifm-color-primary); color: white; border-radius: 20px; padding: 6px 14px; font-size: 13px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); white-space: nowrap;`
  - `.panel`: `position: fixed; bottom: 96px; right: 24px; z-index: 9997; width: 360px; max-height: 520px; display: flex; flex-direction: column; background: var(--ifm-background-color); border: 1px solid var(--ifm-color-emphasis-300); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.15);`
  - `.contextBlock`: `background: var(--ifm-color-emphasis-100); border-left: 3px solid var(--ifm-color-primary); padding: 8px 12px; margin: 8px; font-size: 13px; color: var(--ifm-color-emphasis-700); max-height: 72px; overflow: hidden; border-radius: 4px;`
  - `.panelHeader`, `.closeButton`, `.messageArea`, `.inputRow` — same pattern as ChatWidget.module.css
  - Mobile `@media (max-width: 480px)`: panel full-width, bottom: 0, right: 0, border-radius top-only

- [X] T009 [US1] Write barrel export `book-site/src/components/SelectionPopup/index.ts`:
  ```ts
  export { default as SelectionPopup } from './SelectionPopup';
  export { default as SelectionChatPanel } from './SelectionChatPanel';
  ```

- [X] T010 [US1] Update `book-site/src/theme/Root.tsx` to:
  - Import `SelectionPopup` and `SelectionChatPanel`
  - Add state: `const [selectionContext, setSelectionContext] = useState<string | null>(null)`
  - Render `<SelectionPopup backendUrl={backendUrl} onAskAI={(text) => setSelectionContext(text)} />`
  - Render `{selectionContext && <SelectionChatPanel selectedText={selectionContext} backendUrl={backendUrl} onClose={() => setSelectionContext(null)} />}` alongside existing `<ChatWidget />`

- [X] T011 [US1] Write `book-site/__tests__/SelectionPopup.test.tsx` with 6 RTL tests:
  1. No popup when no text selected
  2. No popup when selection < 10 chars
  3. Popup appears when selection >= 10 chars and mouseup fires
  4. No popup when selection is inside a `<code>` element
  5. `onAskAI` callback fires with selected text when "Ask AI" button clicked
  6. Popup disappears when `mousedown` fires outside (deselect simulation)

**Checkpoint**: Select text on any chapter page → popup appears → click → panel opens with context block → question streams answer.

---

## Phase 4: User Story 2 — Follow-up Questions (Priority: P2)

**Goal**: After initial answer, student asks follow-up questions in same panel with original context preserved.

**Independent Test**: Submit initial question → receive answer → type follow-up without re-selecting → context block still shows original text → follow-up answer incorporates it.

### Implementation for User Story 2

- [X] T012 [US2] Verify `SelectionChatPanel.tsx` (T007) correctly preserves `selectedText` prop across multiple `handleSubmit` calls — `useChatStream` hook must always prepend `selectedText` as `context_passages[0]` for every message in the session, not just the first.

- [X] T013 [US2] Write `book-site/__tests__/SelectionChatPanel.test.tsx` with 5 RTL tests:
  1. Context block renders with provided `selectedText`
  2. Context block persists after submitting a question (not cleared after first submit)
  3. Close button calls `onClose` prop
  4. Input starts focused on mount
  5. Empty question shows validation message

**Checkpoint**: Follow-up questions work with same context; close button clears panel.

---

## Phase 5: User Story 3 — Mobile-Friendly Selection (Priority: P3)

**Goal**: Touch/long-press selection on mobile shows popup above selection without conflicting with browser selection handles.

**Independent Test**: On 480px viewport, select text → popup appears above selection → panel opens → keyboard does not obscure input.

### Implementation for User Story 3

- [X] T014 [US3] Update `SelectionPopup.tsx` to handle `touchend` events: after `touchend`, use `window.getSelection()` same as `mouseup`. Add a 50ms debounce on touch to wait for browser to finalize selection before reading it.

- [X] T015 [US3] Update popup positioning in `SelectionPopup.tsx` for mobile: when `window.innerWidth <= 480`, position popup above selection (`top: rect.top + scrollY - 44`) instead of computing horizontal center (which may overflow on narrow screens). Always keep popup within `[8px, window.innerWidth - 104px]` horizontal range.

- [X] T016 [US3] Verify `SelectionPopup.module.css` panel mobile styles (added in T008): `@media (max-width: 480px)` panel should be full-width, bottom-anchored, with `padding-bottom: env(safe-area-inset-bottom)` for iOS notch safety.

**Checkpoint**: Mobile viewport — text selection triggers popup above selection; panel scrolls correctly with keyboard open.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Route change dismissal, accessibility, syntax validation.

- [X] T017 [P] Add route-change dismissal to `SelectionPopup.tsx`: use Docusaurus's `useLocation` hook from `@docusaurus/router`. In a `useEffect` with `location.pathname` dependency, reset selection state to `{ text: '', rect: null, isVisible: false }`.

- [X] T018 [P] Add `aria-label="Ask AI about selected text"` to the popup button and `role="dialog"`, `aria-label="Ask about selection"` to the panel in `SelectionChatPanel.tsx`.

- [X] T019 [P] Run `python3 -m py_compile` on all backend files to confirm zero backend changes broke anything: `backend/app/main.py`, `backend/app/models.py`, `backend/app/services/chat_service.py`, `backend/app/services/gemini_service.py`.

- [X] T020 Run quickstart.md integration scenarios manually (or document expected outcomes): confirm popup appears on chapter pages, code block exclusion works, follow-up questions retain context.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — Core feature; must be complete before US2/US3
- **US2 (Phase 4)**: Depends on Phase 3 (T007 must exist) — follow-up is an enhancement of US1 panel
- **US3 (Phase 5)**: Depends on Phase 3 (T006, T008 must exist) — mobile is a CSS/event enhancement
- **Polish (Phase 6)**: Depends on US1 complete; US2/US3 can be in-progress

### Parallel Opportunities Within Phases

- **Phase 3**: T006 (SelectionPopup), T007 (SelectionChatPanel), T008 (CSS) can all run in parallel [P]
- **Phase 6**: T017, T018, T019 can all run in parallel [P]
- **US2 + US3**: Can be worked in parallel after Phase 3 complete (different files)

---

## Implementation Strategy

### MVP (US1 only — 11 tasks)

1. Phase 1: T001–T002 (setup)
2. Phase 2: T003–T005 (hook extraction)
3. Phase 3: T006–T011 (core selection + panel + tests)
4. **STOP & VALIDATE**: Select text → popup → panel → streaming answer ✅

### Full Delivery (all 20 tasks)

1. MVP above
2. Phase 4: T012–T013 (follow-up questions)
3. Phase 5: T014–T016 (mobile)
4. Phase 6: T017–T020 (polish)

---

## Notes

- `useChatStream` hook (T003) is the critical foundational task — all UI components depend on it
- Backend has zero changes — all 20 tasks are frontend-only
- `MessageList` and `CitationList` from F4 are imported directly, not copied
- CSS uses Docusaurus CSS variables (`--ifm-*`) for automatic light/dark theme support
