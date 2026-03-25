import os
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app import config
from app.models import (
    SearchRequest, SearchResponse, SearchResultItem, HealthResponse,
    ChatRequest,
)
from app.services.gemini_service import GeminiService
from app.services.qdrant_service import QdrantService
from app.services.chat_service import GeminiChatService
from app.services.personalizer_service import PersonalizerService
from app.routes.profile import router as profile_router
from app.routes.personalize import router as personalize_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

# Instantiate services once at startup
gemini = GeminiService()
qdrant = QdrantService()
chat = GeminiChatService(gemini)
personalizer = PersonalizerService(
    gemini_api_key=config.GEMINI_API_KEY,
    db_url=os.getenv("DATABASE_URL", ""),
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        "RAG backend started | collection=%s | origins=%s",
        config.QDRANT_COLLECTION,
        config.ALLOWED_ORIGINS,
    )
    # TTL cleanup: remove personalized chapter cache rows older than 30 days
    try:
        await personalizer.cleanup_expired(days=30)
    except Exception as exc:
        logger.warning("Personalization TTL cleanup failed (non-fatal): %s", exc)
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
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["*"],
)

app.include_router(profile_router)
app.include_router(personalize_router)


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


@app.post("/chat")
def chat_generate(request: ChatRequest) -> StreamingResponse:
    """
    Generate a grounded answer from context passages via Gemini 2.0 Flash.
    Returns a Server-Sent Events stream of ChatChunk JSON objects.
    Event types: token | citations | error | done
    """
    start = time.perf_counter()
    logger.info(
        "chat query_len=%d passages=%d",
        len(request.query),
        len(request.context_passages),
    )
    stream = chat.stream_answer(request.query, request.context_passages, request.language)
    elapsed = time.perf_counter() - start
    logger.info("chat stream started elapsed=%.3fs", elapsed)
    return StreamingResponse(stream, media_type="text/event-stream")


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
