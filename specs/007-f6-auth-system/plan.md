# Implementation Plan: Auth System

**Branch**: `007-f6-auth-system` | **Date**: 2026-03-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-f6-auth-system/spec.md`

## Summary

Add session-based authentication (sign-up, sign-in, profile management, sign-out) to the Physical AI textbook. Because better-auth is TypeScript-only, the implementation uses a **Node.js/Hono sidecar** (`auth-service/`) that owns all `/api/auth/*` routes via better-auth, while the existing FastAPI backend validates sessions by querying the shared Neon Postgres `session` table. The Docusaurus frontend uses the better-auth React client for all auth interactions.

## Technical Context

**Language/Version**: TypeScript (Node.js 20 — auth-service), Python 3.11 (FastAPI — session validation only), TypeScript/React (Docusaurus frontend)
**Primary Dependencies**: better-auth 1.x, Hono (auth-service HTTP layer), @neondatabase/serverless (WebSocket pool — required for transactions), drizzle-orm (better-auth DB adapter), better-auth/react (frontend client)
**Storage**: Neon Postgres (shared — `user`, `session`, `account` tables created by better-auth; `user_profile` table added custom)
**Testing**: Vitest (auth-service unit tests), pytest (FastAPI session-validation middleware tests), manual E2E via quickstart scenarios
**Target Platform**: Node.js 20 server (auth-service), Linux/WSL (existing FastAPI), GitHub Pages (Docusaurus static)
**Project Type**: Web application with sidecar service — auth-service + FastAPI + Docusaurus
**Performance Goals**: Sign-in round trip < 500ms; profile retrieval < 200ms; session validation on FastAPI routes < 50ms (DB lookup)
**Constraints**: better-auth is TS-only (constitution mandate); Neon Postgres free tier (pool connections carefully); no SSR in Docusaurus; CORS must allow Docusaurus origin + FastAPI origin
**Scale/Scope**: Hackathon demo scale — tens of concurrent users; Neon free tier (0.5 GB storage, 10 GB transfer)

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | Spec + checklist complete; plan follows pipeline |
| II. Smallest Viable Diff | ✅ PASS | Auth-service is new; FastAPI changes minimal (session validation middleware only) |
| III. Content Accuracy First | ✅ PASS | No book content changes in this feature |
| IV. Provider-Agnostic Service Layer | ✅ PASS | Session validation in FastAPI is DB-level, not better-auth SDK |
| V. Free-Tier Resilient | ✅ PASS | Neon Postgres free tier; WebSocket pool (required by better-auth/neon); connection pool size ≤ 5 |
| VI. Security by Default | ✅ PASS | Passwords hashed via scrypt (better-auth default); sessions in DB; HTTP-only cookies; CORS restricted to known origins; all secrets via `.env` |
| VII. Subagent Reusability | ✅ PASS | No subagent changes; auth-service is a new independent service |

**No violations. Gate PASSED.**

## Complexity Tracking

| Addition | Why Needed | Simpler Alternative Rejected Because |
|----------|------------|--------------------------------------|
| Node.js auth-service (4th project) | better-auth is TS-only — constitution mandates better-auth for bonus points | Python-only auth would forfeit the +50 bonus pts; reimplementing better-auth in Python is more complex than a thin Hono sidecar |

## Project Structure

### Documentation (this feature)

```text
specs/007-f6-auth-system/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/           ← Phase 1 output
│   ├── auth-endpoints.md
│   └── profile-endpoints.md
└── tasks.md             ← Phase 2 output (/sp.tasks)
```

### Source Code Layout

```text
auth-service/                    ← NEW: Node.js/Hono better-auth sidecar
├── src/
│   ├── index.ts                 ← Hono app entrypoint; mounts auth.handler at /api/auth/*
│   ├── auth.ts                  ← better-auth config (DB adapter, session, custom user_profile)
│   └── db/
│       ├── client.ts            ← Neon WebSocket Pool + drizzle client
│       └── schema.ts            ← Drizzle schema (better-auth tables + user_profile)
├── package.json
├── tsconfig.json
└── .env                         ← DATABASE_URL, BETTER_AUTH_SECRET, ALLOWED_ORIGINS

backend/
├── app/
│   ├── middleware/
│   │   └── auth.py              ← NEW: session validation middleware (reads session table via Neon)
│   └── routes/
│       └── profile.py           ← NEW: GET/PUT /profile endpoints (FastAPI, session-protected)
└── tests/
    └── test_auth_middleware.py  ← NEW: pytest tests for session validation

book-site/src/
├── components/
│   └── Auth/
│       ├── AuthProvider.tsx      ← NEW: better-auth React client + useSession hook wrapper
│       ├── LoginForm.tsx         ← NEW: email/password login form
│       ├── SignupForm.tsx        ← NEW: email/password + profile fields form
│       └── ProfileForm.tsx       ← NEW: view/edit profile fields
├── pages/
│   ├── login.tsx                ← NEW: Docusaurus custom page
│   ├── signup.tsx               ← NEW: Docusaurus custom page
│   └── profile.tsx              ← NEW: Docusaurus custom page (protected)
└── theme/
    └── Root.tsx                 ← UPDATED: wrap with AuthProvider
```

## Architecture Decisions

### Decision 1: Node.js Hono Sidecar for better-auth
**Decision**: Run a standalone Node.js/Hono service (`auth-service/`) that handles all `/api/auth/*` routes.
**Rationale**: better-auth has no Python SDK. The sidecar pattern is the officially recommended way to use better-auth with non-Node backends. The sidecar shares the same Neon Postgres instance so FastAPI can read the `session` table directly.
**Alternative rejected**: Custom Python auth (passlib + itsdangerous) — loses better-auth, forfeits +50 pts bonus.

### Decision 2: FastAPI Reads Session Table Directly
**Decision**: FastAPI validates sessions by querying `SELECT * FROM session WHERE token = $1 AND expires_at > NOW()` using the existing asyncpg/SQLAlchemy Neon connection.
**Rationale**: No inter-service HTTP calls needed for session validation. The session table is in the same Neon DB FastAPI already connects to for RAG metadata. Latency target (< 50ms) is achievable with a single indexed DB lookup.
**Alternative rejected**: FastAPI calling auth-service `/api/auth/get-session` on every request — adds ~100ms network overhead per protected request.

### Decision 3: User Profile as Custom Table
**Decision**: Add a `user_profile` table (not a better-auth built-in) linked to the `user` table by `user_id`. Managed by Drizzle schema alongside better-auth tables.
**Rationale**: better-auth's `user` table has limited extensible fields. Keeping profile data separate makes it easier for F7 (personaliser) and F8 (translator) to read without touching auth tables.
**Alternative rejected**: Extending the better-auth `user` table via `additionalFields` — couples profile schema to auth library upgrades.

### Decision 4: Neon WebSocket Pool (Not HTTP Driver)
**Decision**: Use `@neondatabase/serverless` with `Pool` (WebSocket mode), not the HTTP driver.
**Rationale**: better-auth requires database transactions for user creation. The Neon HTTP driver does not support transactions (confirmed bug). WebSocket pool supports transactions natively.
**Alternative rejected**: neon-http driver — causes `unable_to_create_user` error on sign-up.

### Decision 5: better-auth React Client in Docusaurus
**Decision**: Install `better-auth/react` in `book-site/` and configure with `baseURL` pointing to the auth-service.
**Rationale**: The React client handles cookie management, session refresh, and provides `useSession()` hook — all client-side compatible with Docusaurus SSG. No server-side rendering needed.
**Alternative rejected**: Raw fetch calls — requires reimplementing cookie handling, CSRF protection, and session refresh logic.

## Interface Contracts (Summary)

### Auth Service → Frontend

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/sign-up/email` | POST | None | Create account + start session |
| `/api/auth/sign-in/email` | POST | None | Authenticate + start session |
| `/api/auth/sign-out` | POST | Cookie | Invalidate session |
| `/api/auth/get-session` | GET | Cookie | Return current session + user |

### FastAPI → Frontend (new routes)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `GET /profile` | GET | Session cookie | Return UserProfile for current user |
| `PUT /profile` | PUT | Session cookie | Update UserProfile fields |

Full contracts in `/contracts/`.
