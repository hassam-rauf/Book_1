---
id: "040"
title: Specify F7 Personalization
stage: spec
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 008-f7-personalization
branch: 008-f7-personalization
user: hassam_rauf
command: sp.specify
labels: ["spec","personalization","content-adaptation","profile","f7","caching"]
links:
  spec: specs/008-f7-personalization/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/008-f7-personalization/spec.md
  - specs/008-f7-personalization/checklists/requirements.md
tests:
  - N/A (spec stage)
---

## Prompt

yes (triggering sp.specify for F7 Personalization — adapt Physical AI textbook chapter content to each student's profile. After a student signs up (F6), their profile (experience_level: beginner/intermediate/advanced, programming_background: free text, hardware: laptop-only/gpu-workstation/jetson-kit/robot, preferred_language: en/ur) is stored. When a logged-in student reads a chapter, the content is personalized: code examples match their hardware, explanations match their experience level, and terminology is adjusted for their programming background. Personalization is generated on-demand by calling the FastAPI backend which uses the personalizer subagent. Personalized versions are cached so repeat visits are fast. The Docusaurus frontend detects the session cookie, fetches the user profile, and swaps in the personalized version of the current chapter. Non-logged-in users see the default chapter content.)

## Response snapshot

Generated spec.md with 4 user stories (US1 auto-personalization P1, US2 caching P1, US3 transparent swap P2, US4 cache invalidation P2), 11 FRs, 6 SCs, 3 key entities (PersonalizedChapter, Chapter, UserProfile). No NEEDS CLARIFICATION markers. Urdu language generation explicitly out of scope (F8). Checklist 12/12 PASS. Branch 008-f7-personalization created.

## Outcome

- ✅ Impact: F7 spec complete. 4 user stories covering the full personalization lifecycle: generate → cache → serve → invalidate on profile change.
- 🧪 Tests: N/A (spec stage); independent test criteria defined per user story
- 📁 Files: specs/008-f7-personalization/spec.md, checklists/requirements.md
- 🔁 Next prompts: Run `/sp.plan` for F7 Personalization.
- 🧠 Reflection: Cache invalidation (US4/FR-006) is critical — without it personalization becomes stale after profile edits. The 30-second generation timeout (FR-010/SC-001) sets a realistic bound for AI-generated content.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Checklist validation → 12/12 PASS
- Prompt variant (if applicable): null
- Next experiment: null
