import os
from dotenv import load_dotenv

load_dotenv()

def _require(key: str) -> str:
    val = os.getenv(key)
    if not val:
        raise SystemExit(f"[config] ERROR: Required environment variable '{key}' is not set.\n"
                         f"Copy backend/.env.example to backend/.env and fill in your values.")
    return val

GEMINI_API_KEY: str = _require("GEMINI_API_KEY")
QDRANT_URL: str = _require("QDRANT_URL")
QDRANT_API_KEY: str = _require("QDRANT_API_KEY")
QDRANT_COLLECTION: str = os.getenv("QDRANT_COLLECTION", "physical-ai-book")
ALLOWED_ORIGINS: list[str] = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000,https://hassam-rauf.github.io"
).split(",")
PORT: int = int(os.getenv("PORT", "8000"))
DOCS_DIR: str = os.getenv("DOCS_DIR", "../book-site/docs")
