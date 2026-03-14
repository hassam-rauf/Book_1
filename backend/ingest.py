"""
Ingestion CLI — chunks all book chapters and upserts to Qdrant Cloud.

Usage:
    cd backend/
    python ingest.py

Re-running is safe: upsert is idempotent (deterministic chunk IDs).
"""

import glob
import logging
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Config import triggers env validation — exits cleanly on missing keys
from app import config  # noqa: E402
from app.chunker import chunk_markdown_file  # noqa: E402
from app.services.gemini_service import GeminiService  # noqa: E402
from app.services.qdrant_service import QdrantService  # noqa: E402
from qdrant_client.models import PointStruct  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger(__name__)

BATCH_SIZE = 100  # Stay within free-tier Qdrant limits
RATE_LIMIT_RETRY_SECONDS = 60


def main() -> None:
    docs_dir = Path(config.DOCS_DIR).resolve()
    if not docs_dir.exists():
        logger.error("DOCS_DIR '%s' does not exist. Check your .env file.", docs_dir)
        sys.exit(1)

    # --- 1. Discover markdown files ---
    md_files = sorted(glob.glob(str(docs_dir / "**" / "*.md"), recursive=True))
    logger.info("Found %d markdown files in %s", len(md_files), docs_dir)

    if not md_files:
        logger.error("No markdown files found. Nothing to ingest.")
        sys.exit(1)

    # --- 2. Chunk all files ---
    all_chunks: list[dict] = []
    for f in md_files:
        chunks = chunk_markdown_file(f, docs_root=str(docs_dir))
        all_chunks.extend(chunks)
        logger.debug("  %s → %d chunks", Path(f).name, len(chunks))

    logger.info("Total chunks generated: %d", len(all_chunks))

    # --- 3. Ensure Qdrant collection exists ---
    qdrant = QdrantService()
    qdrant.ensure_collection(config.QDRANT_COLLECTION, vector_size=768)
    logger.info("Collection '%s' ready.", config.QDRANT_COLLECTION)

    # --- 4. Embed and upsert in batches ---
    gemini = GeminiService()
    total_batches = (len(all_chunks) + BATCH_SIZE - 1) // BATCH_SIZE

    for batch_num, start in enumerate(range(0, len(all_chunks), BATCH_SIZE), 1):
        batch = all_chunks[start : start + BATCH_SIZE]
        texts = [c["text"] for c in batch]

        # Embed with retry on rate limit
        while True:
            try:
                embeddings = gemini.embed_documents(texts)
                break
            except Exception as e:
                if "quota" in str(e).lower() or "429" in str(e):
                    logger.warning(
                        "Rate limit hit on batch %d/%d — retrying in %ds...",
                        batch_num,
                        total_batches,
                        RATE_LIMIT_RETRY_SECONDS,
                    )
                    time.sleep(RATE_LIMIT_RETRY_SECONDS)
                else:
                    logger.error("Embedding failed: %s", e)
                    raise

        # Build Qdrant points
        points = [
            PointStruct(
                id=chunk["id"],
                vector=embedding,
                payload={
                    "text": chunk["text"],
                    "source_path": chunk["source_path"],
                    "chapter_title": chunk["chapter_title"],
                    "section_heading": chunk["section_heading"],
                    "chunk_index": chunk["chunk_index"],
                    "module": chunk["module"],
                    "word_count": chunk["word_count"],
                },
            )
            for chunk, embedding in zip(batch, embeddings)
        ]

        qdrant.upsert_batch(config.QDRANT_COLLECTION, points)
        logger.info(
            "Upserted batch %d/%d (%d chunks)", batch_num, total_batches, len(batch)
        )

    # --- 5. Final summary ---
    info = qdrant.collection_info(config.QDRANT_COLLECTION)
    logger.info(
        "✅ Ingestion complete. %d vectors in collection '%s'.",
        info.get("vector_count", "?"),
        config.QDRANT_COLLECTION,
    )


if __name__ == "__main__":
    main()
