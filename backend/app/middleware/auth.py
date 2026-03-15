"""
FastAPI session validation middleware for better-auth sessions.

better-auth stores sessions in the Neon Postgres `session` table.
FastAPI reads the `better-auth.session_token` cookie and does a direct DB lookup —
no HTTP calls to the auth-service required.
"""

import os
from typing import Optional

import asyncpg
from fastapi import Cookie, Depends, HTTPException, status


async def _get_db_url() -> str:
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError("DATABASE_URL is not set — required for session validation")
    return url


async def get_current_user(
    session_token: Optional[str] = Cookie(default=None, alias="better-auth.session_token"),
) -> dict:
    """
    FastAPI dependency that validates the better-auth session cookie.

    Reads `better-auth.session_token` cookie → queries `session` table in Neon →
    returns a dict with `user_id` (and `session_id`) if valid.

    Raises HTTP 401 if cookie is absent, session not found, or session expired.
    """
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    db_url = await _get_db_url()

    try:
        conn: asyncpg.Connection = await asyncpg.connect(db_url)
        try:
            row = await conn.fetchrow(
                """
                SELECT id, user_id, expires_at
                FROM session
                WHERE token = $1
                  AND expires_at > NOW()
                """,
                session_token,
            )
        finally:
            await conn.close()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Session store unavailable",
        ) from exc

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    return {"user_id": row["user_id"], "session_id": row["id"]}
