---
id: "026"
title: Plan Text-Selection Q&A Architecture
stage: plan
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 005-text-selection-qa
branch: 005-text-selection-qa
user: hassam_rauf
command: sp.plan
labels: ["plan","text-selection","qa","react","docusaurus","f5","architecture"]
links:
  spec: specs/005-text-selection-qa/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-text-selection-qa/plan.md
  - specs/005-text-selection-qa/research.md
  - specs/005-text-selection-qa/data-model.md
  - specs/005-text-selection-qa/quickstart.md
  - specs/005-text-selection-qa/contracts/openapi.yaml
tests: []
---

## Prompt

yes (triggering sp.plan for 005-text-selection-qa)

## Response snapshot

Generated 5 planning artifacts for F5 Text-Selection Q&A. Constitution Check 7/7 PASS.

Key decisions:
- AD-1: No new backend endpoint — selected text prepended as context_passages[0] with score=1.0 to existing POST /chat
- AD-2: window.getSelection() on mouseup/touchend — no external library
- AD-3: Extract useChatStream hook from ChatWidget.tsx to share SSE streaming logic
- AD-4: SelectionChatPanel positioned near selection (not fixed) with viewport clamping

4-phase implementation: (1) extract useChatStream hook, (2) SelectionPopup component, (3) SelectionChatPanel, (4) wire Root.tsx.

## Outcome

- ✅ Impact: Full plan generated. Zero backend changes required.
- 🧪 Tests: N/A (plan stage)
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/openapi.yaml
- 🔁 Next prompts: /sp.tasks → /sp.implement
- 🧠 Reflection: Key insight — useChatStream hook extraction avoids code duplication between ChatWidget and SelectionChatPanel. The selected text injection as score=1.0 passage piggybacks cleanly on existing backend model with zero changes.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution Check 7/7 PASS
- Prompt variant (if applicable): null
- Next experiment: null
