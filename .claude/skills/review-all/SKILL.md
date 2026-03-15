---
name: review-all
description: |
  Runs the content-reviewer subagent across all book chapters and produces a consolidated quality report.
  This skill should be used when users want a full quality audit of the textbook before submission or deployment.
---

# Review All

Run quality review across all book chapters and produce a consolidated report.

## How This Skill Works

```
User: "/review-all [--chapter N] [--fix]"
       ↓
1. Discover all chapters in book-site/docs/
       ↓
2. Run content-reviewer agent on each chapter
       ↓
3. Aggregate results into consolidated report
       ↓
4. Optionally auto-fix Critical issues
       ↓
Output: Quality report with per-chapter scores
```

## What This Skill Does

- Reviews all chapters for technical accuracy, completeness, readability
- Produces per-chapter scores and a book-wide quality summary
- Cross-references syllabus coverage from `requirement.md`
- Identifies gaps in content coverage

## What This Skill Does NOT Do

- Write or rewrite chapter content
- Fix style/formatting issues automatically (except with --fix flag)
- Review non-chapter files (backend code, configs)

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | All chapters in `book-site/docs/`, `requirement.md` for syllabus |
| **Conversation** | Scope (all or specific chapter), whether to auto-fix |
| **Skill References** | content-reviewer agent review checklist |
| **User Guidelines** | Constitution quality principles |

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| --chapter N | No | Review only chapter N (default: all) |
| --fix | No | Auto-fix Critical issues where possible |
| --min-score N | No | Flag chapters scoring below N/10 (default: 7) |

## Execution Steps

### Step 1: Discover Chapters

```
Glob: book-site/docs/**/*.md
```

Sort by chapter order (sidebar_position from frontmatter).

### Step 2: Run Reviews

For each chapter, invoke content-reviewer agent.
Collect per-chapter:
- Score (X/10)
- Critical issues count
- Warning count
- Suggestion count
- Completeness checklist results

### Step 3: Syllabus Coverage Check

Cross-reference all chapters against `requirement.md`:
- Map each syllabus topic to chapter coverage
- Identify any uncovered topics
- Flag missing learning objectives

### Step 4: Auto-Fix (if --fix)

For Critical issues with clear fixes:
- Missing frontmatter → add from template
- Missing learning objectives → extract from syllabus
- Broken internal links → fix paths

Do NOT auto-fix:
- Technical accuracy issues (need human review)
- Content gaps (need chapter-writer)
- Code errors (need code-example-generator)

### Step 5: Generate Report

```markdown
# Book Quality Report

Generated: [date]
Chapters reviewed: N

## Summary
| Chapter | Score | Critical | Warnings | Status |
|---------|-------|----------|----------|--------|
| Ch 1    | 8/10  | 0        | 2        | Pass   |
| Ch 2    | 6/10  | 1        | 3        | Fail   |
| ...     | ...   | ...      | ...      | ...    |

**Book Average: X.X/10**

## Syllabus Coverage
- Covered: N/M topics (X%)
- Gaps: [list uncovered topics]

## Critical Issues (must fix before submission)
1. [Chapter N] [Issue description]

## Top Recommendations
1. [Most impactful improvement]
2. [Second most impactful]
3. [Third most impactful]
```

Save report to `book-site/review-report.md`.

## Error Handling

| Error | Action |
|-------|--------|
| No chapters found | Warn user, suggest running build-chapter first |
| Chapter has no frontmatter | Flag as Critical, skip review |
| All chapters below min-score | Generate report but warn about quality |
