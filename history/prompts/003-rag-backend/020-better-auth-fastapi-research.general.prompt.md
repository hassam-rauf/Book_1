---
id: "020"
title: "better-auth FastAPI integration research"
stage: general
date: 2026-03-15
surface: agent
model: claude-sonnet-4-6
feature: 003-rag-backend
branch: 003-rag-backend
user: hassam_rauf
command: research better-auth FastAPI integration
labels: ["better-auth","fastapi","auth","session","neon","research"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - history/prompts/003-rag-backend/020-better-auth-fastapi-research.general.prompt.md
tests:
  - none
---

## Prompt

Research better-auth integration with FastAPI for a session-based auth system. I need to know:

1. Does better-auth have a Python/FastAPI SDK or is it JS-only? What is the correct integration pattern for a FastAPI backend?
2. What is the standard session storage approach (cookie-based vs token-based) with better-auth?
3. How does better-auth handle password hashing? What algorithm does it use?
4. What database schema does better-auth require (table names, columns) for users and sessions?
5. What are the standard REST endpoints better-auth exposes: sign-up, sign-in, sign-out, get-session?
6. How does a Docusaurus (SSG, client-side only) frontend consume better-auth sessions — does it use the better-auth JS client or raw fetch calls?
7. Are there known issues combining better-auth with Neon Postgres (serverless Postgres)?

## Response snapshot

**Q1 — Python/FastAPI SDK:**
better-auth is TypeScript-only. No Python or FastAPI SDK exists. The official supported backends are Node.js frameworks (Express, Fastify, Hono, NestJS, Elysia, Nitro) and meta-frameworks (Next.js, Nuxt, SvelteKit, Astro, etc.). There is no JS-to-Python bridge or adapter.

**Correct integration pattern for FastAPI:** There are two viable approaches:
- **Sidecar pattern (recommended):** Run a Node.js better-auth server alongside FastAPI. FastAPI delegates session validation to the Node server by forwarding the session cookie, or FastAPI reads/queries the shared Postgres sessions table directly.
- **Manual reimplementation:** Implement the same DB schema and session-cookie logic in Python. This is complex and defeats the purpose of using better-auth.
- **Proxy pattern:** Mount better-auth on a thin Node.js/Hono server that handles only auth routes (`/api/auth/*`). FastAPI serves all other routes. The frontend calls both; FastAPI validates sessions by querying the shared `session` table.

The auth handler universal pattern (from Hono docs): `app.on(["POST","GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))`. FastAPI cannot use this handler directly.

**Q2 — Session storage:**
Default is **cookie-based with database backing**. The session token is stored in a cookie; the database `session` table holds the full record. Cookie name is `better-auth.session_token` by default.

Optional enhancements available:
- **Cookie caching:** Encrypted signed cookie stores session data to reduce DB round-trips; configurable refresh interval.
- **Stateless sessions:** Full session payload in encrypted cookie, zero DB reads.
- **Secondary storage (Redis):** Session offloaded to Redis/KV store.

**Q3 — Password hashing:**
Uses **scrypt** (Node.js native). Rationale from docs: scrypt is natively supported by Node.js; OWASP recommends it when argon2id is unavailable. Developers can override with custom `hash`/`verify` functions to use argon2 instead.

**Q4 — Database schema:**

| Table | Key columns |
|-------|------------|
| `user` | `id`, `name`, `email`, `emailVerified`, `image`, `createdAt`, `updatedAt` |
| `session` | `id`, `userId` (FK), `token`, `expiresAt`, `ipAddress`, `userAgent`, `createdAt`, `updatedAt` |
| `account` | `userId`, `providerId`, `accessToken`, `refreshToken`, `password` |
| `verification` | `identifier`, `value`, `expiresAt` |

Table and column names are customizable via `modelName` and `fields` in auth config. TypeScript type inference still uses original names internally.

**Q5 — Standard REST endpoints (all prefixed with `/api/auth` by default):**

| Action | Method | Path |
|--------|--------|------|
| Sign up | POST | `/api/auth/sign-up/email` |
| Sign in | POST | `/api/auth/sign-in/email` |
| Sign out | POST | `/api/auth/sign-out` |
| Get session | GET | `/api/auth/get-session` |

The base path `/api/auth` is configurable. All endpoints are handled by the single `auth.handler()` mounted at `/api/auth/*`.

**Q6 — Docusaurus (CSR) consuming better-auth:**
Use the **better-auth JS client** (`better-auth/react` or framework-agnostic `better-auth/client`). Configure it with `baseURL` pointing to the auth server:

```typescript
import { createAuthClient } from "better-auth/react";
const authClient = createAuthClient({
  baseURL: "https://your-auth-server.com"
});
// Then use:
authClient.signIn.email({ email, password });
authClient.signUp.email({ email, password, name });
authClient.signOut();
const { data: session } = authClient.useSession(); // React hook
```

The client handles cookies automatically via browser fetch. For a pure static site (no SSR), `useSession()` React hook works client-side. Raw fetch calls to `/api/auth/get-session` also work but you lose type safety and the session hook.

**Q7 — Neon Postgres known issues:**

Several GitHub issues were found (most now closed/fixed):
- **No transaction support in neon-http driver** (Issue #4747): The Neon HTTP driver does not support transactions. Error: `Error: No transactions support in neon-http driver - unable_to_create_user`. **Resolution:** Use `@neondatabase/serverless` with WebSocket mode (not HTTP) which supports transactions, OR use standard `postgres` driver via connection pooling (PgBouncer). Fixed in later versions.
- **Array inserts breaking with neon pg + kysely** (PR #6646): Fixed December 2025.
- **CLI failing to generate Drizzle schema with Postgres** (Issue #4305): Fixed.
- **`supportsDates` option for string timestamps** (PR #4298): Still open as of research date — Neon returns timestamps as strings, not Date objects. Set `useDates: false` or handle with adapter option.

**Recommended Neon config** (Drizzle adapter):
```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Pool } from "@neondatabase/serverless";
// Use WebSocket pool (supports transactions) NOT neon-http
const db = drizzle(new Pool({ connectionString: process.env.DATABASE_URL }));

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
});
```

## Outcome

- Impact: Full research findings on better-auth + FastAPI integration patterns, session mechanics, schema, endpoints, JS client usage, and Neon compatibility.
- Tests: none
- Files: PHR created
- Next prompts: Use findings to decide auth architecture — Node.js sidecar vs custom Python session validation
- Reflection: better-auth is JS/TS-only; FastAPI requires a sidecar or proxy pattern. The Neon HTTP driver transaction issue is the most critical gotcha to avoid.

## Evaluation notes (flywheel)

- Failure modes observed: Several better-auth docs pages returned 404 (integrations/docusaurus, adapters/neon, concepts/security); relied on related pages and GitHub issues.
- Graders run and results: N/A (research task)
- Prompt variant: none
- Next experiment: Test Node.js sidecar + FastAPI proxy pattern in a minimal scaffold
