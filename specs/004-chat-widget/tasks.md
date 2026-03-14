# Tasks: Chat Widget (F4)

**Input**: Design documents from `/specs/004-chat-widget/`
**Branch**: `004-chat-widget`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/openapi.yaml ✅

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- All paths relative to repo root

---

## Phase 1: Setup (Project Scaffold)

**Purpose**: Create new directories needed for F4. No new packages required — Docusaurus 3 and FastAPI already installed.

- [x] T001 Create `book-site/src/components/ChatWidget/` directory structure (placeholder index.ts) and `book-site/src/theme/` directory
- [x] T002 [P] Add `@testing-library/react` and `@testing-library/jest-dom` to `book-site/package.json` devDependencies (verify or add if missing) and create `book-site/__tests__/` directory

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend models + service layer and frontend TypeScript types. All user stories depend on these.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T003 Add `ContextPassage`, `ChatRequest`, `CitationItem`, `ChatChunk` Pydantic v2 models to `backend/app/models.py` per `data-model.md` Pydantic schemas section
- [x] T004 Create `backend/app/services/chat_service.py` — implement `GeminiChatService` class:
  - `__init__`: use `GeminiService` from `gemini_service.py` for the underlying model call
  - `stream_answer(query: str, passages: list[ContextPassage]) -> AsyncGenerator`: call `gemini-2.0-flash` with grounding system prompt, yield `ChatChunk` dicts for each token; after stream ends, parse `---CITATIONS---` marker to emit a `citations` chunk; yield `done` chunk
  - System prompt: "You are a helpful tutor for the Physical AI & Humanoid Robotics textbook. Answer using ONLY the provided context. If the context is insufficient, say so. After your answer output exactly `---CITATIONS---` then list each citation used as `[$INDEX] $chapter_title — $section_heading`."
  - All `google.generativeai` calls via existing `GeminiService`; no direct genai imports here (Constitution IV)
- [x] T005 [P] Create `book-site/src/components/ChatWidget/types.ts` — TypeScript interfaces: `ChatMessage`, `Citation` per `data-model.md` Frontend TypeScript Types section

**Checkpoint**: `python -c "from app.services.chat_service import GeminiChatService"` runs without error. TypeScript types file compiles.

---

## Phase 3: User Story 1 — Student Asks a Textbook Question (Priority: P1) 🎯 MVP

**Goal**: `POST /chat` backend endpoint works and returns SSE stream. ChatWidget component makes the two-call flow (search → chat) and renders streaming answer.

**Independent Test** (backend only):
```bash
cd backend && python ingest.py   # ensure vectors exist
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"What is ROS 2?","context_passages":[{"text":"ROS 2 is a robotics framework...","chapter_title":"Chapter 3","section_heading":"3.1 Overview","score":0.9}]}'
# Expect: SSE event stream ending with {"type":"done"}
```

### Implementation

- [x] T006 [US1] Add `POST /chat` route to `backend/app/main.py`:
  - Accept `ChatRequest` body (Pydantic auto-validates; empty query returns 422)
  - Instantiate `GeminiChatService` using existing `gemini` service instance
  - Return `StreamingResponse(chat_service.stream_answer(req.query, req.context_passages), media_type="text/event-stream")`
  - On any exception from chat_service: catch and yield `{"type":"error","detail":str(e)}` then close stream
  - Add structured log: query length + passage count at request start
- [x] T007 [P] [US1] Create `backend/tests/test_chat_endpoint.py` — integration tests with mocked services:
  - Test: valid request returns 200 with `Content-Type: text/event-stream`
  - Test: empty `query` string returns 422
  - Test: `context_passages` empty list returns 422
  - Test: Gemini service exception causes `{"type":"error",...}` event in stream (not 500 crash)
  - Test: `done` event is always the last event in a successful stream
- [x] T008 [US1] Create `book-site/src/components/ChatWidget/ChatWidget.tsx`:
  - State: `{ isOpen: boolean, messages: ChatMessage[], loading: boolean }` using `useState`
  - `handleSubmit(query: string)`:
    1. Add user message to messages
    2. Set `loading=true`; add placeholder assistant message with `isStreaming=true`
    3. `POST ${backendUrl}/search` with `{query, top_k: 5}` → get passages
    4. `POST ${backendUrl}/chat` with `{query, context_passages: passages}` → read SSE stream
    5. On each `token` event: append text to last assistant message
    6. On `citations` event: set citations on last assistant message; set `isStreaming=false`
    7. On `error` event: replace assistant message content with error text; set `isStreaming=false`
    8. On `done` event: set `loading=false`
    9. Empty query guard: if `query.trim() === ''` show validation hint, do nothing
  - Props: `backendUrl: string`
  - Renders: floating button (when `!isOpen`) + chat panel (when `isOpen`) containing input + send button + `<MessageList messages={messages} />`
