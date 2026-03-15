# Feature Specification: Subagents and Agent Skills

**Feature Branch**: `006-f9-subagents-and-agent-skills`
**Created**: 2026-03-15
**Status**: Draft
**Input**: User description: "F9 Subagents and Agent Skills — create 6 reusable Claude Code subagents and 4 agent skills that are used throughout the Physical AI textbook project. Subagents include: chapter-writer (writes textbook chapters), code-example-generator (generates ROS2/Gazebo/Isaac code examples), content-reviewer (reviews chapters for accuracy), rag-ingestor (chunks and ingests book content into Qdrant), personalizer (rewrites chapters for user background), and translator (translates chapters to Urdu). Skills include: build-chapter (orchestrates chapter creation), deploy (full deployment pipeline), ingest-book (RAG ingestion pipeline), and review-all (runs content review across all chapters). All subagents and skills must be generic and reusable per the project constitution."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Textbook Chapter End-to-End (Priority: P1)

A developer on the textbook project wants to add a new chapter on "Legged Locomotion." They invoke the `build-chapter` skill, which coordinates the chapter-writer subagent to draft content, the code-example-generator subagent to produce working ROS 2 / Gazebo / Isaac code snippets, and the content-reviewer subagent to validate accuracy. The complete chapter Markdown file lands in `book-site/docs/` ready for commit.

**Why this priority**: This is the highest-value workflow — it automates the most time-consuming manual task (research, write, code, review) into a single command. All other subagents and skills exist to support this flow or analogous ones.

**Independent Test**: Invoke `build-chapter` with a chapter title and outline; verify a valid `.md` file is produced in `book-site/docs/`, contains at least one working code block with a language tag, and has no unresolved placeholder tokens.

**Acceptance Scenarios**:

1. **Given** the developer calls `build-chapter` with a chapter name and brief outline, **When** the skill orchestrates chapter-writer → code-example-generator → content-reviewer, **Then** a Docusaurus-compatible Markdown file is written to `book-site/docs/` with frontmatter, prose, and code examples.
2. **Given** the chapter draft is written, **When** content-reviewer runs, **Then** it outputs a structured review report listing any accuracy, completeness, or readability issues — each linked to a section.
3. **Given** the content-reviewer reports no blocking issues, **When** the skill finishes, **Then** the chapter file is present, the review report is saved alongside it, and the terminal output summarises chapter title, word count, code block count, and review verdict.

---

### User Story 2 - Ingest All Book Content into RAG (Priority: P2)

A developer has updated several chapters and needs to rebuild the RAG vector index. They invoke the `ingest-book` skill, which triggers the rag-ingestor subagent to chunk every Markdown file in `book-site/docs/`, generate Gemini embeddings, and upsert vectors into Qdrant Cloud.

**Why this priority**: Without an up-to-date RAG index the chatbot (F3/F4) serves stale or missing answers. This skill must be reliable and idempotent.

**Independent Test**: Invoke `ingest-book`; verify the Qdrant collection point count increases (or stays the same for identical content) and the terminal output reports the number of chunks upserted.

**Acceptance Scenarios**:

1. **Given** valid `GEMINI_API_KEY`, `QDRANT_URL`, `QDRANT_API_KEY`, and `QDRANT_COLLECTION` are set, **When** `ingest-book` is invoked, **Then** the rag-ingestor subagent processes all `.md` files in `book-site/docs/` and reports total chunks upserted.
2. **Given** a chapter file has already been ingested and has not changed, **When** `ingest-book` is run again, **Then** the collection point count does not increase (upsert is idempotent).
3. **Given** a required environment variable is missing, **When** `ingest-book` is invoked, **Then** the skill reports a clear error message naming the missing variable and exits without attempting ingestion.

---

### User Story 3 - Full Deploy Pipeline (Priority: P2)

A developer wants to build and publish the current state of the book. They invoke the `deploy` skill, which builds the Docusaurus site, optionally runs RAG ingestion, and pushes the build to GitHub Pages — producing a live URL.

**Why this priority**: Deployment is a multi-step, error-prone manual process. A single skill that wraps build + ingest + deploy guards against partial deploys and makes the submission workflow repeatable.

**Independent Test**: Run `deploy --dry-run`; verify that all pre-flight checks pass (Node.js ≥ 18, env vars, clean git state) and the terminal output lists every planned step without executing the actual deploy.

**Acceptance Scenarios**:

