"""
Qdrant vector store service — ALL qdrant-client imports live here.
"""

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    ScoredPoint,
)
from app import config


class QdrantService:
    def __init__(self) -> None:
        self._client = QdrantClient(
            url=config.QDRANT_URL,
            api_key=config.QDRANT_API_KEY,
        )

    def ensure_collection(self, name: str, vector_size: int = 768) -> None:
        """Create the collection if it does not already exist."""
        existing = [c.name for c in self._client.get_collections().collections]
        if name not in existing:
            self._client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(
                    size=vector_size,
                    distance=Distance.COSINE,
                ),
            )

    def upsert_batch(self, collection: str, points: list[PointStruct]) -> None:
        """Upsert a batch of points. wait=True ensures durability."""
        self._client.upsert(
            collection_name=collection,
            points=points,
            wait=True,
        )

    def search(
        self, collection: str, vector: list[float], top_k: int
    ) -> list[ScoredPoint]:
        """Cosine similarity search — returns top_k scored points."""
        return self._client.search(
            collection_name=collection,
            query_vector=vector,
            limit=top_k,
            with_payload=True,
        )

    def collection_info(self, collection: str) -> dict:
        """Return vector count and collection name. Returns error dict on failure."""
        try:
            info = self._client.get_collection(collection)
            return {
                "collection_name": collection,
                "vector_count": info.vectors_count or 0,
            }
        except Exception as e:
            return {
                "collection_name": collection,
                "vector_count": 0,
                "error": str(e),
            }
