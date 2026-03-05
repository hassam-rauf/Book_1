---
name: ingest-book
description: |
  Runs the RAG ingestion pipeline across all book chapters: chunk content, generate Gemini embeddings, and upsert to Qdrant Cloud.
  This skill should be used when book content has changed and the vector index needs rebuilding or when setting up RAG for the first time.
---

# Ingest Book

Run the full RAG ingestion pipeline for all book chapters.

## How This Skill Works

```
User: "/ingest-book [--chapter N] [--force]"
       ↓
1. Discover all .md files in book-site/docs/
       ↓
2. Chunk each file (500 chars, 50 overlap)
       ↓
3. Generate embeddings via Gemini text-embedding-004
       ↓
4. Upsert vectors to Qdrant Cloud collection
       ↓
5. Update metadata in Neon Postgres
       ↓
Output: Indexed chunks with progress report
```

## What This Skill Does

- Discovers and processes all chapter markdown files
- Coordinates the rag-ingestor subagent
- Tracks ingestion progress and reports results
- Handles incremental updates (single chapter re-index)

## What This Skill Does NOT Do

- Write or modify chapter content
- Configure Qdrant or Neon from scratch (setup is separate)
- Handle query-time RAG retrieval (that's the backend API)

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Files in `book-site/docs/`, existing `backend/scripts/ingest_book.py` |
| **Conversation** | Whether full re-index or incremental, any specific chapters |
| **Skill References** | rag-ingestor agent pipeline steps |
| **User Guidelines** | Environment variables (GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY) |

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| --chapter N | No | Only re-index chapter N (default: all) |
| --force | No | Delete and recreate collection before indexing |
| --dry-run | No | Count chunks without uploading |

## Execution Steps

### Step 1: Verify Environment

Check that required env vars exist:
- `GEMINI_API_KEY`
- `QDRANT_URL`
- `QDRANT_API_KEY`
- `DATABASE_URL` (Neon)

If missing, list which are absent and stop.

### Step 2: Discover Content

```
Glob: book-site/docs/**/*.md
```

List all files found. If `--chapter N` specified, filter to matching file.

### Step 3: Check Ingestion Script

Verify `backend/scripts/ingest_book.py` exists.
If not, invoke rag-ingestor agent to create it.

### Step 4: Run Ingestion

Invoke rag-ingestor agent with:
- File list from Step 2
- Force flag if `--force`
- Dry-run flag if `--dry-run`

Monitor progress: file N of M, chunks processed.

### Step 5: Verify Results

After ingestion completes:
1. Query Qdrant for collection stats (total vectors)
2. Query Neon for `book_metadata` table (last_indexed timestamps)
3. Run a test similarity search with a sample query

### Step 6: Report

```
Ingestion Complete:
- Files processed: N
- Total chunks: M
- Qdrant vectors: M (verified)
- Time taken: Xs
- Errors: [list or "none"]
```

## Error Handling

| Error | Action |
|-------|--------|
| Missing env vars | List missing vars, link to .env.example |
| Gemini rate limit (429) | Retry with exponential backoff (4s, 8s, 16s) |
| Qdrant connection refused | Check QDRANT_URL, suggest verifying Qdrant Cloud dashboard |
| Partial failure | Report which files failed, continue with rest |
| Script not found | Trigger rag-ingestor agent to create it |
