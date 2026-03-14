# Data Model: RAG Backend (F3)

**Date**: 2026-03-14
**Feature**: 003-rag-backend

---

## Entity 1: Chunk (stored in Qdrant)

Represents a segment of textbook content embedded as a vector.

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `id` | `int64` | Derived (UUID v5) | Deterministic ID from `file_path + chunk_index` |
| `vector` | `float32[768]` | Gemini API | Embedding from `text-embedding-004`, task=`RETRIEVAL_DOCUMENT` |
| `text` | `str` | Chunker | Raw text content (400–600 tokens typically, 512 max) |
| `source_path` | `str` | File system | Relative path, e.g., `module-1/ch01-intro-physical-ai.md` |
| `chapter_title` | `str` | Frontmatter | Parsed from `title:` frontmatter field |
| `section_heading` | `str` | Markdown | Nearest preceding `##` heading; empty string if before first heading |
| `chunk_index` | `int` | Chunker | 0-based index within the source file |
| `module` | `str` | Path | Derived from path segment, e.g., `module-1`, `appendices`, `capstone` |
| `word_count` | `int` | Chunker | Word count of the chunk text |

### State: Chunk lifecycle

```
File on disk
     │
     ▼
[chunker.py] → strips frontmatter + Mermaid blocks → splits on ## headings
     │
     ▼
[gemini_service.py] → embed(text, task=RETRIEVAL_DOCUMENT) → float32[768]
     │
     ▼
[qdrant_service.py] → PointStruct(id, vector, payload) → upsert to Qdrant
```

### Validation rules

- `text` MUST be non-empty and ≥20 characters (skip degenerate chunks)
- `source_path` MUST be relative (no absolute paths stored)
- `chunk_index` MUST be ≥0 and unique per `source_path`
- `vector` MUST have exactly 768 dimensions (validated before upsert)

---

## Entity 2: SearchResult (API response)

Represents a single ranked retrieval result returned by `POST /search`.

| Field | Type | Source | Description |
|-------|------|--------|-------------|
| `text` | `str` | Qdrant payload | The chunk text content |
| `source_path` | `str` | Qdrant payload | Relative file path of the source chapter |
| `chapter_title` | `str` | Qdrant payload | Human-readable chapter title |
| `section_heading` | `str` | Qdrant payload | Section heading where chunk was found |
| `module` | `str` | Qdrant payload | Module identifier |
| `score` | `float` | Qdrant | Cosine similarity score in range [0.0, 1.0] |
| `chunk_index` | `int` | Qdrant payload | Position within source file |

---

## Entity 3: Qdrant Collection Configuration

| Setting | Value | Rationale |
|---------|-------|-----------|
| `collection_name` | `physical-ai-book` (env: `QDRANT_COLLECTION`) | Configurable |
| `vector_size` | `768` | Gemini text-embedding-004 output dimension |
| `distance` | `Cosine` | Standard for normalized semantic embeddings |
| `on_disk_payload` | `false` | Keep payloads in RAM for free-tier speed |

---

## Entity 4: API Request/Response Schemas (Pydantic)

```python
# models.py

class SearchRequest(BaseModel):
    query: str                          # User's natural language question
    top_k: int = Field(5, ge=1, le=20)  # Number of results (default 5, max 20)

class SearchResultItem(BaseModel):
    text: str
    source_path: str
    chapter_title: str
    section_heading: str
    module: str
    score: float
    chunk_index: int

class SearchResponse(BaseModel):
    results: list[SearchResultItem]
    query: str
    total: int                          # Number of results returned

class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    collection_name: str
    vector_count: int
    message: str = ""                   # Error description when degraded
```

---

## Entity 5: Environment Configuration

All secrets loaded from `.env` at startup. Missing required vars → `SystemExit(1)`.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | — | Gemini API key for embeddings |
| `QDRANT_URL` | ✅ Yes | — | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | ✅ Yes | — | Qdrant Cloud API key |
| `QDRANT_COLLECTION` | No | `physical-ai-book` | Collection name |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | Comma-separated CORS origins |
| `PORT` | No | `8000` | FastAPI server port |
| `DOCS_DIR` | No | `../book-site/docs` | Path to book content (for ingest.py) |
