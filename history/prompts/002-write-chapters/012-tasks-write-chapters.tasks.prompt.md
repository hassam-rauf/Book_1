---
id: "012"
title: "Tasks Write Chapters"
stage: tasks
date: "2026-03-08"
surface: agent
model: claude-opus-4-6
feature: 002-write-chapters
branch: 002-write-chapters
user: hassam-rauf
command: /sp.tasks
labels: ["tasks", "F2", "chapters", "content", "build-chapter"]
links:
  spec: "specs/002-write-chapters/spec.md"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - specs/002-write-chapters/tasks.md
tests: []
---

## Prompt

User ran `/sp.tasks` on F2 (002-write-chapters) after completing spec + clarify + plan.

## Response

Generated `specs/002-write-chapters/tasks.md` with 46 tasks across 7 phases.

**Phase breakdown:**
- Phase 1 (Setup): T001–T004 — verify scaffold, document templates
- Phase 2 (Foundational): T005–T006 — verify/enhance intro chapter
- Phase 3 (US1 + US4): T007–T023 — write 13 main chapters + 4 appendices in 5 parallel tracks
- Phase 4 (US2 Capstone): T024–T029 — write ch14 + verify all cross-references
- Phase 5 (US3 Exercises): T030–T035 — audit all exercises for lab-readiness
- Phase 6 (US4 Appendix verify): T036–T040 — verify bash commands + add cross-refs
- Phase 7 (Polish): T041–T046 — review-all, build check, broken link check

**Parallel opportunities:**
- Phase 3 Tracks A–E fully parallel (5 concurrent module tracks)
- Phases 4, 5, 6 can overlap after Phase 3 completes
- Within each phase: cross-reference reviews and exercise audits parallelized

**MVP scope**: Phase 1 + Phase 2 + Phase 3 Track A (Module 1, ch01–ch05) = 11 tasks

## Outcome

✅ tasks.md ready at `specs/002-write-chapters/tasks.md`
Ready for `/sp.implement`
