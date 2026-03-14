# Appendix Content Template

**Date**: 2026-03-08 | **Feature**: 002-write-chapters

This template defines the required section structure for every appendix (a1–a4).

---

## Frontmatter (required)

```markdown
---
sidebar_position: <N>
title: "Appendix <Letter>: <Title>"
description: "<One sentence summary, ≤160 chars>"
---
```

## Section Order (required, in this order)

### 1. Overview

```markdown
## Overview

<What does this appendix help the student set up or understand?>
<Who should read this appendix — which chapters require this setup?>
<Estimated time to complete: X–Y minutes>
```

### 2. Prerequisites

```markdown
## Prerequisites

Before starting, ensure you have:

- <OS requirement, e.g., Ubuntu 22.04 LTS>
- <Hardware requirement if any>
- <Account requirement, e.g., NVIDIA Developer account>
- <Internet connection requirement>
```

### 3. Setup Sections (2–4 sections)

```markdown
## <Setup Section Title>

<Brief explanation of what this step accomplishes.>

```bash
# <Comment explaining what this command does>
<command 1>
<command 2>
```

Expected output:
```
<what the terminal should show after running>
```

<Additional explanation if needed.>
```

### 4. Verification

```markdown
## Verification

Run the following commands to confirm your setup is complete:

```bash
<verification command 1>
```
Expected: `<output>`

```bash
<verification command 2>
```
Expected: `<output>`

✅ If you see the expected output, your setup is complete. Proceed to [Chapter 01](../module-1/ch01-intro-physical-ai.md).
```

### 5. Troubleshooting

```markdown
## Troubleshooting

### Error: `<common error message>`

**Cause**: <Why this happens>
**Fix**:
```bash
<fix command>
```

### Error: `<another common error>`

**Cause**: <Why this happens>
**Fix**: <Steps to resolve>

If you encounter an unlisted error, check the [official documentation](<link>).
```

---

## Quality Checklist (per appendix)

Before marking an appendix ✅ complete:

- [ ] Frontmatter has sidebar_position, title, description
- [ ] Overview states who needs this appendix and estimated time
- [ ] All bash commands are syntactically correct
- [ ] Every command block has expected output shown
- [ ] Verification section confirms successful setup
- [ ] Troubleshooting covers ≥ 2 common errors
- [ ] Cross-reference link to first chapter that requires this setup
