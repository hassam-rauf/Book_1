#!/usr/bin/env python3
"""
Translation pipeline for Physical AI textbook chapters.

Reads English chapter markdown files, calls Gemini 2.0 Flash to translate
prose to Urdu (keeping code blocks, technical terms, and formatting intact),
and writes the result to book-site/static/translations/ur/.

Usage:
    python translate_chapters.py --slug module-1/ch01-intro-physical-ai
    python translate_chapters.py --all
    python translate_chapters.py --all --force

Requirements:
    GEMINI_API_KEY environment variable (or backend/.env)
"""

import argparse
import glob
import os
import sys

# Load .env from backend/ if running from repo root or backend/scripts/
_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND = os.path.dirname(_HERE)
_ENV_PATH = os.path.join(_BACKEND, ".env")
if os.path.isfile(_ENV_PATH):
    from dotenv import load_dotenv
    load_dotenv(_ENV_PATH)

from google import genai
from google.genai import types as genai_types


# ─── Defaults ─────────────────────────────────────────────────────────────────

_DEFAULT_DOCS_DIR = os.path.join(_BACKEND, "..", "book-site", "docs")
_DEFAULT_OUT_DIR = os.path.join(_BACKEND, "..", "book-site", "static", "translations", "ur")


# ─── Translation prompt ───────────────────────────────────────────────────────

def _build_translation_prompt(chapter_md: str) -> str:
    """Build the Gemini prompt for English→Urdu chapter translation.

    Rules mirror the translator subagent (.claude/agents/translator.md):
    - Translate all prose to Urdu
    - Keep all code blocks exactly unchanged (no Urdu in code)
    - Technical terms: English + Urdu transliteration in parentheses on first use
      e.g. ROS 2 (آر او ایس ٹو), then just ROS 2 thereafter
    - Headings: Urdu heading + English in parentheses
    - Wrap each prose section in <div dir="rtl">...</div>; code blocks outside divs
    - Frontmatter: keep keys in English, translate title/description values to Urdu
    - Return ONLY the translated markdown, no commentary or preamble
    """
    return f"""You are an expert English-to-Urdu technical translator for a Physical AI and Robotics textbook.

## Translation Rules

### What to translate
- All prose and explanatory text → Urdu
- Section headings → Urdu (keep English in parentheses): e.g. `## این آر او ایس (ROS 2 Architecture)`
- List items that are plain text → Urdu
- Image alt text → Urdu
- Frontmatter `title` and `description` values → Urdu (keep frontmatter KEYS in English)

### What NOT to translate (keep exactly as-is)
- All code blocks (Python, C++, bash, YAML, etc.) — preserve character-for-character
- Variable names, function names, class names appearing inline
- File paths and URLs
- Frontmatter keys (sidebar_position, title key itself, etc.)

### Technical term handling
- On FIRST occurrence: keep English term + add Urdu transliteration in parentheses
  Examples: `ROS 2 (آر او ایس ٹو)`, `Robot (روبوٹ)`, `Sensor (سینسر)`,
  `Algorithm (الگورتھم)`, `Node (نوڈ)`, `Topic (ٹاپک)`, `Simulation (سمیولیشن)`,
  `SLAM (سلام)`, `NVIDIA (این ویڈیا)`, `Isaac (آئزک)`, `PyTorch (پائی ٹارچ)`
- On SUBSEQUENT occurrences: just the English term (no parenthetical)

### RTL formatting
- Wrap EACH prose paragraph/section in `<div dir="rtl">` ... `</div>`
- Place code blocks OUTSIDE these divs (code is LTR)
- Mermaid diagrams stay in English unchanged
- Pattern:
  ```
  <div dir="rtl">

  [Urdu prose here]

  </div>

  ```python
  # code stays here, outside the div
  ```

  <div dir="rtl">

  [More Urdu prose]

  </div>
  ```

### Output format
- Preserve all markdown structure: heading hierarchy, lists, bold, italic, links
- Maintain code fence languages (```python, ```bash, etc.)
- Keep frontmatter block (--- ... ---) at the top
- Return ONLY the translated markdown — no commentary, no "Here is the translation:" preamble

## ORIGINAL CHAPTER (English)
---
{chapter_md}
---

## TRANSLATED CHAPTER (Urdu):"""


