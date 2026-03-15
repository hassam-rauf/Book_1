# RAG Backend — Physical AI Textbook

Semantic search + chat API for the Physical AI & Humanoid Robotics textbook.
Uses Gemini `text-embedding-004` for embeddings, `gemini-2.0-flash` for grounded chat answers, and Qdrant Cloud for vector storage.

## Quick Start

```bash
cd backend/
python -m venv .venv
source .venv/bin/activate    # Linux/macOS
# .venv\Scripts\activate     # Windows

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
```

## Ingest Book Content

```bash
python ingest.py
```

Expected: `✅ Ingestion complete. N vectors in collection 'physical-ai-book'.`

## Start API Server

```bash
uvicorn app.main:app --reload --port 8000
```

## Test Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Semantic search (F3)
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "how does ROS 2 publish-subscribe work?", "top_k": 3}'

# Grounded chat answer (F4) — returns SSE stream
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is DDS middleware?",
    "context_passages": [
      {
        "text": "DDS is a data-centric publish-subscribe standard used by ROS 2...",
        "chapter_title": "Chapter 3: ROS 2 Architecture",
        "section_heading": "3.2 DDS Middleware",
        "score": 0.91
      }
    ]
  }'
```

Interactive docs: http://localhost:8000/docs

## Auth Service (F6)

The profile endpoints (`GET /profile`, `PUT /profile`) require a running auth-service sidecar that manages sessions via better-auth.

**Start auth-service:**
```bash
cd auth-service/
npm install
cp .env.example .env
# Edit .env — set DATABASE_URL, BETTER_AUTH_SECRET (openssl rand -hex 32), BETTER_AUTH_URL, ALLOWED_ORIGINS
npm run db:push   # push Drizzle schema to Neon (first time only)
npm run dev       # starts on port 3001
```

**Required env vars** (in `auth-service/.env`):

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres WebSocket connection string |
| `BETTER_AUTH_SECRET` | 32+ char secret (`openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | `http://localhost:3001` (dev) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

**Also add to `backend/.env`:**
```
DATABASE_URL=postgres://user:pass@your-project.neon.tech/neondb?sslmode=require
```
(same Neon database — FastAPI reads the `session` table directly for auth validation)

## Run Tests

```bash
pytest tests/ -v
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `GEMINI_API_KEY not set` | Copy `.env.example` to `.env` and fill in values |
| `Qdrant connection refused` | Check `QDRANT_URL` and `QDRANT_API_KEY` |
| `vector_count: 0` after ingest | Check `DOCS_DIR` path points to `book-site/docs/` |
| CORS error in browser | Add your origin to `ALLOWED_ORIGINS` in `.env` |
| Rate limit during ingest | Retry — the script auto-waits 60s on quota errors |
| `/chat` returns empty answer | Ensure passages are not empty; check Gemini quota |
| Widget shows "Something went wrong" | Check backend is running at `DOCUSAURUS_BACKEND_URL` |
