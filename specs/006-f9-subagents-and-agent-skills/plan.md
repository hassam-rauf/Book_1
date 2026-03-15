# Implementation Plan: Subagents and Agent Skills

**Branch**: `006-f9-subagents-and-agent-skills` | **Date**: 2026-03-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-f9-subagents-and-agent-skills/spec.md`

## Summary

All 6 subagents and 4 skills were created earlier in the project (during F1–F5 implementation). This feature's implementation work is to **verify, complete, and document** them to spec — confirm YAML frontmatter validity, fill any prompt gaps, add missing reference files for skills over 200 lines, and run an end-to-end smoke test of `build-chapter` and `ingest-book`. No new file creation is needed unless a gap is discovered.

## Technical Context

**Language/Version**: Markdown + YAML (subagent/skill definitions) | Python 3.11 (rag-ingestor backend script)
**Primary Dependencies**: Claude Code (subagent loader), Gemini text-embedding-004 (rag-ingestor), Qdrant Cloud free tier (vector store)
**Storage**: `.claude/agents/` (6 `.md` files), `.claude/skills/` (4 `SKILL.md` files + references), Qdrant Cloud (vector index), Neon Postgres (metadata)
**Testing**: Manual smoke test — invoke each skill, verify outputs; pytest for backend ingest script
**Target Platform**: Claude Code CLI (all subagents + skills), Linux/WSL (rag-ingestor Python script)
**Project Type**: Configuration/documentation (subagents and skills are Markdown, not compiled code)
**Performance Goals**: build-chapter completes in < 5 minutes; ingest-book processes 19 chapters in < 10 minutes
**Constraints**: Subagent files ≤ 500 lines (constitution rule); no subagent spawns another subagent (Claude Code constraint); all secrets via `.env`
**Scale/Scope**: 6 subagent files, 4 skill files, 19 chapters to ingest

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | Spec + checklist complete; plan follows pipeline |
| II. Smallest Viable Diff | ✅ PASS | All files pre-exist; only verify and patch gaps |
| III. Content Accuracy First | ✅ PASS | Subagents validate code examples via content-reviewer |
| IV. Provider-Agnostic Service Layer | ✅ PASS | rag-ingestor calls backend service layer, not Gemini SDK directly |
| V. Free-Tier Resilient | ✅ PASS | Gemini free tier, Qdrant free tier; rate-limit backoff in rag-ingestor |
| VI. Security by Default | ✅ PASS | All credentials via `.env`; subagents documented to never hardcode secrets |
| VII. Subagent Reusability | ✅ PASS | All subagents generic (parameterised by input, not hardcoded chapter names) |

**No violations. Gate PASSED.**

## Project Structure

### Documentation (this feature)

```text
specs/006-f9-subagents-and-agent-skills/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output (subagent/skill interface contracts)
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/sp.tasks — not created by /sp.plan)
```

### Source Files (already present, verify/patch only)

```text
.claude/
├── agents/
│   ├── chapter-writer.md          ✅ exists (83 lines)
│   ├── code-example-generator.md  ✅ exists (97 lines)
│   ├── content-reviewer.md        ✅ exists (92 lines)
│   ├── rag-ingestor.md            ✅ exists (70 lines)
│   ├── personalizer.md            ✅ exists (89 lines)
│   └── translator.md              ✅ exists (93 lines)
└── skills/
    ├── build-chapter/
    │   └── SKILL.md               ✅ exists (135 lines)
    ├── deploy/
    │   └── SKILL.md               ✅ exists (167 lines)
    ├── ingest-book/
    │   └── SKILL.md               ✅ exists (122 lines)
    └── review-all/
        └── SKILL.md               ✅ exists (137 lines)

backend/
└── scripts/
    └── ingest_book.py             ← verify exists; create via rag-ingestor if missing
