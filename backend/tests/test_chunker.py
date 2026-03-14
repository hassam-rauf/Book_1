"""
Unit tests for app/chunker.py.
No external services required — pure logic tests.
"""

import tempfile
from pathlib import Path

import pytest

from app.chunker import chunk_markdown_file, _make_chunk_id


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _write_tmp(content: str) -> str:
    """Write content to a temp .md file and return the path."""
    f = tempfile.NamedTemporaryFile(suffix=".md", mode="w", delete=False, encoding="utf-8")
    f.write(content)
    f.close()
    return f.name


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestFrontmatterStripping:
    def test_frontmatter_is_not_in_chunk_text(self):
        path = _write_tmp(
            "---\ntitle: My Chapter\nsidebar_position: 1\n---\n\n## Intro\n\nSome content here."
        )
        chunks = chunk_markdown_file(path)
        for c in chunks:
            assert "sidebar_position" not in c["text"]
            assert "---" not in c["text"]

    def test_chapter_title_parsed_from_frontmatter(self):
        path = _write_tmp('---\ntitle: "Chapter 99: Test"\n---\n\n## Intro\n\nThis is enough content to pass the filter.')
        chunks = chunk_markdown_file(path)
        assert chunks[0]["chapter_title"] == "Chapter 99: Test"

    def test_file_without_frontmatter_uses_stem_as_title(self):
        path = _write_tmp("## Intro\n\nThis is enough content to pass the twenty character minimum filter.")
        chunks = chunk_markdown_file(path)
        # Title derived from filename stem — just verify it's non-empty
        assert chunks[0]["chapter_title"]


class TestMermaidStripping:
    def test_mermaid_blocks_removed(self):
        md = "---\ntitle: Test\n---\n\n## Section\n\n```mermaid\ngraph LR\n  A --> B\n```\n\nReal content here."
        path = _write_tmp(md)
        chunks = chunk_markdown_file(path)
        for c in chunks:
            assert "graph LR" not in c["text"]
            assert "mermaid" not in c["text"].lower()

    def test_content_after_mermaid_preserved(self):
        md = "---\ntitle: T\n---\n\n## Section\n\n```mermaid\nflowchart TD\nA-->B\n```\n\nThis text must survive."
        path = _write_tmp(md)
        chunks = chunk_markdown_file(path)
        combined = " ".join(c["text"] for c in chunks)
        assert "This text must survive" in combined


class TestHeadingSplitting:
    def test_section_heading_is_captured(self):
        path = _write_tmp(
            "---\ntitle: T\n---\n\n## Alpha\n\nThis is the alpha section content.\n\n## Beta\n\nThis is the beta section content."
        )
        chunks = chunk_markdown_file(path)
        headings = {c["section_heading"] for c in chunks}
        assert "Alpha" in headings
        assert "Beta" in headings

    def test_multiple_sections_produce_multiple_chunks(self):
        path = _write_tmp(
            "---\ntitle: T\n---\n\n## Sec1\n\nBody one has enough text.\n\n## Sec2\n\nBody two has enough text too."
        )
        chunks = chunk_markdown_file(path)
        assert len(chunks) >= 2


class TestSlidingWindow:
    def test_long_section_produces_multiple_chunks(self):
        # 3000 chars >> 2048 char max → should split into 2+ chunks
        long_body = "word " * 600  # 3000 chars
        path = _write_tmp(f"---\ntitle: T\n---\n\n## Long\n\n{long_body}")
        chunks = chunk_markdown_file(path)
        long_chunks = [c for c in chunks if c["section_heading"] == "Long"]
        assert len(long_chunks) >= 2

    def test_short_section_is_single_chunk(self):
        path = _write_tmp("---\ntitle: T\n---\n\n## Short\n\nThis section is short but above the minimum length threshold.")
        chunks = chunk_markdown_file(path)
        short = [c for c in chunks if c["section_heading"] == "Short"]
        assert len(short) == 1


class TestDeterministicIds:
    def test_same_input_same_id(self):
        id1 = _make_chunk_id("module-1/ch01.md", 0)
        id2 = _make_chunk_id("module-1/ch01.md", 0)
        assert id1 == id2

    def test_different_index_different_id(self):
        id1 = _make_chunk_id("module-1/ch01.md", 0)
        id2 = _make_chunk_id("module-1/ch01.md", 1)
        assert id1 != id2

    def test_different_path_different_id(self):
        id1 = _make_chunk_id("module-1/ch01.md", 0)
        id2 = _make_chunk_id("module-1/ch02.md", 0)
        assert id1 != id2

    def test_chunk_index_in_output(self):
        path = _write_tmp("---\ntitle: T\n---\n\n## A\n\nFirst.\n\n## B\n\nSecond.")
        chunks = chunk_markdown_file(path)
        indices = [c["chunk_index"] for c in chunks]
        # Indices should be sequential starting at 0
        assert indices == list(range(len(chunks)))


class TestMinLengthFilter:
    def test_very_short_chunks_skipped(self):
        # Section with only a few chars should be filtered
        path = _write_tmp("---\ntitle: T\n---\n\n## Tiny\n\nOK\n\n## Normal\n\n" + "x " * 50)
        chunks = chunk_markdown_file(path)
        for c in chunks:
            assert len(c["text"]) >= 20
