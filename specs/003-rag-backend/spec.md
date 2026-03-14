# Feature Specification: RAG Backend

**Feature Branch**: `003-rag-backend`
**Created**: 2026-03-14
**Status**: Draft
**Input**: F3 RAG backend — chunk all 19 book chapters, generate embeddings with Gemini text-embedding-004, upsert vectors into Qdrant Cloud, and expose a /search endpoint via a FastAPI service that the chat widget (F4) will query.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Operator Ingests Book Content (Priority: P1)

A course maintainer runs the ingestion pipeline to index all 19 textbook chapters into the vector database. After ingestion, the search service can retrieve semantically relevant passages for any query about the book content.

**Why this priority**: Ingestion is the prerequisite for everything else. Without vectors in the store, no search or chat features work.

**Independent Test**: Run the ingestion script against the 19 chapter files and verify that the Qdrant collection contains the expected number of vectors.

**Acceptance Scenarios**:

1. **Given** 19 Markdown chapter files exist in `book-site/docs/`, **When** the ingestion pipeline runs, **Then** all chapters are chunked, embedded, and stored as vectors in Qdrant Cloud with no errors.
2. **Given** the ingestion has completed, **When** a duplicate ingestion is triggered, **Then** existing vectors are upserted (not duplicated) and the collection size stays consistent.
3. **Given** a chapter file is empty or malformed, **When** ingestion runs, **Then** that file is skipped with a warning logged and the rest continue successfully.

---

### User Story 2 — Chat Widget Searches for Relevant Passages (Priority: P2)

The chat widget (F4) sends a user's question to the `/search` endpoint and receives the top-k most relevant passages from the textbook, along with source metadata (chapter title, section heading, page path).

**Why this priority**: This is the core RAG retrieval step that powers the chatbot's ability to give grounded, citation-backed answers.

**Independent Test**: Send a question directly to the `/search` endpoint via curl and verify it returns relevant passages with source metadata.

**Acceptance Scenarios**:

1. **Given** the Qdrant collection is populated, **When** a POST to `/search` is made with `{"query": "how does ROS 2 DDS work", "top_k": 5}`, **Then** the response contains 5 passages from the most semantically relevant chapters, each with `text`, `source_path`, `chapter_title`, and `score` fields.
2. **Given** a valid search request, **When** the Gemini embedding API is temporarily unavailable, **Then** the endpoint returns a 503 with a descriptive error message rather than an unhandled exception.
3. **Given** a query with no close matches (nonsense text), **When** `/search` is called, **Then** it still returns `top_k` results (lowest-scoring matches) rather than an empty array.

---

### User Story 3 — Developer Monitors Ingestion Health (Priority: P3)

A developer can query a `/health` endpoint to verify the FastAPI service is running and check basic Qdrant collection stats (vector count, collection name) without needing direct database access.

**Why this priority**: Operational visibility is needed for debugging but is not required for the core search functionality.

**Independent Test**: Hit `GET /health` and verify it returns collection stats without any authentication.

**Acceptance Scenarios**:

1. **Given** the service is running and Qdrant is reachable, **When** `GET /health` is called, **Then** the response includes `status: "ok"`, `vector_count`, and `collection_name`.
2. **Given** Qdrant is unreachable, **When** `GET /health` is called, **Then** the response returns `status: "degraded"` with an error description (not a 500 crash).

---

### Edge Cases

- What happens when a chapter has no meaningful text (only code blocks)? → Chunk is still indexed; code content is valid semantic content.
- How does the system handle very long chapters (>10,000 words)? → Chunking splits them into overlapping windows; no single chunk exceeds the embedding model's token limit.
- What if the Qdrant API key or Gemini API key is missing at startup? → Service fails fast with a clear configuration error rather than starting in a broken state.
- What if two chunks have identical text (e.g., repeated boilerplate)? → Upsert by deterministic ID deduplicates them automatically.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The ingestion pipeline MUST read all Markdown files from `book-site/docs/` recursively and chunk them into segments of 400–600 tokens with a 50-token overlap.
- **FR-002**: Each chunk MUST be embedded using Gemini `text-embedding-004` and stored in Qdrant Cloud with metadata: `source_path`, `chapter_title`, `section_heading`, `chunk_index`, `module`.
- **FR-003**: Chunk IDs MUST be deterministic (derived from file path + chunk index) so re-running ingestion upserts rather than duplicates vectors.
- **FR-004**: The FastAPI service MUST expose `POST /search` accepting `{"query": string, "top_k": int (default 5, max 20)}` and returning ranked passages with metadata and similarity scores.
- **FR-005**: The FastAPI service MUST expose `GET /health` returning service status and Qdrant collection statistics.
- **FR-006**: The service MUST validate API keys (Gemini, Qdrant) at startup and exit with a clear error if missing.
- **FR-007**: The ingestion pipeline MUST be runnable as a standalone CLI script (`python ingest.py`) independent of the FastAPI server.
- **FR-008**: All secrets (API keys, Qdrant URL) MUST be loaded from environment variables or a `.env` file; no hardcoded credentials.
- **FR-009**: The `/search` endpoint MUST respond within 3 seconds for any valid query under normal load.
- **FR-010**: The FastAPI service MUST include CORS headers permitting requests from the Docusaurus site origin to enable the chat widget (F4) to call it from the browser.

### Key Entities

- **Chunk**: A segment of text extracted from a chapter. Attributes: `id` (deterministic), `text` (400–600 tokens), `embedding` (768-dim float32 vector), `source_path`, `chapter_title`, `section_heading`, `chunk_index`, `module`, `word_count`.
- **SearchResult**: A ranked retrieval result. Attributes: `text`, `source_path`, `chapter_title`, `section_heading`, `score` (cosine similarity 0–1), `chunk_index`.
- **Collection**: The Qdrant vector collection. Attributes: `name` (configurable via env), `vector_size` (768 for text-embedding-004), `distance` (Cosine).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Ingestion of all 19 chapters completes without errors and results in ≥200 vectors stored in Qdrant Cloud.
- **SC-002**: A search query returns semantically relevant results — the top result for "how does ROS 2 publish-subscribe work" comes from a ROS 2 chapter (Module 1), verifiable manually.
- **SC-003**: The `/search` endpoint responds in under 3 seconds for any query on standard hardware (laptop or small cloud instance).
- **SC-004**: Re-running ingestion on already-indexed content produces no duplicate vectors (collection size stays stable after the second run).
- **SC-005**: The service starts cleanly with only `GEMINI_API_KEY`, `QDRANT_URL`, and `QDRANT_API_KEY` set, and fails with a human-readable error if any are missing.

---

## Assumptions

- The Docusaurus content is located at `book-site/docs/**/*.md` relative to the repo root.
- Gemini `text-embedding-004` produces 768-dimensional embeddings.
- Qdrant Cloud (free tier) is the target vector store; the collection name defaults to `physical-ai-book`.
- The FastAPI service will run on port 8000 by default, configurable via `PORT` env var.
- Chunking is by approximate token count (1 token ≈ 4 characters); an exact tokenizer is not required.
- The chat widget (F4) will call the `/search` endpoint from the browser (hence CORS requirement).
- Frontmatter and Mermaid diagram blocks should be stripped before embedding to reduce noise.
- Python 3.11+ is the target runtime for the backend service.
