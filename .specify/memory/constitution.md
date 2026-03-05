<!--
Sync Impact Report
==================
Version change: 0.0.0 → 1.0.0 (MAJOR — initial ratification)
Modified principles: N/A (new document)
Added sections:
  - Core Principles (7 principles)
  - Technology Constraints
  - Development Workflow
  - Governance
Removed sections: None
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ compatible (Constitution Check section exists)
  - .specify/templates/spec-template.md — ✅ compatible (priority-based user stories align)
  - .specify/templates/tasks-template.md — ✅ compatible (phase structure matches workflow)
Follow-up TODOs: None
-->

# Physical AI Textbook Constitution

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

Every feature MUST follow the SDD pipeline before any code is written:
specify → clarify → plan → tasks → implement → commit.
No implementation without a spec. No spec without understanding requirements.
All artifacts live under `specs/<feature-name>/` with `spec.md`, `plan.md`, `tasks.md`.

### II. Smallest Viable Diff

Every change MUST be the minimum needed to satisfy the current task.
Do not refactor unrelated code. Do not add features not in the spec.
Do not add abstractions for hypothetical future needs (YAGNI).
One task = one logical change = one commit.

### III. Content Accuracy First

Book content MUST be technically accurate and verifiable against official documentation.
All code examples MUST be syntactically correct for their target framework (ROS 2, Gazebo, Isaac, Python).
Claims about APIs, tools, or hardware MUST reference official sources, not assumptions.
When uncertain, mark with `TODO(verify)` rather than guessing.

### IV. Provider-Agnostic Service Layer

The RAG backend MUST isolate LLM/embedding provider calls behind a service interface.
Swapping Gemini for OpenAI (or vice versa) MUST require changes only in the service layer.
No provider-specific types, SDKs, or constants outside `services/gemini_service.py`.
All API contracts (request/response schemas) MUST be provider-independent.

### V. Free-Tier Resilient

All external services MUST use free tiers: Gemini API, Qdrant Cloud, Neon Postgres.
The system MUST handle rate limits, storage limits, and connection limits gracefully.
Cache aggressively: personalized content, translations, and chat responses where possible.
No feature may depend on a paid service without explicit user consent.

### VI. Security by Default

Never commit secrets, API keys, or credentials to the repository.
All sensitive values MUST use environment variables loaded from `.env` (gitignored).
User passwords MUST be hashed (never stored in plaintext).
All user input MUST be sanitized before passing to LLM prompts or database queries.
CORS MUST be configured to allow only known origins.

### VII. Subagent Reusability

Claude Code subagents and skills MUST be generic and reusable, not requirement-specific.
Each subagent MUST have a single, focused responsibility.
Skills MUST orchestrate subagents, not duplicate their logic.
All subagents MUST be stored in `.claude/agents/` and skills in `.claude/skills/`.
Follow the Skill Creator Pro framework for all skill creation.

## Technology Constraints

**Mandatory stack** (per hackathon requirements + Gemini substitution):

| Layer | Technology | Constraint |
|-------|-----------|------------|
| Book | Docusaurus 3 (TypeScript) | MUST use; no alternatives |
| Deployment | GitHub Pages | MUST deploy here; Vercel as fallback |
| Backend | FastAPI (Python 3.11+) | MUST use; no alternatives |
| LLM | Gemini 2.0 Flash | Substitutes OpenAI; service layer isolates |
| Embeddings | Gemini text-embedding-004 | 768-dim vectors; compatible with Qdrant |
| Vector DB | Qdrant Cloud (Free Tier) | MUST use; no alternatives |
| SQL DB | Neon Serverless Postgres | MUST use; no alternatives |
| Auth | better-auth | MUST use for bonus; no alternatives |
| Dev Tooling | Claude Code + Spec-Kit Plus | MUST use; SDD workflow enforced |

**Prohibited:**
- No paid services without explicit approval
- No hardcoded secrets or tokens
- No OpenAI SDK imports (Gemini substitution is project-wide)
- No server-side rendering for auth (Docusaurus is SSG)

## Development Workflow

**Per-feature workflow** (enforced by SDD pipeline):

1. **Specify** (`/sp.specify`) — Write feature spec with user stories and acceptance criteria
2. **Clarify** (`/sp.clarify`) — Resolve ambiguities with targeted questions
3. **Plan** (`/sp.plan`) — Architecture decisions, interfaces, data flow
4. **Tasks** (`/sp.tasks`) — Ordered, testable tasks with dependencies
5. **Analyze** (`/sp.analyze`) — Cross-check spec/plan/tasks consistency (optional but recommended)
6. **Implement** (`/sp.implement`) — Execute tasks in order
7. **Commit** (`/sp.git.commit_pr`) — Commit changes with descriptive message

**Quality gates:**
- No implementation before spec + plan + tasks are complete
- Each task MUST have clear acceptance criteria
- Each feature MUST pass its acceptance criteria before moving to next feature
- PHR (Prompt History Record) MUST be created after every significant interaction

**Build order** (features MUST be built in this sequence):
1. Constitution (this document)
2. Subagents + Skills (F9)
3. Docusaurus setup (F1)
4. Book content (F2)
5. RAG backend (F3)
6. Chat widget (F4)
7. Text selection Q&A (F5)
8. Auth system (F6)
9. Personalization (F7)
10. Urdu translation (F8)

## Governance

This constitution supersedes all other development practices for this project.
All features, PRs, and code changes MUST comply with these principles.

**Amendment procedure:**
1. Propose amendment with rationale
2. Document impact on existing artifacts
3. Update constitution with version bump
4. Propagate changes to affected templates and specs

**Versioning:**
- MAJOR: Principle removed, redefined, or backward-incompatible change
- MINOR: New principle added or existing principle materially expanded
- PATCH: Clarification, typo fix, or non-semantic refinement

**Compliance:**
- Every `/sp.plan` MUST include a Constitution Check gate
- Violations MUST be justified in the Complexity Tracking section
- Unjustified violations block implementation

**Version**: 1.0.0 | **Ratified**: 2026-03-05 | **Last Amended**: 2026-03-05