1. **Given** all pre-flight checks pass, **When** `deploy` is invoked, **Then** the Docusaurus build completes without errors and `book-site/build/index.html` is present.
2. **Given** the build succeeds and `--skip-ingest` is not set, **When** `deploy` proceeds, **Then** rag-ingestor runs and reports chunk count before the GitHub Pages push.
3. **Given** the build and ingest succeed, **When** the deploy step completes, **Then** the live URL is printed in the terminal output.
4. **Given** `--dry-run` is passed, **When** `deploy` runs, **Then** all steps are validated and reported but no files are pushed and no deployment occurs.

---

### User Story 4 - Review All Chapters for Quality (Priority: P3)

A developer wants a comprehensive quality audit before submission. They invoke the `review-all` skill, which runs the content-reviewer subagent against every chapter and consolidates findings into a single report.

**Why this priority**: Ensures submission-time quality gate. The reviewer is already used inline during `build-chapter`; a batch review pass is a useful bonus but not blocking.

**Independent Test**: Invoke `review-all`; verify a consolidated report is saved to `book-site/review-report.md` listing every chapter with a pass/warn/fail verdict and actionable issues.

**Acceptance Scenarios**:

1. **Given** one or more `.md` files exist in `book-site/docs/`, **When** `review-all` is invoked, **Then** content-reviewer runs on each chapter and a consolidated `review-report.md` is written listing chapter name, verdict, and issues.
2. **Given** a chapter has no issues, **When** it is reviewed, **Then** it appears in the report as `PASS` with zero issues listed.
3. **Given** a chapter has accuracy or completeness issues, **When** it is reviewed, **Then** it appears with `WARN` or `FAIL` verdict and a description of each issue.

---

### User Story 5 - Personalise a Chapter for a User Profile (Priority: P3)

A student has completed signup and provided their experience level, programming background, and available hardware. An administrator or automated job calls the personalizer subagent to rewrite a chapter so it is appropriate for that student's background.

**Why this priority**: Personalisation is a bonus feature (+50 pts hackathon) but depends on F6 (auth/profiles). The subagent must be ready for integration.

**Independent Test**: Call the personalizer subagent with a chapter path and a user profile (experience: beginner, languages: Python, hardware: laptop-only); verify the output chapter adapts the content appropriately and preserves all code blocks.

**Acceptance Scenarios**:

1. **Given** a chapter file and a user profile, **When** the personalizer subagent runs, **Then** it produces a rewritten chapter file that matches the user's experience level and available hardware.
2. **Given** a user profile with `experience: advanced`, **When** personalizer runs, **Then** the output retains advanced content and adds implementation depth rather than simplifying it.

---

### User Story 6 - Translate a Chapter to Urdu (Priority: P3)

A student selects Urdu as their preferred language. An administrator calls the translator subagent to produce an Urdu-language version of a chapter, preserving all Markdown formatting, code blocks, and technical terms in English.

**Why this priority**: Urdu translation is a bonus feature (+50 pts hackathon) but depends on F8. The subagent must be ready for integration.

**Independent Test**: Call the translator subagent with a chapter path; verify the output file contains Urdu prose, all code blocks are unchanged, all technical terms remain in English, and Markdown structure is preserved.

**Acceptance Scenarios**:

1. **Given** a chapter file in English, **When** the translator subagent runs, **Then** an Urdu-language version is written to the appropriate output path with all code blocks and technical terms unchanged.
2. **Given** a chapter with frontmatter, **When** translated, **Then** the frontmatter `title` and `description` fields are translated but structural fields (`id`, `sidebar_position`) are preserved.

---

### Edge Cases

- What happens if chapter-writer produces a file with unresolved placeholder tokens (e.g., `[TODO]`)?
- What if code-example-generator produces code with syntax errors?
- What if the Qdrant collection does not exist when rag-ingestor runs?
- What if a chapter file is empty or contains only frontmatter?
- What if `build-chapter` is called for a chapter that already exists in `book-site/docs/`?
- What if `review-all` is invoked when no chapter files exist?
- What if translation corrupts Markdown table formatting?

## Requirements *(mandatory)*

### Functional Requirements

#### Subagents

