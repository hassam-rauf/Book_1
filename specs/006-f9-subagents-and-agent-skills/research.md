# Research: Subagents and Agent Skills

**Feature**: 006-f9-subagents-and-agent-skills
**Date**: 2026-03-15

## R-001: Claude Code Subagent YAML Frontmatter Schema

**Decision**: Use the documented frontmatter fields: `name`, `description`, `tools`, `model`, and optionally `disallowedTools`, `permissionMode`, `maxTurns`.

**Rationale**: The project's `sub_agent.md` reference file documents the full schema. Current agent files use `name`, `description`, `tools`, `model` — the minimum required set. Optional fields (`disallowedTools`, `permissionMode`, `maxTurns`) are omitted deliberately to keep files concise and use Claude Code defaults.

**Alternatives considered**:
- Adding `permissionMode: restricted` for all agents — rejected: over-engineering; default permissioning is correct for this project's use cases.
- Adding `maxTurns` limits — rejected: chapter-writer may legitimately require many turns for long chapters.

**Verification**: All 6 agent files confirmed to have `name`, `description`, `tools`, `model` fields.

---

## R-002: Skill File Format and Size Constraints

**Decision**: Skills use `SKILL.md` files under `.claude/skills/<name>/` with YAML frontmatter (`name`, `description`) and a markdown body ≤ 500 lines. Complex logic is extracted to `references/` sub-directory.

**Rationale**: The Skill Creator Pro framework (`.claude/skills/skill-creator-pro/SKILL.md`) defines this pattern. Current skills are 122–167 lines — all within the 500-line constitution limit. No `references/` extraction needed for current skill sizes.

**Alternatives considered**:
- Storing skills as `.yaml` or `.json` — rejected: Claude Code expects Markdown files.
- Combining all skills into one file — rejected: violates single-responsibility (Constitution VII).

---

## R-003: Subagent Cannot Spawn Subagent — Orchestration Pattern

**Decision**: The `build-chapter` skill (and `review-all`, `ingest-book`) use the Claude Code `Agent` tool to spawn subagents from the **skill's own execution context**. Subagents themselves only use file tools and Bash — never the Agent tool.

**Rationale**: Claude Code platform constraint: subagents cannot call the Agent tool. Skills run in the top-level Claude context and CAN call Agent tool. This means `build-chapter` SKILL orchestrates chapter-writer → code-example-generator → content-reviewer by calling Agent tool three times sequentially.

**Alternatives considered**:
- Having chapter-writer spawn code-example-generator inline — impossible at platform level.
- Running all logic inside one mega-subagent — rejected: violates single-responsibility; also, one subagent doing three jobs would need to be > 500 lines.

---

## R-004: rag-ingestor Backend Script Integration

**Decision**: The `rag-ingestor` subagent runs `cd backend && python scripts/ingest_book.py` via the Bash tool. If the script does not exist, the subagent creates it following the pipeline steps defined in its own prompt.

**Rationale**: The backend already has `GeminiService` and Qdrant client code (F3). Reusing these avoids re-implementing embedding logic and respects Constitution IV (Provider-Agnostic Service Layer). The Python script is the cleanest execution boundary.

**Alternatives considered**:
- Calling Gemini and Qdrant APIs directly from the subagent via Bash curl — rejected: bypasses service layer, duplicates authentication/retry logic.
- Using a pre-built ingestion library — rejected: adds a dependency; project already has all required services in-house.

---

## R-005: Content Review Output Format

**Decision**: `content-reviewer` outputs a structured Markdown report with sections: Summary, Verdict (PASS/WARN/FAIL), Issues (each with severity, section reference, and suggested fix).

**Rationale**: `review-all` must aggregate individual chapter reports into a consolidated `review-report.md`. A consistent, machine-parseable structure (predictable headings) makes aggregation reliable. PASS/WARN/FAIL verdicts allow filtering by severity.

**Alternatives considered**:
- Free-form prose review — rejected: unparseable for `review-all` aggregation.
- JSON output — rejected: harder for humans to read; Claude Code renders Markdown natively.

---

## R-006: personalizer and translator Output Paths

**Decision**:
- personalizer writes to `book-site/docs/personalized/<profile-id>/<chapter>.md`
- translator writes to `book-site/docs/urdu/<chapter>.md`

**Rationale**: These paths avoid overwriting the canonical English chapters. Docusaurus can route language/profile variants with custom plugin logic (F7/F8 features). Storing them as siblings avoids path conflicts.

**Alternatives considered**:
- Overwriting the original chapter file — rejected: destroys source content; irreversible.
- Writing to a separate `translations/` root directory — rejected: outside Docusaurus docs tree, requiring additional routing config.

---

## R-007: Gemini Free-Tier Rate Limits for Embeddings

**Decision**: rag-ingestor uses a 4-second inter-batch delay with exponential backoff on 429 errors. Batch size is capped at 10 chunks per API call.

**Rationale**: Gemini `text-embedding-004` free tier allows 15 RPM. With 19 chapters × ~40 chunks = ~760 chunks total, at 10 per batch = 76 batches × 4s = ~5 minutes for full ingest. This fits within the 10-minute performance goal (SC-004 equivalent in plan).

**Alternatives considered**:
- Parallel batch requests — rejected: exceeds rate limit, causes cascade 429s.
- Increasing chunk size to reduce total chunks — rejected: larger chunks degrade RAG retrieval precision.
