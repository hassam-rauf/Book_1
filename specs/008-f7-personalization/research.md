# Research: Content Personalization (F7)

**Feature**: 008-f7-personalization
**Date**: 2026-03-15

---

## Decision 1: Personalization Generation via Gemini API (Not Claude Subagent Subprocess)

**Decision**: Use a `PersonalizerService` in FastAPI that calls the Gemini 2.0 Flash API directly with a structured personalization prompt. Do NOT invoke the `.claude/agents/personalizer.md` subagent as a subprocess.

**Rationale**: The Claude Code personalizer subagent is designed for CLI execution (runs as a tool-use agent, writes to `book-site/docs/personalized/`). Calling it from a running FastAPI process would require subprocess invocation, file-system coordination, and complex error handling. The Gemini API is already available via `GeminiService`; reusing it via a `PersonalizerService` keeps all generation within the existing service layer — aligned with Constitution Principle IV (provider-agnostic service layer) and Principle II (smallest viable diff).

**Alternatives considered**:
- Claude API subprocess: Would add `anthropic` SDK dependency (prohibited by constitution — no OpenAI SDK equivalent, and constitution says Gemini substitution is project-wide) and complex process management
- Pre-generate all permutations at build time: 19 chapters × 3 experience levels × 4 hardware types = 228 combinations; too much content for Neon free tier, slow CI
- File-based personalized docs at `book-site/docs/personalized/`: Requires server access to `book-site/` filesystem; incompatible with GitHub Pages deployment; suitable for local CLI use, not production serving

---

## Decision 2: Neon Postgres Cache Table with asyncpg

**Decision**: Store personalized chapter content in a `personalized_chapter_cache` table in Neon Postgres. Use asyncpg directly (no SQLAlchemy).

**Schema**:
```sql
CREATE TABLE personalized_chapter_cache (
  id          BIGSERIAL PRIMARY KEY,
  user_id     TEXT        NOT NULL,
  chapter_slug TEXT       NOT NULL,
  content_md  TEXT        NOT NULL,
  profile_hash TEXT       NOT NULL,  -- SHA-256 of profile fields
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_hit_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, chapter_slug)
);
CREATE INDEX ON personalized_chapter_cache (user_id);
```

**Rationale**: asyncpg is simpler and faster (~30–40% lower overhead) for the two operations needed: `SELECT` by `(user_id, chapter_slug)` and `INSERT ... ON CONFLICT DO UPDATE`. SQLAlchemy adds no value for this use case. Existing `backend/app/middleware/auth.py` already uses asyncpg, so the pattern is established.

**Storage estimate**: ~16KB/row × 19 chapters × 100 students = ~30MB — well within Neon's 0.5GB free tier for hackathon scale.

**Alternatives considered**: Redis — not in the tech stack and not free-tier without additional service; Qdrant — for vector search only, not text storage.

---

## Decision 3: Profile Hash for Smart Cache Invalidation

**Decision**: Compute a SHA-256 hash of the four profile fields (`experience_level`, `hardware`, `programming_background`, `preferred_language`) at read time. If the current hash differs from `profile_hash` in the cache row, treat as a cache miss. Additionally, run `DELETE FROM personalized_chapter_cache WHERE user_id=$1` as a background sweep when the user updates their profile via `PUT /profile`.

**Rationale**: Hash comparison allows the system to detect profile changes without requiring a separate "profile version" counter. The DELETE sweep on profile update prevents stale rows accumulating for chapters the student never visits again. This two-layer approach is more robust than either mechanism alone.

**Cache invalidation flow**:
1. `PUT /profile` → update `user_profile` → background `DELETE` cache rows for `user_id`
2. `GET /personalize/{slug}` → compute `current_hash` → compare to `profile_hash` in cache row → mismatch triggers re-generation

**Alternatives considered**: Stale flag column (`is_stale BOOLEAN`) — requires two-phase write, still accumulates rows; profile version counter in `user_profile` — requires schema change in F6; no invalidation (always use newest cache) — profile changes silently ignored.

