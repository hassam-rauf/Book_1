# Research: Auth System (F6)

**Feature**: 007-f6-auth-system
**Date**: 2026-03-15

## R-001: better-auth Python/FastAPI Support

**Decision**: Use a Node.js/Hono sidecar for better-auth; FastAPI validates sessions via direct DB query.

**Rationale**: better-auth is TypeScript-only. No Python or FastAPI SDK exists. The only officially documented pattern for non-Node backends is a sidecar that shares the same database. FastAPI can validate sessions by querying the `session` table directly using the cookie token — no inter-service calls needed per request.

**Alternatives considered**:
- Custom Python auth (passlib + itsdangerous) — rejected: forfeits better-auth requirement and +50 bonus pts.
- FastAPI calling auth-service on every request — rejected: ~100ms overhead per protected route.

**Source**: better-auth docs (https://www.better-auth.com/docs), GitHub issues #4747, #6646.

---

## R-002: better-auth Database Schema

**Decision**: better-auth creates 4 tables: `user`, `session`, `account`, `verification`. Add a custom `user_profile` table.

**Rationale**: better-auth's built-in `user` table covers only identity fields. Profile data (experience level, hardware, language) belongs in a separate table to avoid coupling to auth library schema changes and to make F7/F8 profile reads clean.

**Schema**:

```sql
-- Created by better-auth (via Drizzle migration)
user (id, name, email, email_verified, image, created_at, updated_at)
session (id, user_id FK, token, expires_at, ip_address, user_agent, created_at, updated_at)
account (id, user_id FK, provider_id, access_token, refresh_token, password, created_at, updated_at)
verification (id, identifier, value, expires_at, created_at, updated_at)

-- Custom table
user_profile (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  experience_level  TEXT NOT NULL CHECK (experience_level IN ('beginner','intermediate','advanced')),
  programming_background  TEXT NOT NULL DEFAULT '',
  hardware    TEXT NOT NULL CHECK (hardware IN ('laptop-only','gpu-workstation','jetson-kit','robot')),
  preferred_language  TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en','ur')),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

---

## R-003: Neon Postgres — WebSocket Pool Requirement

**Decision**: Use `@neondatabase/serverless` with `Pool` (WebSocket mode), not the HTTP driver.

**Rationale**: better-auth requires database transactions during `sign-up` (user creation is atomic — inserts to `user` + `account` + `session`). The Neon HTTP driver does not support transactions. Using the HTTP driver causes `unable_to_create_user` errors (confirmed bug in better-auth GitHub issue #4747, fixed by switching to WebSocket pool).

**Connection config**:
```typescript
import { Pool } from "@neondatabase/serverless";
import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
neonConfig.webSocketConstructor = ws; // Required in Node.js (not browser)
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

**Free-tier constraint**: Neon free tier supports up to 10 concurrent connections. Set `max: 5` on the pool to leave headroom for FastAPI.

---

## R-004: better-auth Session Mechanism

**Decision**: HTTP-only cookie (`better-auth.session_token`) backed by the `session` table. 7-day expiry.

**Rationale**: Cookie-based sessions are CSRF-resistant (same-site: Lax) and work seamlessly with the better-auth React client. The session token is a random 32-byte hex string stored in the DB; not a JWT (no payload to decode).

**FastAPI validation pattern**:
```python
async def get_current_user(request: Request, db: AsyncSession) -> dict:
    token = request.cookies.get("better-auth.session_token")
    if not token:
        raise HTTPException(401)
    session = await db.execute(
        select(Session).where(Session.token == token, Session.expires_at > func.now())
    )
    row = session.scalar_one_or_none()
    if not row:
        raise HTTPException(401)
    return {"user_id": row.user_id}
```

---

## R-005: better-auth React Client in Docusaurus

**Decision**: Install `better-auth/react` in `book-site/`; configure with `baseURL` pointing to auth-service.

**Rationale**: The React client handles cookie transport, CSRF headers, and `useSession()` hook — all SSG/CSR compatible. `useSession()` makes a single `GET /api/auth/get-session` request on mount; result is cached in React context. This satisfies SC-006 (profile available < 500ms of login).

**CORS requirement**: Auth-service must set `Access-Control-Allow-Origin: https://hassam-rauf.github.io` (and `http://localhost:3000` for dev) with `Access-Control-Allow-Credentials: true`.

**Client setup**:
```typescript
// book-site/src/components/Auth/AuthProvider.tsx
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: process.env.AUTH_SERVICE_URL ?? "http://localhost:3001",
});
```

---

## R-006: Password Hashing

**Decision**: Use better-auth's default scrypt hashing (Node.js native crypto).

**Rationale**: scrypt is OWASP-recommended when argon2id is unavailable. It is natively supported by Node.js crypto module — no additional dependency. Passwords never stored in plaintext; the `password` field in the `account` table holds the hash.

**No action needed**: better-auth handles this automatically.

---

## R-007: Profile Creation Flow

**Decision**: Insert into `user_profile` immediately after `sign-up` completes, in the same Hono request handler using an `onSignUp` hook (or after the better-auth response).

**Rationale**: Sign-up form collects profile fields alongside email/password. The profile must exist before F7/F8 attempt to read it. A better-auth `after:signUp` hook or a Hono middleware that intercepts the `sign-up/email` response and inserts the profile row is the cleanest approach.

**Implementation**: Use better-auth's `hooks.after` option:
```typescript
export const auth = betterAuth({
  // ...
  hooks: {
    after: [
      {
        matcher: (context) => context.path === "/sign-up/email",
        handler: async (context) => {
          const userId = context.context.newSession?.userId;
          if (userId) {
            await db.insert(userProfileTable).values({
              user_id: userId,
              experience_level: context.body?.experienceLevel ?? "beginner",
              programming_background: context.body?.programmingBackground ?? "",
              hardware: context.body?.hardware ?? "laptop-only",
              preferred_language: context.body?.preferredLanguage ?? "en",
            });
          }
        },
      },
    ],
  },
});
```
