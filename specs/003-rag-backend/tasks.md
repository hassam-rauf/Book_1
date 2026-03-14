# Tasks: RAG Backend (F3)

**Input**: Design documents from `/specs/003-rag-backend/`
**Branch**: `003-rag-backend`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/openapi.yaml ✅

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1, US2, US3)
- All paths relative to repo root

---

## Phase 1: Setup (Project Scaffold)

**Purpose**: Create `backend/` directory structure, dependencies, and configuration files.

- [x] T001 Create `backend/` directory structure: `app/`, `app/services/`, `tests/` per plan.md
- [x] T002 Create `backend/requirements.txt` with: fastapi, uvicorn[standard], google-generativeai, qdrant-client, python-dotenv, pydantic>=2.0, httpx, pytest
- [x] T003 [P] Create `backend/.env.example` with all required vars: GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION, ALLOWED_ORIGINS, PORT, DOCS_DIR
- [x] T004 [P] Create `backend/app/__init__.py` and `backend/app/services/__init__.py` (empty init files)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure all user stories depend on — models, config loader, service interfaces, FastAPI app skeleton.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Create `backend/app/config.py` — load and validate all env vars at import time; raise `SystemExit(1)` with clear message if GEMINI_API_KEY, QDRANT_URL, or QDRANT_API_KEY are missing
- [x] T006 Create `backend/app/models.py` — define Pydantic v2 schemas: `SearchRequest` (query: str, top_k: int = 5), `SearchResultItem`, `SearchResponse`, `HealthResponse` per data-model.md
- [x] T007 Create `backend/app/chunker.py` — implement `chunk_markdown_file(file_path) -> list[Chunk]`:
  - Strip YAML frontmatter (`---` blocks)
  - Strip Mermaid blocks (`` ```mermaid ... ``` ``)
  - Parse `chapter_title` from `title:` frontmatter field
  - Derive `module` from first path segment
  - Split on `## ` headings; for sections >512 tokens (~2048 chars), apply sliding window (512 tokens, 50-token overlap)
  - Generate deterministic `id` using UUID v5 (namespace=`uuid.uuid5(NAMESPACE_URL, "https://github.com/hassam-rauf/Book_1")`, key=`path#index`)
  - Skip chunks with fewer than 20 characters
  - Return list of dicts with: id, text, source_path, chapter_title, section_heading, chunk_index, module, word_count
- [x] T008 Create `backend/app/services/gemini_service.py` — implement `GeminiService` class:
  - `__init__`: configure `google.generativeai` with API key from config
  - `embed_documents(texts: list[str]) -> list[list[float]]`: call `genai.embed_content` with `task_type="RETRIEVAL_DOCUMENT"`, model `models/text-embedding-004`
  - `embed_query(text: str) -> list[float]`: call with `task_type="RETRIEVAL_QUERY"`
  - No Gemini imports outside this file (Constitution Principle IV)
- [x] T009 Create `backend/app/services/qdrant_service.py` — implement `QdrantService` class:
  - `__init__`: create `QdrantClient(url, api_key)` from config
  - `ensure_collection(name: str, vector_size: int = 768)`: create collection with `Distance.COSINE` if not exists (use `recreate_collection` with `exists_ok` or check first)
  - `upsert_batch(collection: str, points: list[PointStruct])`: upsert with `wait=True`
  - `search(collection: str, vector: list[float], top_k: int) -> list[ScoredPoint]`: cosine similarity search
  - `collection_info(collection: str) -> dict`: return vector_count and collection_name; return `{"vector_count": 0, "error": str}` on failure
- [x] T010 Create `backend/app/main.py` — FastAPI app skeleton:
  - Import config at module level (triggers validation)
  - Add `CORSMiddleware` with origins from `config.ALLOWED_ORIGINS` (split on comma)
  - Register `/health` and `/search` routers (stubs returning 501 for now)
  - Add lifespan context manager for startup log message

**Checkpoint**: Foundation complete — `python -c "from app.main import app"` runs without error; missing env vars produce clear exit message.

---