---

## Decision 4: Stale-While-Revalidate with FastAPI BackgroundTasks

**Decision**: Use the stale-while-revalidate pattern. On first visit (cache miss), return the default chapter content immediately and enqueue generation as a `BackgroundTasks` call. On repeat visit (cache hit), return cached content immediately. On stale hit (profile hash mismatch), return stale content immediately while enqueueing re-generation in background.

**Rationale**: LLM generation takes 5–30 seconds. Blocking the HTTP response on generation would make the feature unusable. FastAPI's built-in `BackgroundTasks` runs the coroutine after the response is sent in the same event loop — no message queue or separate worker needed. Meets FR-010 (generation must complete within 30 seconds) and SC-001 (repeat visits <2s) without additional infrastructure.

**Response contract for cache miss**:
```json
{ "content": "<default chapter content>", "cached": false, "generating": true }
```
**Response contract for cache hit**:
```json
{ "content": "<personalized content>", "cached": true, "generating": false }
```

**Alternatives considered**: Celery + Redis worker — overkill for hackathon scale, adds paid service risk; synchronous generation — blocks request for up to 30s, unacceptable UX; polling endpoint — additional complexity.

---

## Decision 5: Frontend Content Swap via `react-markdown` + Docusaurus Swizzle

**Decision**: Swizzle Docusaurus's `@theme/DocItem/Content` component with a `PersonalizationWrapper` that:
1. On mount: checks session via `useSession()` from AuthProvider
2. If authenticated: calls `GET /personalize/{chapter_slug}` on the FastAPI backend
3. On success: renders the personalized markdown using `react-markdown` (replaces the default MDX children)
4. On failure or loading: renders the default children unchanged

**Rationale**: Swizzling `DocItem/Content` is the cleanest Docusaurus integration point — it wraps exactly the chapter body without affecting sidebar, navbar, or URL. `react-markdown` handles Docusaurus-compatible markdown rendering including code blocks (via `react-syntax-highlighter`). URL, structure, and navigation are untouched — satisfying FR-009 and SC-005.

**Chapter slug extraction**: Derived from `window.location.pathname` (e.g., `/Book_1/docs/module-1/ch01-intro-physical-ai` → `module-1/ch01-intro-physical-ai`).

**Alternatives considered**: DOM injection via `MutationObserver` — fragile, fights against React reconciliation; separate `/personalized/{slug}` page — breaks bookmarks, changes URL (violates FR-009); iframe — CORS issues, layout problems; full page reload with query param — changes URL.

---

## Decision 6: F6 Profile Field Mapping to Personalizer Prompt

**Decision**: Map F6 `user_profile` fields to the personalization prompt as follows:

| F6 field | Prompt variable | Notes |
|----------|----------------|-------|
| `experience_level` | `level` | Direct mapping (beginner/intermediate/advanced) |
| `hardware` | `hardware` | Direct mapping (laptop-only/gpu-workstation/jetson-kit/robot) |
| `programming_background` | `background_context` | Free-text inserted into prompt as "Student background: ..." |
| `preferred_language` | Not used in F7 | `ur` language handled by F8 (Translation) |

**Rationale**: The personalizer subagent schema (`languages`, `robotics_exp`, `learning_goal`) differs from F6's stored fields. Since we're calling Gemini directly (Decision 1), we design the prompt ourselves and can use F6's actual fields directly. No impedance mismatch.

---

## Decision 7: TTL Cleanup on Startup

**Decision**: On FastAPI startup (in the `lifespan` context), run a background sweep: `DELETE FROM personalized_chapter_cache WHERE created_at < NOW() - INTERVAL '30 days'`. This bounds storage growth on Neon free tier.

**Rationale**: For hackathon scale (≤100 users, 19 chapters), the 30-day TTL sweep keeps the cache table under ~30MB. No separate cron job or scheduler needed — FastAPI's lifespan startup hook is sufficient.
