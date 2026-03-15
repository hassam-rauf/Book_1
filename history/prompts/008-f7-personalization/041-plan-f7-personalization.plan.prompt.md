---
id: "041"
title: Plan F7 Personalization
stage: plan
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 008-f7-personalization
branch: 008-f7-personalization
user: hassam_rauf
command: sp.plan
labels: ["plan","personalization","gemini","neon","cache","fastapi","docusaurus","swizzle","f7"]
links:
  spec: specs/008-f7-personalization/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/008-f7-personalization/plan.md
  - specs/008-f7-personalization/research.md
  - specs/008-f7-personalization/data-model.md
  - specs/008-f7-personalization/quickstart.md
  - specs/008-f7-personalization/contracts/personalize-endpoint.md
tests:
  - N/A (plan stage)
---

## Prompt

yes (triggering sp.plan for F7 Personalization)

## Response snapshot

Key finding: Claude Code personalizer subagent is a CLI tool — not callable from FastAPI. Plan uses PersonalizerService calling Gemini 2.0 Flash directly (same pattern as GeminiService). Stale-while-revalidate via FastAPI BackgroundTasks — returns default/stale content immediately, generates in background. Cache in Neon Postgres (personalized_chapter_cache) with profile_hash-based invalidation + DELETE sweep on PUT /profile. Docusaurus swizzles @theme/DocItem/Content for transparent content swap. All 7 constitution principles PASS.

## Outcome

- ✅ Impact: Full planning artifacts for F7 Personalization. PersonalizerService + cache + swizzled Docusaurus component architecture documented.
- 🧪 Tests: N/A (plan stage); test scenarios in quickstart.md
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/personalize-endpoint.md
- 🔁 Next prompts: Run `/sp.tasks` for ordered implementation task list.
- 🧠 Reflection: The key insight is that the existing personalizer subagent writes to filesystem — incompatible with serving personalized content via REST API. Using Gemini directly in a new PersonalizerService is the smallest viable diff that actually works.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution check → 7/7 PASS
- Prompt variant (if applicable): null
- Next experiment: null
