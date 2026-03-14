# Implementation Plan: Book Content — Write 19 Chapters

**Branch**: `002-write-chapters` | **Date**: 2026-03-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-write-chapters/spec.md`

## Summary

Write 19 fully-realized chapters for the Physical AI & Humanoid Robotics textbook using the `build-chapter` skill (chapter-writer → code-example-generator → content-reviewer pipeline). Chapters follow a tutorial-style, beginner-friendly template. Generation uses a module-parallel strategy: Modules 1–4 and Appendices run concurrently (Phase 1), with the Capstone written last (Phase 2) after all modules are complete.

## Technical Context

**Language/Version**: Markdown (MDX-compatible Docusaurus 3); Python 3.11 for ROS 2 code examples
**Primary Dependencies**: `build-chapter` skill, chapter-writer subagent, code-example-generator subagent, content-reviewer subagent
**Storage**: `book-site/docs/` — static `.md` files committed to git
**Testing**: content-reviewer subagent quality check per chapter; `npm run build` for final integration
**Target Platform**: Docusaurus 3 static site (GitHub Pages)
**Performance Goals**: Each chapter ≥ 1,500 words; ≥ 1 Mermaid diagram; ≥ 2 code examples
**Constraints**: ROS 2 Humble (LTS); tutorial-style pedagogy; no assumed robotics background
**Scale/Scope**: 19 chapters (14 main + 4 appendices + 1 intro already seeded); ~30,000+ total words

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | spec.md + clarify + plan complete before implementation |
| II. Smallest Viable Diff | ✅ PASS | Each chapter is one atomic unit; no unrelated edits |
| III. Content Accuracy First | ✅ PASS | All code examples must be syntactically correct; `TODO(verify)` for uncertain claims |
| IV. Provider-Agnostic Service Layer | ✅ N/A | No backend code in this feature |
| V. Free-Tier Resilient | ✅ N/A | Static content; no external service calls |
| VI. Security by Default | ✅ N/A | No secrets or user input in static content |
| VII. Subagent Reusability | ✅ PASS | Uses `build-chapter` skill + existing subagents; no duplication |

**Gate result: ALL PASS — proceed to Phase 0**

## Project Structure

### Documentation (this feature)

```text
specs/002-write-chapters/
├── plan.md              ← this file
├── research.md          ← chapter structure decisions
├── data-model.md        ← chapter entity template
├── quickstart.md        ← generation commands
└── tasks.md             ← /sp.tasks output (not yet created)
```

### Source Code (content files)

```text
book-site/docs/
├── intro/
│   └── index.md                    ← already written (F1 seed)
├── module-1/
│   ├── ch01-intro-physical-ai.md   ← Phase 1
│   ├── ch02-embodied-intelligence.md
│   ├── ch03-ros2-architecture.md
│   ├── ch04-ros2-nodes-topics.md
│   └── ch05-ros2-packages-python.md
├── module-2/
│   ├── ch06-gazebo-simulation.md   ← Phase 1
│   └── ch07-urdf-sdf.md
├── module-3/
│   ├── ch08-nvidia-isaac.md        ← Phase 1
│   ├── ch09-perception-manipulation.md
│   └── ch10-sim-to-real.md
├── module-4/
│   ├── ch11-humanoid-kinematics.md ← Phase 1
│   ├── ch12-bipedal-locomotion.md
│   └── ch13-conversational-robotics.md
├── capstone/
│   └── ch14-autonomous-humanoid.md ← Phase 2 (last)
└── appendices/
    ├── a1-hardware-setup.md        ← Phase 1
    ├── a2-software-installation.md
    ├── a3-cloud-lab-setup.md
    └── a4-jetson-deployment.md
```

**Structure Decision**: Content-only feature. All source files are `.md` under `book-site/docs/`. No new directories needed. Each chapter overwrites its F1 placeholder file.

## Implementation Approach

### Chapter Content Template (all main chapters)

Every chapter follows this section order:

```
1. Frontmatter (sidebar_position, title, description)
2. ## Learning Objectives (3–5 bullet outcomes)
3. ## Introduction (why this matters — "why before how")
4. ## [Core Concept 1] (explanation + Mermaid diagram)
5. ## [Core Concept 2] (explanation + code example with comments)
6. ## [Core Concept 3] (explanation + code example with expected output)
7. ## Summary (key takeaways)
8. ## Hands-On Exercise (prerequisites, steps, expected output)
9. ## Further Reading (cross-references to related chapters)
```

### Appendix Content Template

```
1. Frontmatter
2. ## Overview (what this appendix covers)
3. ## Prerequisites (what you need before starting)
4. ## [Setup Section 1] (step-by-step commands with expected output)
5. ## [Setup Section 2]
6. ## Verification (commands to confirm setup succeeded)
7. ## Troubleshooting (common errors + fixes)
```

### Generation Phases

**Phase 1 (parallel — 5 tracks):**
- Track A: Module 1 — ch01 → ch02 → ch03 → ch04 → ch05 (sequential)
- Track B: Module 2 — ch06 → ch07 (sequential)
- Track C: Module 3 — ch08 → ch09 → ch10 (sequential)
- Track D: Module 4 — ch11 → ch12 → ch13 (sequential)
- Track E: Appendices — a1 → a2 → a3 → a4 (sequential)

**Phase 2 (sequential, after Phase 1 complete):**
- ch14 Capstone — references all 4 modules; written last

### Quality Gate Per Chapter

Each chapter goes through the `build-chapter` skill pipeline:
1. `chapter-writer` subagent — generates full content from spec + context
2. `code-example-generator` subagent — verifies/enhances code blocks
3. `content-reviewer` subagent — quality check (technical accuracy, completeness, readability)

Chapter is marked complete only when content-reviewer passes with no critical issues.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
