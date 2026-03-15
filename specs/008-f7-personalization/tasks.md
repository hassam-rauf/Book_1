# Tasks: Content Personalization (F7)

**Input**: Design documents from `/specs/008-f7-personalization/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story (US1–US4), preceded by Setup and Foundational phases.

**Key architectural decisions**:
- `PersonalizerService` calls Gemini 2.0 Flash directly (NOT Claude subagent subprocess)
- `personalized_chapter_cache` table in Neon Postgres via asyncpg
- Stale-while-revalidate via FastAPI `BackgroundTasks`
- Profile hash (`SHA-256`) for cache invalidation + DELETE sweep on `PUT /profile`
- Docusaurus swizzles `@theme/DocItem/Content` → `PersonalizationWrapper` with `react-markdown`

## Format: `[ID] [P?] [Story?] Description`

---

## Phase 1: Setup

**Purpose**: Install new dependencies and create the DB migration.

- [X] T001 Install `react-markdown` and `react-syntax-highlighter` in `book-site/`: run `npm install react-markdown react-syntax-highlighter @types/react-syntax-highlighter` in `book-site/`
- [X] T002 [P] Create `backend/migrations/001_personalized_chapter_cache.sql` — SQL migration: `CREATE TABLE personalized_chapter_cache (id BIGSERIAL PRIMARY KEY, user_id TEXT NOT NULL, chapter_slug TEXT NOT NULL, content_md TEXT NOT NULL, profile_hash TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), last_hit_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), UNIQUE (user_id, chapter_slug)); CREATE INDEX ON personalized_chapter_cache (user_id);`
- [X] T003 Apply the migration: run `psql $DATABASE_URL -f backend/migrations/001_personalized_chapter_cache.sql` (or paste into Neon console SQL editor) to create `personalized_chapter_cache` in Neon

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: PersonalizerService (generation + cache read/write) — blocks all user stories.

**⚠️ CRITICAL**: All user story phases depend on this phase. `PersonalizerService` must be complete before any endpoint or frontend work.

- [X] T004 Create `backend/app/services/personalizer_service.py` — `PersonalizerService` class with: `__init__(self, gemini_api_key: str, db_url: str)`, `async get_or_enqueue(user_id, chapter_slug, profile, background_tasks) -> PersonalizationResult`, `async _read_cache(conn, user_id, chapter_slug) -> CacheRow | None`, `async _write_cache(conn, user_id, chapter_slug, content_md, profile_hash)`, `async _generate(user_id, chapter_slug, profile)` (calls Gemini with personalization prompt), `_compute_hash(profile) -> str` (SHA-256 of sorted JSON of experience_level, hardware, programming_background), `_build_prompt(chapter_md, profile) -> str`
- [X] T005 Add `PersonalizationResult` Pydantic model to `backend/app/services/personalizer_service.py`: fields `content: str`, `cached: bool`, `generating: bool`, `profile: dict`
- [X] T006 Add `DOCS_DIR` resolution in `backend/app/services/personalizer_service.py` — method `_read_chapter(chapter_slug) -> str` that reads `{DOCS_DIR}/{chapter_slug}.md` from filesystem; raises `FileNotFoundError` if not found (mapped to HTTP 404 in route)
- [X] T007 [P] Instantiate `PersonalizerService` singleton at startup in `backend/app/main.py` — add `personalizer = PersonalizerService(config.GEMINI_API_KEY, os.getenv("DATABASE_URL"))` after existing service instantiation; log startup message

**Checkpoint**: Call `personalizer._compute_hash({"experience_level":"beginner","hardware":"laptop-only","programming_background":""})` — should return a 64-char hex string. `personalizer._read_chapter("module-1/ch01-intro-physical-ai")` should return markdown string.

---

## Phase 3: User Story 1 — Receive Personalized Chapter on First Visit (Priority: P1) 🎯 MVP

**Goal**: Logged-in student requests a chapter → gets default content immediately with `generating: true`; background generation populates the cache; next request returns personalized content.

**Independent Test**: `GET /personalize/module-1/ch01-intro-physical-ai` with valid session cookie → `200 OK`, `cached: false`, `generating: true`, `content` contains default chapter markdown. Wait 30s, re-request → `cached: true`, `generating: false`, content contains profile-adapted text.

- [X] T008 [US1] Create `backend/app/routes/personalize.py` — FastAPI router with `GET /personalize/{chapter_slug:path}` endpoint: depends on `get_current_user`; fetches profile from `user_profile` table via asyncpg; calls `personalizer.get_or_enqueue(user_id, chapter_slug, profile, background_tasks)`; returns `PersonalizationResult` as JSON
- [X] T009 [US1] Add profile fetch helper in `backend/app/routes/personalize.py` — `async _get_profile(user_id: str) -> dict` queries `user_profile` table via asyncpg using `DATABASE_URL`; returns dict with `experience_level`, `hardware`, `programming_background`, `preferred_language`; raises `HTTPException(404)` if no profile row
- [X] T010 [US1] Register `personalize_router` in `backend/app/main.py`: `from app.routes.personalize import router as personalize_router` and `app.include_router(personalize_router)`
- [X] T011 [US1] Add 30-day TTL cleanup to `backend/app/main.py` lifespan startup: after existing startup log, run asyncpg `DELETE FROM personalized_chapter_cache WHERE created_at < NOW() - INTERVAL '30 days'` as a background task on startup

**Checkpoint**: `GET http://localhost:8000/personalize/module-1/ch01-intro-physical-ai` with session cookie → `200 OK` with `{"content": "...", "cached": false, "generating": true, "profile": {...}}`.

