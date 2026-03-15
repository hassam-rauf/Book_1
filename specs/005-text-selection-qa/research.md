# Research: Text-Selection Q&A (F5)

## Decision 1: Selection Detection Strategy

**Decision**: Use the browser native `window.getSelection()` API on `mouseup` and `touchend` events, mounted via a global React hook in `Root.tsx`.

**Rationale**: `window.getSelection()` is universally supported in all modern browsers and provides the selection string, range, and `getBoundingClientRect()` for popup positioning. No third-party library needed.

**Alternatives considered**:
- `selectionchange` event on `document` — fires too frequently (on every character of selection change), causes performance issues; `mouseup`/`touchend` fires once at end of selection.
- MutationObserver — irrelevant; we're detecting user gestures, not DOM mutations.

---

## Decision 2: Popup Positioning

**Decision**: Use `Selection.getRangeAt(0).getBoundingClientRect()` to get the selection rectangle. Position popup at `{ top: rect.top + window.scrollY - popupHeight - 8, left: rect.left + rect.width / 2 }` (centered above selection). Clamp to viewport edges (0 + margin, viewport width - popupWidth - margin).

**Rationale**: Absolute positioning via `document.body` with scroll offset is the most reliable approach across Docusaurus's page layout. CSS `position: fixed` would require converting to viewport coords on every scroll.

**Alternatives considered**:
- `position: fixed` — simpler but popup jumps during scroll; requires scroll listener to stay attached to selection.
- External tooltip library (e.g., Popper.js, Floating UI) — adds dependency; overkill for a single small popup.

---

## Decision 3: Backend Integration — No New Endpoint

**Decision**: Reuse existing `POST /chat` endpoint. Pass selected text as the **first** `ContextPassage` with `score: 1.0` (synthetic highest-priority), followed by RAG-retrieved passages from `POST /search`.

**Rationale**: The `ChatRequest` model already accepts `context_passages: list[ContextPassage]` (max 10). Prepending the selected text as passage[0] with score 1.0 signals to the grounding prompt that it is the primary reference. No backend changes required — Constitution Principle II (smallest viable diff) preserved.

**Alternatives considered**:
- New `POST /chat-with-selection` endpoint with a `selected_text` field — adds duplication; the existing model already supports injecting the text as a passage.
- Sending selection as the `query` — wrong; the query is the student's question, not the selected passage.

---

## Decision 4: SelectionChatPanel vs ChatWidget Reuse

**Decision**: Create a new `SelectionChatPanel` component that **imports and reuses** the `handleSubmit` logic and `MessageList`/`CitationList` sub-components from `ChatWidget`, but wraps them in a different shell: a context block at the top showing the selected text (read-only), and panel triggered by selection (not floating button).

**Rationale**: ChatWidget's `handleSubmit` (search → chat → SSE stream) is exactly the same flow. Only differences are: (1) SelectionChatPanel receives an `initialContext` string prop; (2) layout differs (no floating button, panel appears near selection). Extracting the streaming logic into a shared hook (`useChatStream`) avoids code duplication.

**Alternatives considered**:
- Extend ChatWidget with an `initialContext` prop — makes ChatWidget more complex and harder to test; violates Constitution Principle II.
- Copy-paste ChatWidget logic — violates DRY; bugs fixed in one won't propagate to the other.

---

## Decision 5: Code Block Exclusion

**Decision**: On `mouseup`, walk the DOM ancestors of `Selection.anchorNode`. If any ancestor has `tagName === 'CODE'` or `tagName === 'PRE'`, suppress the popup.

**Rationale**: Students selecting code to copy it should not trigger the AI popup. This is explicitly in the spec's Out of Scope section. DOM ancestor traversal is O(depth) — negligible cost.

**Alternatives considered**:
- CSS `user-select: none` on code blocks — would prevent selection entirely, breaking copy-paste.
- Check `classList` for Docusaurus code block classes — fragile; Docusaurus can change class names across versions. Tag check is more stable.

---

## Decision 6: Popup Dismissal on SPA Navigation

**Decision**: In the `SelectionPopup` component, subscribe to `window.location` changes via Docusaurus's router. On route change, clear selection state and hide popup.

**Rationale**: Docusaurus uses React Router under the hood. The popup must disappear when the user navigates to a new chapter — otherwise stale context from a previous page could persist.

**Implementation note**: Use a `useEffect` with `window.location.pathname` as dependency, or listen to Docusaurus's `@docusaurus/router` `useLocation` hook.
