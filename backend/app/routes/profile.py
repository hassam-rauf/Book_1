"""
Profile endpoints: GET /profile and PUT /profile.

Requires: better-auth session cookie (`better-auth.session_token`).
Reads/writes the `user_profile` table in Neon Postgres.
"""

import os
from datetime import datetime, timezone
from enum import Enum
from typing import Optional

import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from app.middleware.auth import get_current_user

router = APIRouter(tags=["profile"])


# ─── Enums ────────────────────────────────────────────────────────────────────

class ExperienceLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class HardwareType(str, Enum):
    laptop_only = "laptop-only"
    gpu_workstation = "gpu-workstation"
    jetson_kit = "jetson-kit"
    robot = "robot"


class PreferredLanguage(str, Enum):
    en = "en"
    ur = "ur"


# ─── Pydantic schemas ─────────────────────────────────────────────────────────

class UserProfileResponse(BaseModel):
    user_id: str
    experience_level: ExperienceLevel
    programming_background: str
    hardware: HardwareType
    preferred_language: PreferredLanguage
    updated_at: datetime


class UserProfileUpdate(BaseModel):
    experience_level: Optional[ExperienceLevel] = None
    programming_background: Optional[str] = Field(None, max_length=200)
    hardware: Optional[HardwareType] = None
    preferred_language: Optional[PreferredLanguage] = None

    @field_validator("programming_background")
    @classmethod
    def validate_programming_background(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and len(v) > 200:
            raise ValueError("Programming background must be under 200 characters")
        return v


# ─── Helper ───────────────────────────────────────────────────────────────────

async def _get_conn() -> asyncpg.Connection:
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not configured",
        )
    return await asyncpg.connect(db_url)


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(current_user: dict = Depends(get_current_user)) -> UserProfileResponse:
    """Return the current user's profile."""
    user_id: str = current_user["user_id"]
    conn = await _get_conn()
    try:
        row = await conn.fetchrow(
            """
            SELECT user_id, experience_level, programming_background,
                   hardware, preferred_language, updated_at
            FROM user_profile
            WHERE user_id = $1
            """,
            user_id,
        )
    finally:
        await conn.close()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return UserProfileResponse(
        user_id=row["user_id"],
        experience_level=row["experience_level"],
        programming_background=row["programming_background"],
        hardware=row["hardware"],
        preferred_language=row["preferred_language"],
        updated_at=row["updated_at"],
    )


@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    body: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
) -> UserProfileResponse:
    """Update one or more profile fields for the current user."""
    user_id: str = current_user["user_id"]

    # Build SET clauses for only the provided fields
    updates: dict[str, object] = {
        k: v.value if isinstance(v, Enum) else v
        for k, v in {
            "experience_level": body.experience_level,
            "programming_background": body.programming_background,
            "hardware": body.hardware,
            "preferred_language": body.preferred_language,
        }.items()
        if v is not None
    }

    if not updates:
        # Nothing to update — just return current profile
        return await get_profile(current_user)

    updates["updated_at"] = datetime.now(tz=timezone.utc)

    set_clause = ", ".join(
        f"{col} = ${i + 2}" for i, col in enumerate(updates.keys())
    )
    values = [user_id, *updates.values()]

    conn = await _get_conn()
    try:
        row = await conn.fetchrow(
            f"""
            UPDATE user_profile
            SET {set_clause}
            WHERE user_id = $1
            RETURNING user_id, experience_level, programming_background,
                      hardware, preferred_language, updated_at
            """,
            *values,
        )
    finally:
        await conn.close()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return UserProfileResponse(
        user_id=row["user_id"],
        experience_level=row["experience_level"],
        programming_background=row["programming_background"],
        hardware=row["hardware"],
        preferred_language=row["preferred_language"],
        updated_at=row["updated_at"],
    )
