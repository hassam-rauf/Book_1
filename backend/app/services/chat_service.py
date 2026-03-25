"""
Chat service — builds grounding prompts and streams ChatChunk responses.
Uses GeminiService for all LLM calls (Constitution Principle IV).
"""

import json
import re
from typing import Generator

from app.models import ChatChunk, CitationItem, ContextPassage
from app.services.gemini_service import GeminiService

_SYSTEM_PROMPT_EN = """\
You are a helpful tutor for the "Physical AI & Humanoid Robotics" textbook.
Answer the student's question using ONLY the provided context passages.
If the context does not contain enough information, say so — do not invent facts.
After your answer, output exactly "---CITATIONS---" on its own line, then list
each citation you used as: [$INDEX] $chapter_title — $section_heading
Only list citations you actually referenced in your answer.\
"""

_SYSTEM_PROMPT_UR = """\
آپ "Physical AI & Humanoid Robotics" نصابی کتاب کے ایک مددگار ٹیوٹر ہیں۔
صرف فراہم کردہ سیاق و سباق کے اقتباسات کا استعمال کرتے ہوئے طالب علم کے سوال کا جواب اردو میں دیں۔
اگر سیاق و سباق میں کافی معلومات نہ ہوں تو یہ بتائیں — حقائق خود نہ بنائیں۔
اپنے جواب کے بعد، ایک الگ لائن پر بالکل "---CITATIONS---" لکھیں، پھر آپ نے جن حوالوں کا استعمال کیا انہیں اس طرح درج کریں:
[$INDEX] $chapter_title — $section_heading
صرف وہی حوالے درج کریں جو آپ نے اپنے جواب میں استعمال کیے ہوں۔\
"""


class GeminiChatService:
    def __init__(self, gemini: GeminiService) -> None:
        self._gemini = gemini

    def stream_answer(
        self, query: str, passages: list[ContextPassage], language: str = "en"
    ) -> Generator[str, None, None]:
        """
        Yields SSE-formatted `data: <json>\\n\\n` strings.
        Event types: token | citations | error | done
        """
        prompt = self._build_prompt(query, passages, language)

        answer_buffer = ""
        in_citations = False

        try:
            for token in self._gemini.stream_generate(prompt):
                if "---CITATIONS---" in token:
                    # Split on the marker — text before is answer, after is citations header
                    parts = token.split("---CITATIONS---", 1)
                    if parts[0]:
                        answer_buffer += parts[0]
                        yield _sse(ChatChunk(type="token", text=parts[0]))
                    in_citations = True
                    answer_buffer += "---CITATIONS---"
                    if len(parts) > 1:
                        answer_buffer += parts[1]
                elif in_citations:
                    answer_buffer += token
                else:
                    answer_buffer += token
                    yield _sse(ChatChunk(type="token", text=token))

        except Exception as exc:
            yield _sse(ChatChunk(type="error", detail=str(exc)))
            return

        # Parse citations from buffered text
        citations = self._parse_citations(answer_buffer, passages)
        if citations:
            yield _sse(ChatChunk(type="citations", citations=citations))

        yield _sse(ChatChunk(type="done"))

    def _build_prompt(self, query: str, passages: list[ContextPassage], language: str = "en") -> str:
        system = _SYSTEM_PROMPT_UR if language == "ur" else _SYSTEM_PROMPT_EN
        context_lines = []
        for i, p in enumerate(passages, 1):
            context_lines.append(
                f"[{i}] {p.chapter_title} — {p.section_heading}\n{p.text}"
            )
        context_block = "\n\n".join(context_lines)
        question_label = "سوال" if language == "ur" else "STUDENT QUESTION"
        return f"{system}\n\nCONTEXT PASSAGES:\n{context_block}\n\n{question_label}: {query}"

    def _parse_citations(
        self, full_text: str, passages: list[ContextPassage]
    ) -> list[CitationItem]:
        """
        Parses '[$INDEX] chapter — section' lines after the ---CITATIONS--- marker.
        Maps indices back to passages for metadata enrichment.
        """
        if "---CITATIONS---" not in full_text:
            return []

        _, citation_block = full_text.split("---CITATIONS---", 1)
        citations: list[CitationItem] = []
        seen_indices: set[int] = set()

        for line in citation_block.strip().splitlines():
            match = re.match(r"\[(\d+)\]\s*(.+?)\s*—\s*(.+)", line)
            if not match:
                continue
            idx = int(match.group(1))
            if idx in seen_indices:
                continue
            seen_indices.add(idx)

            # Map to passage metadata (1-based index)
            if 1 <= idx <= len(passages):
                p = passages[idx - 1]
                citations.append(
                    CitationItem(
                        index=idx,
                        chapter_title=p.chapter_title,
                        section_heading=p.section_heading,
                        score=p.score,
                        excerpt=p.text[:120] if p.text else None,
                    )
                )

        return citations


def _sse(chunk: ChatChunk) -> str:
    """Format a ChatChunk as an SSE data event."""
    return f"data: {chunk.model_dump_json(exclude_none=True)}\n\n"