# ─── Core translation logic ───────────────────────────────────────────────────

def translate_single(
    slug: str,
    docs_dir: str,
    out_dir: str,
    force: bool,
    model,
) -> str:
    """Translate one chapter. Returns 'translated', 'skipped', or 'failed'."""
    # Sanitize slug (prevent path traversal)
    safe_slug = slug.lstrip("/").replace("..", "")

    src_path = os.path.join(docs_dir, f"{safe_slug}.md")
    out_path = os.path.join(out_dir, f"{safe_slug}.md")

    if not os.path.isfile(src_path):
        print(f"[FAIL] Source not found: {src_path}")
        return "failed"

    if os.path.isfile(out_path) and not force:
        print(f"[SKIP] SKIPPED: {slug} (file exists, use --force to overwrite)")
        return "skipped"

    # Read source
    with open(src_path, encoding="utf-8") as f:
        chapter_md = f.read()

    prompt = _build_translation_prompt(chapter_md)
    print(f"[INFO] Translating {slug}…")

    try:
        response = model.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        translated_md = response.text
    except Exception as exc:
        print(f"[FAIL] FAILED: {slug} (Gemini error: {exc})")
        return "failed"

    # Count code blocks preserved (rough check)
    src_code_blocks = chapter_md.count("```")
    out_code_blocks = translated_md.count("```")
    blocks_preserved = min(src_code_blocks, out_code_blocks) // 2

    # Write output
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, encoding="utf-8", newline="\n", mode="w") as f:
        f.write(translated_md)

    words = len(chapter_md.split())
    print(f"[OK]   TRANSLATED: {slug} ({blocks_preserved} code blocks preserved, ~{words} words)")
    return "translated"


def find_all_chapters(docs_dir: str) -> list[str]:
    """Return all chapter slugs (relative paths without .md) under docs_dir."""
    pattern = os.path.join(docs_dir, "**", "*.md")
    paths = glob.glob(pattern, recursive=True)
    slugs = []
    for p in sorted(paths):
        rel = os.path.relpath(p, docs_dir)
        slug = rel.replace("\\", "/").removesuffix(".md")
        # Skip _category_ files and hidden files
        if not os.path.basename(slug).startswith("_") and not os.path.basename(slug).startswith("."):
            slugs.append(slug)
    return slugs


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Translate Physical AI textbook chapters from English to Urdu"
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--slug", help="Translate a single chapter by slug (e.g. module-1/ch01-intro-physical-ai)")
    group.add_argument("--all", action="store_true", help="Translate all chapters found in --docs-dir")
    parser.add_argument("--force", action="store_true", help="Overwrite existing Urdu files")
    parser.add_argument("--docs-dir", default=_DEFAULT_DOCS_DIR, help="Path to English docs directory")
    parser.add_argument("--out-dir", default=_DEFAULT_OUT_DIR, help="Output directory for Urdu files")
    args = parser.parse_args()

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("[ERROR] GEMINI_API_KEY environment variable is not set.", file=sys.stderr)
        return 2

    model = genai.Client(api_key=api_key)

    docs_dir = os.path.abspath(args.docs_dir)
    out_dir = os.path.abspath(args.out_dir)

    if not os.path.isdir(docs_dir):
        print(f"[ERROR] docs-dir not found: {docs_dir}", file=sys.stderr)
        return 2

    if args.slug:
        slugs = [args.slug]
    else:
        slugs = find_all_chapters(docs_dir)
        print(f"[INFO] Found {len(slugs)} chapters in {docs_dir}")

    translated = skipped = failed = 0
    for slug in slugs:
        result = translate_single(slug, docs_dir, out_dir, args.force, model)
        if result == "translated":
            translated += 1
        elif result == "skipped":
            skipped += 1
        else:
            failed += 1

    print(f"\n---\nSummary: {translated} translated, {skipped} skipped, {failed} failed")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
