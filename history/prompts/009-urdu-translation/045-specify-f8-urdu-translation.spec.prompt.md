---
id: "045"
title: Specify F8 Urdu Translation
stage: spec
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 009-urdu-translation
branch: 009-urdu-translation
user: hassam_rauf
command: sp.specify
labels: ["spec","urdu","translation","i18n","rtl","docusaurus","f8"]
links:
  spec: specs/009-urdu-translation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-urdu-translation/spec.md
  - specs/009-urdu-translation/checklists/requirements.md
tests: []
---

## Prompt

F8 Urdu Translation — translate all Physical AI textbook chapter content from English to Urdu. The Docusaurus site supports a toggle (language switcher) that swaps the displayed chapter language between English and Urdu. Urdu translations are pre-generated and stored as separate markdown files alongside the English originals. The translation pipeline is a backend job that reads English chapter markdown, calls the FastAPI backend which uses the translator subagent (Claude-based), and writes Urdu markdown files to the docs directory. The Docusaurus i18n system (or a custom toggle) detects the user's language preference (stored in localStorage) and serves the correct file. Non-translated pages fall back to English. The Urdu text is rendered right-to-left (RTL). Code blocks, frontmatter, and technical terms remain in English.

## Response

Created F8 Urdu Translation spec at `specs/009-urdu-translation/spec.md` on branch `009-urdu-translation`.

**4 User Stories**:
- US1 (P1): Switch chapter language to Urdu — toggle + RTL rendering + persistence
- US2 (P1): Fallback to English for untranslated content — no broken pages, notice shown
- US3 (P2): Translation pipeline generates Urdu files — operator batch job, idempotent
- US4 (P2): Switch back to English — bidirectional toggle

**12 Functional Requirements** covering: toggle control, localStorage persistence, RTL rendering, English fallback + notice, code block preservation, technical term preservation, translation pipeline idempotency, batch/single-chapter modes, markdown structure fidelity.

**7 Success Criteria**: all technology-agnostic and measurable (sub-1s toggle, 100% persistence, 0 Urdu chars in code, 19 chapters batch, RTL cross-browser, 100% fallback, 100% structure preservation).

**Checklist**: 12/12 PASS — no clarifications needed.
