# Implementation Plan: Content Personalization

**Branch**: `008-f7-personalization` | **Date**: 2026-03-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-f7-personalization/spec.md`

## Summary

Automatically personalize Physical AI textbook chapter content for logged-in students based on their profile (experience level, hardware, programming background). A FastAPI `PersonalizerService` calls Gemini 2.0 Flash to generate adapted markdown on first visit; results are cached in a Neon Postgres table (`personalized_chapter_cache`) keyed by `(user_id, chapter_slug)`. The Docusaurus frontend swizzles `@theme/DocItem/Content` to detect session, fetch personalized content from `GET /personalize/{slug}`, and render it via `react-markdown`. Non-logged-in users always see default content. Cache is invalidated on profile update via a background DELETE sweep.

## Technical Context

**Language/Version**: Python 3.11 (FastAPI backend), TypeScript/React (Docusaurus frontend)
**Primary Dependencies**: `asyncpg` (Neon Postgres cache), `google-generativeai` (Gemini personalization), `react-markdown` + `react-syntax-highlighter` (frontend rendering), `hashlib` stdlib (profile hash)
**Storage**: Neon Postgres — new `personalized_chapter_cache` table (~16KB/row, bounded by 30-day TTL)
**Testing**: Manual E2E via quickstart.md scenarios; pytest for PersonalizerService unit tests (mock Gemini)
**Target Platform**: Linux/WSL (FastAPI), GitHub Pages (Docusaurus SSG with client-side personalization)
**Performance Goals**: Cache hit <2s; cache miss returns default immediately + background generation <30s
**Constraints**: Gemini free tier (60 req/min); Neon free tier (0.5GB); no SSR in Docusaurus; no subprocess invocation of Claude subagents from FastAPI
**Scale/Scope**: Hackathon demo scale — tens of concurrent users; 19 chapters × N students cached

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | Spec + checklist complete; pipeline followed |
| II. Smallest Viable Diff | ✅ PASS | New `PersonalizerService` + new `personalize.py` route + new cache table + swizzled DocItem/Content component. No unrelated refactoring. |
| III. Content Accuracy First | ✅ PASS | Personalization rewrites explanations/code examples; original chapter is always the source of truth. Personalized versions include a notice indicating they are adapted. |
| IV. Provider-Agnostic Service Layer | ✅ PASS | `PersonalizerService` isolated behind service interface; swapping Gemini for another LLM requires only service-layer changes |
| V. Free-Tier Resilient | ✅ PASS | Gemini free tier (60 req/min); Neon free tier; 30-day TTL prevents storage bloat; falls back to default content on generation failure |
| VI. Security by Default | ✅ PASS | Session auth required; user input (profile fields) validated before prompt injection; no raw user text in SQL queries (parameterized); API key in `.env` |
| VII. Subagent Reusability | ✅ PASS | `personalizer` subagent not modified; `PersonalizerService` is a new focused class. Existing subagents unaffected. |

**No violations. Gate PASSED.**

## Project Structure

### Documentation (this feature)

```text
specs/008-f7-personalization/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── personalize-endpoint.md
└── tasks.md             ← Phase 2 output (/sp.tasks)
```

### Source Code Layout

```text
backend/
├── app/
│   ├── routes/
│   │   └── personalize.py          ← NEW: GET /personalize/{slug:path} + GET /personalize/{slug:path}/status
│   ├── services/
│   │   └── personalizer_service.py ← NEW: PersonalizerService (Gemini prompt + cache read/write)
│   └── main.py                     ← UPDATED: include personalize_router; TTL cleanup in lifespan
├── migrations/
│   └── 001_personalized_chapter_cache.sql ← NEW: CREATE TABLE + INDEX

book-site/
├── src/
│   ├── theme/
│   │   └── DocItem/
│   │       └── Content/
│   │           └── index.tsx        ← NEW: swizzled DocItem/Content with PersonalizationWrapper
│   └── components/
│       └── Personalization/
│           └── PersonalizationWrapper.tsx ← NEW: fetches personalized content, renders with react-markdown
```

## Architecture Decisions

### Decision 1: PersonalizerService Calls Gemini API Directly

**Decision**: `PersonalizerService` in `backend/app/services/personalizer_service.py` uses the existing `google-generativeai` library to call Gemini 2.0 Flash with a structured personalization prompt. Does NOT invoke the `.claude/agents/personalizer.md` subagent.

**Rationale**: Claude Code subagents are CLI tools, not callable APIs. The constitution mandates Gemini for all LLM calls. The existing `GeminiService` pattern provides the right model — a focused service class that isolates the provider dependency.

**Alternative rejected**: Claude API subprocess — adds `anthropic` SDK (prohibited), complex process management, no benefit over direct Gemini call.

### Decision 2: Neon Postgres Cache with asyncpg

**Decision**: `personalized_chapter_cache` table in Neon Postgres. Use asyncpg directly (not SQLAlchemy) for two operations: SELECT by `(user_id, chapter_slug)` and `INSERT ... ON CONFLICT DO UPDATE`.

**Rationale**: asyncpg is already used by `auth.py` middleware. Simplest, lowest-overhead approach. No ORM needed for two operations.

### Decision 3: Stale-While-Revalidate via FastAPI BackgroundTasks

**Decision**: On cache miss → return default content immediately + enqueue generation in `BackgroundTasks`. On stale hit → return stale content immediately + enqueue re-generation. On fresh hit → return cached content directly.

**Rationale**: Generation takes 5–30s. Blocking the HTTP response is not acceptable. `BackgroundTasks` runs post-response in the same event loop; no extra infrastructure required for hackathon scale.

### Decision 4: Profile Hash for Smart Invalidation

**Decision**: `profile_hash = SHA-256(sorted JSON of {experience_level, hardware, programming_background})`. Computed on each read; mismatch = stale. Also DELETE cache rows on `PUT /profile` as background sweep.

**Rationale**: Two-layer invalidation prevents both stale-on-read and accumulation of orphaned rows from profile changes.

### Decision 5: Docusaurus Swizzle of DocItem/Content

**Decision**: Swizzle `@theme/DocItem/Content` with a `PersonalizationWrapper` that checks session, fetches `/personalize/{slug}`, and renders personalized markdown via `react-markdown`.

**Rationale**: Only swizzling the content component (not the full DocItem) minimizes blast radius. URL, sidebar, and nav are unaffected. `react-markdown` handles GFM and code highlighting without a full MDX pipeline.

## Interface Contracts (Summary)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/personalize/{slug:path}` | GET | Cookie | Return personalized chapter (or default if miss/error) |
| `/personalize/{slug:path}/status` | GET | Cookie | Check if personalized version is ready |

Full contracts in `/contracts/personalize-endpoint.md`.

## Complexity Tracking

No constitution violations.