## Phase 3: User Story 1 — Operator Ingests Book Content (Priority: P1) 🎯 MVP

**Goal**: `python ingest.py` reads all 19 chapter files, chunks them, embeds with Gemini, and upserts to Qdrant Cloud.

**Independent Test**:
```bash
cd backend && python ingest.py
# Then verify:
curl http://localhost:8000/health
# Expect: vector_count >= 200
```

### Implementation

- [x] T011 [US1] Create `backend/ingest.py` — CLI ingestion script:
  - `glob.glob(f"{DOCS_DIR}/**/*.md", recursive=True)` to find all markdown files
  - Call `chunker.chunk_markdown_file(f)` for each file, collect all chunks
  - Log: total files found, total chunks generated
  - Call `qdrant_service.ensure_collection(COLLECTION)` to create collection if absent
  - Batch chunks into groups of 100
  - For each batch: call `gemini_service.embed_documents([c["text"] for c in batch])`
  - Build `PointStruct(id=c["id"], vector=embedding, payload={...all chunk fields...})` for each
  - Call `qdrant_service.upsert_batch(COLLECTION, batch_points)`
  - Log progress: `"Upserted batch N/M (K chunks)"`
  - Print final summary: `"Ingestion complete. {total} vectors in collection '{COLLECTION}'"`
  - Handle `google.api_core.exceptions.ResourceExhausted` (rate limit) with 60-second retry wait
- [x] T012 [US1] Add `backend/tests/test_chunker.py` — unit tests for chunker:
  - Test: frontmatter is stripped from output text
  - Test: Mermaid blocks are stripped
  - Test: heading-based splitting produces correct `section_heading` values
  - Test: long section (>2048 chars) produces multiple chunks with overlap
  - Test: deterministic IDs — same input always produces same ID
  - Test: chunks shorter than 20 chars are skipped
  - Test: `chapter_title` is parsed from frontmatter `title:` field

**Checkpoint**: Run `python ingest.py` → no errors, Qdrant collection has ≥200 vectors. Run `pytest tests/test_chunker.py` → all pass.

---

## Phase 4: User Story 2 — Chat Widget Searches Passages (Priority: P2)

**Goal**: `POST /search` returns ranked passages with source metadata in ≤3 seconds.

**Independent Test**:
```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "how does ROS 2 publish-subscribe work?", "top_k": 3}'
# Expect: 3 results, top result from module-1, score > 0.7
```

### Implementation

- [x] T013 [US2] Implement `POST /search` endpoint in `backend/app/main.py` (or `backend/app/routes/search.py`):
  - Accept `SearchRequest` body (Pydantic auto-validates, returns 422 on bad input)
  - Call `gemini_service.embed_query(request.query)` → 768-dim vector
  - Call `qdrant_service.search(COLLECTION, vector, request.top_k)` → scored points
  - Map each `ScoredPoint` to `SearchResultItem` using `point.payload` fields + `point.score`
  - Return `SearchResponse(results=items, query=request.query, total=len(items))`
  - On `Exception` from Gemini or Qdrant: raise `HTTPException(503, detail=str(e))`
- [x] T014 [US2] Add `backend/tests/test_search_endpoint.py` — integration tests with mocked services:
  - Test: valid request returns 200 with correct response shape
  - Test: `top_k` defaults to 5 when omitted
  - Test: `top_k=0` returns 422 validation error
  - Test: `top_k=21` returns 422 validation error
  - Test: empty `query` string returns 422
  - Test: Gemini API error returns 503 with `detail` field

**Checkpoint**: `POST /search` returns semantically relevant results. `pytest tests/test_search_endpoint.py` → all pass.

---

## Phase 5: User Story 3 — Developer Health Monitoring (Priority: P3)

**Goal**: `GET /health` returns service status and Qdrant collection stats without crashing when Qdrant is unreachable.

**Independent Test**:
```bash
curl http://localhost:8000/health
# Expect: {"status":"ok","collection_name":"physical-ai-book","vector_count":N,"message":""}
```

### Implementation

