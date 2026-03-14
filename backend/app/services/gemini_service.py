"""
Gemini service — ALL google-generativeai imports live here.
Constitution Principle IV: provider-agnostic callers, provider-specific code isolated.
Provides: text embeddings (text-embedding-004) + streaming text generation (gemini-2.0-flash).
"""

from typing import Generator

import google.generativeai as genai
from app import config

_EMBED_MODEL = "models/text-embedding-004"
_CHAT_MODEL = "gemini-2.0-flash"


class GeminiService:
    def __init__(self) -> None:
        genai.configure(api_key=config.GEMINI_API_KEY)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """
        Embed a list of document texts for indexing.
        Uses task_type=RETRIEVAL_DOCUMENT for better retrieval performance.
        """
        results = []
        for text in texts:
            response = genai.embed_content(
                model=_EMBED_MODEL,
                content=text,
                task_type="RETRIEVAL_DOCUMENT",
            )
            results.append(response["embedding"])
        return results

    def embed_query(self, text: str) -> list[float]:
        """
        Embed a single user query for semantic search.
        Uses task_type=RETRIEVAL_QUERY for better retrieval performance.
        """
        response = genai.embed_content(
            model=_EMBED_MODEL,
            content=text,
            task_type="RETRIEVAL_QUERY",
        )
        return response["embedding"]

    def stream_generate(self, prompt: str) -> Generator[str, None, None]:
        """
        Stream text generation from Gemini (gemini-2.0-flash).
        Yields text token chunks as they arrive.
        """
        model = genai.GenerativeModel(_CHAT_MODEL)
        response = model.generate_content(prompt, stream=True)
        for chunk in response:
            if chunk.text:
                yield chunk.text
