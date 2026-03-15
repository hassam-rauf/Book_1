# API Contract: Auth Endpoints (better-auth sidecar)

**Service**: `auth-service` (Node.js/Hono)
**Base URL**: `http://localhost:3001` (dev) / `https://auth.yourdomain.com` (prod)
**All endpoints under**: `/api/auth/`

---

## POST /api/auth/sign-up/email

Register a new user account.

**Request body**:
```json
{
  "email": "student@example.com",
  "password": "securepassword",
  "name": "Jane Smith",
  "experienceLevel": "beginner",
  "programmingBackground": "Python basics, some web development",
  "hardware": "laptop-only",
  "preferredLanguage": "en"
}
```

**Success response** `200 OK`:
```json
{
  "token": "abc123...",
  "user": {
    "id": "usr_abc123",
    "email": "student@example.com",
    "name": "Jane Smith"
  }
}
```
Sets `Set-Cookie: better-auth.session_token=<token>; HttpOnly; SameSite=Lax; Path=/`

**Error responses**:
- `422` — Validation error (invalid email, password too short, missing required fields)
  ```json
  { "code": "VALIDATION_ERROR", "message": "Password must be at least 8 characters" }
  ```
- `409` — Email already registered
  ```json
  { "code": "USER_ALREADY_EXISTS", "message": "Email already in use" }
  ```

---

## POST /api/auth/sign-in/email

Authenticate an existing user.

**Request body**:
```json
{
  "email": "student@example.com",
  "password": "securepassword"
}
```

**Success response** `200 OK`:
```json
{
  "token": "xyz789...",
  "user": {
    "id": "usr_abc123",
    "email": "student@example.com",
    "name": "Jane Smith"
  }
}
```
Sets session cookie (same as sign-up).

**Error responses**:
- `401` — Invalid credentials
  ```json
  { "code": "INVALID_EMAIL_OR_PASSWORD", "message": "Invalid email or password" }
  ```

---

## POST /api/auth/sign-out

Invalidate the current session.

**Request**: No body. Session identified by `better-auth.session_token` cookie.

**Success response** `200 OK`:
```json
{ "success": true }
```
Clears `better-auth.session_token` cookie.

**Error responses**:
- `401` — No active session
  ```json
  { "code": "UNAUTHORIZED", "message": "No active session" }
  ```

---

## GET /api/auth/get-session

Return the current session and user object.

**Request**: No body. Session identified by cookie.

**Success response** `200 OK`:
```json
{
  "session": {
    "id": "sess_xyz",
    "userId": "usr_abc123",
    "expiresAt": "2026-03-22T15:00:00Z"
  },
  "user": {
    "id": "usr_abc123",
    "email": "student@example.com",
    "name": "Jane Smith"
  }
}
```

**Response when not authenticated** `200 OK`:
```json
null
```
(better-auth returns null, not 401, for unauthenticated get-session)
