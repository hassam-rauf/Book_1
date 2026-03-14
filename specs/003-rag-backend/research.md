# Research: RAG Backend (F3)

**Date**: 2026-03-14
**Feature**: 003-rag-backend
**Status**: Complete — all decisions resolved

---

## Decision 1: Embedding Model

**Decision**: Use `text-embedding-004` as specified; note `gemini-embedding-001` as the current non-deprecated alternative if availability issues arise.

**Rationale**: The project spec explicitly calls for `text-embedding-004`. The model produces 768-dimensional vectors. If the API signals deprecation, swap in `gemini-embedding-001` (same dimensions, same interface) in the service layer only — no other code changes needed due to Constitution Principle IV.

**Spec**:
- Vector dimension: 768
- Max input tokens: 3,000
- Task type: `RETRIEVAL_DOCUMENT` for indexing, `RETRIEVAL_QUERY` for search queries

**Alternatives considered**: OpenAI `text-embedding-3-small` (1536-dim) — rejected per constitution (no OpenAI SDK).

---

## Decision 2: Chunking Strategy

**Decision**: Markdown section-based chunking — split on `##` headings first, then recursively split sections exceeding 512 tokens using character-based windows with 50-token overlap.

**Rationale**: Textbook chapters are structured around section headings. Keeping heading context intact improves retrieval relevance. Pure fixed-size chunking cuts mid-sentence. Sentence-based is too fine-grained for technical content.

**Algorithm**:
1. Strip frontmatter (`---` blocks) and Mermaid diagram blocks (`\`\`\`mermaid ... \`\`\``)
2. Split on `## ` headings — each section becomes a candidate chunk
3. If a section exceeds 512 tokens (~2,048 chars), split it with sliding window (512 tokens, 50-token overlap)
4. Preserve `section_heading` from the nearest preceding heading in metadata

**Alternatives considered**: Fixed-size sliding windows (loses heading context), LangChain RecursiveCharacterTextSplitter (adds unnecessary dependency).

---

## Decision 3: Chunk ID Generation

**Decision**: UUID v5 derived from a project namespace + normalized file path + chunk index.

**Rationale**: Deterministic IDs enable idempotent upserts — re-running ingestion never creates duplicates in Qdrant.

**Implementation**:
```python
PROJECT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_URL, "https://github.com/hassam-rauf/Book_1")

def make_chunk_id(file_path: str, chunk_index: int) -> int:
    key = f"{file_path.lower().replace(chr(92), '/')}#{chunk_index}"
    return int(uuid.uuid5(PROJECT_NAMESPACE, key).int % (2**63))
```

**Alternatives considered**: Sequential integers (not idempotent), hash(text) (breaks if text changes).

---

## Decision 4: Qdrant Collection Configuration

**Decision**: Single collection `physical-ai-book` (configurable via `QDRANT_COLLECTION` env var), Cosine distance, 768-dim vectors.

**Qdrant Python client pattern**:
```python
client.recreate_collection(  # or create_collection with exists_ok=True
    collection_name=COLLECTION,
    vectors_config=VectorParams(size=768, distance=Distance.COSINE),
)
```

**Upsert pattern**: Batch points in groups of 100 to stay within free-tier request limits.

**Alternatives considered**: Dot product distance (requires normalized vectors), Euclidean (not standard for semantic search).

---

## Decision 5: Backend Directory Structure

**Decision**: `backend/` directory at repo root, separate from `book-site/`. The FastAPI app is a standalone Python service.

**Rationale**: Clean separation between the Docusaurus static site and the Python API server. The backend can be deployed independently (e.g., Railway, Fly.io, or locally during development).

**Structure**:
```
backend/
├── app/
│   ├── main.py          # FastAPI app + CORS + routes
│   ├── services/
│   │   ├── gemini_service.py   # All Gemini API calls (Constitution IV)
│   │   └── qdrant_service.py   # All Qdrant calls
│   ├── models.py        # Pydantic request/response schemas
│   └── chunker.py       # Markdown chunking logic
├── ingest.py            # Standalone CLI ingestion script
├── requirements.txt
└── .env.example
```

**Alternatives considered**: Monorepo packages (overkill for hackathon scope), FastAPI inside book-site (mixes concerns).

---

## Decision 6: CORS Configuration

**Decision**: Explicit origin list — no wildcard. Allow `http://localhost:3000`, `http://localhost:8000`, `https://hassam-rauf.github.io`.

**Rationale**: Using `["*"]` with credentials causes browser CORS errors. Explicit list is required when cookies or auth headers may be sent (F6 auth integration).

**Pattern**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

**Alternatives considered**: Wildcard origins (breaks with credentials in F6).

---

## Decision 7: Ingestion Script vs Always-On Service

**Decision**: Ingestion is a one-shot CLI script (`python ingest.py`), not a background service. The FastAPI server handles only search at runtime.

**Rationale**: Ingestion only needs to run when book content changes. Running it as a background thread adds unnecessary complexity and memory overhead.

**Re-ingestion trigger**: After any F2 chapter update, maintainer runs `python ingest.py` manually or via CI.

---

## Summary Table

| Topic | Decision | Key Constraint |
|-------|----------|----------------|
| Embedding model | `text-embedding-004` (768-dim) | `RETRIEVAL_DOCUMENT` / `RETRIEVAL_QUERY` task types |
| Chunking | Section-based + 512-token max + 50-token overlap | Strip frontmatter + Mermaid blocks |
| Chunk IDs | UUID v5 (project namespace + path + index) | Deterministic → idempotent upserts |
| Qdrant collection | Cosine distance, 768-dim, batch 100 | Free-tier safe |
| Directory | `backend/` at repo root | Isolated from Docusaurus |
| CORS | Explicit origin list | Required for F6 auth |
| Ingestion | CLI script, not background service | Run manually after content changes |
