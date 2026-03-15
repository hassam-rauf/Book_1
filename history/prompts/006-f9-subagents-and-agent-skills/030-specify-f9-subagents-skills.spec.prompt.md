---
id: "030"
title: Specify F9 Subagents and Agent Skills
stage: spec
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 006-f9-subagents-and-agent-skills
branch: 006-f9-subagents-and-agent-skills
user: hassam_rauf
command: sp.specify
labels: ["spec","subagents","skills","f9"]
links:
  spec: specs/006-f9-subagents-and-agent-skills/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-f9-subagents-and-agent-skills/spec.md
  - specs/006-f9-subagents-and-agent-skills/checklists/requirements.md
tests:
  - N/A (spec stage)
---

## Prompt

yes (triggering sp.specify for F9 Subagents and Agent Skills — create 6 reusable Claude Code subagents and 4 agent skills that are used throughout the Physical AI textbook project. Subagents include: chapter-writer (writes textbook chapters), code-example-generator (generates ROS2/Gazebo/Isaac code examples), content-reviewer (reviews chapters for accuracy), rag-ingestor (chunks and ingests book content into Qdrant), personalizer (rewrites chapters for user background), and translator (translates chapters to Urdu). Skills include: build-chapter (orchestrates chapter creation), deploy (full deployment pipeline), ingest-book (RAG ingestion pipeline), and review-all (runs content review across all chapters). All subagents and skills must be generic and reusable per the project constitution.)

## Response snapshot

Created branch `006-f9-subagents-and-agent-skills` and wrote `specs/006-f9-subagents-and-agent-skills/spec.md` with 6 user stories (P1–P3), 14 functional requirements, 7 success criteria, and a fully-passing quality checklist. All 12 checklist items PASS — spec is ready for `/sp.plan`.

## Outcome

- ✅ Impact: Branch `006-f9-subagents-and-agent-skills` created; spec written with 6 stories and 14 FRs.
- 🧪 Tests: N/A (spec stage)
- 📁 Files: spec.md + checklists/requirements.md
- 🔁 Next prompts: Run `/sp.plan` to generate research.md, data-model.md, and implementation plan for all 6 subagents and 4 skills.
- 🧠 Reflection: Feature cleanly maps 1 user story per subagent + 4 skill stories. No NEEDS CLARIFICATION markers needed — all design constraints were known from memory and prior features.

## Evaluation notes (flywheel)

- Failure modes observed: powershell.exe script errored on long -Json arg (positional parameter); branch still created correctly on first line.
- Graders run and results (PASS/FAIL): Spec quality checklist → all 12 PASS.
- Prompt variant (if applicable): null
- Next experiment: null
