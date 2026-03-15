---
id: "032"
title: Tasks F9 Subagents and Agent Skills
stage: tasks
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 006-f9-subagents-and-agent-skills
branch: 006-f9-subagents-and-agent-skills
user: hassam_rauf
command: sp.tasks
labels: ["tasks","subagents","skills","f9","verification"]
links:
  spec: specs/006-f9-subagents-and-agent-skills/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-f9-subagents-and-agent-skills/tasks.md
tests:
  - N/A (tasks stage)
---

## Prompt

yes (triggering sp.tasks for F9 Subagents and Agent Skills)

## Response snapshot

Generated tasks.md with 46 tasks across 9 phases. Feature is a verification + patch sprint (all files pre-exist). Tasks cover: frontmatter validation (T005–T014), prompt review + patch for each subagent/skill, and smoke tests for all 6 user stories. 14 tasks parallelizable. MVP scope is US1 build-chapter (T001–T021).

## Outcome

- ✅ Impact: tasks.md created at specs/006-f9-subagents-and-agent-skills/tasks.md with 46 tasks.
- 🧪 Tests: N/A (tasks stage); smoke test tasks defined for all 6 user stories (T021, T027, T030, T035, T038, T041)
- 📁 Files: tasks.md
- 🔁 Next prompts: Run `/sp.implement` to execute verification and patching tasks.
- 🧠 Reflection: Verification-only feature requires a different framing: review → patch → smoke-test replaces the usual build → test cycle. Task IDs T016-T020 are review/patch pairs before the smoke test T021.

## Evaluation notes (flywheel)

- Failure modes observed: None — check-prerequisites.ps1 returned correct FEATURE_DIR.
- Graders run and results (PASS/FAIL): Format validation → all 46 tasks follow checkbox + ID + label format.
- Prompt variant (if applicable): null
- Next experiment: null
