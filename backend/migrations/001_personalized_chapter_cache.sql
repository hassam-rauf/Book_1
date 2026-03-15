-- Migration: 001_personalized_chapter_cache
-- Feature: F7 Personalization
-- Date: 2026-03-15
--
-- Creates the cache table for personalized chapter content.
-- Apply with: psql $DATABASE_URL -f backend/migrations/001_personalized_chapter_cache.sql
-- Or paste into Neon Console → SQL Editor

CREATE TABLE IF NOT EXISTS personalized_chapter_cache (
    id           BIGSERIAL    PRIMARY KEY,
    user_id      TEXT         NOT NULL,
    chapter_slug TEXT         NOT NULL,
    content_md   TEXT         NOT NULL,
    profile_hash TEXT         NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    last_hit_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, chapter_slug)
);

-- Index for fast DELETE sweep on profile update
CREATE INDEX IF NOT EXISTS idx_personalized_chapter_cache_user_id
    ON personalized_chapter_cache (user_id);
