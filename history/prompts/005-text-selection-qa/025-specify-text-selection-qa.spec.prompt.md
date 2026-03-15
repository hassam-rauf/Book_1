---
id: "025"
title: Specify Text-Selection Q&A Feature
stage: spec
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 005-text-selection-qa
branch: 005-text-selection-qa
user: hassam_rauf
command: sp.specify
labels: ["spec","text-selection","qa","chat","docusaurus","f5"]
links:
  spec: specs/005-text-selection-qa/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-text-selection-qa/spec.md
  - specs/005-text-selection-qa/checklists/requirements.md
  - history/prompts/005-text-selection-qa/025-specify-text-selection-qa.spec.prompt.md
tests: []
---

## Prompt

F5 Text-selection Q&A — when a user selects/highlights text on any page of the Docusaurus book, a small popup appears near the selection with an "Ask AI" button. Clicking it opens a chat panel pre-filled with the selected text as context, and the student can type a question about that specific passage. The question is sent to the RAG backend with the selected text as additional context, and the Gemini API streams a grounded answer back into the panel.

## Response snapshot

Created branch `005-text-selection-qa`. Wrote spec.md with 3 user stories (P1: ask about selected passage, P2: follow-up questions in same panel, P3: mobile touch selection), 12 functional requirements (FR-001–FR-012), 6 success criteria (SC-001–SC-006), edge cases, assumptions, and out-of-scope section. Checklist: 12/12 PASS. No NEEDS CLARIFICATION markers.

Key decisions:
- Popup suppressed for selections < 10 characters (avoids accidental triggers)
- Reuses F4 ChatWidget streaming/citations logic (avoids duplication)
- Selected text prepended as highest-priority context passage alongside RAG results
- Panel persists for follow-up questions within same open session

## Outcome

- ✅ Impact: Spec complete. Branch `005-text-selection-qa` created. Ready for `/sp.plan`.
- 🧪 Tests: N/A (spec stage)
- 📁 Files: 2 files created (spec.md, checklists/requirements.md)
- 🔁 Next prompts: `/sp.plan` → `/sp.tasks` → `/sp.implement`
- 🧠 Reflection: F5 is tightly coupled to F4 — the chat panel and streaming logic will be shared/extended rather than rebuilt from scratch.

## Evaluation notes (flywheel)

- Failure modes observed: PowerShell not available in WSL; created branch and files manually.
- Graders run and results (PASS/FAIL): Checklist 12/12 PASS.
- Prompt variant (if applicable): null
- Next experiment: null
