# Data Model: Chat Widget (F4)

**Feature**: 004-chat-widget
**Date**: 2026-03-15

---

## Entities

### ChatMessage

Represents a single turn in a conversation session.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID v4) | Client-generated unique ID |
| `role` | `"user" \| "assistant"` | Who sent the message |
| `content` | `string` | Message text |
| `citations` | `Citation[]` | Source citations (assistant only; empty for user) |
| `timestamp` | `number` (epoch ms) | When the message was created |
| `isStreaming` | `boolean` | True while assistant is still receiving tokens |

**Validation**:
- `content` must be non-empty for user messages (FR-006)
- `content` may be empty string during streaming (partially received)

---

### Citation

A reference to a specific textbook passage returned by the RAG backend.

| Field | Type | Description |
|-------|------|-------------|
| `index` | `number` | 1-based citation number as it appears in answer |
| `chapter_title` | `string` | Chapter title from RAG passage metadata |
| `section_heading` | `string` | Section heading from RAG passage metadata |
| `score` | `number` | Relevance score (0–1) from Qdrant |
| `excerpt` | `string` (optional) | Short excerpt from the passage text |

---

### ConversationSession

In-memory list of ChatMessages for the current page visit. Not persisted.

| Field | Type | Description |
|-------|------|-------------|
| `messages` | `ChatMessage[]` | Ordered list of all turns |
| `isOpen` | `boolean` | Whether the chat panel is visible |
| `loading` | `boolean` | True while a request is in flight |

**Lifecycle**: Created when `Root.tsx` first mounts. Resets (empty messages) when the user navigates to a new page (Docusaurus re-mounts Root only on cold loads; SPA navigation preserves Root, so messages persist within a session by default).

---

## Backend Request/Response Schemas (Pydantic v2)

### ChatRequest (FastAPI — POST /chat)

```python
class ContextPassage(BaseModel):
    text: str
    chapter_title: str
    section_heading: str
    score: float

class ChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    context_passages: list[ContextPassage] = Field(..., min_length=1, max_length=10)
```

### ChatChunk (streamed via SSE)

Each SSE `data:` event carries one of these:

```python
class ChatChunk(BaseModel):
    type: Literal["token", "citations", "error", "done"]
    text: str | None = None          # present for type="token"
    citations: list[CitationItem] | None = None  # present for type="citations"
    detail: str | None = None        # present for type="error"
```

### CitationItem (in ChatChunk response)

```python
class CitationItem(BaseModel):
    index: int
    chapter_title: str
    section_heading: str
    score: float
    excerpt: str | None = None
```

---

## Frontend TypeScript Types

```ts
export interface Citation {
  index: number;
  chapter_title: string;
  section_heading: string;
  score: number;
  excerpt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Citation[];
  timestamp: number;
  isStreaming: boolean;
}
```

---

## State Transitions

```
ConversationSession state machine:

IDLE ─── user submits query ──► LOADING
  ▲                                 │
  │                         first SSE token
  │                                 │
  │                               STREAMING
  │                                 │
  │                      "done" event / error
  │                                 │
  └─────────────────────────────────┘
               IDLE
```

---

## Data Flow

```
[User types query]
        │
        ▼
[ChatWidget sends: POST /search]    ← existing F3 endpoint
        │
        ▼ (top-k passages)
[ChatWidget sends: POST /chat]      ← new F4 endpoint
        │                           (passes query + passages as context)
        ▼ (SSE stream)
[ChatWidget renders tokens]
        │
        ▼ (citations event)
[ChatWidget appends citation list]
```
