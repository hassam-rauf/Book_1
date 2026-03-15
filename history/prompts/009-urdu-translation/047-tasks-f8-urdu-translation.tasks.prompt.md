---
id: "047"
title: Tasks F8 Urdu Translation
stage: tasks
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 009-urdu-translation
branch: 009-urdu-translation
user: hassam_rauf
command: sp.tasks
labels: ["tasks","urdu","translation","i18n","rtl","docusaurus","gemini","f8"]
links:
  spec: specs/009-urdu-translation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-urdu-translation/tasks.md
tests: []
---

## Prompt

yes (trigger sp.tasks for F8 Urdu Translation)

## Response

Generated `specs/009-urdu-translation/tasks.md` with 12 tasks across 7 phases.

**Task count**: 12 total
- Setup (Phase 1): 2 tasks (T001–T002)
- Foundational (Phase 2): 1 task (T003)
- US1 Switch to Urdu (Phase 3): 2 tasks (T004–T005)
- US2 Fallback (Phase 4): 1 task (T006)
- US3 Translation Pipeline (Phase 5): 2 tasks (T007–T008)
- US4 Switch Back (Phase 6): 1 task (T009)
- Polish (Phase 7): 3 tasks (T010–T012)

**Parallel opportunities**: T001+T002, T003+T007, T004+T007, T008+T009, T010+T011

**MVP scope**: US1 + US2 (T001–T006) — toggle + fallback; works with manually placed Urdu files before pipeline is ready

**Key task details**:
- T004: Full LanguageWrapper (localStorage, fetch, RTL, toggle, SyntaxHighlighter)
- T005: Update DocItem/Content swizzle to outer-wrap with LanguageWrapper
- T006: 404 fallback + "not yet translated" dismissible notice
- T007: Full translate_chapters.py CLI with Gemini, argparse, --slug/--all/--force
- T010: Batch translate all 19 chapters
