---
id: "043"
title: Implement F7 Personalization
stage: green
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 008-f7-personalization
branch: 008-f7-personalization
user: hassam_rauf
command: sp.implement
labels: ["green","personalization","fastapi","docusaurus","gemini","caching","react-markdown"]
links:
  spec: specs/008-f7-personalization/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - backend/migrations/001_personalized_chapter_cache.sql
  - backend/app/services/personalizer_service.py
  - backend/app/routes/personalize.py
  - backend/app/routes/profile.py
  - backend/app/main.py
  - backend/.env.example
  - book-site/src/components/Personalization/PersonalizationWrapper.tsx
  - book-site/src/theme/DocItem/Content/index.tsx
  - specs/008-f7-personalization/tasks.md
tests:
  - "GET /personalize/{slug} with session cookie returns 200 + generating:true on cache miss"
  - "GET /personalize/{slug} returns cached:true on repeat visit after background generation"
  - "GET /personalize/{slug}/status returns ready:true after generation completes"
  - "PUT /profile triggers invalidate_user_cache background task"
  - "PersonalizationWrapper renders default content for unauthenticated users"
  - "PersonalizationWrapper swaps in personalized markdown for authenticated users"
---

## Prompt

yes

## Response

Implemented all 24 tasks for F7 Content Personalization (008-f7-personalization). Full stale-while-revalidate personalization pipeline from Neon DB cache → Gemini 2.0 Flash generation → Docusaurus frontend swap.

### What was built

**Phase 1 — Setup**
- `backend/migrations/001_personalized_chapter_cache.sql`: CREATE TABLE with UNIQUE(user_id, chapter_slug) + user_id index
- `book-site/package.json`: already had react-markdown ^10.1.0, react-syntax-highlighter ^16.1.1, remark-gfm ^4.0.1

**Phase 2 — PersonalizerService (foundational)**
- `backend/app/services/personalizer_service.py`: Full PersonalizerService class
  - `get_or_enqueue()`: stale-while-revalidate — cache miss returns default+enqueues, fresh hit returns cache, stale returns stale+enqueues
  - `_compute_hash()`: SHA-256 of sorted JSON (experience_level, hardware, programming_background)
  - `_read_chapter()`: path traversal protection, reads from DOCS_DIR
  - `_build_prompt()`: detailed Gemini prompt with hardware/experience/background adaptation rules
  - `_generate_and_cache()`: background task calling Gemini 2.0 Flash + asyncpg UPSERT
  - `invalidate_user_cache()`, `cleanup_expired()`, `get_status()`

**Phase 3 — Personalization API (US1)**
- `backend/app/routes/personalize.py`: GET /personalize/{slug:path} + GET /personalize/{slug:path}/status
- `backend/app/main.py`: personalizer singleton, personalize_router registered, TTL cleanup in lifespan

**Phase 4 — Caching (US2)**
- `_read_cache` + `_write_cache` (INSERT ON CONFLICT DO UPDATE) + `_update_last_hit` all in PersonalizerService

**Phase 5 — Docusaurus Frontend Swap (US3)**
- `book-site/src/components/Personalization/PersonalizationWrapper.tsx`:
  - useSession() auth check, chapter slug extraction from window.location.pathname
  - fetch /personalize/{slug} with credentials:include
  - Polling /status every 15s (max 4 attempts) when generating
  - ReactMarkdown + remarkGfm + SyntaxHighlighter (vscDarkPlus theme) rendering
  - Dismissible "✨ Personalized for you" notice with "Edit profile" link
  - Graceful fallback to defaultContent on any error (401, 404, network)
- `book-site/src/theme/DocItem/Content/index.tsx`: Docusaurus 3 swizzle wrapping Content in PersonalizationWrapper

**Phase 6 — Cache Invalidation (US4)**
- `backend/app/routes/profile.py`: update_profile now accepts BackgroundTasks, calls personalizer.invalidate_user_cache(user_id) after successful DB update

**Phase 7 — Polish**
- Graceful fallback: silently returns defaultContent on fetch errors
- "Personalized for you" notice: dismissible banner with "Edit profile" link
- Missing profile row: returns default content with cached:false, generating:false
- DOCS_DIR documented in backend/.env.example with DATABASE_URL
- All 24 tasks marked [X] in tasks.md
