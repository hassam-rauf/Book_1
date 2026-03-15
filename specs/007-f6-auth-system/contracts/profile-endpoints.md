# API Contract: Profile Endpoints (FastAPI)

**Service**: `backend` (FastAPI)
**Base URL**: `http://localhost:8000` (dev)
**Authentication**: Session cookie `better-auth.session_token` validated via `session` table lookup

---

## GET /profile

Return the current user's profile.

**Request**: No body. Authenticated via session cookie.

**Success response** `200 OK`:
```json
{
  "user_id": "usr_abc123",
  "experience_level": "beginner",
  "programming_background": "Python basics, some web development",
  "hardware": "laptop-only",
  "preferred_language": "en",
  "updated_at": "2026-03-15T12:00:00Z"
}
```

**Error responses**:
- `401 Unauthorized` — Missing or expired session cookie
  ```json
  { "detail": "Authentication required" }
  ```
- `404 Not Found` — Profile not yet created (edge case: session exists but profile insert failed)
  ```json
  { "detail": "Profile not found" }
  ```

---

## PUT /profile

Update the current user's profile fields.

**Request body** (all fields optional — only provided fields are updated):
```json
{
  "experience_level": "intermediate",
  "programming_background": "Python, ROS 2 basics",
  "hardware": "gpu-workstation",
  "preferred_language": "ur"
}
```

**Validation**:
- `experience_level`: MUST be one of `beginner`, `intermediate`, `advanced`
- `programming_background`: max 200 characters
- `hardware`: MUST be one of `laptop-only`, `gpu-workstation`, `jetson-kit`, `robot`
- `preferred_language`: MUST be one of `en`, `ur`

**Success response** `200 OK`:
```json
{
  "user_id": "usr_abc123",
  "experience_level": "intermediate",
  "programming_background": "Python, ROS 2 basics",
  "hardware": "gpu-workstation",
  "preferred_language": "ur",
  "updated_at": "2026-03-15T13:00:00Z"
}
```

**Error responses**:
- `401 Unauthorized` — Missing or expired session
- `422 Unprocessable Entity` — Validation error
  ```json
  {
    "detail": [
      {
        "field": "experience_level",
        "message": "Must be one of: beginner, intermediate, advanced"
      }
    ]
  }
  ```
