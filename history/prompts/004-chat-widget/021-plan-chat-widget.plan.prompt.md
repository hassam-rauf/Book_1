---
id: "021"
title: Plan Chat Widget Architecture
stage: plan
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 004-chat-widget
branch: 004-chat-widget
user: hassam_rauf
command: sp.plan
labels: ["chat-widget","react","fastapi","gemini","sse","docusaurus","plan"]
links:
  spec: specs/004-chat-widget/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-chat-widget/plan.md
  - specs/004-chat-widget/research.md
  - specs/004-chat-widget/data-model.md
  - specs/004-chat-widget/contracts/openapi.yaml
  - specs/004-chat-widget/quickstart.md
tests:
  - "Constitution Check: 7/7 PASS"
---

## Prompt

yes

## Response snapshot

Completed sp.plan for F4 Chat Widget. Research agent resolved 4 key decisions:

1. **Docusaurus injection**: `src/theme/Root.tsx` swizzle — mounts widget above all content, never unmounts during SPA navigation.
2. **Gemini proxy**: New `POST /chat` FastAPI endpoint — Gemini key stays server-side; browser never touches it (Constitution VI).
3. **State management**: `useState/useReducer` local state — no external library; conversation resets on navigation per spec assumption.
4. **Streaming**: SSE via `StreamingResponse` + `text/event-stream` — ChatChunk events (token, citations, error, done); ~0.5s TTFT.

Architecture: Two-call pattern — browser calls `POST /search` first (F3), then `POST /chat` (F4 new endpoint) with retrieved passages as Gemini context.

Generated:
- research.md (4 decisions, alternatives documented)
- data-model.md (ChatMessage, Citation, ConversationSession, Pydantic schemas, TypeScript types, state machine)
- contracts/openapi.yaml (POST /chat SSE contract + SearchRequest reference)
- quickstart.md (integration test scenarios A-D)
- plan.md (4 implementation phases, AD-1 to AD-4, Constitution Check all pass)

## Outcome

- ✅ Impact: Complete architecture plan for F4. All decisions grounded in research. Constitution Check 7/7 PASS.
- 🧪 Tests: Constitution gates all pass. No violations.
- 📁 Files: 5 planning artifacts created in specs/004-chat-widget/
- 🔁 Next prompts: /sp.tasks to generate tasks.md, then /sp.implement.
- 🧠 Reflection: Key decision was proxy pattern for Gemini key — FastAPI backend reuse is cleanest solution. SSE streaming chosen over batch for better perceived latency (0.5s TTFT vs 2-4s batch wait).

## Evaluation notes (flywheel)

- Failure modes observed: None — research agent resolved all 4 unknowns in single pass.
- Graders run and results (PASS/FAIL): Constitution Check → 7/7 PASS
- Prompt variant (if applicable): null
- Next experiment: null
