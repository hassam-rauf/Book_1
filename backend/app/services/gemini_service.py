"""
Gemini service — uses google-genai (new SDK).
Constitution Principle IV: provider-agnostic callers, provider-specific code isolated.
Provides: text embeddings (text-embedding-004) + streaming text generation (gemini-2.0-flash).
"""

import time
from typing import Generator

from google import genai
from google.genai import types as genai_types
from app import config

_EMBED_MODEL = "gemini-embedding-001"
_CHAT_MODEL = "gemini-2.0-flash"


class GeminiService:
    def __init__(self) -> None:
        self._client = genai.Client(api_key=config.GEMINI_API_KEY)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        """
        Embed a list of document texts for indexing.
        Uses task_type=RETRIEVAL_DOCUMENT for better retrieval performance.
        """
        results = []
        for text in texts:
            for attempt in range(5):
                try:
                    response = self._client.models.embed_content(
                        model=_EMBED_MODEL,
                        contents=text,
                        config=genai_types.EmbedContentConfig(task_type="RETRIEVAL_DOCUMENT"),
                    )
                    results.append(response.embeddings[0].values)
                    break
                except Exception as e:
                    if attempt == 4:
                        raise
                    wait = 2 ** attempt
                    time.sleep(wait)
        return results

    def embed_query(self, text: str) -> list[float]:
        """
        Embed a single user query for semantic search.
        Uses task_type=RETRIEVAL_QUERY for better retrieval performance.
        """
        response = self._client.models.embed_content(
            model=_EMBED_MODEL,
            contents=text,
            config=genai_types.EmbedContentConfig(task_type="RETRIEVAL_QUERY"),
        )
        return response.embeddings[0].values

    def stream_generate(self, prompt: str) -> Generator[str, None, None]:
        """
        Stream text generation from Gemini (gemini-2.0-flash).
        Yields text token chunks as they arrive.
        """
        for chunk in self._client.models.generate_content_stream(
            model=_CHAT_MODEL,
            contents=prompt,
        ):
            if chunk.text:
                yield chunk.text
