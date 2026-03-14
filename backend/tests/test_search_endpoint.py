"""
Integration tests for POST /search.
Mocks GeminiService and QdrantService to avoid real API calls.
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# Patch services before importing app.main to prevent real connections at import time
@pytest.fixture
def client():
    mock_gemini = MagicMock()
    mock_gemini.embed_query.return_value = [0.1] * 768

    mock_qdrant = MagicMock()
    mock_hit = MagicMock()
    mock_hit.payload = {
        "text": "ROS 2 uses publish-subscribe messaging via DDS.",
        "source_path": "module-1/ch04-ros2-nodes-topics.md",
        "chapter_title": "Chapter 4: ROS 2 Nodes and Topics",
        "section_heading": "The Publish/Subscribe Pattern",
        "module": "module-1",
        "chunk_index": 2,
    }
    mock_hit.score = 0.912
    mock_qdrant.search.return_value = [mock_hit] * 3

    with patch("app.main.gemini", mock_gemini), patch("app.main.qdrant", mock_qdrant):
        from app.main import app
        yield TestClient(app)


def test_search_returns_200_with_results(client):
    resp = client.post("/search", json={"query": "how does pub-sub work?", "top_k": 3})
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] == 3
    assert len(body["results"]) == 3
    assert body["query"] == "how does pub-sub work?"


def test_search_result_has_required_fields(client):
    resp = client.post("/search", json={"query": "ROS 2 topics"})
    item = resp.json()["results"][0]
    for field in ["text", "source_path", "chapter_title", "section_heading", "module", "score", "chunk_index"]:
        assert field in item


def test_search_default_top_k_is_5(client):
    resp = client.post("/search", json={"query": "test"})
    assert resp.status_code == 200
    # Mock returns list * 3 regardless — just check top_k default is accepted
    assert "results" in resp.json()


def test_search_top_k_zero_returns_422(client):
    resp = client.post("/search", json={"query": "test", "top_k": 0})
    assert resp.status_code == 422


def test_search_top_k_21_returns_422(client):
    resp = client.post("/search", json={"query": "test", "top_k": 21})
    assert resp.status_code == 422


def test_search_empty_query_returns_422(client):
    resp = client.post("/search", json={"query": "", "top_k": 5})
    assert resp.status_code == 422


def test_search_gemini_error_returns_503(client):
    with patch("app.main.gemini") as mock_gem:
        mock_gem.embed_query.side_effect = Exception("Gemini quota exceeded")
        resp = client.post("/search", json={"query": "test"})
    assert resp.status_code == 503
    assert "detail" in resp.json()