- [x] T015 [US3] Implement `GET /health` endpoint in `backend/app/main.py`:
  - Call `qdrant_service.collection_info(COLLECTION)`
  - If success: return `HealthResponse(status="ok", collection_name=COLLECTION, vector_count=count, message="")`
  - If exception: return `HealthResponse(status="degraded", collection_name=COLLECTION, vector_count=0, message=str(e))`
  - Always return HTTP 200 (degraded is a status field, not an HTTP error)
- [x] T016 [US3] Add `backend/tests/test_health_endpoint.py` — integration tests:
  - Test: healthy Qdrant returns `status: "ok"` with `vector_count >= 0`
  - Test: unreachable Qdrant returns `status: "degraded"` (still HTTP 200)
  - Test: response always contains `collection_name` and `vector_count` fields

**Checkpoint**: `GET /health` returns valid JSON in both healthy and degraded states. `pytest tests/test_health_endpoint.py` → all pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: CORS validation, logging, documentation, and final integration verification.

- [x] T017 [P] Add structured logging to `backend/app/main.py` — log each `/search` request with query length and response time (use `time.perf_counter()`)
- [x] T018 [P] Create `backend/README.md` — copy quickstart.md content, add troubleshooting table
- [ ] T019 Verify CORS works end-to-end: start server, open `http://localhost:3000` in browser, make fetch() to `http://localhost:8000/search`, confirm no CORS errors in console
- [x] T020 Run full test suite: `cd backend && pytest tests/ -v` — all tests pass
- [ ] T021 Run `python ingest.py` on clean collection, verify `vector_count` matches chunk count, run `/search` for 3 different queries and manually verify top result relevance

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundation)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 Ingest)**: Depends on Phase 2 — can start after foundation
- **Phase 4 (US2 Search)**: Depends on Phase 2 — can start in parallel with US1
- **Phase 5 (US3 Health)**: Depends on Phase 2 — can start in parallel with US1/US2
- **Phase 6 (Polish)**: Depends on US1 + US2 + US3 all complete

### User Story Dependencies

- **US1 (Ingest)**: Needs chunker (T007), gemini_service (T008), qdrant_service (T009)
- **US2 (Search)**: Needs gemini_service (T008), qdrant_service (T009), models (T006) — also benefits from US1 being run first to populate data
- **US3 (Health)**: Needs qdrant_service (T009) only

### Parallel Opportunities

- T003 and T004 can run in parallel with T002
- T007 (chunker), T008 (gemini_service), T009 (qdrant_service) can all be written in parallel after T005 + T006
- T012 (chunker tests) can be written in parallel with T011 (ingest.py)
- T014 (search tests) can be written in parallel with T013 (search endpoint)
- T015 (health endpoint) can be written in parallel with T013 (search endpoint)
- T017 and T018 can be written in parallel

---

## Parallel Example: Phase 2 Foundation

```bash
# These 5 tasks can run in parallel (different files):
Task T005: backend/app/config.py
Task T006: backend/app/models.py
Task T007: backend/app/chunker.py
Task T008: backend/app/services/gemini_service.py
Task T009: backend/app/services/qdrant_service.py
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundation (T005–T010) — **do not skip**
3. Complete Phase 3: US1 Ingest (T011–T012)
4. **STOP and VALIDATE**: `python ingest.py` → ≥200 vectors in Qdrant
5. MVP is useful: book is indexed and searchable via Qdrant console

### Incremental Delivery

1. Setup + Foundation → backend boots cleanly
2. US1 (Ingest) → data in Qdrant ✅
3. US2 (Search) → `/search` returns results → chat widget can be built ✅
4. US3 (Health) → `/health` endpoint → monitoring ✅
5. Polish → CORS validated, all tests pass, docs complete ✅

---

## Notes

- [P] tasks touch different files — safe to parallelize
- Ingest must be run at least once before `/search` will return meaningful results
- `python-dotenv` loads `.env` automatically when `from dotenv import load_dotenv; load_dotenv()` is called in config.py
- Free-tier Qdrant: keep batch size ≤100 to avoid timeout errors
- Always test with `pytest tests/ -v` before committing
