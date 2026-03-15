# Data Model: Urdu Translation (F8)

## Entities

### 1. Urdu Translation File

A pre-generated markdown file containing the Urdu translation of one English chapter.

| Field | Type | Description |
|-------|------|-------------|
| `chapter_slug` | `string` | Path-based identifier matching the English original (e.g., `module-1/ch01-intro-physical-ai`) |
| `content_md` | `string` | Full Urdu markdown content with RTL wrappers; code blocks in English |
| `file_path` | `string` | Absolute path on disk: `book-site/static/translations/ur/{chapter_slug}.md` |
| `public_url` | `string` | URL served to browser: `/Book_1/translations/ur/{chapter_slug}.md` |

**Relationships**:
- One English chapter file → zero or one Urdu translation file (1:0..1)
- `chapter_slug` matches the path used by `window.location.pathname` after stripping `/Book_1/docs/`

**Validation rules**:
- `chapter_slug` MUST NOT contain `..` (path traversal protection)
- Urdu file MUST pass quality checks: code blocks intact, RTL wrappers present, no empty content

---

### 2. Language Preference

The user's language selection, persisted client-side.

| Field | Type | Values | Description |
|-------|------|--------|-------------|
| `preferred-lang` | `string` | `"en"` \| `"ur"` | Stored in `localStorage` under key `preferred-lang`; default `"en"` |

**Lifecycle**:
- Set when user clicks the language toggle
- Read on every chapter page load by `LanguageWrapper`
- Cleared if localStorage is cleared by the user/browser

---

### 3. Translation Job Run (operator-facing, no persistence)

Transient state tracked during the translation pipeline script execution.

| Field | Type | Description |
|-------|------|-------------|
| `chapter_slug` | `string` | Chapter being translated |
| `status` | `enum` | `skipped` (file exists, no --force) \| `translated` (new file written) \| `failed` (Gemini error) |
| `words_original` | `int` | Word count of English source |
| `code_blocks_preserved` | `int` | Number of code blocks found and left unchanged |

**No database persistence** — script outputs a summary report to stdout only.

---

## File Structure

```text
book-site/
├── static/
│   └── translations/
│       └── ur/
│           ├── intro.md                              # Preface
│           ├── module-1/
│           │   ├── ch01-intro-physical-ai.md
│           │   ├── ch02-ros2-fundamentals.md
│           │   ├── ch03-ros2-navigation.md
│           │   ├── ch04-ros2-manipulation.md
│           │   └── ch05-ros2-perception.md
│           ├── module-2/
│           │   ├── ch06-gazebo-simulation.md
│           │   └── ch07-gazebo-advanced.md
│           ├── module-3/
│           │   ├── ch08-nvidia-isaac.md
│           │   ├── ch09-isaac-sim.md
│           │   └── ch10-isaac-ros.md
│           ├── module-4/
│           │   ├── ch11-humanoid-kinematics.md
│           │   ├── ch12-vla-models.md
│           │   └── ch13-embodied-ai.md
│           ├── capstone/
│           │   └── ch14-autonomous-humanoid.md
│           └── appendices/
│               ├── a1-hardware-setup.md
│               ├── a2-ros2-cheatsheet.md
│               ├── a3-python-robotics.md
│               ├── a4-simulation-tools.md
│               └── a5-further-reading.md

backend/
└── scripts/
    └── translate_chapters.py    # Translation pipeline CLI
```

---

## Urdu Markdown Format

Each translated file follows this structure (from translator subagent spec):

```markdown
---
sidebar_position: N
title: "باب N: [Urdu Title] (English Title)"
description: "[Urdu description]"
---

<div dir="rtl">

# باب N: [Urdu Title] (English Title)

## سیکھنے کے مقاصد
- [Urdu objective 1]
- [Urdu objective 2]

## N.1 [Urdu Section Heading] (English Heading)

[Urdu prose with technical terms: ROS 2 (آر او ایس ٹو) on first use]

</div>

```python
# Code block stays in English — outside RTL div
def example():
    pass
```

<div dir="rtl">

[Continue Urdu prose after code block]

</div>
```

**Rules enforced by translation prompt**:
- Prose sections wrapped in `<div dir="rtl">...</div>`
- Code blocks outside RTL divs
- Technical terms: English + Urdu transliteration in parentheses on first mention
- Headings: Urdu + English in parentheses
- Frontmatter keys in English; `title` and `description` values in Urdu
