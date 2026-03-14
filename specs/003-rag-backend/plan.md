# Implementation Plan: RAG Backend

**Branch**: `003-rag-backend` | **Date**: 2026-03-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-rag-backend/spec.md`

---

## Summary

Build a Python FastAPI service that ingests the 19 Physical AI textbook chapters into Qdrant Cloud via Gemini embeddings, and exposes a `/search` endpoint for the chat widget (F4) to retrieve semantically relevant passages. Ingestion is a one-shot CLI script (`python ingest.py`); the FastAPI server handles only search queries at runtime.

---

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, uvicorn, google-generativeai, qdrant-client, python-dotenv, pydantic v2
**Storage**: Qdrant Cloud (vector store, free tier); no SQL for this feature
**Testing**: pytest with httpx (FastAPI test client); manual curl tests for integration
**Target Platform**: Local dev (Linux/macOS/Windows); production on any Python-capable host (Fly.io, Railway)
**Project Type**: Single backend service (`backend/` directory at repo root)
**Performance Goals**: `/search` responds in ≤3 seconds; ingestion processes all 19 chapters in ≤5 minutes
**Constraints**: Free-tier Qdrant (1GB storage, 1 collection); Gemini free-tier rate limits (handle with batching + backoff)
**Scale/Scope**: ~312 chunks from 19 chapters; single collection; single user at a time (hackathon scope)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|---------|
| I. Spec-Driven Development | ✅ PASS | spec.md → plan.md → tasks.md before any code |
| II. Smallest Viable Diff | ✅ PASS | No extra features; only `/search` + `/health` + `ingest.py` |
| III. Content Accuracy First | ✅ N/A | No book content changes in this feature |
| IV. Provider-Agnostic Service Layer | ✅ PASS | All Gemini calls isolated in `services/gemini_service.py`; Qdrant calls in `services/qdrant_service.py` |
| V. Free-Tier Resilient | ✅ PASS | Qdrant free tier; Gemini free tier; batch embeds 100 at a time; rate limit backoff |
| VI. Security by Default | ✅ PASS | All secrets via `.env`; CORS explicit origins; input validated by Pydantic |
| VII. Subagent Reusability | ✅ N/A | No new subagents in this feature |

**No violations. Gate passed.**

---

## Project Structure

### Documentation (this feature)

```text
specs/003-rag-backend/
├── plan.md              ← This file
├── research.md          ← Phase 0 decisions
├── data-model.md        ← Entities and schemas
├── quickstart.md        ← Local dev guide
├── contracts/
│   └── openapi.yaml     ← API contract
└── tasks.md             ← Phase 2 output (sp.tasks)
```

### Source Code

```text
backend/
├── app/
│   ├── main.py                    # FastAPI app: CORS, lifespan, routes
│   ├── models.py                  # Pydantic v2: SearchRequest/Response, HealthResponse
│   ├── chunker.py                 # Markdown → chunks (heading-split + sliding window)
│   └── services/
│       ├── gemini_service.py      # embed_content (RETRIEVAL_DOCUMENT / RETRIEVAL_QUERY)
│       └── qdrant_service.py      # create_collection, upsert_batch, search
├── ingest.py                      # CLI: reads docs/, chunks, embeds, upserts
├── requirements.txt               # fastapi uvicorn google-generativeai qdrant-client python-dotenv
├── .env.example                   # Template (committed); .env (gitignored)
└── tests/
    ├── test_chunker.py            # Unit tests: chunking logic
    ├── test_search_endpoint.py    # Integration: POST /search (mock Gemini + Qdrant)
    └── test_health_endpoint.py    # Integration: GET /health
```

**Structure Decision**: Single Python project in `backend/` (no monorepo packages). All source in `app/`, isolated service layer per Constitution Principle IV.

---

## Architecture Decisions

### Decision 1: Chunking Pipeline

```
Markdown file
    │
    ▼ strip: frontmatter (---...---), mermaid blocks (```mermaid...```)
    │
    ▼ split on "## " headings → list of (heading, body) tuples
    │
    ▼ for each section: if len(tokens) ≤ 512 → single chunk
    │                   else → sliding windows (512 tokens, 50-token overlap)
    │
    ▼ yield Chunk(text, source_path, chapter_title, section_heading, chunk_index, module)
```

**Token approximation**: `len(text) // 4` (1 token ≈ 4 chars). No external tokenizer required.

**Metadata extraction**:
- `chapter_title`: from frontmatter `title:` field
- `module`: from first path segment (e.g., `module-1`, `appendices`, `capstone`, `intro`)
- `source_path`: relative to `docs/` root

### Decision 2: Embedding Service Interface

```python
# services/gemini_service.py interface (provider-agnostic callers)
class GeminiService:
    def embed_documents(self, texts: list[str]) -> list[list[float]]: ...
    def embed_query(self, text: str) -> list[float]: ...
```

Callers use only `embed_documents` / `embed_query` — no Gemini imports outside this file.

### Decision 3: Ingestion Flow

```
ingest.py
    │
    ▼ glob docs/**/*.md → 19 files
    │
    ▼ chunk each file → ~312 chunks total
    │
    ▼ ensure_collection_exists (create if not present)
    │
    ▼ batch embed 100 chunks at a time (rate-limit safe)
    │
    ▼ upsert batch to Qdrant (wait=True for durability)
    │
    ▼ print summary: N chunks upserted, collection vector_count
```

### Decision 4: Search Flow

```
POST /search {query, top_k}
    │
    ▼ Pydantic validation
    │
    ▼ gemini_service.embed_query(query)  # task=RETRIEVAL_QUERY
    │
    ▼ qdrant_service.search(vector, top_k) → ScoredPoint[]
    │
    ▼ map ScoredPoint.payload → SearchResultItem[]
    │
    ▼ return SearchResponse {results, query, total}
```

### Decision 5: Error Handling

| Error | HTTP Status | Behavior |
|-------|------------|---------|
| Gemini API error during search | 503 | Return error detail, log traceback |
| Qdrant unreachable during search | 503 | Return error detail |
| Pydantic validation failure | 422 | FastAPI auto-handles |
| Missing env vars at startup | N/A | `SystemExit(1)` with clear message |
| Health check — Qdrant unreachable | 200 (degraded) | Return `status: "degraded"`, no 500 |

---

## Implementation Phases

### Phase A: Project Scaffold (tasks T001–T004)
Set up `backend/` directory, `requirements.txt`, `.env.example`, FastAPI skeleton with health endpoint.

### Phase B: Chunker (tasks T005–T007)
Implement `chunker.py`: frontmatter stripping, Mermaid removal, heading split, sliding window, metadata extraction.

### Phase C: Service Layer (tasks T008–T011)
Implement `gemini_service.py` (embed_documents, embed_query) and `qdrant_service.py` (create_collection, upsert_batch, search).

### Phase D: Ingestion CLI (tasks T012–T014)
Implement `ingest.py`: file discovery, chunking, batched embedding, batched upsert, summary report.

### Phase E: Search Endpoint (tasks T015–T017)
Implement `POST /search` route with Pydantic validation, embed_query call, Qdrant search, response mapping.

### Phase F: Testing (tasks T018–T021)
Unit tests for chunker. Integration tests for `/search` and `/health` using pytest + httpx.

### Phase G: Documentation (task T022)
Update `quickstart.md` with verified commands; add `backend/README.md`.

---

## Complexity Tracking

*No constitution violations — section left empty.*
