# Chapter Content Template

**Date**: 2026-03-08 | **Feature**: 002-write-chapters

This template defines the required section structure for every main chapter (ch01–ch14).

---

## Frontmatter (required)

```markdown
---
sidebar_position: <N>
title: "Chapter <N>: <Title>"
description: "<One sentence summary, ≤160 chars>"
---
```

## Section Order (required, in this order)

### 1. Learning Objectives

```markdown
## Learning Objectives

By the end of this chapter, you will be able to:

- <Measurable outcome 1 — use action verbs: explain, build, configure, implement>
- <Measurable outcome 2>
- <Measurable outcome 3>
- (3–5 objectives total)
```

### 2. Introduction ("Why Before How")

```markdown
## Introduction

<Open with a real-world scenario or problem that motivates this chapter.>
<Explain WHY this technology/concept exists — what problem does it solve?>
<Connect to the previous chapter (if applicable) with a cross-reference link.>
<1–3 paragraphs, accessible to beginners with no robotics background.>
```

### 3. Core Concept Sections (2–3 sections)

```markdown
## <Concept Name>

<Explain what it is in plain language.>
<Then explain how it works.>

```mermaid
<diagram type: flowchart LR, sequenceDiagram, graph TD, etc.>
<At least 1 Mermaid diagram per chapter>
```

### Code Example

```python
# File: ~/ros2_ws/src/<package>/<module>.py
# <Brief description of what this code does>

<annotated code — every non-obvious line has an inline comment>

# Expected output:
# <what the student should see in their terminal>
```

<Explain the code example line by line for beginners.>
```

### 4. Summary

```markdown
## Summary

In this chapter, you learned:

- <Key takeaway 1>
- <Key takeaway 2>
- <Key takeaway 3>
(Mirror the learning objectives — confirm each was covered)
```

### 5. Hands-On Exercise

```markdown
## Hands-On Exercise: <Action-Oriented Title>

**Time estimate**: X–Y minutes

**Prerequisites**:
- <Software/hardware needed>
- <Previous chapter completion if required>

:::caution Hardware Required
(Include ONLY if physical hardware needed)
**Simulation alternative**: See [Gazebo Simulation](../module-2/ch06-gazebo-simulation.md)
:::

### Steps

1. **<Step title>**
   ```bash
   <command>
   ```
   Expected output: `<what to see>`

2. **<Step title>**
   ```python
   <code>
   ```

3. ...

### Verification

Run the following to confirm success:
```bash
<verification command>
```
You should see: `<expected output>`
```

### 6. Further Reading

```markdown
## Further Reading

- **Previous**: [<Chapter Title>](<relative-link>) — <one-line description>
- **Next**: [<Chapter Title>](<relative-link>) — <one-line description>
- **Related**: [<Chapter Title>](<relative-link>) — <one-line description>

**Official docs**:
- [ROS 2 Humble Documentation](https://docs.ros.org/en/humble/)
- (add relevant official links)
```

---

## Quality Checklist (per chapter)

Before marking a chapter ✅ complete:

- [ ] Frontmatter has sidebar_position, title, description
- [ ] 3–5 learning objectives (action verbs)
- [ ] Introduction opens with "why" before "how"
- [ ] At least 1 Mermaid diagram
- [ ] At least 2 annotated code examples with expected output
- [ ] Summary mirrors learning objectives
- [ ] Exercise has prerequisites, numbered steps, verification
- [ ] Cross-reference links (previous + next chapter)
- [ ] Word count ≥ 1,500 words
- [ ] Passes content-reviewer subagent check