---

## Phase 4: User Story 2 — Cached Personalization on Repeat Visits (Priority: P1)

**Goal**: Second request to the same chapter returns cached personalized content in <2s.

**Independent Test**: First request → `cached: false`. Wait for background generation (~30s). Second request → `cached: true`, `generating: false`, response in <2s, content differs from default (profile-adapted).

- [X] T012 [US2] Verify `PersonalizerService._read_cache` in `backend/app/services/personalizer_service.py` returns the correct row on second call, that `profile_hash` matches, and that `last_hit_at` is updated via `UPDATE personalized_chapter_cache SET last_hit_at = NOW() WHERE user_id=$1 AND chapter_slug=$2`
- [X] T013 [US2] Add `GET /personalize/{chapter_slug:path}/status` endpoint to `backend/app/routes/personalize.py` — reads cache row, returns `{"ready": bool, "cached": bool, "profile_hash": str | null}` without triggering generation; allows frontend polling

**Checkpoint**: `GET http://localhost:8000/personalize/module-1/ch01-intro-physical-ai/status` with cookie after generation → `{"ready": true, "cached": true, "profile_hash": "..."}`.

---

## Phase 5: User Story 3 — Transparent Content Swap in Docusaurus (Priority: P2)

**Goal**: Logged-in student sees personalized content inline at the same chapter URL; sidebar and nav unchanged.

**Independent Test**: Open `http://localhost:3000/Book_1/docs/module-1/ch01-intro-physical-ai` as logged-in student → URL unchanged, sidebar visible, chapter body shows personalized content (or default while generating).

- [X] T014 [US3] Create `book-site/src/components/Personalization/PersonalizationWrapper.tsx` — React component that: accepts `defaultContent: React.ReactNode` prop, reads `useSession()` from AuthProvider, extracts `chapter_slug` from `window.location.pathname` (strip base URL prefix and derive slug), calls `GET {BACKEND_URL}/personalize/{chapter_slug}` with `credentials: 'include'` on mount if session exists, renders `<ReactMarkdown>` with personalized content when `cached: true`, renders `defaultContent` while loading or on error, shows a subtle "Personalized for you" badge when serving personalized content
- [X] T015 [US3] Create `book-site/src/theme/DocItem/Content/index.tsx` — swizzled Docusaurus component that wraps the default `@theme-original/DocItem/Content` with `PersonalizationWrapper`: import `{PersonalizationWrapper}` from `@site/src/components/Personalization/PersonalizationWrapper`; render `<PersonalizationWrapper defaultContent={<Content {...props} />}>`
- [X] T016 [US3] Install `@theme-original/DocItem/Content` swizzle by adding the wrapper — verify `book-site/src/theme/DocItem/Content/index.tsx` path is correct for Docusaurus 3 swizzle convention (component must be in `src/theme/` matching the theme component path)
- [X] T017 [P] [US3] Add `react-markdown` rendering in `PersonalizationWrapper.tsx` with `react-syntax-highlighter` for code blocks: use `remarkGfm` plugin for GitHub Flavored Markdown; configure `components` prop to use `SyntaxHighlighter` for `code` elements with `language` detection

**Checkpoint**: Navigate to any chapter while logged in → URL unchanged, personalized markdown renders with syntax-highlighted code blocks, "Personalized for you" badge visible.

---

## Phase 6: User Story 4 — Profile Update Invalidates Cache (Priority: P2)

**Goal**: Updating any profile field via `PUT /profile` invalidates all cached personalized chapters for that student.

**Independent Test**: Generate personalized chapter → update profile `hardware` field → navigate to chapter → `cached: false` (or stale with `generating: true`) → wait → new personalized content reflects updated hardware.