```

**Structure Decision**: All subagent and skill files are pre-created. This plan validates correctness and completeness against the spec acceptance criteria. No structural changes expected.

## Interfaces

### Subagent Input/Output Contracts

Each subagent is invoked by Claude Code via the Agent tool. Inputs are passed as natural-language prompts; outputs are written to disk.

| Subagent | Required Input | Output Location | Output Format |
|----------|---------------|-----------------|---------------|
| chapter-writer | chapter title, optional outline | `book-site/docs/<chapter>.md` | Docusaurus Markdown with frontmatter |
| code-example-generator | topic, framework (ROS 2/Gazebo/Isaac) | inline in chapter or separate snippet file | fenced code blocks with language tags |
| content-reviewer | chapter file path | `book-site/docs/<chapter>-review.md` | structured report (verdict + issues) |
| rag-ingestor | directory path or file list | Qdrant Cloud + Neon Postgres | upsert confirmation + chunk count |
| personalizer | chapter file path + user profile | `book-site/docs/personalized/<chapter>.md` | adapted Markdown |
| translator | chapter file path + target language | `book-site/docs/urdu/<chapter>.md` | Urdu Markdown |

### Skill Invocation Contracts

| Skill | Slash Command | Parameters | Terminal Output |
|-------|--------------|------------|-----------------|
| build-chapter | `/build-chapter` | `<chapter-number> [topic]` | chapter path + review verdict |
| deploy | `/deploy` | `[--skip-ingest] [--dry-run]` | live URL or error report |
| ingest-book | `/ingest-book` | `[--chapter N] [--force] [--dry-run]` | chunks upserted count |
| review-all | `/review-all` | `[--chapter N] [--fix]` | path to `review-report.md` |

## Architecture Decisions

### Decision 1: Subagents Pre-exist — Verify Rather Than Rebuild
**Decision**: Treat this feature as a verification + documentation sprint, not a build sprint.
**Rationale**: All 6 subagents and 4 skills were created during F1–F5 to support chapter writing, deployment, and RAG ingestion. Rebuilding them would violate the Smallest Viable Diff principle (Constitution II).
**Alternative rejected**: Rebuild all files from scratch — rejected because existing files are functional and 70–97 lines each (well under 500-line limit).

### Decision 2: No Subagent-to-Subagent Calls
**Decision**: Skills orchestrate subagents; subagents call backend scripts directly via Bash or read/write files — never call another subagent.
**Rationale**: Claude Code platform constraint (subagents cannot spawn other subagents). `build-chapter` skill chains three subagents sequentially via the Agent tool from the skill's own context.
**Alternative rejected**: Having chapter-writer call code-example-generator internally — impossible at the platform level.

### Decision 3: rag-ingestor Uses Python Script, Not Direct API Calls
**Decision**: `rag-ingestor` runs `cd backend && python scripts/ingest_book.py` (or creates the script if absent).
**Rationale**: The backend Python stack already has Gemini and Qdrant service classes. Reusing them avoids duplicating embedding logic and respects the Provider-Agnostic Service Layer (Constitution IV).
**Alternative rejected**: Direct Gemini API calls from the subagent's Bash tool — would bypass the service layer abstraction.

## Verification Plan (replaces traditional test suite for this feature)

Since subagent/skill files are configuration, not code, the primary validation is functional smoke testing:

### SC-001: Subagent files load without errors
- Check: All 6 `.claude/agents/*.md` files have valid YAML frontmatter
- Check: `name`, `description`, `tools`, `model` fields all present and valid
- Verified by: `/agents` command in Claude Code session (lists loaded agents)

### SC-002: Skill files are invocable
- Check: All 4 `.claude/skills/*/SKILL.md` have valid frontmatter (`name`, `description`)
- Verified by: Skill appears in Claude Code skill list and responds to slash command

### SC-003: build-chapter end-to-end smoke test
- Invoke: `/build-chapter 20 "Legged Locomotion Basics"`
- Verify: File created in `book-site/docs/`, has frontmatter, has ≥ 1 code block, no `[TODO]` tokens

### SC-004: ingest-book smoke test
- Invoke: `/ingest-book --dry-run`
- Verify: Reports correct file count from `book-site/docs/`, no env var errors

### SC-005: review-all smoke test
- Invoke: `/review-all`
- Verify: `book-site/review-report.md` created with entry for every chapter

### SC-006: deploy dry-run
- Invoke: `/deploy --dry-run`
- Verify: All pre-flight checks pass, steps listed, no actual push

### SC-007: Line count compliance
- Check: All agent files ≤ 500 lines (current max is 97 — well within limit)
- Check: All skill files ≤ 500 lines (current max is 167 — well within limit)
