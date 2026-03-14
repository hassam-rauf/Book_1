"""
Gemini embedding service — ALL google-generativeai imports live here.
Constitution Principle IV: provider-agnostic callers, provider-specific code isolated.
"""

import google.generativeai as genai
from app import config

_MODEL = "models/text-embedding-004"


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
                model=_MODEL,
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
            model=_MODEL,
            content=text,
            task_type="RETRIEVAL_QUERY",
        )
        return response["embedding"]
