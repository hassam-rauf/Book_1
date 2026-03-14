from pydantic import BaseModel, Field
from typing import Literal


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=1000)
    top_k: int = Field(5, ge=1, le=20)


class SearchResultItem(BaseModel):
    text: str
    source_path: str
    chapter_title: str
    section_heading: str
    module: str
    score: float
    chunk_index: int


class SearchResponse(BaseModel):
    results: list[SearchResultItem]
    query: str
    total: int


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    collection_name: str
    vector_count: int
    message: str = ""
