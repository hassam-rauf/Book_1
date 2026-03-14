# Data Model: Book Content — Write 19 Chapters

**Date**: 2026-03-08 | **Feature**: 002-write-chapters

## Entity: Chapter

A single Docusaurus `.md` file representing one book chapter.

### Fields

| Field | Type | Constraint |
|-------|------|------------|
| `sidebar_position` | integer | Unique within module; determines sidebar order |
| `title` | string | ≤ 60 chars; title-case; descriptive |
| `description` | string | ≤ 160 chars; one sentence summary for SEO |
| `word_count` | integer | ≥ 1,500 words (validated by content-reviewer) |
| `diagram_count` | integer | ≥ 1 Mermaid diagram per chapter |
| `code_example_count` | integer | ≥ 2 annotated code blocks per chapter |
| `has_exercise` | boolean | MUST be true for all main chapters |
| `has_summary` | boolean | MUST be true for all chapters |
| `has_objectives` | boolean | MUST be true; 3–5 bullet outcomes |
| `ros2_version` | string | `humble` (default); noted if version-specific |

### Required Sections (main chapters)

```
frontmatter → objectives → introduction → concept_1 → concept_2 →
concept_3 → summary → exercise → further_reading
```

### Required Sections (appendices)

```
frontmatter → overview → prerequisites → setup_sections[] →
verification → troubleshooting
```

### State Transitions

```
placeholder → in_progress → review → complete
```

- `placeholder`: F1 scaffold file (frontmatter only, no real content)
- `in_progress`: chapter-writer subagent is generating
- `review`: code-example-generator + content-reviewer running
- `complete`: content-reviewer passed, no critical issues

---

## Entity: Module

A logical grouping of chapters under a shared directory with `_category_.json`.

### Fields

| Field | Type | Value |
|-------|------|-------|
| `name` | string | e.g., "Module 1: The Robotic Nervous System" |
| `position` | integer | 1–7 (sidebar order) |
| `chapter_count` | integer | varies (2–5 chapters) |
| `directory` | string | e.g., `book-site/docs/module-1/` |

### Module Inventory

| Module | Directory | Chapters | Phase |
|--------|-----------|----------|-------|
| Introduction | `intro/` | index.md (seeded) | Done |
| Module 1: ROS 2 | `module-1/` | ch01–ch05 | Phase 1 Track A |
| Module 2: Gazebo | `module-2/` | ch06–ch07 | Phase 1 Track B |
| Module 3: Isaac | `module-3/` | ch08–ch10 | Phase 1 Track C |
| Module 4: Humanoid | `module-4/` | ch11–ch13 | Phase 1 Track D |
| Capstone | `capstone/` | ch14 | Phase 2 |
| Appendices | `appendices/` | a1–a4 | Phase 1 Track E |

---

## Entity: Exercise

A hands-on lab task embedded at the end of each main chapter.

### Fields

| Field | Type | Constraint |
|-------|------|------------|
| `title` | string | Action-oriented: "Build a...", "Configure a..." |
| `prerequisites` | list[string] | Software/hardware needed before starting |
| `steps` | list[Step] | Ordered; each step has command + expected output |
| `time_estimate` | string | e.g., "15–30 minutes" |
| `hardware_required` | boolean | If true, simulation alternative MUST be provided |

---

## Entity: Code Example

An annotated code block within a chapter.

### Fields

| Field | Type | Constraint |
|-------|------|------------|
| `language` | enum | `python`, `cpp`, `bash`, `yaml`, `xml` |
| `filename` | string | Shown in title comment at top of block |
| `purpose` | string | Brief description of what the example demonstrates |
| `has_expected_output` | boolean | MUST be true for runnable examples |
| `syntax_verified` | boolean | MUST be true before chapter marked complete |

### Language Distribution

| Chapter Group | Primary Language | Secondary |
|---------------|-----------------|-----------|
| Module 1 (ROS 2) | Python (rclpy) | Bash (CLI), YAML (config) |
| Module 2 (Gazebo) | Python (launch files) | XML/SDF (models) |
| Module 3 (Isaac) | Python (Isaac API) | Bash |
| Module 4 (Humanoid) | Python | C++ (kinematics where needed) |
| Capstone | Python | Bash |
| Appendices | Bash | YAML |
