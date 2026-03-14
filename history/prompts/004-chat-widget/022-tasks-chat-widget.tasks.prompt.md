---
id: "022"
title: Generate Chat Widget Tasks
stage: tasks
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 004-chat-widget
branch: 004-chat-widget
user: hassam_rauf
command: sp.tasks
labels: ["chat-widget","react","fastapi","sse","tasks"]
links:
  spec: specs/004-chat-widget/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-chat-widget/tasks.md
tests:
  - "Format validation: all 20 tasks follow checkbox + ID + [P?] + [Story?] + filepath format"
---

## Prompt

yes

## Response snapshot

Generated `specs/004-chat-widget/tasks.md` with 20 tasks (T001–T020) across 6 phases:

- **Phase 1 (Setup)**: T001–T002 — directory structure + test dependency verification
- **Phase 2 (Foundation)**: T003–T005 — Pydantic models, GeminiChatService, TypeScript types
- **Phase 3 (US1 P1)**: T006–T009 — POST /chat route, mocked SSE tests, ChatWidget.tsx, MessageList.tsx
- **Phase 4 (US2 P2)**: T010–T012 — Root.tsx swizzle, ChatWidget.module.css, .env.example
- **Phase 5 (US3 P3)**: T013–T015 — CitationList.tsx, MessageList update, barrel export
- **Phase 6 (Polish)**: T016–T020 — RTL tests, backend README update, full test run, manual integration

Parallel opportunities: T003/T004/T005 (Phase 2), T007/T008 (US1), T010/T011 (US2), T013/T015 (US3), T016/T017 (Polish).

## Outcome

- ✅ Impact: 20 executable tasks ready for /sp.implement. MVP = complete US1 + US2 (streaming Q&A + floating button).
- 🧪 Tests: Format check — all 20 tasks have checkbox + ID + [Story] where required + file path. 0 violations.
- 📁 Files: specs/004-chat-widget/tasks.md (20 tasks)
- 🔁 Next prompts: /sp.implement to execute all tasks.
- 🧠 Reflection: ChatWidget.tsx (T008) is the most complex single task — documented the two-call SSE reading flow in detail so LLM can implement without additional context.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): Format validation → 20/20 PASS
- Prompt variant (if applicable): null
- Next experiment: null
