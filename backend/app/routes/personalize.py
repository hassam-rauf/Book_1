"""
Personalization endpoints: GET /personalize/{chapter_slug:path}
                           GET /personalize/{chapter_slug:path}/status

Accepts user_id via query param (from frontend session) or session cookie.
"""

import os
import logging
from typing import Optional

import asyncpg
from fastapi import APIRouter, BackgroundTasks, Cookie, HTTPException, Query, status
from pydantic import BaseModel

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


# ─── Helpers ──────────────────────────────────────────────────────────────────

async def _resolve_user_id(
    user_id: Optional[str] = None,
    session_token: Optional[str] = None,
) -> str:
    """Resolve user_id from query param or session cookie."""
    if user_id:
        return user_id

    if not session_token:
        raise HTTPException(status_code=401, detail="Authentication required")

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise HTTPException(status_code=503, detail="Database not configured")

    conn = await asyncpg.connect(db_url)
    try:
        row = await conn.fetchrow(
            "SELECT user_id FROM session WHERE token = $1 AND expires_at > NOW()",
            session_token,
        )
    finally:
        await conn.close()

    if not row:
        raise HTTPException(status_code=401, detail="Authentication required")
    return row["user_id"]


async def _get_profile(user_id: str) -> dict:
    """Fetch user_profile row from Neon for the given user_id."""
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        return {}
    try:
        conn = await asyncpg.connect(db_url)
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
    except Exception as exc:
        logger.warning("Profile lookup failed (returning empty): %s", exc)
        return {}

    if row is None:
        return {}

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
    user_id: Optional[str] = Query(default=None),
    session_token: Optional[str] = Cookie(default=None, alias="better-auth.session_token"),
) -> PersonalizeStatusResponse:
    from app.main import personalizer

    resolved_uid = await _resolve_user_id(user_id, session_token)
    profile = await _get_profile(resolved_uid)

    if not profile:
        return PersonalizeStatusResponse(ready=False, cached=False, profile_hash=None)

    status_info = await personalizer.get_status(resolved_uid, chapter_slug, profile)
    return PersonalizeStatusResponse(
        ready=status_info["ready"],
        cached=status_info["cached"],
        profile_hash=status_info["profile_hash"],
    )


@router.get("/personalize/{chapter_slug:path}", response_model=PersonalizeResponse)
async def personalize_chapter(
    chapter_slug: str,
    background_tasks: BackgroundTasks,
    user_id: Optional[str] = Query(default=None),
    session_token: Optional[str] = Cookie(default=None, alias="better-auth.session_token"),
) -> PersonalizeResponse:
    from app.main import personalizer

    resolved_uid = await _resolve_user_id(user_id, session_token)
    profile = await _get_profile(resolved_uid)

    if not profile:
        try:
            default_md = personalizer._read_chapter(chapter_slug)
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"Chapter not found: {chapter_slug}")
        return PersonalizeResponse(content=default_md, cached=False, generating=False, profile={})

    try:
        result = await personalizer.get_or_enqueue(
            user_id=resolved_uid,
            chapter_slug=chapter_slug,
            profile=profile,
            background_tasks=background_tasks,
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Chapter not found: {chapter_slug}")
    except Exception as exc:
        logger.error("Personalization error for user=%s slug=%s: %s", resolved_uid, chapter_slug, exc)
        raise HTTPException(status_code=503, detail="Personalization service unavailable")

    return PersonalizeResponse(
        content=result.content,
        cached=result.cached,
        generating=result.generating,
        profile=result.profile,
    )
