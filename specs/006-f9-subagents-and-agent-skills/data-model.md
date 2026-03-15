# Data Model: Subagents and Agent Skills

**Feature**: 006-f9-subagents-and-agent-skills
**Date**: 2026-03-15

> Note: This feature has no database schema (no new tables). The "data model" here describes the interface contracts for each subagent and skill — their expected inputs, outputs, and internal entities.

---

## Subagent Interface Schemas

### SubagentDefinition

Every subagent file follows this YAML frontmatter schema:

```yaml
name: <slug>                  # Unique identifier; matches filename without .md
description: |                # Multi-line; shown in /agents list
  <one-line summary>
  Use <when to invoke hint>.
tools: <comma-separated list> # Subset of: Read, Write, Glob, Grep, Bash, WebSearch, WebFetch, Agent
model: opus | sonnet | haiku  # Claude model to use
```

**Validation rules**:
- `name` MUST match the filename (e.g., `chapter-writer.md` → `name: chapter-writer`)
- `tools` MUST NOT include `Agent` (subagents cannot spawn subagents)
- `description` MUST include a "Use when..." hint for auto-invocation

---

### ChapterWriterInput

```text
Fields:
  chapter_number  : integer   — Chapter number (1–20)
  chapter_title   : string    — Full chapter title (e.g., "Legged Locomotion Basics")
  outline         : string?   — Optional bullet-point outline of topics to cover
  audience_level  : enum      — "beginner" | "intermediate" | "advanced" (default: "intermediate")
```

**Output**: `book-site/docs/<slug>.md` — Docusaurus Markdown file with:
- Frontmatter: `id`, `title`, `sidebar_position`, `description`
- H2 sections matching outline topics
- Inline callouts (`:::tip`, `:::warning`, `:::info`)
- Code block placeholders (filled by code-example-generator)

---

### CodeExampleGeneratorInput

```text
Fields:
  topic           : string    — The specific concept or API to illustrate
  framework       : enum      — "ros2" | "gazebo" | "isaac" | "python"
  language        : enum      — "python" | "cpp" | "bash" | "yaml" (default: "python")
  chapter_context : string?   — The chapter section this code belongs to
```

**Output**: Fenced code blocks with:
- Correct language tag
- Inline comments explaining each step
- Import statements at the top
- Error handling where appropriate

---

### ContentReviewerInput

```text
Fields:
  chapter_path    : string    — Absolute path to the .md file to review
  review_scope    : enum      — "full" | "accuracy-only" | "code-only" (default: "full")
```

**Output**: `<chapter_path_stem>-review.md` with structure:

```text
# Review: <Chapter Title>
**Verdict**: PASS | WARN | FAIL
**Issues**: <count>

## Summary
<1–3 sentence overview>

## Issues
### [SEVERITY] Section: <section name>
**Issue**: <description>
**Suggestion**: <fix>
```

Severity levels: `CRITICAL` (blocks publish) | `WARNING` (should fix) | `NOTE` (optional)

---

### RagIngestorInput

```text
Fields:
  docs_dir        : string    — Path to directory containing .md files (default: "book-site/docs/")
  force           : boolean   — Delete and recreate collection before indexing (default: false)
  dry_run         : boolean   — Count chunks without uploading (default: false)
```

**Internal chunk entity**:

```text
Chunk:
  id              : string    — Deterministic UUID from (file_path + position)
  text            : string    — Plain text content (markdown stripped)
  display_text    : string    — Original markdown for display
  embedding       : float[]   — 768-dim Gemini text-embedding-004 vector
  metadata:
    chapter       : string    — Chapter slug (from filename)
    section       : string    — Nearest H2/H3 heading
    position      : integer   — Chunk index within file (0-based)
    file_path     : string    — Relative path from repo root
```

**Output**: Console report — files processed, chunks upserted, errors

---

### PersonalizerInput

