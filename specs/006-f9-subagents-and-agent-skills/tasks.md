# Tasks: Subagents and Agent Skills (F9)

**Input**: Design documents from `/specs/006-f9-subagents-and-agent-skills/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Context**: All 6 subagents and 4 skills pre-exist. This is a **verification + patch sprint** — confirm YAML correctness, fill prompt gaps, verify end-to-end smoke tests pass, update memory.

**Organization**: Tasks grouped by user story (US1–US6), preceded by Setup and Foundational phases.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

**Purpose**: Confirm working environment and locate all existing files.

- [X] T001 Confirm all 6 subagent files exist under `.claude/agents/` (chapter-writer.md, code-example-generator.md, content-reviewer.md, rag-ingestor.md, personalizer.md, translator.md)
- [X] T002 Confirm all 4 skill SKILL.md files exist under `.claude/skills/` (build-chapter, deploy, ingest-book, review-all)
- [X] T003 [P] Confirm `backend/scripts/ingest_book.py` exists; note path for rag-ingestor tasks — actual script at `backend/ingest.py`
- [X] T004 [P] Confirm `.env.example` documents GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION, DATABASE_URL — created `.env.example` at repo root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Validate all subagent and skill YAML frontmatter before any story-level smoke testing.

**⚠️ CRITICAL**: All story phases depend on valid frontmatter — fix any issues here before proceeding.

- [X] T005 Validate YAML frontmatter in `.claude/agents/chapter-writer.md` — confirm `name`, `description`, `tools`, `model` fields present and `tools` does NOT include `Agent`
- [X] T006 [P] Validate YAML frontmatter in `.claude/agents/code-example-generator.md` — same checks as T005
- [X] T007 [P] Validate YAML frontmatter in `.claude/agents/content-reviewer.md` — same checks as T005
- [X] T008 [P] Validate YAML frontmatter in `.claude/agents/rag-ingestor.md` — same checks as T005
- [X] T009 [P] Validate YAML frontmatter in `.claude/agents/personalizer.md` — same checks as T005
- [X] T010 [P] Validate YAML frontmatter in `.claude/agents/translator.md` — same checks as T005
- [X] T011 Validate YAML frontmatter in `.claude/skills/build-chapter/SKILL.md` — confirm `name`, `description` fields present
- [X] T012 [P] Validate YAML frontmatter in `.claude/skills/deploy/SKILL.md` — same checks as T011
- [X] T013 [P] Validate YAML frontmatter in `.claude/skills/ingest-book/SKILL.md` — same checks as T011
- [X] T014 [P] Validate YAML frontmatter in `.claude/skills/review-all/SKILL.md` — same checks as T011
- [X] T015 Confirm all agent files are ≤ 500 lines (current max 97 lines — expected PASS); confirm all skill files ≤ 500 lines (current max 167 lines — expected PASS)

**Checkpoint**: All 6 agents and 4 skills have valid frontmatter — story smoke testing can now proceed.

---

## Phase 3: User Story 1 — Build Chapter End-to-End (Priority: P1) 🎯 MVP

**Goal**: Verify `build-chapter` skill orchestrates chapter-writer → code-example-generator → content-reviewer and produces a complete chapter file.

**Independent Test**: Invoke `build-chapter` with a new chapter title; verify `.md` file created in `book-site/docs/` with frontmatter, prose, and ≥ 1 code block.

- [X] T016 [US1] Review `.claude/agents/chapter-writer.md` prompt body — confirm it covers: Docusaurus frontmatter generation, H2 section structure, callout blocks (:::tip/warning/info), and output path `book-site/docs/<slug>.md`
- [X] T017 [P] [US1] Review `.claude/agents/code-example-generator.md` prompt body — confirm it covers: ROS 2, Gazebo, NVIDIA Isaac frameworks; fenced code blocks with language tags; inline comments; import statements
- [X] T018 [US1] Review `.claude/skills/build-chapter/SKILL.md` — confirm orchestration flow documents: (1) chapter-writer → chapter_path, (2) code-example-generator → updated chapter, (3) content-reviewer → review report; confirm terminal output format matches data-model.md BuildChapterSkillIO
- [X] T019 [US1] Patch `.claude/agents/chapter-writer.md` if any gap found in T016 — add missing sections while keeping file ≤ 500 lines
- [X] T020 [US1] Patch `.claude/skills/build-chapter/SKILL.md` if any gap found in T018 — ensure orchestration steps match data-model.md BuildChapterSkillIO
- [ ] T021 [US1] Smoke test: run `/build-chapter` (or instruct chapter-writer agent directly) with topic "Legged Locomotion Basics" and verify output file at `book-site/docs/legged-locomotion-basics.md` has valid frontmatter, ≥ 3 H2 sections, ≥ 1 fenced code block, no `[TODO]` tokens

**Checkpoint**: `build-chapter` produces a complete chapter in a single invocation — US1 independently verified.

---

## Phase 4: User Story 2 — Ingest Book into RAG (Priority: P2)

**Goal**: Verify `ingest-book` skill triggers rag-ingestor across all docs and reports chunk count.

**Independent Test**: Run `/ingest-book --dry-run`; confirm file count matches actual `.md` files in `book-site/docs/`, no env-var errors.

- [X] T022 [US2] Review `.claude/agents/rag-ingestor.md` prompt body — confirm it covers: chunking logic (500 chars, 50 overlap), code block preservation, Gemini embedding call, Qdrant upsert, rate-limit backoff (4s delay, exponential on 429), progress logging
- [X] T023 [US2] Review `.claude/skills/ingest-book/SKILL.md` — confirm it covers: env var validation step, glob `book-site/docs/**/*.md`, rag-ingestor agent invocation, post-ingest Qdrant stats check, error report format
- [X] T024 [US2] Verify `backend/scripts/ingest_book.py` exists and implements the rag-ingestor pipeline steps; if missing, create it at `backend/scripts/ingest_book.py` following rag-ingestor agent prompt pipeline (discover → chunk → embed → upsert → report)
- [X] T025 [US2] Patch `.claude/agents/rag-ingestor.md` if any gap found in T022 — ensure idempotent upsert and rate-limit handling are explicitly documented
- [X] T026 [US2] Patch `.claude/skills/ingest-book/SKILL.md` if any gap found in T023 — ensure env-var validation occurs before any file processing and dry-run path is explicit
- [ ] T027 [US2] Smoke test: run `ingest-book` skill with `--dry-run` flag; verify output lists correct file count from `book-site/docs/` and reports "0 chunks uploaded (dry run)"

**Checkpoint**: `ingest-book --dry-run` reports correct file count — US2 independently verified.

---

## Phase 5: User Story 3 — Full Deploy Pipeline (Priority: P2)

**Goal**: Verify `deploy` skill runs pre-flight checks, builds Docusaurus, and can reach GitHub Pages push step.

**Independent Test**: Run `/deploy --dry-run`; all pre-flight checks pass and planned steps listed without actual push.

- [X] T028 [US3] Review `.claude/skills/deploy/SKILL.md` — confirm it covers: Node.js ≥ 18 check, env var check, git clean-state check, `npm run build` step, rag-ingestor invocation (unless `--skip-ingest`), `npm run deploy` step, live URL output; confirm `--dry-run` and `--skip-ingest` flags are handled
- [X] T029 [US3] Patch `.claude/skills/deploy/SKILL.md` if any gap found in T028 — add missing pre-flight checks or flag handling; keep file ≤ 500 lines
- [ ] T030 [US3] Smoke test: run `deploy` skill with `--dry-run --skip-ingest`; verify pre-flight output shows Node.js version, git state, and planned steps; confirm no actual build or push occurs

**Checkpoint**: `deploy --dry-run` completes all pre-flight validation — US3 independently verified.

---

## Phase 6: User Story 4 — Review All Chapters (Priority: P3)

**Goal**: Verify `review-all` skill runs content-reviewer on every chapter and writes consolidated `review-report.md`.

**Independent Test**: Run `/review-all`; verify `book-site/review-report.md` is created with a row for every chapter.

- [X] T031 [US4] Review `.claude/agents/content-reviewer.md` prompt body — confirm it outputs a structured Markdown report with: Verdict (PASS/WARN/FAIL), Issues list (severity + section reference + suggestion), consistent headings for aggregation by review-all
- [X] T032 [US4] Review `.claude/skills/review-all/SKILL.md` — confirm it covers: glob all `.md` files in `book-site/docs/`, content-reviewer agent invocation per chapter, aggregation into `book-site/review-report.md` with chapter table (name | verdict | issue count)
- [X] T033 [US4] Patch `.claude/agents/content-reviewer.md` if gap found in T031 — ensure output format uses exact `**Verdict**: PASS | WARN | FAIL` line for reliable parsing
- [X] T034 [US4] Patch `.claude/skills/review-all/SKILL.md` if gap found in T032 — ensure consolidated report table format matches data-model.md ReviewAllSkillIO
- [ ] T035 [US4] Smoke test: run `review-all` skill on at least 2 chapters; verify `book-site/review-report.md` is created with correct chapter entries and verdict column populated

**Checkpoint**: `review-all` writes consolidated report — US4 independently verified.

---

## Phase 7: User Story 5 — Personalise a Chapter (Priority: P3)

**Goal**: Verify `personalizer` subagent rewrites a chapter for a given user profile without losing code blocks.

**Independent Test**: Run personalizer on `book-site/docs/intro.md` with beginner/Python/laptop profile; verify output at `book-site/docs/personalized/<profile_id>/intro.md` exists and all code blocks are intact.

- [X] T036 [US5] Review `.claude/agents/personalizer.md` prompt body — confirm it covers: experience-level adaptation rules (beginner/intermediate/advanced), hardware-specific substitutions (laptop → Gazebo instead of Isaac), programming-language context, output path `book-site/docs/personalized/<profile_id>/<slug>.md`, preservation of all code blocks
- [X] T037 [US5] Patch `.claude/agents/personalizer.md` if gap found in T036 — add missing adaptation rules or output path documentation; keep file ≤ 500 lines
- [ ] T038 [US5] Smoke test: invoke personalizer agent directly with chapter `book-site/docs/intro.md` and profile `{experience: beginner, languages: [python], hardware: laptop-only, profile_id: test_user}`; verify output file at `book-site/docs/personalized/test_user/intro.md` with all code blocks unchanged and prose simplified

**Checkpoint**: personalizer produces adapted chapter — US5 independently verified.

---

## Phase 8: User Story 6 — Translate Chapter to Urdu (Priority: P3)

**Goal**: Verify `translator` subagent produces Urdu output with code blocks and technical terms unchanged.

**Independent Test**: Run translator on `book-site/docs/intro.md`; verify output at `book-site/docs/urdu/intro.md` has Urdu prose, unchanged code blocks, and technical terms (ROS 2, Gazebo, Python) still in English.

- [X] T039 [US6] Review `.claude/agents/translator.md` prompt body — confirm it covers: Urdu translation of prose and headings, preservation of code blocks verbatim, preservation of technical terms (ROS 2, Gazebo, NVIDIA Isaac, Python, etc.), frontmatter translation rules (translate `title`/`description`, preserve `id`/`sidebar_position`), output path `book-site/docs/urdu/<slug>.md`
- [X] T040 [US6] Patch `.claude/agents/translator.md` if gap found in T039 — add explicit list of technical terms to preserve and output path; keep file ≤ 500 lines
- [ ] T041 [US6] Smoke test: invoke translator agent on `book-site/docs/intro.md`; verify output at `book-site/docs/urdu/intro.md` exists, all fenced code blocks identical to source, prose is in Urdu script, and terms "ROS 2", "Gazebo", "NVIDIA Isaac" appear unchanged in translated text

**Checkpoint**: translator produces correct Urdu chapter — US6 independently verified.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final quality pass, memory update, and submission readiness.

- [X] T042 [P] Update `/home/hassam_rauf/.claude/projects/-mnt-d-Projects-Hackathon-1-Book-1/memory/MEMORY.md` — add reference to `sub_agent.md` and confirm subagent/skill paths are current
- [X] T043 [P] Verify `.env.example` at repo root lists all required env vars with placeholder values and comments; add any missing vars found during T024/T027
- [X] T044 Run final line-count check on all 10 files: confirm all ≤ 500 lines; if any exceed limit, extract overflow to `references/` sub-directory under the skill's folder
- [ ] T045 Verify `book-site/docs/legged-locomotion-basics.md` (smoke test output from T021) is gitignored or removed if not intended as a permanent chapter
- [ ] T046 Commit all agent/skill patches and any new files (`backend/scripts/ingest_book.py` if created) under branch `006-f9-subagents-and-agent-skills`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all story phases
- **US1–US6 (Phases 3–8)**: All depend on Phase 2; US1 (P1) should be completed first; US2/US3 (P2) can run in parallel after US1; US4/US5/US6 (P3) can run in parallel after P2 stories
- **Polish (Phase 9)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: No dependencies on other stories
- **US2 (P2)**: Independent of US1; shares rag-ingestor agent with no conflicts
- **US3 (P2)**: Depends on US2 completing successfully (deploy calls ingest)
- **US4 (P3)**: Independent; shares content-reviewer with US1 (no conflict — different invocations)
- **US5 (P3)**: Independent; no shared state with other stories
- **US6 (P3)**: Independent; no shared state with other stories

### Parallel Opportunities

- T005–T010 (agent frontmatter validation) all run in parallel
- T011–T014 (skill frontmatter validation) all run in parallel
- T016, T017 (chapter-writer and code-example-generator review) run in parallel
- T022, T023 (rag-ingestor agent and skill review) run in parallel
- US4, US5, US6 phases can run in parallel (different files, different agents)

---

## Parallel Example: Foundational Phase

```
T005 Validate chapter-writer.md frontmatter
T006 Validate code-example-generator.md frontmatter   [P]
T007 Validate content-reviewer.md frontmatter          [P]
T008 Validate rag-ingestor.md frontmatter              [P]
T009 Validate personalizer.md frontmatter              [P]
T010 Validate translator.md frontmatter                [P]
T011 Validate build-chapter SKILL.md
T012 Validate deploy SKILL.md                          [P]
T013 Validate ingest-book SKILL.md                     [P]
T014 Validate review-all SKILL.md                      [P]
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T015) — fix any YAML issues
3. Complete Phase 3: US1 build-chapter (T016–T021)
4. **STOP and VALIDATE**: Smoke test produces a chapter file
5. Proceed to P2 stories

### Incremental Delivery

1. Setup + Foundational → all agents/skills have valid frontmatter
2. US1 → build-chapter smoke test passes (MVP!)
3. US2 + US3 → ingest + deploy pipelines verified
4. US4 + US5 + US6 → review, personalise, translate verified
5. Polish → commit, memory update

---

## Notes

- [P] tasks operate on different files — safe to run in parallel
- "Review" tasks = read the existing file and identify gaps; "Patch" tasks = apply fixes
- If a smoke test fails, the corresponding patch task may need re-running
- No new subagent or skill files need to be created unless a gap is found that cannot be patched inline
- All smoke tests can be run by invoking the skill/agent directly in Claude Code