- **FR-001**: The `chapter-writer` subagent MUST accept a chapter title and optional outline and produce a Docusaurus-compatible Markdown file with valid frontmatter, prose sections, and inline callouts.
- **FR-002**: The `code-example-generator` subagent MUST accept a topic and target framework (ROS 2, Gazebo, or NVIDIA Isaac), and produce well-commented, working code snippets with correct language tags in fenced blocks.
- **FR-003**: The `content-reviewer` subagent MUST accept a chapter file path and output a structured review report covering technical accuracy, completeness, readability, and consistency — each issue linked to a section.
- **FR-004**: The `rag-ingestor` subagent MUST accept a directory of Markdown files, chunk them into passages, generate embeddings via the configured embedding service, and upsert vectors into the configured vector store collection.
- **FR-005**: The `personalizer` subagent MUST accept a chapter file path and a user profile (experience level, programming background, hardware), and produce a rewritten chapter adapted to that profile.
- **FR-006**: The `translator` subagent MUST accept a chapter file path and target language (defaulting to Urdu), and produce a translated file that preserves Markdown structure, code blocks, and technical terms in English.

#### Skills

- **FR-007**: The `build-chapter` skill MUST orchestrate chapter-writer → code-example-generator → content-reviewer in sequence, saving all outputs and surfacing the review report to the user.
- **FR-008**: The `deploy` skill MUST run pre-flight checks, build the Docusaurus site, optionally run rag-ingestor, and push to GitHub Pages — stopping and reporting on the first failure.
- **FR-009**: The `ingest-book` skill MUST trigger rag-ingestor across all `.md` files in `book-site/docs/` and report total chunks upserted and any errors.
- **FR-010**: The `review-all` skill MUST run content-reviewer on every chapter and produce a consolidated report at a predictable output path (`book-site/review-report.md`).

#### General

- **FR-011**: All subagents MUST be defined as Markdown files with valid YAML frontmatter stored under `.claude/agents/`.
- **FR-012**: All skills MUST be defined as Markdown files stored under `.claude/skills/<skill-name>/SKILL.md`.
- **FR-013**: No subagent MUST spawn another subagent (Claude Code platform constraint).
- **FR-014**: All subagents and skills MUST be generic and reusable — parameterised by inputs, not hardcoded to specific chapters or file paths.

### Key Entities

- **Subagent**: A Markdown file with YAML frontmatter (`name`, `description`, `tools`, `model`) defining a specialized autonomous agent. Stored under `.claude/agents/`.
- **Skill**: A Markdown file with YAML frontmatter and a prompt body defining a reusable command. Stored under `.claude/skills/<name>/SKILL.md`.
- **Chapter**: A Docusaurus-compatible Markdown file in `book-site/docs/` with frontmatter (`id`, `title`, `sidebar_position`) and structured prose content.
- **UserProfile**: A record specifying a reader's experience level, programming background, and available hardware — used by the personalizer subagent.
- **ReviewReport**: A structured document listing chapters with pass/warn/fail verdicts and per-issue descriptions — output by content-reviewer and consolidated by review-all.
- **IngestResult**: A summary of a rag-ingestor run — total files processed, total chunks upserted, and any errors encountered.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 6 subagent files are present under `.claude/agents/` and load without errors in a Claude Code session.
- **SC-002**: All 4 skill SKILL.md files are present under `.claude/skills/` and are invocable as slash commands.
- **SC-003**: `build-chapter` produces a complete chapter file (frontmatter + prose + at least one code block) in a single invocation with no manual intervention.
- **SC-004**: `ingest-book` reports successful upsert for every `.md` file in `book-site/docs/` when environment variables are correctly set.
- **SC-005**: `review-all` produces a consolidated report covering 100% of chapters present in `book-site/docs/`.
- **SC-006**: `deploy` completes the full pipeline (build → ingest → push) with a single command and prints the live GitHub Pages URL on success.
- **SC-007**: Each subagent definition file is under 500 lines; complex prompt logic is extracted to reference files.

## Assumptions

- Claude Code is the execution environment; subagents are `.md` files with YAML frontmatter loaded via `.claude/agents/`.
- The Gemini API key, Qdrant URL/key/collection are available as environment variables for rag-ingestor and chapter-writer.
- The `deploy` and `ingest-book` skills partially exist from prior features; this feature formalises and completes them.
- Subagents cannot spawn other subagents — skills orchestrate subagents; subagents do not call each other.
- The `book-site/docs/` directory is the canonical location for all chapter Markdown files.
- The project constitution (`.specify/memory/constitution.md`) is the authoritative source for coding standards.

## Out of Scope

- Implementing a subagent registry or discovery API beyond what Claude Code provides natively.
- Creating a GUI or web interface for invoking subagents or skills.
- Automated CI/CD triggers for subagent runs (skills are invoked manually or via the deploy pipeline).
- Authentication or access control for subagent invocations.
- Subagents that operate on vector stores other than Qdrant.
