# Data Model: Content Personalization (F7)

**Feature**: 008-f7-personalization
**Date**: 2026-03-15

---

## Database Tables

### `personalized_chapter_cache` (new — F7 addition)

Stores cached personalized chapter content keyed by `(user_id, chapter_slug)`.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGSERIAL | PK | Auto-increment ID |
| `user_id` | TEXT | NOT NULL | FK → `user.id` (better-auth) |
| `chapter_slug` | TEXT | NOT NULL | Chapter URL path (e.g., `module-1/ch01-intro-physical-ai`) |
| `content_md` | TEXT | NOT NULL | Full personalized chapter markdown |
| `profile_hash` | TEXT | NOT NULL | SHA-256 of profile fields used during generation |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | When the cached version was first generated |
| `last_hit_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Most recent cache hit (for TTL management) |

**Constraints**:
- `UNIQUE (user_id, chapter_slug)` — one cache row per student per chapter
- `INDEX ON (user_id)` — fast DELETE sweep on profile update

**Storage estimate**: ~16KB/row × 19 chapters × 100 students = ~30MB (within Neon 0.5GB free tier)

---

## Entity Relationships

```
user (from F6)
  └── (1) ─── (*) personalized_chapter_cache
                    │
                    ├── user_id   → user.id
                    ├── chapter_slug → source chapter in book-site/docs/
                    └── profile_hash → SHA-256(experience_level|hardware|programming_background)
```

---

## Profile Hash Computation

The `profile_hash` is computed deterministically from the profile fields that affect content generation:

```
profile_hash = SHA-256(
  JSON.dumps({
    "experience_level": user_profile.experience_level,
    "hardware": user_profile.hardware,
    "programming_background": user_profile.programming_background
  }, sort_keys=True)
)
```

`preferred_language` is excluded from the hash in F7 — Urdu generation is F8's scope. If F8 is implemented, the hash must include `preferred_language`.

---

## Cache State Transitions

```
[no cache row]
    │
    │ GET /personalize/{slug} (miss)
    ▼
[background generation enqueued]
    │
    │ Gemini generation complete
    ▼
[cache row created: content_md, profile_hash, created_at]
    │
    │ GET /personalize/{slug} (hit, hash matches)
    ├──► return cached content, update last_hit_at
    │
    │ PUT /profile (profile changed)
    ├──► DELETE cache rows WHERE user_id = $1
    │    └──► [no cache row] (back to start)
    │
    │ GET /personalize/{slug} (stale: hash mismatch)
    └──► return stale content immediately + re-enqueue generation
         └──► [cache row updated with new content_md + profile_hash]
```

---

## Source Chapters (Read-Only)

Chapters are read from `book-site/docs/` at generation time. They are not stored in the DB.

| Path pattern | Example |
|---|---|
| `book-site/docs/**/*.md` | `book-site/docs/module-1/ch01-intro-physical-ai.md` |

The chapter slug used as the cache key is derived from the chapter's Docusaurus path (strip `book-site/docs/` prefix and `.md` suffix).

---

## Validation Rules

| Field | Rule |
|-------|------|
| `chapter_slug` | Must correspond to an existing file in `book-site/docs/` |
| `content_md` | Non-empty string; must contain at least one heading |
| `profile_hash` | 64-char hex string (SHA-256) |
| `user_id` | Must correspond to a valid session (validated by `get_current_user`) |