- [x] T009 [P] [US1] Create `book-site/src/components/ChatWidget/MessageList.tsx`:
  - Props: `messages: ChatMessage[]`
  - Renders each message as a `div` with role-based styling (user vs assistant)
  - For assistant messages with `isStreaming=true`: show animated ellipsis skeleton after content
  - For assistant messages with citations: render `<CitationList citations={msg.citations} />` below message text (CitationList is a stub that renders nothing until T013)

**Checkpoint**: Backend SSE endpoint responds correctly. `pytest tests/test_chat_endpoint.py -v` all pass. `POST /search` + `POST /chat` two-call chain works via curl.

---

## Phase 4: User Story 2 — Widget Is Always Accessible (Priority: P2)

**Goal**: Floating button visible on every Docusaurus page. Panel opens/closes without disrupting content layout.

**Independent Test**:
```bash
cd book-site && npm start
# Navigate to http://localhost:3000
# Navigate to http://localhost:3000/docs/module-1/ch01-intro-physical-ai
# Navigate to http://localhost:3000/docs/appendices/a1-ros2-installation
# On each page: floating button visible bottom-right. Click → panel opens. Click X → panel closes.
```

### Implementation

- [x] T010 [US2] Create `book-site/src/theme/Root.tsx` — Docusaurus swizzle entry point:
  - Wraps all children with `ChatWidget` mounted after `{children}`
  - Passes `backendUrl={process.env.DOCUSAURUS_BACKEND_URL ?? 'http://localhost:8000'}` as prop
  - TypeScript: `import type { ReactNode } from 'react'; export default function Root({ children }: { children: ReactNode })`
- [x] T011 [US2] Create `book-site/src/components/ChatWidget/ChatWidget.module.css`:
  - `.floatingButton`: `position: fixed; bottom: 24px; right: 24px; z-index: 9999; width: 56px; height: 56px; border-radius: 50%; background: #2563eb; color: white; border: none; cursor: pointer; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.25)`
  - `.panel`: `position: fixed; bottom: 96px; right: 24px; z-index: 9998; width: 360px; max-height: 520px; display: flex; flex-direction: column; background: white; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); overflow: hidden`
  - `.panelHeader`: flex row with "Ask the Textbook" title and close button
  - `.messageArea`: `flex: 1; overflow-y: auto; padding: 12px`
  - `.inputRow`: `display: flex; gap: 8px; padding: 12px; border-top: 1px solid #e5e7eb`
  - `.input`: `flex: 1; border: 1px solid #d1d5db; border-radius: 8px; padding: 8px 12px`
  - `.sendButton`: styled blue button, `disabled` opacity when `loading=true`
  - Mobile (`@media (max-width: 480px)`): `.panel` width 100vw, right 0, bottom 0, border-radius top only
- [x] T012 [P] [US2] Create `book-site/.env.development.local.example` with `DOCUSAURUS_BACKEND_URL=http://localhost:8000` (for developer onboarding; actual `.env.development.local` is gitignored)

**Checkpoint**: `npm start` → floating button visible on homepage and at least two chapter pages. Open/close works. No layout reflow in main content.

---

## Phase 5: User Story 3 — Cited Sources Are Traceable (Priority: P3)

**Goal**: Each assistant answer shows numbered citations with chapter title and section heading. Citation list renders below the answer text.

**Independent Test**:
```bash
# In the running Docusaurus site:
# Open chat widget, ask "What is DDS middleware?"
# Expect: answer text + citation list below showing "[1] Chapter 3 — 3.3 Publisher-Subscriber" (or similar)
```

### Implementation

- [x] T013 [US3] Create `book-site/src/components/ChatWidget/CitationList.tsx`:
  - Props: `citations: Citation[]`
  - If `citations.length === 0`: render nothing
  - Renders a `<ul>` with each citation as `<li>`: `[{index}] {chapter_title} — {section_heading}` (optionally show `score` as a faint percentage)
  - CSS: small font, muted color, left-border accent; each item on its own line
