# Data Model: Text-Selection Q&A (F5)

## Frontend State Entities

### SelectionState (React state in SelectionPopup)

```
SelectionState {
  text: string              // selected text content (trimmed)
  rect: DOMRect | null      // bounding rect of selection for popup positioning
  isVisible: boolean        // whether popup button is shown
}
```

**Constraints**:
- `text.length >= 10` to show popup (FR-011)
- `rect` must be non-null when `isVisible === true`
- Reset to `{ text: '', rect: null, isVisible: false }` on deselect, click-away, or route change

---

### SelectionPanelState (React state in SelectionChatPanel)

```
SelectionPanelState {
  isOpen: boolean           // whether the chat panel is visible
  selectedContext: string   // read-only context from selection (persists for session)
  messages: ChatMessage[]   // reused from F4 types.ts
  loading: boolean          // streaming in progress
  validationMsg: string     // inline validation error
}
```

**Note**: `selectedContext` is set once when the panel opens (from `SelectionState.text`) and does not change while the panel is open (US2 — follow-up questions).

---

### ChatMessage (reused from F4 types.ts)

```
ChatMessage {
  id: string                // unique message id
  role: 'user' | 'assistant'
  content: string           // message text (built up during streaming)
  citations: Citation[]     // populated when 'citations' chunk arrives
  timestamp: number         // epoch ms
  isStreaming: boolean      // true while SSE stream is active
}
```

---

### Citation (reused from F4 types.ts)

```
Citation {
  index: number
  chapter_title: string
  section_heading: string
  score: float
  excerpt?: string
}
```

---

## Backend Entities (no changes — existing models reused)

### ContextPassage (existing — backend/app/models.py)

```
ContextPassage {
  text: str                  // passage content
  chapter_title: str         // used for citation display
  section_heading: str       // used for citation display
  score: float               // 1.0 for selected text (synthetic highest priority)
}
```

**F5 usage**: Selected text is wrapped in a `ContextPassage` with:
- `text` = selected text
- `chapter_title` = "Selected Text" (synthetic)
- `section_heading` = current page title (extracted from document.title)
- `score` = 1.0

---

### ChatRequest (existing — backend/app/models.py)

```
ChatRequest {
  query: str                          // min_length=1, max_length=1000
  context_passages: ContextPassage[]  // min_length=1, max_length=10
}
```

**F5 usage**: `context_passages[0]` = selected text passage (score 1.0), followed by RAG passages (scores < 1.0 from /search).

---

## Component Tree

```
Root.tsx (Docusaurus swizzle — existing)
├── {children}                         (page content)
├── ChatWidget (existing F4)           (floating button → chat panel)
└── SelectionPopup (new F5)            (global selection listener)
    ├── SelectionButton                (small "Ask AI" popup near selection)
    └── SelectionChatPanel             (panel with context block + chat)
        ├── ContextBlock               (read-only selected text display)
        ├── MessageList (reused F4)    (message thread)
        └── CitationList (reused F4)   (citation cards)
```

---

## State Machine — SelectionPopup

```
IDLE
  → [text selected, len >= 10, not in code block]
  → POPUP_VISIBLE (show SelectionButton near selection)

POPUP_VISIBLE
  → [click away / deselect / route change] → IDLE
  → [click "Ask AI"] → PANEL_OPEN

PANEL_OPEN
  → [close button] → IDLE (clears context + messages)
  → [submit question] → STREAMING (loading=true)
  → [route change] → IDLE

STREAMING
  → [done/error chunk] → PANEL_OPEN (loading=false)
```
