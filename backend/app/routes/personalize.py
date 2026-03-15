"""
Personalization endpoints: GET /personalize/{chapter_slug:path}
                           GET /personalize/{chapter_slug:path}/status

Requires: better-auth session cookie.
Reads user_profile from Neon, delegates generation + caching to PersonalizerService.
"""

import os
import logging
from typing import Optional

import asyncpg
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel

from app.middleware.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["personalization"])


# ─── Response schemas ─────────────────────────────────────────────────────────

class PersonalizeResponse(BaseModel):
    content: str
    cached: bool
    generating: bool
    profile: dict


class PersonalizeStatusResponse(BaseModel):
    ready: bool
    cached: bool
    profile_hash: Optional[str]


# ─── Profile fetch helper ─────────────────────────────────────────────────────

async def _get_profile(user_id: str) -> dict:
    """Fetch user_profile row from Neon for the given user_id."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not configured",
        )
    conn: asyncpg.Connection = await asyncpg.connect(db_url)
    try:
        row = await conn.fetchrow(
            """
            SELECT experience_level, hardware, programming_background, preferred_language
            FROM user_profile
            WHERE user_id = $1
            """,
            user_id,
        )
    finally:
        await conn.close()

    if row is None:
        return {}  # Return empty dict — caller returns default chapter content

    return {
        "experience_level": row["experience_level"],
        "hardware": row["hardware"],
        "programming_background": row["programming_background"],
        "preferred_language": row["preferred_language"],
    }


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/personalize/{chapter_slug:path}/status", response_model=PersonalizeStatusResponse)
async def personalize_status(
    chapter_slug: str,
    current_user: dict = Depends(get_current_user),
) -> PersonalizeStatusResponse:
    """
    Check if a personalized version is ready for the current user + chapter.
    Does NOT trigger generation. Used for frontend polling after a cache miss.
    """
    from app.main import personalizer  # avoid circular import at module level

    user_id: str = current_user["user_id"]
    profile = await _get_profile(user_id)

    if not profile:
        return PersonalizeStatusResponse(ready=False, cached=False, profile_hash=None)

    status_info = await personalizer.get_status(user_id, chapter_slug, profile)
    return PersonalizeStatusResponse(
        ready=status_info["ready"],
        cached=status_info["cached"],
        profile_hash=status_info["profile_hash"],
    )


@router.get("/personalize/{chapter_slug:path}", response_model=PersonalizeResponse)
async def personalize_chapter(
    chapter_slug: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user),
) -> PersonalizeResponse:
    """
    Return a personalized version of the chapter for the authenticated student.

    - Cache hit (fresh): returns personalized content immediately
    - Cache miss: returns default content + enqueues generation in background
    - Stale hit: returns stale content + enqueues re-generation
    - No profile: returns default content (no personalization)
    """
    from app.main import personalizer  # avoid circular import at module level

    user_id: str = current_user["user_id"]
    profile = await _get_profile(user_id)

    if not profile:
        # No profile row — return default content without personalization
        try:
            default_md = personalizer._read_chapter(chapter_slug)
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Chapter not found: {chapter_slug}",
            )
        return PersonalizeResponse(
            content=default_md,
            cached=False,
            generating=False,
            profile={},
        )

    try:
        result = await personalizer.get_or_enqueue(
            user_id=user_id,
            chapter_slug=chapter_slug,
            profile=profile,
            background_tasks=background_tasks,
        )
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chapter not found: {chapter_slug}",
        )
    except Exception as exc:
        logger.error("Personalization error for user=%s slug=%s: %s", user_id, chapter_slug, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Personalization service unavailable",
        )

    return PersonalizeResponse(
        content=result.content,
        cached=result.cached,
        generating=result.generating,
        profile=result.profile,
    )