- [X] T018 [US4] Update `backend/app/routes/profile.py` `update_profile` endpoint — after successfully updating `user_profile`, add asyncpg call: `DELETE FROM personalized_chapter_cache WHERE user_id = $1` as a `BackgroundTasks` background task (non-blocking)
- [X] T019 [US4] Verify stale-while-revalidate path in `PersonalizerService.get_or_enqueue` — when cache row exists but `profile_hash != current_hash`, method MUST return stale `content_md` immediately with `cached: true, generating: true` AND enqueue `_generate` in `BackgroundTasks`

**Checkpoint**: `PUT /profile` → `DELETE FROM personalized_chapter_cache WHERE user_id=$1` runs in background → `GET /personalize/{slug}` returns stale content + `generating: true` → after 30s returns fresh content matching new profile.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, CORS, loading states, personalization notice.

- [X] T020 [P] Add graceful fallback in `PersonalizationWrapper.tsx` — if `GET /personalize/{slug}` returns 401, 404, or network error, silently render `defaultContent` with no error shown to student (FR-008)
- [X] T021 [P] Add `"Personalized for you"` notice in `PersonalizationWrapper.tsx` — small, dismissible banner below the chapter title when serving personalized content (e.g., "✨ This chapter has been personalized for your profile. [Edit profile]")
- [X] T022 [P] Handle missing profile row in `backend/app/routes/personalize.py` — if `_get_profile` returns 404, return the default chapter content with `cached: false, generating: false` (no personalization attempted for profileless users)
- [X] T023 [P] Add `DOCS_DIR` to `backend/app/config.py` optional vars documentation comment — verify `DOCS_DIR` default (`../book-site/docs`) works from `backend/` working directory; add note in `backend/.env.example` if not present
- [X] T024 Verify end-to-end quickstart.md scenarios pass: cache miss → generation → cache hit → profile update → stale hit → re-generation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately (T001 npm install, T002 migration SQL creation, T003 migration apply require DATABASE_URL)
- **Foundational (Phase 2)**: Depends on Phase 1 (DB table must exist) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — first working endpoint
- **US2 (Phase 4)**: Depends on US1 — verifies caching layer works
- **US3 (Phase 5)**: Depends on US1 (endpoint must exist for frontend to call) — can develop frontend in parallel with US2
- **US4 (Phase 6)**: Depends on US1 + profile endpoint from F6 — cache invalidation hook added to existing `PUT /profile`
- **Polish (Phase 7)**: After US1–US4 complete

### User Story Dependencies

- **US1 (P1)**: Foundational complete
- **US2 (P1)**: US1 complete (cache populated by US1 background task)
- **US3 (P2)**: US1 complete (endpoint must exist); frontend can be developed in parallel with US2
- **US4 (P2)**: US1 + F6 `PUT /profile` route (already exists from F6)

### Parallel Opportunities

- T002 (migration SQL), T004 (PersonalizerService), T008 (route) can be written in parallel — different files
- T014, T015, T016, T017 (frontend components) all parallel — different files
- T018 (cache invalidation hook) and T019 (stale-while-revalidate verification) parallel — different files
- T020, T021, T022, T023 (polish) all parallel — different files

---

## Implementation Strategy

### MVP First (US1 + US2 — first visit + caching)

1. Complete Phase 1: Setup (T001–T003) — DB table created
2. Complete Phase 2: Foundational (T004–T007) — PersonalizerService boots
3. Complete Phase 3: US1 (T008–T011) — endpoint returns default + enqueues generation
4. Complete Phase 4: US2 (T012–T013) — verify cache hit on second request
5. **STOP and VALIDATE**: `GET /personalize/{slug}` returns personalized content on second call
6. Proceed to US3 (frontend swap) and US4 (cache invalidation)

### Incremental Delivery

1. Setup + Foundational → PersonalizerService boots, DB table ready
2. US1 → `/personalize/{slug}` endpoint works (MVP for demo)
3. US2 → cache hit confirmed (<2s repeat visits)
4. US3 → Docusaurus frontend shows personalized content inline
5. US4 → profile updates propagate correctly
6. Polish → error handling, notice banner, fallbacks

---

## Notes

- [P] tasks operate on different files — safe to run in parallel
- `DOCS_DIR` must point to `book-site/docs/` relative to the FastAPI process working directory (default: `../book-site/docs` from `backend/`)
- Gemini generation typically takes 10–25s for a full chapter; set `BackgroundTasks` timeout awareness accordingly
- `react-markdown` renders GFM; import `remarkGfm` from `remark-gfm` package (already transitively installed via other deps, or install explicitly)
- The swizzle path `src/theme/DocItem/Content/index.tsx` matches Docusaurus 3's component resolution for `@theme/DocItem/Content`
- Profile `preferred_language` field is passed to the personalizer prompt for context but Urdu generation is F8 scope — English-only output in F7
