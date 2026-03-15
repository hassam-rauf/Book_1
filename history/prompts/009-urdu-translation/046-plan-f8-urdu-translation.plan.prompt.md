---
id: "046"
title: Plan F8 Urdu Translation
stage: plan
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 009-urdu-translation
branch: 009-urdu-translation
user: hassam_rauf
command: sp.plan
labels: ["plan","urdu","translation","i18n","rtl","docusaurus","gemini","f8"]
links:
  spec: specs/009-urdu-translation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/009-urdu-translation/plan.md
  - specs/009-urdu-translation/research.md
  - specs/009-urdu-translation/data-model.md
  - specs/009-urdu-translation/contracts/translation-pipeline.md
  - specs/009-urdu-translation/quickstart.md
tests: []
---

## Prompt

yes (trigger sp.plan for F8 Urdu Translation)

## Response

Generated F8 Urdu Translation plan at `specs/009-urdu-translation/plan.md`. All 7 constitution gates PASS.

**5 Architecture Decisions**:
1. Static file delivery (`book-site/static/translations/ur/`) instead of Docusaurus i18n locale — avoids double builds and URL changes
2. LanguageWrapper wraps PersonalizationWrapper — keeps translation and personalization orthogonal; Urdu bypasses personalization
3. Translation script calls Gemini 2.0 Flash directly (subagent is CLI-only, same pattern as F7)
4. RTL via inline style on markdown container div (scoped to body only)
5. localStorage key `preferred-lang` (`"en"` | `"ur"`)

**New files**: 1 Python script, 1 React component, static Urdu files (19), minor update to existing swizzle
**No backend changes** — translation is a one-time operator script; static files served by GitHub Pages

📋 Architectural decision detected: Static file delivery vs Docusaurus i18n for multilingual content — Document reasoning and tradeoffs? Run `/sp.adr urdu-static-files-vs-i18n`
