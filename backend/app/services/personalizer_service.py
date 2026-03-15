"""
PersonalizerService — generate and cache profile-adapted chapter content.

Calls Gemini 2.0 Flash to rewrite chapter markdown for a specific student
profile (experience level, hardware, programming background). Results are
cached in the `personalized_chapter_cache` Neon Postgres table.

Cache strategy: stale-while-revalidate
- Cache MISS → return default content immediately, enqueue generation in background
- Cache HIT (fresh) → return cached content
- Cache HIT (stale: profile changed) → return stale content immediately, re-enqueue
"""

import hashlib
import json
import logging
import os
from dataclasses import dataclass
from typing import Optional

import asyncpg
from google import genai
from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)


@dataclass
class CacheRow:
    content_md: str
    profile_hash: str


@dataclass
class PersonalizationResult:
    content: str
    cached: bool
    generating: bool
    profile: dict


class PersonalizerService:
    """
    Manages on-demand generation and caching of personalized chapter content.

    Usage:
        result = await svc.get_or_enqueue(user_id, chapter_slug, profile, bg_tasks)
        # result.content is either cached personalized or default chapter markdown
    """

    def __init__(self, gemini_api_key: str, db_url: str) -> None:
        if not db_url:
            raise ValueError("DATABASE_URL is required for PersonalizerService")
        self._db_url = db_url
        self._client = genai.Client(api_key=gemini_api_key)
        self._docs_dir = os.getenv("DOCS_DIR", "../book-site/docs")
        logger.info("[personalizer] Initialized. docs_dir=%s", self._docs_dir)

    # ─── Public API ────────────────────────────────────────────────────────────

    async def get_or_enqueue(
        self,
        user_id: str,
        chapter_slug: str,
        profile: dict,
        background_tasks: BackgroundTasks,
    ) -> PersonalizationResult:
        """
        Return personalized content for (user_id, chapter_slug).

        - Cache miss: return default content, enqueue generation
        - Cache hit (fresh): return cached content
        - Cache hit (stale): return stale content, enqueue re-generation
        """
        current_hash = self._compute_hash(profile)

        try:
            default_md = self._read_chapter(chapter_slug)
        except FileNotFoundError:
            raise

        conn: asyncpg.Connection = await asyncpg.connect(self._db_url)
        try:
            row = await self._read_cache(conn, user_id, chapter_slug)
        finally:
            await conn.close()

        if row is None:
            # Cache miss — enqueue generation, return default
            background_tasks.add_task(
                self._generate_and_cache, user_id, chapter_slug, profile, current_hash
            )
            return PersonalizationResult(
                content=default_md,
                cached=False,
                generating=True,
                profile={"experience_level": profile.get("experience_level"), "hardware": profile.get("hardware")},
            )

        if row.profile_hash == current_hash:
            # Fresh cache hit
            await self._update_last_hit(user_id, chapter_slug)
            return PersonalizationResult(
                content=row.content_md,
                cached=True,
                generating=False,
                profile={"experience_level": profile.get("experience_level"), "hardware": profile.get("hardware")},
            )

        # Stale hit — return stale, re-enqueue
        background_tasks.add_task(
            self._generate_and_cache, user_id, chapter_slug, profile, current_hash
        )
        return PersonalizationResult(
            content=row.content_md,
            cached=True,
            generating=True,
            profile={"experience_level": profile.get("experience_level"), "hardware": profile.get("hardware")},
        )

    async def invalidate_user_cache(self, user_id: str) -> None:
        """Delete all cached chapters for a user (called on profile update)."""
        conn: asyncpg.Connection = await asyncpg.connect(self._db_url)
        try:
            deleted = await conn.execute(
                "DELETE FROM personalized_chapter_cache WHERE user_id = $1",
                user_id,
            )
            logger.info("[personalizer] Invalidated cache for user=%s rows=%s", user_id, deleted)
        finally:
            await conn.close()

    async def cleanup_expired(self, days: int = 30) -> None:
        """Delete cache rows older than `days` days (called at startup)."""
        conn: asyncpg.Connection = await asyncpg.connect(self._db_url)
        try:
            deleted = await conn.execute(
                f"DELETE FROM personalized_chapter_cache WHERE created_at < NOW() - INTERVAL '{days} days'"
            )
            logger.info("[personalizer] TTL cleanup: deleted %s rows older than %d days", deleted, days)
        finally:
            await conn.close()

    async def get_status(self, user_id: str, chapter_slug: str, profile: dict) -> dict:
        """Check if a cached version exists and whether it is fresh."""
        current_hash = self._compute_hash(profile)
        conn: asyncpg.Connection = await asyncpg.connect(self._db_url)
        try:
            row = await self._read_cache(conn, user_id, chapter_slug)
        finally:
            await conn.close()
        if row is None:
            return {"ready": False, "cached": False, "profile_hash": None}
        fresh = row.profile_hash == current_hash
        return {"ready": fresh, "cached": True, "profile_hash": row.profile_hash}

    # ─── Private helpers ───────────────────────────────────────────────────────

    def _compute_hash(self, profile: dict) -> str:
        """SHA-256 of the profile fields that drive generation."""
        payload = json.dumps(
            {
                "experience_level": profile.get("experience_level", "beginner"),
                "hardware": profile.get("hardware", "laptop-only"),
                "programming_background": profile.get("programming_background", ""),
            },
            sort_keys=True,
        )
        return hashlib.sha256(payload.encode()).hexdigest()

    def _read_chapter(self, chapter_slug: str) -> str:
        """Read original chapter markdown from docs directory."""
        # Sanitize slug to prevent path traversal
        safe_slug = chapter_slug.lstrip("/").replace("..", "")
        path = os.path.join(self._docs_dir, f"{safe_slug}.md")
        if not os.path.isfile(path):
            raise FileNotFoundError(f"Chapter not found: {chapter_slug}")
        with open(path, encoding="utf-8") as f:
            return f.read()

    def _build_prompt(self, chapter_md: str, profile: dict) -> str:
        experience = profile.get("experience_level", "beginner")
        hardware = profile.get("hardware", "laptop-only")
        background = profile.get("programming_background", "")

        hardware_desc = {
            "laptop-only": "a standard laptop with CPU only (no GPU)",
            "gpu-workstation": "a GPU workstation with NVIDIA GPU",
            "jetson-kit": "an NVIDIA Jetson embedded kit",
            "robot": "a physical robot with onboard compute",
        }.get(hardware, hardware)

        experience_desc = {
            "beginner": "a beginner with limited prior knowledge — use simple language, more analogies, step-by-step explanations",
            "intermediate": "an intermediate learner — standard depth, include performance notes and 'going deeper' sections",
            "advanced": "an advanced student — skip basic explanations, add implementation details, edge cases, and optimization notes",
        }.get(experience, experience)

        background_section = f"\nStudent's programming background: {background}" if background else ""

        return f"""You are adapting a Physical AI textbook chapter for a specific student.

Student profile:
- Experience level: {experience_desc}
- Available hardware: {hardware_desc}{background_section}

INSTRUCTIONS:
1. Rewrite the chapter content to match the student's experience level and hardware.
2. For hardware: adapt code examples to use the student's available hardware (e.g., CPU-only code for laptop, CUDA code for GPU, Jetson-specific APIs for Jetson, ROS 2 hardware nodes for robot).
3. For experience level: adjust explanation depth, vocabulary, and analogies accordingly.
4. Preserve ALL markdown structure: frontmatter (if present), headings, code blocks, images, lists.
5. Keep the same heading hierarchy and section order.
6. Do NOT add new sections or remove existing sections — only adapt the content within them.
7. Code blocks MUST retain their language tags (```python, ```bash, etc.).
8. Return ONLY the adapted markdown — no commentary, no preamble.

ORIGINAL CHAPTER:
---
{chapter_md}
---

ADAPTED CHAPTER:"""

    async def _generate_and_cache(
        self,
        user_id: str,
        chapter_slug: str,
        profile: dict,
        profile_hash: str,
    ) -> None:
        """Generate personalized content and write to cache (runs in background)."""
        try:
            chapter_md = self._read_chapter(chapter_slug)
        except FileNotFoundError:
            logger.warning("[personalizer] Chapter not found during generation: %s", chapter_slug)
            return

        prompt = self._build_prompt(chapter_md, profile)
        logger.info("[personalizer] Generating for user=%s chapter=%s", user_id, chapter_slug)

        try:
            response = self._client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
            personalized_md = response.text
        except Exception as exc:
            logger.error("[personalizer] Gemini generation failed: %s", exc)
            return

        try:
            conn: asyncpg.Connection = await asyncpg.connect(self._db_url)
            try:
                await self._write_cache(conn, user_id, chapter_slug, personalized_md, profile_hash)
                logger.info("[personalizer] Cached personalized chapter user=%s slug=%s", user_id, chapter_slug)
            finally:
                await conn.close()
        except Exception as exc:
            logger.error("[personalizer] Cache write failed: %s", exc)

    async def _read_cache(
        self, conn: asyncpg.Connection, user_id: str, chapter_slug: str
    ) -> Optional[CacheRow]:
        row = await conn.fetchrow(
            "SELECT content_md, profile_hash FROM personalized_chapter_cache WHERE user_id=$1 AND chapter_slug=$2",
            user_id,
            chapter_slug,
        )
        return CacheRow(content_md=row["content_md"], profile_hash=row["profile_hash"]) if row else None

    async def _write_cache(
        self,
        conn: asyncpg.Connection,
        user_id: str,
        chapter_slug: str,
        content_md: str,
        profile_hash: str,
    ) -> None:
        await conn.execute(
            """
            INSERT INTO personalized_chapter_cache (user_id, chapter_slug, content_md, profile_hash)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, chapter_slug) DO UPDATE
              SET content_md   = EXCLUDED.content_md,
                  profile_hash = EXCLUDED.profile_hash,
                  last_hit_at  = NOW()
            """,
            user_id,
            chapter_slug,
            content_md,
            profile_hash,
        )

    async def _update_last_hit(self, user_id: str, chapter_slug: str) -> None:
        try:
            conn: asyncpg.Connection = await asyncpg.connect(self._db_url)
            try:
                await conn.execute(
                    "UPDATE personalized_chapter_cache SET last_hit_at = NOW() WHERE user_id=$1 AND chapter_slug=$2",
                    user_id,
                    chapter_slug,
                )
            finally:
                await conn.close()
        except Exception as exc:
            logger.warning("[personalizer] last_hit_at update failed: %s", exc)