```text
Fields:
  chapter_path    : string    — Absolute path to source .md file
  profile:
    experience    : enum      — "beginner" | "intermediate" | "advanced"
    languages     : string[]  — e.g., ["python", "cpp"]
    hardware      : enum      — "laptop-only" | "gpu-workstation" | "cloud"
    profile_id    : string    — Unique user identifier (used in output path)
```

**Output**: `book-site/docs/personalized/<profile_id>/<chapter_slug>.md`

**Transformation rules**:
- `beginner`: Simplify prerequisites; add "What is X?" explanations; replace GPU code with CPU fallbacks
- `advanced`: Add implementation depth; link to source code; skip basic definitions
- `laptop-only`: Replace NVIDIA Isaac examples with Gazebo equivalents; note hardware requirements

---

### TranslatorInput

```text
Fields:
  chapter_path    : string    — Absolute path to source .md file
  target_language : string    — ISO 639-1 code (default: "ur" for Urdu)
```

**Output**: `book-site/docs/urdu/<chapter_slug>.md`

**Translation rules**:
- Translate: All prose, H2/H3 headings, frontmatter `title` and `description`
- Preserve unchanged: All fenced code blocks, technical terms (ROS 2, Gazebo, NVIDIA Isaac, Python, etc.), frontmatter `id` and `sidebar_position`, URLs, file paths
- RTL support: Output file may need `dir="rtl"` in frontmatter (document as TODO for F8)

---

## Skill Interface Schemas

### SkillDefinition

Every skill `SKILL.md` file follows this YAML frontmatter schema:

```yaml
name: <slug>                  # Unique identifier; matches directory name
description: |                # Multi-line; shown in skill list
  <one-line summary>
  This skill should be used when <invocation hint>.
```

---

### BuildChapterSkillIO

```text
Input:
  chapter_number  : integer   — Required
  topic           : string?   — Optional; passed to chapter-writer

Execution flow:
  1. Agent(chapter-writer, {chapter_number, topic})  → chapter_path
  2. Agent(code-example-generator, {chapter_path})   → updated chapter_path
  3. Agent(content-reviewer, {chapter_path})         → review_path

Output:
  chapter_path    : string    — Path to created/updated chapter
  review_path     : string    — Path to review report
  verdict         : enum      — PASS | WARN | FAIL
```

---

### DeploySkillIO

```text
Input:
  skip_ingest     : boolean   — Skip rag-ingestor step (default: false)
  dry_run         : boolean   — Validate only, do not push (default: false)
  skip_review     : boolean   — Skip quality check (default: false)

Execution flow:
  1. Pre-flight checks
  2. npm run build (book-site)
  3. Agent(rag-ingestor, {dry_run}) [unless skip_ingest]
  4. Quality check (frontmatter, links, code tags) [unless skip_review]
  5. npm run deploy (or git push main)

Output:
  live_url        : string    — GitHub Pages URL
  build_time      : number    — Seconds
  chunks_indexed  : number    — RAG chunks (or "skipped")
  quality_verdict : string    — "passed" | "N warnings"
```

---

### IngestBookSkillIO

```text
Input:
  chapter         : integer?  — Specific chapter only (default: all)
  force           : boolean   — Recreate collection (default: false)
  dry_run         : boolean   — Count only (default: false)

Execution flow:
  1. Verify env vars
  2. Glob book-site/docs/**/*.md
  3. Agent(rag-ingestor, {docs_dir, force, dry_run})

Output:
  files_processed : integer
  chunks_upserted : integer
  errors          : string[]
```

---

### ReviewAllSkillIO

```text
Input:
  chapter         : integer?  — Specific chapter only (default: all)
  fix             : boolean   — Apply auto-fixable suggestions (default: false)

Execution flow:
  1. Glob book-site/docs/**/*.md
  2. For each chapter: Agent(content-reviewer, {chapter_path})
  3. Aggregate individual reports into review-report.md

Output:
  report_path     : string    — "book-site/review-report.md"
  chapters_passed : integer
  chapters_warned : integer
  chapters_failed : integer
```
