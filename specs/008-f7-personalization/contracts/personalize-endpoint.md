# API Contract: Personalization Endpoint (FastAPI)

**Service**: `backend` (FastAPI)
**Base URL**: `http://localhost:8000` (dev)
**Authentication**: Session cookie `better-auth.session_token` validated via `get_current_user`

---

## GET /personalize/{chapter_slug:path}

Return a personalized version of the specified chapter for the authenticated student.

The `chapter_slug` path parameter uses the `:path` converter to allow slashes (e.g., `module-1/ch01-intro-physical-ai`).

**Request**: No body. Authenticated via session cookie.

**Path parameter**: `chapter_slug` — the chapter's Docusaurus path relative to `docs/`
(e.g., `module-1/ch01-intro-physical-ai`, `module-2/ch06-gazebo-simulation`)

---

### Response: Cache Hit (200 OK — fast path, <2s)

Personalized content was already cached and the student's profile hasn't changed.

```json
{
  "content": "# Chapter 1: Introduction to Physical AI\n\n...(personalized markdown)...",
  "cached": true,
  "generating": false,
  "profile": {
    "experience_level": "beginner",
    "hardware": "laptop-only"
  }
}
```

---

### Response: Cache Miss — Default Returned, Generation Enqueued (200 OK)

No cached version exists yet. Returns default chapter content immediately. Generation is started in the background.

```json
{
  "content": "# Chapter 1: Introduction to Physical AI\n\n...(default markdown)...",
  "cached": false,
  "generating": true,
  "profile": {
    "experience_level": "beginner",
    "hardware": "laptop-only"
  }
}
```

Frontend should poll or reload after ~30 seconds to pick up the generated version.

---

### Response: Stale Cache — Stale Content Returned, Re-generation Enqueued (200 OK)

A cached version exists but the profile has changed since it was generated. Returns stale content immediately; background re-generation is queued.

```json
{
  "content": "# Chapter 1: Introduction to Physical AI\n\n...(stale personalized markdown)...",
  "cached": true,
  "generating": true,
  "profile": {
    "experience_level": "intermediate",
    "hardware": "gpu-workstation"
  }
}
```

---

### Error Responses

- `401 Unauthorized` — Missing or expired session
  ```json
  { "detail": "Authentication required" }
  ```
- `404 Not Found` — Chapter slug does not correspond to an existing chapter file
  ```json
  { "detail": "Chapter not found: module-99/ch99-unknown" }
  ```
- `503 Service Unavailable` — Database unavailable
  ```json
  { "detail": "Personalization service unavailable" }
  ```

---

## GET /personalize/{chapter_slug:path}/status

Check whether a personalized version has been generated for the current user and chapter.
Allows the frontend to poll after a cache miss without re-fetching the full content.

**Response** `200 OK`:
```json
{
  "ready": true,
  "cached": true,
  "profile_hash": "a1b2c3d4..."
}
```

Or if still generating:
```json
{
  "ready": false,
  "cached": false,
  "profile_hash": null
}
```

---

## Notes

- The `chapter_slug` must match the path used by Docusaurus (i.e., the file path relative to `book-site/docs/`, without `.md` extension).
- Generation time varies: typically 5–20 seconds for a full chapter. Clients should treat `generating: true` as a signal to retry after 15–30 seconds.
- The `profile` field in responses reflects the profile used for the cached version (or the current profile if generating).
