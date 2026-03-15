"""
Set dummy environment variables before any test imports app.main.
This prevents config.py's SystemExit from firing during tests.
The actual service calls are mocked in each test fixture.
"""
import os

os.environ.setdefault("GEMINI_API_KEY", "test-key")
os.environ.setdefault("QDRANT_URL", "http://localhost:6333")
os.environ.setdefault("QDRANT_API_KEY", "test-key")
os.environ.setdefault("QDRANT_COLLECTION", "test-collection")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:3000")
