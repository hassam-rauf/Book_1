# Feature Specification: Book Content — Write 19 Chapters

**Feature Branch**: `002-write-chapters`
**Created**: 2026-03-08
**Status**: Draft
**Input**: User description: "F2: Book Content - Write 19 chapter pages for the Physical AI & Humanoid Robotics textbook using the build-chapter skill."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Student reads a module chapter (Priority: P1)

A robotics student opens a chapter (e.g., "ROS 2 Architecture") and reads structured educational content: concept explanation, annotated code examples, diagrams showing system relationships, and a practice exercise at the end.

**Why this priority**: Core value of the textbook — without readable content, no other feature matters.

**Independent Test**: Open any single chapter page in the Docusaurus site and verify it contains all required content sections.

**Acceptance Scenarios**:

1. **Given** a student is on the ROS 2 Architecture chapter, **When** they scroll through the page, **Then** they see a learning objectives section, concept explanations, at least one Mermaid diagram, at least one code block, and a hands-on exercise.
2. **Given** a student wants to understand a concept, **When** they read the chapter, **Then** the content progresses logically from fundamentals to applied examples without assumed prior robotics knowledge.

---

### User Story 2 — Student follows a full learning module (Priority: P2)

A student works through all chapters in a module (e.g., Module 1: ROS 2) in sequence. Each chapter builds on the previous one, and cross-references guide the student to related chapters.

**Why this priority**: Module coherence is essential for the textbook to function as a structured curriculum rather than isolated articles.

**Independent Test**: Read Module 1 chapters (ch01–ch05) in sequence and verify concepts build progressively.

**Acceptance Scenarios**:

1. **Given** a student completes ch01, **When** they start ch02, **Then** ch02 references ch01 concepts and introduces new ones without re-explaining basics.
2. **Given** a student is on any chapter, **When** they look for related content, **Then** cross-reference links to other chapters are present.

---

### User Story 3 — Instructor uses exercises for lab sessions (Priority: P3)

An instructor uses the hands-on exercises at the end of each chapter as lab assignments. Each exercise has clear objectives, prerequisite setup, step-by-step tasks, and expected outcomes.

**Why this priority**: Exercises add pedagogical depth; required for hackathon evaluation rubric.

**Independent Test**: Extract the exercise section from any chapter and verify it can stand alone as a lab assignment.

**Acceptance Scenarios**:

1. **Given** an instructor reviews the exercises section, **When** they read it, **Then** they find: prerequisites, step-by-step instructions, and expected terminal/visual output.
2. **Given** a student runs the code example in an exercise, **When** they follow the steps exactly, **Then** the output matches what the chapter describes.

---

### User Story 4 — Student uses appendices for environment setup (Priority: P4)

A student who is setting up their environment for the first time uses the appendices to install software, configure hardware, and set up cloud labs before starting Module 1.

**Why this priority**: Appendices are prerequisite references; without them students cannot run code examples.

**Independent Test**: Follow Appendix A2 (Software Installation) from scratch and verify all commands produce the described result.

**Acceptance Scenarios**:

1. **Given** a student with a fresh Ubuntu 22.04 install, **When** they follow Appendix A2, **Then** they can successfully run a ROS 2 talker/listener example.
2. **Given** a student with Jetson hardware, **When** they follow Appendix A4, **Then** they can deploy and run a sample Isaac application.

---

### Edge Cases

- What happens when a code example requires hardware not all students have? → Mark with `[Hardware Required]` callout; provide simulation fallback.
- How does content handle ROS 2 version differences (Humble vs Iron vs Jazzy)? → Default to ROS 2 Humble (LTS); note version-specific differences with callout boxes.
- What if a Mermaid diagram is too complex to render inline? → Break into sub-diagrams; use collapsible details blocks if needed.
- How are long code examples handled? → Use code blocks with filename headers; split into numbered steps for exercises.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each chapter MUST contain a "Learning Objectives" section listing 3–5 measurable outcomes.
- **FR-002**: Each chapter MUST contain at least one Mermaid diagram illustrating a key concept.
- **FR-003**: Each chapter MUST contain at least two annotated code examples (Python or C++ for ROS 2; Python for Isaac/ML chapters).
- **FR-004**: Each chapter MUST end with a "Hands-On Exercise" section with step-by-step tasks and expected outputs.
- **FR-005**: Each chapter MUST include a "Summary" section recapping key concepts.
- **FR-006**: All 13 main chapters MUST be written (ch01–ch13 + ch14 capstone).
- **FR-007**: All 4 appendices MUST be written (a1–a4) with complete installation/setup commands.
- **FR-008**: Content MUST use ROS 2 Humble as the default version; version differences noted with callout blocks.
- **FR-009**: Code examples MUST be tested for syntactic correctness and include expected output comments.
- **FR-010**: Each chapter MUST have cross-reference links to prerequisite and follow-up chapters.
- **FR-011**: Module chapters MUST maintain conceptual continuity — later chapters build on earlier ones. Chapters MUST follow tutorial-style "why before how" pedagogy throughout.
- **FR-012**: Each chapter MUST pass the content-reviewer subagent quality check before being marked complete.

### Key Entities

- **Chapter**: A Docusaurus `.md` file with frontmatter (sidebar_position, title, description), structured content sections, code blocks, Mermaid diagrams, and exercises.
- **Module**: A group of related chapters under a shared `_category_.json` folder (4 modules + intro + capstone + appendices).
- **Exercise**: A standalone lab task within a chapter with prerequisites, steps, and expected outputs.
- **Code Example**: An annotated, runnable snippet demonstrating a specific concept with inline comments.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 19 chapter files contain non-placeholder content (word count > 1,500 words per chapter).
- **SC-002**: Each of the 19 chapters has at least 1 Mermaid diagram and 2 code examples.
- **SC-003**: All 19 chapters pass the content-reviewer subagent quality check (no critical issues flagged).
- **SC-004**: A student can read ch01 through ch05 in sequence and follow all code examples without prerequisite gaps.
- **SC-005**: All appendix setup commands are syntactically valid bash/shell commands.
- **SC-006**: The Docusaurus site builds without errors after all chapters are written (`npm run build` exits 0).

## Clarifications

### Session 2026-03-08

- Q: What is the target writing style for chapters? → A: Tutorial-style, beginner-friendly — "why before how", heavy explanations, step-by-step, no assumed robotics knowledge.
- Q: What is the chapter generation strategy? → A: Module-parallel, sequential within each module. Modules 1–4 + Appendices run in parallel (Phase 1); ch14 Capstone written last after all modules complete (Phase 2).

## Assumptions

- ROS 2 Humble (LTS, Ubuntu 22.04) is the target environment for all ROS 2 code examples.
- Python is the primary language for ROS 2 examples; C++ examples included where industry-standard.
- NVIDIA Isaac Sim 4.x is the target for Isaac chapters.
- Readers have basic Python programming knowledge but no prior robotics experience.
- The `build-chapter` skill will be used to generate each chapter, coordinating chapter-writer, code-example-generator, and content-reviewer subagents.
- Chapters will be written sequentially within each module to maintain continuity; modules run in parallel across phases.
- Writing style is tutorial-focused: beginner-friendly, "why before how", no assumed robotics background.
- Chapter generation uses Phase 1 (modules + appendices in parallel) → Phase 2 (capstone last).
