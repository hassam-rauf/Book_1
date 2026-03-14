"""
Integration tests for GET /health.
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def healthy_client():
    mock_qdrant = MagicMock()
    mock_qdrant.collection_info.return_value = {
        "collection_name": "physical-ai-book",
        "vector_count": 312,
    }
    mock_gemini = MagicMock()
    with patch("app.main.qdrant", mock_qdrant), patch("app.main.gemini", mock_gemini):
        from app.main import app
        yield TestClient(app)


@pytest.fixture
def degraded_client():
    mock_qdrant = MagicMock()
    mock_qdrant.collection_info.return_value = {
        "collection_name": "physical-ai-book",
        "vector_count": 0,
        "error": "Connection refused",
    }
    mock_gemini = MagicMock()
    with patch("app.main.qdrant", mock_qdrant), patch("app.main.gemini", mock_gemini):
        from app.main import app
        yield TestClient(app)


def test_health_returns_200_when_healthy(healthy_client):
    resp = healthy_client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["vector_count"] == 312
    assert body["collection_name"] == "physical-ai-book"


def test_health_returns_200_when_degraded(degraded_client):
    """Degraded state must return HTTP 200, not 500."""
    resp = degraded_client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "degraded"
    assert body["vector_count"] == 0
    assert "message" in body


def test_health_response_always_has_required_fields(healthy_client):
    resp = healthy_client.get("/health")
    body = resp.json()
    for field in ["status", "collection_name", "vector_count"]:
        assert field in body
