import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.models import SearchRequest, SearchResponse, SearchResultItem, HealthResponse
from app.services.gemini_service import GeminiService
from app.services.qdrant_service import QdrantService

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# Instantiate services once at startup
gemini = GeminiService()
qdrant = QdrantService()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "RAG backend started | collection=%s | origins=%s",
        config.QDRANT_COLLECTION,
        config.ALLOWED_ORIGINS,
    )
    yield
    logger.info("RAG backend shutting down.")


app = FastAPI(
    title="Physical AI Book — RAG Search API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.post("/search", response_model=SearchResponse)
def search(request: SearchRequest) -> SearchResponse:
    """Semantic search over book chapters."""
    start = time.perf_counter()
    try:
        vector = gemini.embed_query(request.query)
        hits = qdrant.search(config.QDRANT_COLLECTION, vector, request.top_k)
    except Exception as e:
        logger.error("Search failed: %s", e)
        raise HTTPException(status_code=503, detail=str(e))

    results = [
        SearchResultItem(
            text=hit.payload.get("text", ""),
            source_path=hit.payload.get("source_path", ""),
            chapter_title=hit.payload.get("chapter_title", ""),
            section_heading=hit.payload.get("section_heading", ""),
            module=hit.payload.get("module", ""),
            score=hit.score,
            chunk_index=hit.payload.get("chunk_index", 0),
        )
        for hit in hits
    ]

    elapsed = time.perf_counter() - start
    logger.info(
        "search query_len=%d top_k=%d results=%d elapsed=%.3fs",
        len(request.query),
        request.top_k,
        len(results),
        elapsed,
    )
    return SearchResponse(results=results, query=request.query, total=len(results))


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Service health and Qdrant collection statistics."""
    info = qdrant.collection_info(config.QDRANT_COLLECTION)
    if "error" in info:
        return HealthResponse(
            status="degraded",
            collection_name=info["collection_name"],
            vector_count=0,
            message=info["error"],
        )
    return HealthResponse(
        status="ok",
        collection_name=info["collection_name"],
        vector_count=info["vector_count"],
    )
