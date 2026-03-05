---
id: 002
title: Build subagents and skills
stage: general
date: 2026-03-05
surface: agent
model: claude-opus-4-6
feature: none
branch: master
user: hassam_rauf
command: step-2-build-agents-skills
labels: ["subagents", "skills", "setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/agents/chapter-writer.md
  - .claude/agents/content-reviewer.md
  - .claude/agents/code-example-generator.md
  - .claude/agents/rag-ingestor.md
  - .claude/agents/translator.md
  - .claude/agents/personalizer.md
  - .claude/skills/build-chapter/SKILL.md
  - .claude/skills/ingest-book/SKILL.md
  - .claude/skills/review-all/SKILL.md
  - .claude/skills/deploy/SKILL.md
tests:
  - none
---

## Prompt

yes (proceed with Step 2 — building the 6 subagents + 4 skills)

## Response snapshot

Built all 10 agent artifacts for the project:

**6 Subagents** (in `.claude/agents/`):
1. `chapter-writer.md` — Generates textbook chapters (opus, tools: Read/Write/Glob/Grep/WebSearch/WebFetch)
2. `content-reviewer.md` — Reviews chapters for quality (sonnet, tools: Read/Glob/Grep)
3. `code-example-generator.md` — Generates working code examples (sonnet, tools: Read/Write/Grep/Glob/WebSearch/WebFetch)
4. `rag-ingestor.md` — Chunks, embeds, upserts to Qdrant (sonnet, tools: Read/Bash/Glob/Grep/Write)
5. `translator.md` — English-to-Urdu translation (opus, tools: Read/Write/Glob/Grep)
6. `personalizer.md` — Adapts content to user profiles (opus, tools: Read/Write/Glob/Grep)

**4 Skills** (in `.claude/skills/`):
1. `build-chapter/SKILL.md` — Orchestrates chapter-writer → code-example-generator → content-reviewer
2. `ingest-book/SKILL.md` — Runs rag-ingestor across all chapters
3. `review-all/SKILL.md` — Runs content-reviewer across all chapters with consolidated report
4. `deploy/SKILL.md` — Full build + ingest + deploy pipeline

All follow skill-creator-pro framework conventions.

## Outcome

- ✅ Impact: All 10 agent artifacts created, project is ready for Step 3 (Docusaurus setup)
- 🧪 Tests: none (agent config files, not executable code)
- 📁 Files: 10 files created (6 subagents + 4 skills)
- 🔁 Next prompts: Step 3 — F1 Docusaurus site setup via SDD pipeline (/sp.specify → /sp.clarify → /sp.plan → /sp.tasks → /sp.implement)
- 🧠 Reflection: Referenced sub_agent.md and skill-creator-pro before building. All skills follow <500 line limit.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
