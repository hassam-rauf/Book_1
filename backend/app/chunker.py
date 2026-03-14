"""
Markdown chunker for Physical AI textbook chapters.

Pipeline:
  1. Strip YAML frontmatter (--- blocks)
  2. Strip Mermaid diagram blocks
  3. Parse chapter_title from frontmatter title: field
  4. Derive module from first path segment
  5. Split on ## headings
  6. Sliding-window split for sections > 512 tokens (~2048 chars)
  7. Generate deterministic UUID v5 chunk IDs
  8. Skip chunks < 20 characters
"""

import re
import uuid
from pathlib import Path

# Stable namespace for this project — used to generate deterministic chunk IDs
_PROJECT_NAMESPACE = uuid.uuid5(
    uuid.NAMESPACE_URL,
    "https://github.com/hassam-rauf/Book_1"
)

# Approximate: 1 token ≈ 4 characters
_CHARS_PER_TOKEN = 4
_MAX_CHUNK_CHARS = 512 * _CHARS_PER_TOKEN   # 2048 chars
_OVERLAP_CHARS = 50 * _CHARS_PER_TOKEN      # 200 chars


def _make_chunk_id(source_path: str, chunk_index: int) -> int:
    """Deterministic int64 ID from file path + chunk index."""
    key = f"{source_path.lower().replace(chr(92), '/')}#{chunk_index}"
    return int(uuid.uuid5(_PROJECT_NAMESPACE, key).int % (2 ** 63))


def _strip_frontmatter(text: str) -> tuple[str, dict]:
    """Remove YAML frontmatter and return (cleaned_text, metadata_dict)."""
    meta: dict = {}
    if not text.startswith("---"):
        return text, meta

    end = text.find("\n---", 3)
    if end == -1:
        return text, meta

    frontmatter = text[3:end].strip()
    for line in frontmatter.splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip().strip('"').strip("'")

    return text[end + 4:].lstrip("\n"), meta


def _strip_mermaid(text: str) -> str:
    """Remove ```mermaid ... ``` blocks."""
    return re.sub(r"```mermaid.*?```", "", text, flags=re.DOTALL)


def _sliding_window(text: str, max_chars: int, overlap: int) -> list[str]:
    """Split a long text into overlapping windows."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + max_chars
        chunks.append(text[start:end].strip())
        if end >= len(text):
            break
        start = end - overlap
    return [c for c in chunks if c]


def chunk_markdown_file(file_path: str, docs_root: str = "") -> list[dict]:
    """
    Chunk a single markdown file into a list of chunk dicts.

    Returns list of dicts with keys:
        id, text, source_path, chapter_title, section_heading,
        chunk_index, module, word_count
    """
    path = Path(file_path)
    raw = path.read_text(encoding="utf-8")

    # --- 1. Strip frontmatter ---
    body, meta = _strip_frontmatter(raw)

    # --- 2. Strip Mermaid blocks ---
    body = _strip_mermaid(body)

    # --- 3. Extract metadata ---
    chapter_title = meta.get("title", path.stem.replace("-", " ").title())

    # Derive source_path relative to docs_root
    if docs_root:
        try:
            source_path = str(path.relative_to(docs_root))
        except ValueError:
            source_path = path.name
    else:
        source_path = path.name

    # Derive module from first directory segment
    parts = Path(source_path).parts
    module = parts[0] if len(parts) > 1 else "misc"

    # --- 4. Split on ## headings ---
    sections: list[tuple[str, str]] = []  # (heading, body)
    current_heading = ""
    current_body: list[str] = []

    for line in body.splitlines():
        if line.startswith("## "):
            if current_body:
                sections.append((current_heading, "\n".join(current_body).strip()))
            current_heading = line[3:].strip()
            current_body = []
        else:
            current_body.append(line)

    if current_body:
        sections.append((current_heading, "\n".join(current_body).strip()))

    # If no sections found, treat entire body as one section
    if not sections:
        sections = [("", body.strip())]

    # --- 5. Generate chunks ---
    chunks: list[dict] = []
    chunk_index = 0

    for heading, section_text in sections:
        if not section_text.strip():
            continue

        if len(section_text) <= _MAX_CHUNK_CHARS:
            # Section fits in one chunk
            windows = [section_text.strip()]
        else:
            # Sliding window for long sections
            windows = _sliding_window(section_text, _MAX_CHUNK_CHARS, _OVERLAP_CHARS)

        for window in windows:
            if len(window) < 20:
                continue  # Skip degenerate chunks

            chunks.append({
                "id": _make_chunk_id(source_path, chunk_index),
                "text": window,
                "source_path": source_path,
                "chapter_title": chapter_title,
                "section_heading": heading,
                "chunk_index": chunk_index,
                "module": module,
                "word_count": len(window.split()),
            })
            chunk_index += 1

    return chunks