- [x] T014 [US3] Update `book-site/src/components/ChatWidget/MessageList.tsx` to import and render `<CitationList citations={msg.citations} />` for assistant messages (replacing the stub from T009)
- [x] T015 [P] [US3] Create `book-site/src/components/ChatWidget/index.ts` — barrel export: `export { default } from './ChatWidget'`

**Checkpoint**: Submit a question in the running widget and verify citations appear below the answer with correct chapter and section info.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Tests, README, and final integration validation.

- [x] T016 [P] Create `book-site/__tests__/ChatWidget.test.tsx` — RTL unit tests:
  - Test: floating button renders on mount
  - Test: clicking button opens the panel
  - Test: clicking close button closes the panel
  - Test: submitting empty input shows validation message and does not call fetch
  - Test: submit button is disabled while `loading=true`
  - Test: error message displays when backend returns error SSE event
- [x] T017 [P] Create `book-site/__tests__/MessageList.test.tsx` — RTL unit tests:
  - Test: renders user message with correct content
  - Test: renders assistant message with correct content
  - Test: renders streaming skeleton for messages with `isStreaming=true`
  - Test: renders citation list when message has citations
- [x] T018 [P] Update `backend/README.md` — add section for `POST /chat` endpoint with example curl
- [x] T019 Run full test suite: `cd backend && pytest tests/ -v` + `cd book-site && npm test -- --watchAll=false` — all pass
- [x] T020 Manual end-to-end integration test: follow quickstart.md Scenario A (question → streaming answer → citations visible)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — backend endpoint + widget submit flow
- **Phase 4 (US2)**: Depends on Phase 2 — needs ChatWidget.tsx from T008 to exist (at least a stub) for Root.tsx to import
- **Phase 5 (US3)**: Depends on Phase 3 — citations are populated by the SSE stream from US1
- **Phase 6 (Polish)**: Depends on US1 + US2 + US3 all complete

### User Story Dependencies

- **US1 (Q&A flow)**: Needs T003 (models), T004 (chat_service), T005 (TS types)
- **US2 (Accessibility)**: Needs T008 (ChatWidget.tsx exists with open/close) — can be done in parallel after T008
- **US3 (Citations)**: Needs T008 (ChatWidget streams citations), T009 (MessageList passes citations)

### Parallel Opportunities

- T001 and T002 can run in parallel
- T003, T004, T005 can run in parallel (different files)
- T007 (chat tests) can run in parallel with T008 (ChatWidget.tsx)
- T009 (MessageList) can run in parallel with T006 (/chat route)
- T010 (Root.tsx) can run in parallel with T011 (CSS)
- T013 (CitationList) can run in parallel with T015 (barrel export)
- T016 and T017 can run in parallel

---

## Parallel Example: Phase 2 Foundation

```bash
# These 3 tasks can run in parallel (different files):
Task T003: backend/app/models.py  (add Pydantic schemas)
Task T004: backend/app/services/chat_service.py  (new service)
Task T005: book-site/src/components/ChatWidget/types.ts  (TypeScript interfaces)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundation (T003–T005) — **do not skip**
3. Complete Phase 3: US1 Backend (T006–T007) — validate with curl
4. Complete Phase 4: US2 Accessibility (T008, T010–T011) — validate in browser
5. **STOP and VALIDATE**: open widget, submit question, see streaming answer
6. MVP is valuable: students can ask questions about the textbook

### Incremental Delivery

1. Setup + Foundation → compile check passes, no errors
2. US1 backend (T006–T007) → `POST /chat` responds via curl ✅
3. US1 frontend (T008–T009) → widget renders, submit fires two-call flow ✅
4. US2 (T010–T012) → widget appears on every page ✅
5. US3 (T013–T015) → citations render below answers ✅
6. Polish (T016–T020) → tests pass, docs updated ✅

---

## Notes

- [P] tasks touch different files — safe to parallelize
- ChatWidget.tsx (T008) is the largest single task — split into skeleton (render only) + behavior (submit/SSE) if needed
- `src/theme/Root.tsx` must NOT import from `@docusaurus/core` directly — just wrap children + mount ChatWidget
- `DOCUSAURUS_BACKEND_URL` is a public URL (not a secret) — safe to bake into the JS bundle at build time
- SSE stream reading in the browser uses `ReadableStream` / `getReader()` — no external library needed
- Always test with `pytest tests/ -v && npm test -- --watchAll=false` before committing
