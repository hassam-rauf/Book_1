# Data Model: Auth System (F6)

**Feature**: 007-f6-auth-system
**Date**: 2026-03-15

---

## Database Tables

### `user` (managed by better-auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | better-auth UUID |
| `name` | TEXT | NOT NULL | Display name (from sign-up) |
| `email` | TEXT | NOT NULL, UNIQUE | Login email |
| `email_verified` | BOOLEAN | NOT NULL DEFAULT false | Email verification flag |
| `image` | TEXT | NULL | Avatar URL (optional) |
| `created_at` | TIMESTAMPTZ | NOT NULL | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp |

---

### `session` (managed by better-auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | Session UUID |
| `user_id` | TEXT | FK → user.id, NOT NULL | Owning user |
| `token` | TEXT | NOT NULL, UNIQUE | 32-byte hex session token (stored in cookie) |
| `expires_at` | TIMESTAMPTZ | NOT NULL | Session expiry (7 days from creation) |
| `ip_address` | TEXT | NULL | Client IP for audit |
| `user_agent` | TEXT | NULL | Browser/client string |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

**Index**: `session(token)` — used by FastAPI middleware on every authenticated request.

---

### `account` (managed by better-auth)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PK | |
| `user_id` | TEXT | FK → user.id, NOT NULL | Owning user |
| `provider_id` | TEXT | NOT NULL | `"credential"` for email/password |
| `access_token` | TEXT | NULL | OAuth tokens (not used) |
| `refresh_token` | TEXT | NULL | OAuth tokens (not used) |
| `password` | TEXT | NULL | scrypt hash of user's password |
| `created_at` | TIMESTAMPTZ | NOT NULL | |
| `updated_at` | TIMESTAMPTZ | NOT NULL | |

---

### `user_profile` (custom — F6 addition)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK DEFAULT gen_random_uuid() | Profile UUID |
| `user_id` | TEXT | FK → user.id, NOT NULL, UNIQUE | One profile per user |
| `experience_level` | TEXT | NOT NULL, CHECK IN ('beginner','intermediate','advanced') | Reader's self-assessed level |
| `programming_background` | TEXT | NOT NULL DEFAULT '' | Free-text description (max 200 chars) |
| `hardware` | TEXT | NOT NULL, CHECK IN ('laptop-only','gpu-workstation','jetson-kit','robot') | Available hardware |
| `preferred_language` | TEXT | NOT NULL DEFAULT 'en', CHECK IN ('en','ur') | Display language |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | Last profile update |

**Relationship**: `user_profile.user_id` → `user.id` (CASCADE DELETE)

---

### `verification` (managed by better-auth — unused in F6)

Created by better-auth migrations but not actively used since email verification is out of scope.

---

## Entity Relationships

```
user (1) ────── (1) user_profile
  │
  └── (1) ─── (*) session
  │
  └── (1) ─── (*) account
```

---

## Validation Rules

### UserProfile field validation

| Field | Rule | Error message |
|-------|------|---------------|
| `experience_level` | MUST be one of: beginner, intermediate, advanced | "Please select an experience level" |
| `programming_background` | Optional; max 200 characters | "Programming background must be under 200 characters" |
| `hardware` | MUST be one of: laptop-only, gpu-workstation, jetson-kit, robot | "Please select your hardware setup" |
| `preferred_language` | MUST be one of: en, ur | "Please select a language" |

### User (auth) validation

| Field | Rule | Error message |
|-------|------|---------------|
| `email` | Valid email format | "Please enter a valid email address" |
| `password` | Minimum 8 characters | "Password must be at least 8 characters" |
| `name` | Required, 1–100 characters | "Please enter your name" |

---

## State Transitions

### Session lifecycle

```
[no session] --sign-in/sign-up--> [active session] --expires/sign-out--> [no session]
                                       │
                                       └──── session.expires_at > NOW() → valid
                                       └──── session.expires_at ≤ NOW() → expired (redirect to login)
```

### UserProfile lifecycle

```
[sign-up complete] --after:signUp hook--> [profile created with defaults]
                                               │
                                        [PUT /profile] → [profile updated]
```
