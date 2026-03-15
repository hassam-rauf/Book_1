---
id: "021"
title: Neon Postgres Personalized Chapter Cache Research
stage: general
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 003-rag-backend
branch: 003-rag-backend
user: hassam_rauf
command: research query (direct message)
labels: ["research","neon","postgres","caching","fastapi","asyncpg","personalization"]
links:
  spec: specs/003-rag-backend/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - history/prompts/003-rag-backend/021-neon-cache-research.general.prompt.md
tests:
  - none
---

## Prompt

Research the best approach for caching AI-generated personalized content in Neon Serverless Postgres for a Python FastAPI backend. The use case:
- A personalized chapter (markdown text, ~5-20KB) is generated once per (user_id, chapter_slug) combination
- Must be invalidated when a user updates their profile
- Must be served quickly on repeat visits (<2s)
- Neon free tier: 0.5GB storage, 10GB transfer

Answer these specific questions:
1. What is the right SQL table schema for a `personalized_chapter_cache` table? (columns, types, indexes)
2. Should we use asyncpg directly or SQLAlchemy async? Which is simpler for this use case?
3. What is the best cache invalidation strategy when a user profile changes? (DELETE WHERE user_id=$1, or a stale flag, or profile_hash comparison?)
4. Is there a risk of the cache table growing too large on Neon free tier? How to bound it?
5. How does the FastAPI background task pattern work for async generation (generate in background, serve default while generating)?

## Response snapshot

Five decisions delivered:

1. **Schema**: BIGSERIAL PK, TEXT user_id + chapter_slug, TEXT content_md, TEXT profile_hash (SHA-256 of profile), TIMESTAMPTZ created_at + last_hit_at, UNIQUE(user_id, chapter_slug) constraint with a supporting index on user_id. No FK overhead.

2. **Driver**: asyncpg directly (no SQLAlchemy). Two query patterns only (SELECT by key, INSERT ON CONFLICT DO UPDATE). asyncpg is ~30–40% lower overhead for simple key-value lookups; Neon's serverless driver wraps asyncpg natively. SQLAlchemy adds value only if the project already has other Postgres tables using it.

3. **Invalidation**: profile_hash comparison on read (regenerate only when hash mismatches) plus a DELETE WHERE user_id=$1 sweep on profile update as belt-and-suspenders. Avoids nuking all cached chapters on every profile save while remaining correct.

4. **Storage**: At 1,000 users × 19 chapters × ~16KB/row = ~300MB, approaching 0.5GB limit. Bounded by a TTL sweep (DELETE WHERE created_at < now() - interval '30 days') run as a FastAPI startup background task. Per-user cap (keep latest 19 rows by last_hit_at) is an alternative.

5. **Background generation**: FastAPI BackgroundTasks pattern — return stale content or base chapter immediately, enqueue background coroutine to call Gemini + upsert result. Use INSERT ON CONFLICT DO UPDATE for idempotent upserts. BackgroundTasks runs in-process after response is sent; acceptable for non-critical cache misses.

## Outcome

- Impact: Research decisions captured for implementation of personalized chapter cache in F6/F7 features
- Tests: none — research prompt
- Files: PHR only
- Next prompts: implement personalized_chapter_cache table + cache-aside endpoint in FastAPI
- Reflection: profile_hash approach is the key insight — avoids over-invalidation while keeping correctness simple

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): none
- Next experiment: validate asyncpg pool sizing for Neon serverless cold-start latency
