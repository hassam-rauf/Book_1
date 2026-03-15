# Quickstart: Text-Selection Q&A (F5)

## Prerequisites

- Backend running: `cd backend && source .venv/bin/activate && uvicorn app.main:app --reload`
- Book site running: `cd book-site && npm start`
- Backend URL configured: `DOCUSAURUS_BACKEND_URL=http://localhost:8000` (or default fallback)

---

## Scenario 1: Basic Selection → Question → Answer (US1)

1. Open any chapter page (e.g., `http://localhost:3000/docs/module-1-ros2`)
2. Use mouse to highlight a paragraph of text (at least 10 characters)
3. **Expected**: Small "Ask AI" popup button appears near the end of the selection within 300ms
4. Click "Ask AI"
5. **Expected**: Chat panel opens with the selected text shown in a grey context block at the top
6. Type a question: "Can you explain this in simpler terms?"
7. Press Enter or click Send
8. **Expected**: Loading indicator appears, then answer streams in token by token
9. **Expected**: Citations appear at the bottom of the answer, referencing the selected passage and related sections

---

## Scenario 2: Follow-up Question (US2)

1. Complete Scenario 1 above
2. Without closing the panel, type another question: "What is a practical example of this?"
3. **Expected**: The selected text context block remains visible at the top
4. **Expected**: Answer incorporates the original selected passage as context
5. Click the "✕" close button
6. **Expected**: Panel closes, context cleared

---

## Scenario 3: Short Selection Suppression (Edge Case)

1. Select just a single word or 5 characters of text
2. **Expected**: No popup appears (selection < 10 characters)
3. Select a full sentence (20+ characters)
4. **Expected**: Popup appears correctly

---

## Scenario 4: Code Block Exclusion (Edge Case)

1. Navigate to a chapter with code examples
2. Select text inside a `<code>` or `<pre>` block
3. **Expected**: No popup appears (code blocks excluded per spec)
4. Select text in the prose paragraph above the code block
5. **Expected**: Popup appears correctly

---

## Scenario 5: Viewport Edge Clamping (FR-012)

1. Select text in the first line of a page (near the top of the viewport)
2. **Expected**: Popup appears below the selection (not above, since there's no room above)
3. Select text near the right edge of the page
4. **Expected**: Popup stays within the visible viewport width

---

## Scenario 6: Deselect Dismisses Popup (FR-003)

1. Highlight text — popup appears
2. Click anywhere outside the selection to deselect
3. **Expected**: Popup disappears immediately
4. Highlight text again — popup reappears

---

## Scenario 7: New Selection While Panel Open

1. Open panel with a selection (Scenario 1)
2. Without closing, select different text on the page
3. **Expected**: Popup appears for the new selection but panel stays open with original context
4. (The new popup click would open a new panel session; panel context is not replaced mid-session)

---

## Integration Test Checklist

- [ ] Popup appears on every chapter page (not just one)
- [ ] Popup does not appear on code/pre elements
- [ ] Popup disappears on deselect
- [ ] Panel opens with context block on "Ask AI" click
- [ ] Streaming works end-to-end (search → chat → SSE)
- [ ] Citations displayed correctly
- [ ] Follow-up question uses same context
- [ ] Close button clears state
- [ ] Popup dismissed on page navigation
- [ ] Mobile: popup appears above selection
