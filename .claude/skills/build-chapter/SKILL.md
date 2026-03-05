---
name: build-chapter
description: |
  Orchestrates end-to-end chapter creation by coordinating chapter-writer, code-example-generator, and content-reviewer subagents.
  This skill should be used when users want to create a new textbook chapter or rewrite an existing one with full quality assurance.
---

# Build Chapter

Orchestrate complete chapter creation: write, generate code examples, review.

## How This Skill Works

```
User: "/build-chapter <chapter-number> [topic]"
       ↓
1. chapter-writer agent → drafts full chapter markdown
       ↓
2. code-example-generator agent → generates/validates code snippets
       ↓
3. content-reviewer agent → reviews for accuracy and completeness
       ↓
4. Fix any Critical/Warning issues found in review
       ↓
Output: Production-ready chapter in book-site/docs/
```

## What This Skill Does

- Coordinates 3 subagents in sequence for chapter production
- Ensures chapters match the syllabus from `requirement.md`
- Validates code examples are syntactically correct
- Produces a review report with quality score

## What This Skill Does NOT Do

- Deploy the book site
- Ingest chapters into the RAG pipeline
- Translate or personalize content (use translator/personalizer agents directly)

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing chapters in `book-site/docs/` for consistency |
| **Conversation** | Chapter number, topic, any special requirements |
| **Skill References** | Chapter structure from chapter-writer agent |
| **User Guidelines** | Constitution principles, AGENT.md feature specs |

Ensure all required context is gathered before implementing.
Only ask user for THEIR specific requirements (domain expertise is in this skill).

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| Chapter number | Yes | 1-15, or "preface", "capstone", "A1"-"A4" |
| Topic override | No | Override default topic from syllabus |
| Complexity | No | beginner / intermediate / advanced (default: intermediate) |

## Execution Steps

### Step 1: Resolve Chapter Metadata

Read `requirement.md` to determine:
- Chapter title from syllabus
- Module it belongs to (1-4)
- Week number
- Learning objectives
- Key topics to cover

### Step 2: Check Existing Content

```
Glob: book-site/docs/chapter-{N}*.md
```

If chapter exists, confirm with user before overwriting.

### Step 3: Invoke chapter-writer Agent

Provide the agent with:
- Chapter number and title
- Syllabus topics for that week
- Learning objectives
- Target complexity level
- Existing chapters for style consistency

Output: `book-site/docs/chapter-{N}-{slug}.md`

### Step 4: Invoke code-example-generator Agent

For each code block placeholder or topic requiring examples:
- Specify framework (ROS 2 / Gazebo / Isaac / Python)
- Specify language (Python primary, C++ secondary)
- Match complexity to chapter level

Integrate generated examples into the chapter file.

### Step 5: Invoke content-reviewer Agent

Run review against the completed chapter.

If score < 7/10 or Critical issues exist:
1. List issues to user
2. Apply fixes for Critical issues automatically
3. Re-run review to confirm resolution

### Step 6: Final Validation

- [ ] Frontmatter present (sidebar_position, title, description)
- [ ] All learning objectives addressed
- [ ] Code blocks have language tags
- [ ] No TODO placeholders remaining
- [ ] Markdown renders correctly

## Output

Report to user:
- Chapter file path
- Word count
- Code examples count
- Review score (X/10)
- Any remaining warnings

## Error Handling

| Error | Action |
|-------|--------|
| Chapter number out of range | List valid chapters, ask user to pick |
| Existing chapter conflict | Ask user: overwrite / merge / skip |
| Review score < 5/10 | Flag as needs-rewrite, ask user before proceeding |
| Code example generation fails | Include TODO placeholder, warn user |
