"""
Integration tests for POST /chat.
Gemini and Qdrant services are mocked — no API keys required.
"""

from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def chat_client():
    mock_gemini = MagicMock()
    mock_gemini.stream_generate.return_value = iter([
        "The ROS 2 publisher",
        "-subscriber pattern uses DDS.",
        "\n---CITATIONS---\n[1] Chapter 3 — 3.3 Publisher-Subscriber",
    ])
    mock_qdrant = MagicMock()
    mock_chat = MagicMock()
    mock_chat.stream_answer.return_value = iter([
        'data: {"type":"token","text":"The ROS 2 publisher"}\n\n',
        'data: {"type":"token","text":"-subscriber pattern uses DDS."}\n\n',
        'data: {"type":"citations","citations":[{"index":1,"chapter_title":"Chapter 3","section_heading":"3.3 Publisher-Subscriber","score":0.91}]}\n\n',
        'data: {"type":"done"}\n\n',
    ])
    with (
        patch("app.main.gemini", mock_gemini),
        patch("app.main.qdrant", mock_qdrant),
        patch("app.main.chat", mock_chat),
    ):
        from app.main import app
        yield TestClient(app)


def test_chat_returns_200_with_event_stream(chat_client):
    resp = chat_client.post(
        "/chat",
        json={
            "query": "How does ROS 2 pub-sub work?",
            "context_passages": [
                {
                    "text": "ROS 2 uses DDS for pub-sub communication...",
                    "chapter_title": "Chapter 3",
                    "section_heading": "3.3 Publisher-Subscriber",
                    "score": 0.91,
                }
            ],
        },
    )
    assert resp.status_code == 200
    assert "text/event-stream" in resp.headers["content-type"]


def test_chat_empty_query_returns_422(chat_client):
    resp = chat_client.post(
        "/chat",
        json={
            "query": "",
            "context_passages": [
                {
                    "text": "Some text.",
                    "chapter_title": "Chapter 1",
                    "section_heading": "1.1 Intro",
                    "score": 0.8,
                }
            ],
        },
    )
    assert resp.status_code == 422


def test_chat_empty_passages_returns_422(chat_client):
    resp = chat_client.post(
        "/chat",
        json={
            "query": "What is a robot?",
            "context_passages": [],
        },
    )
    assert resp.status_code == 422


def test_chat_stream_contains_done_event(chat_client):
    resp = chat_client.post(
        "/chat",
        json={
            "query": "Explain DDS middleware.",
            "context_passages": [
                {
                    "text": "DDS is a data-centric publish-subscribe standard...",
                    "chapter_title": "Chapter 3",
                    "section_heading": "3.2 DDS Middleware",
                    "score": 0.88,
                }
            ],
        },
    )
    assert resp.status_code == 200
    assert "done" in resp.text


def test_chat_stream_contains_token_event(chat_client):
    resp = chat_client.post(
        "/chat",
        json={
            "query": "Explain DDS middleware.",
            "context_passages": [
                {
                    "text": "DDS is a data-centric publish-subscribe standard...",
                    "chapter_title": "Chapter 3",
                    "section_heading": "3.2 DDS Middleware",
                    "score": 0.88,
                }
            ],
        },
    )
    assert "token" in resp.text


def test_chat_stream_contains_citations_event(chat_client):
    resp = chat_client.post(
        "/chat",
        json={
            "query": "What is ROS 2?",
            "context_passages": [
                {
                    "text": "ROS 2 is a flexible framework for robot software...",
                    "chapter_title": "Chapter 3",
                    "section_heading": "3.1 Overview",
                    "score": 0.93,
                }
            ],
        },
    )
    assert "citations" in resp.text
