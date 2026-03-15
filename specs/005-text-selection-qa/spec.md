# Feature Specification: Text-Selection Q&A

**Feature Branch**: `005-text-selection-qa`
**Created**: 2026-03-15
**Status**: Draft
**Input**: User description: "F5 Text-selection Q&A — when a user selects/highlights text on any page of the Docusaurus book, a small popup appears near the selection with an 'Ask AI' button. Clicking it opens a chat panel pre-filled with the selected text as context, and the student can type a question about that specific passage. The question is sent to the RAG backend with the selected text as additional context, and the Gemini API streams a grounded answer back into the panel."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask About Selected Passage (Priority: P1)

A student is reading a chapter and encounters a confusing paragraph. They highlight the text, see a small "Ask AI" popup appear near the selection, and click it. A chat panel opens with the selected text already shown as context. The student types their question and receives a streamed, grounded answer within seconds.

**Why this priority**: This is the core interaction that defines the feature — without it the feature does not exist. It directly addresses the hackathon requirement for text-selection-based Q&A.

**Independent Test**: Select any paragraph on a chapter page, click "Ask AI", type "What does this mean?", and verify a streamed answer appears referencing the selected text.

**Acceptance Scenarios**:

1. **Given** a student is reading a chapter page, **When** they highlight any text (minimum 10 characters), **Then** a small popup appears near the selection within 300ms containing an "Ask AI" button.
2. **Given** the popup is visible, **When** the student clicks "Ask AI", **Then** a chat panel opens pre-filled with the selected text shown as a quote/context block.
3. **Given** the chat panel is open with selected context, **When** the student types a question and submits, **Then** the answer streams back in real-time with citations to relevant chapters.
4. **Given** the student clicks away or deselects text, **When** no text is selected, **Then** the popup disappears automatically.

---

### User Story 2 - Panel Persists for Follow-up Questions (Priority: P2)

After getting an answer about a selected passage, the student wants to ask a follow-up question without re-selecting text. The panel stays open and allows continued conversation with the original passage as ongoing context.

**Why this priority**: A single question is rarely enough — follow-ups deepen understanding. The panel should support a short dialogue, not just one shot.

**Independent Test**: Ask an initial question via selection, then type a follow-up in the same panel without re-selecting; verify the answer still references the original passage context.

**Acceptance Scenarios**:

1. **Given** the panel is open after a selection-triggered question, **When** the student types a follow-up question, **Then** the original selected text remains visible as context and the new answer incorporates it.
2. **Given** the panel is open, **When** the student clicks a close button, **Then** the panel closes and the context is cleared.

---

### User Story 3 - Mobile-Friendly Selection (Priority: P3)

A student reading on a mobile device long-presses text to select it. The "Ask AI" popup appears in a position that does not obscure the selected text or the browser's native selection handles.

**Why this priority**: Mobile usage is common for reading. The popup must not conflict with the browser's native text-selection UI on touch devices.

**Independent Test**: On a mobile viewport (≤ 480px), select text via long-press and verify the popup appears without overlapping browser selection handles.

**Acceptance Scenarios**:

1. **Given** a mobile user has selected text, **When** the popup appears, **Then** it is positioned above the selection (not below, where handles appear) and does not overlap native selection handles.
2. **Given** the panel opens on mobile, **When** the keyboard appears, **Then** the input field remains visible and scrollable.

---

### Edge Cases

- What happens when the user selects only whitespace or punctuation (< 10 characters)?
- What happens when the user selects text across multiple paragraphs or headings?
- How does the system handle the popup if the selection is at the very top of the viewport?
- What if the backend is unavailable when the student submits a question?
- What if the student selects new text while the panel is already open with a previous context?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect text selection on any book page and display a popup within 300ms of the selection being completed (mouse-up or touch-end).
- **FR-002**: The popup MUST contain a single clearly-labelled "Ask AI" button and appear near the end of the selected text.
- **FR-003**: The popup MUST disappear when the user deselects text, clicks away, or closes the chat panel.
- **FR-004**: Clicking "Ask AI" MUST open a chat panel that displays the selected text as a read-only context block at the top.
- **FR-005**: The chat panel MUST include a text input and submit button for the student's question.
- **FR-006**: Submitting a question MUST send both the selected text (as context) and the student's question to the backend, which returns a streamed grounded answer.
- **FR-007**: The answer MUST stream token-by-token into the panel in real-time with a loading indicator while streaming.
- **FR-008**: The panel MUST display citations linking answers back to relevant book sections.
- **FR-009**: The selected text context MUST persist for follow-up questions within the same open panel session.
- **FR-010**: The panel MUST have a close button that dismisses it and clears the context.
- **FR-011**: The popup MUST NOT appear for selections shorter than 10 characters (filters out accidental clicks).
- **FR-012**: The popup position MUST adapt to viewport edges so it is never clipped or hidden off-screen.

### Key Entities

- **TextSelection**: The highlighted text captured from the page — has `text` (content), `anchorPosition` (viewport coordinates for popup placement).
- **SelectionContext**: The selected text passed to the backend as additional grounding context alongside the student's question.
- **ChatPanel**: The UI component that holds the context block, message history, and input — same streaming/citations model as F4 ChatWidget.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Popup appears within 300ms of completing a text selection on any chapter page.
- **SC-002**: 100% of pages in the book site show the popup when text is selected (no pages excluded).
- **SC-003**: First streamed token appears within 3 seconds of submitting a question.
- **SC-004**: Popup correctly suppressed for selections under 10 characters (zero false triggers).
- **SC-005**: Panel displays the original selected text as context on every open — no missing context on follow-up questions.
- **SC-006**: Feature works on both desktop (mouse) and mobile (touch/long-press) without conflicts with browser native selection UI.

## Assumptions

- The existing F4 `POST /chat` endpoint already accepts `context_passages` — the selected text will be passed as an additional passage alongside RAG-retrieved passages.
- The existing F3 `POST /search` is still called first to retrieve relevant passages; the selected text is prepended as the highest-priority context passage.
- No authentication is required; the feature is available to all readers (same as F4 chat widget).
- The chat panel UI will reuse F4's `ChatWidget` component logic (streaming, citations, message list) to avoid duplicating UI work.
- Popup is dismissed on page navigation (SPA route change).

## Out of Scope

- Saving or persisting selected-text Q&A history across sessions.
- Highlighting/annotating the selected text permanently in the book.
- Sharing a selection + answer as a shareable link.
- Support for selecting text inside code blocks (code blocks are excluded from triggering the popup).
