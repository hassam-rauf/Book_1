---
id: "020"
title: Specify Chat Widget Feature
stage: spec
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 004-chat-widget
branch: 004-chat-widget
user: hassam_rauf
command: sp.specify
labels: ["chat-widget","react","gemini","rag","docusaurus","spec"]
links:
  spec: specs/004-chat-widget/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-chat-widget/spec.md
  - specs/004-chat-widget/checklists/requirements.md
tests:
  - "Checklist requirements.md: 14/14 PASS"
---

## Prompt

F4 Chat widget — a React component embedded in the Docusaurus site that lets students ask questions about the textbook. The widget calls the F3 RAG backend POST /search to retrieve relevant passages, then calls the Gemini API (gemini-2.0-flash) to generate a grounded answer with citations. The widget appears as a floating chat button on every page.

## Response snapshot

Created branch `004-chat-widget` and wrote `specs/004-chat-widget/spec.md` with 3 user stories:

- **US1 (P1)**: Student asks a textbook question — full Q&A flow via POST /search + Gemini, answer with citations within 5 seconds.
- **US2 (P2)**: Widget is always accessible — floating button on every Docusaurus page, opens/closes without disrupting content.
- **US3 (P3)**: Cited sources are traceable — citations show chapter title + section heading, anchoring answers to textbook.

11 functional requirements (FR-001–FR-011) covering floating button, chat panel, RAG call, Gemini call, citations, validation, loading state, error handling, overlay rendering, Docusaurus integration, API key safety.

5 success criteria: answer within 5s, button on 100% of pages, zero unhandled JS exceptions on API errors, no layout reflow, citations accurately reference source sections.

Assumptions documented: conversation resets on navigation, Gemini key behind server-side proxy, top_k=5 default, no auth required.

All 14 checklist items pass.

## Outcome

- ✅ Impact: Complete spec for F4 chat widget ready for planning. All 3 user stories independently testable.
- 🧪 Tests: Checklist requirements.md — 14/14 items pass. No NEEDS CLARIFICATION markers.
- 📁 Files: specs/004-chat-widget/spec.md, specs/004-chat-widget/checklists/requirements.md
- 🔁 Next prompts: /sp.plan (generate research.md, data-model.md, contracts), then /sp.tasks, then /sp.implement.
- 🧠 Reflection: FR-011 (API key exposure) is the trickiest requirement — the proxy design decision will be the key architectural choice in planning.

## Evaluation notes (flywheel)

- Failure modes observed: None — spec written in single pass, no clarification markers needed.
- Graders run and results (PASS/FAIL): Checklist requirements.md → 14/14 PASS
- Prompt variant (if applicable): null
- Next experiment: null
