# Tasks: Auth System (F6)

**Input**: Design documents from `/specs/007-f6-auth-system/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story (US1–US4), preceded by Setup and Foundational phases.

**Key architectural constraint**: better-auth is TypeScript-only → Node.js/Hono sidecar (`auth-service/`) owns `/api/auth/*`; FastAPI validates sessions by querying `session` table directly.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

**Purpose**: Scaffold the auth-service project and install dependencies.

- [x] T001 Create `auth-service/` directory with `package.json` (name: auth-service, type: module) and install dependencies: `better-auth`, `hono`, `@hono/node-server`, `@neondatabase/serverless`, `drizzle-orm`, `ws`, `dotenv` in `auth-service/package.json`
- [x] T002 Create `auth-service/tsconfig.json` with Node.js 20 ESM settings (target: ES2022, module: NodeNext, moduleResolution: NodeNext, strict: true)
- [x] T003 [P] Create `auth-service/.env.example` documenting: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, ALLOWED_ORIGINS
- [x] T004 [P] Add `auth-service/` to root `.gitignore` `node_modules` entry; add `auth-service/.env` to `.gitignore`
- [x] T005 Install `better-auth/react` in `book-site/`: run `npm install better-auth` in `book-site/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database connection, better-auth config, and DB schema — must be complete before any user story can be built.

**⚠️ CRITICAL**: All story phases depend on this phase. Use WebSocket Pool (NOT Neon HTTP driver) — HTTP driver lacks transaction support.

- [x] T006 Create `auth-service/src/db/client.ts` — Neon WebSocket Pool setup using `@neondatabase/serverless` with `Pool` and `neonConfig.webSocketConstructor = ws`; export `db` (drizzle instance) and `pool`
- [x] T007 Create `auth-service/src/db/schema.ts` — Drizzle schema with better-auth's 4 tables (`user`, `session`, `account`, `verification`) plus custom `user_profile` table per data-model.md
- [x] T008 Create `auth-service/src/auth.ts` — better-auth config: `betterAuth({ database: drizzleAdapter(db, { provider: "pg" }), emailAndPassword: { enabled: true, minPasswordLength: 8 }, trustedOrigins: [...ALLOWED_ORIGINS] })` with `after:signUp` hook that inserts into `user_profile` using profile fields from `context.body`
- [x] T009 Run drizzle migration to create all tables in Neon: generate migration from schema and push to Neon (`drizzle-kit push` or `drizzle-kit generate` + `migrate`)
- [x] T010 [P] Add `AsyncSession` + `session` table model to `backend/app/middleware/auth.py` — SQLAlchemy model mirroring the `session` table (id, user_id, token, expires_at); export `get_current_user` dependency that reads `better-auth.session_token` cookie and queries Neon

**Checkpoint**: DB tables exist in Neon, better-auth initialised, FastAPI session middleware ready.

---

## Phase 3: User Story 1 — Sign Up and Create Profile (Priority: P1) 🎯 MVP

**Goal**: Student can register with email + password + profile fields; profile is stored; session cookie is set.

**Independent Test**: POST to `/api/auth/sign-up/email` with valid payload → `200 OK`, session cookie set, `user_profile` row exists in Neon.

- [x] T011 [US1] Create `auth-service/src/index.ts` — Hono app that mounts `auth.handler` at `/api/auth/*` (GET and POST), starts on PORT from env (default 3001), sets CORS headers for ALLOWED_ORIGINS with `credentials: true`
- [x] T012 [US1] Verify `auth-service/src/auth.ts` `after:signUp` hook correctly reads custom profile fields (`experienceLevel`, `programmingBackground`, `hardware`, `preferredLanguage`) from `context.body` and inserts into `user_profile` table
- [x] T013 [US1] Create `book-site/src/components/Auth/AuthProvider.tsx` — `createAuthClient({ baseURL: AUTH_SERVICE_URL })` export; wrap with React context so `useSession()` is accessible throughout the app
- [x] T014 [US1] Create `book-site/src/components/Auth/SignupForm.tsx` — controlled form with fields: email, password (min 8 chars), name, experienceLevel (select), programmingBackground (textarea), hardware (select), preferredLanguage (select); calls `authClient.signUp.email(...)` on submit; shows error messages from response
- [x] T015 [US1] Create `book-site/src/pages/signup.tsx` — Docusaurus custom page rendering `<SignupForm />`; redirects to `/` on success
- [x] T016 [US1] Update `book-site/src/theme/Root.tsx` to wrap children with `<AuthProvider>` so session is available app-wide

**Checkpoint**: Navigate to `/signup`, fill form, submit → account created, session cookie set, redirected to home.

---

## Phase 4: User Story 2 — Log In and Restore Session (Priority: P1)

**Goal**: Returning student can log in with email + password; session restored on page reload.

**Independent Test**: POST to `/api/auth/sign-in/email` with correct credentials → `200 OK`, session cookie set; GET `/api/auth/get-session` with cookie → returns user object.

- [x] T017 [US2] Create `book-site/src/components/Auth/LoginForm.tsx` — controlled form with email and password fields; calls `authClient.signIn.email(...)` on submit; shows "Invalid email or password" on 401; redirects to home (or `?redirect=` param) on success
- [x] T018 [US2] Create `book-site/src/pages/login.tsx` — Docusaurus custom page rendering `<LoginForm />`; reads `?redirect=` query param and passes target URL to form for post-login redirect
- [x] T019 [US2] Add login/signup links to Docusaurus navbar in `book-site/docusaurus.config.js` — add "Log In" and "Sign Up" items to `navbar.items`; conditionally show "Log Out" + username when session exists (via a custom navbar component)
- [x] T020 [US2] Create `book-site/src/components/Auth/NavbarAuth.tsx` — reads `useSession()` from AuthProvider; shows "Log In" / "Sign Up" links when unauthenticated; shows username + "Log Out" button when authenticated

**Checkpoint**: Navigate to `/login`, enter credentials → session restored; refresh page → still logged in.

---

## Phase 5: User Story 3 — View and Edit Profile (Priority: P2)

**Goal**: Logged-in student can view and update all 4 profile fields; changes persist.

**Independent Test**: GET `http://localhost:8000/profile` with session cookie → returns all 4 fields; PUT with updated value → `200 OK`; re-GET confirms change.

- [x] T021 [US3] Create `backend/app/middleware/auth.py` — `get_current_user` FastAPI dependency: reads `better-auth.session_token` cookie, queries `SELECT user_id FROM session WHERE token=$1 AND expires_at > NOW()`, raises `HTTPException(401)` if missing/expired
- [x] T022 [US3] Create `backend/app/routes/profile.py` — `GET /profile` endpoint (depends on `get_current_user`): queries `user_profile` table by `user_id`, returns `UserProfileResponse` schema; `PUT /profile` endpoint: validates body against `UserProfileUpdate` schema, updates `user_profile`, returns updated record
- [x] T023 [US3] Create Pydantic schemas in `backend/app/routes/profile.py`: `UserProfileResponse` and `UserProfileUpdate` with field validation (experience_level enum, hardware enum, preferred_language enum, programming_background max 200 chars)
- [x] T024 [US3] Register profile router in `backend/app/main.py`: `app.include_router(profile_router, prefix="")`
- [x] T025 [US3] Create `book-site/src/components/Auth/ProfileForm.tsx` — controlled form pre-populated via `GET /profile`; all 4 editable fields; calls `PUT /profile` on save; shows "Profile updated" success message; shows validation errors inline
- [x] T026 [US3] Create `book-site/src/pages/profile.tsx` — Docusaurus custom page rendering `<ProfileForm />`; redirects to `/login?redirect=/profile` if `useSession()` returns null

**Checkpoint**: Navigate to `/profile` while logged in → form pre-populated; change a field → save → re-open page confirms change.

---

## Phase 6: User Story 4 — Log Out (Priority: P2)

**Goal**: Logged-in student can invalidate their session; protected pages become inaccessible.

**Independent Test**: POST `/api/auth/sign-out` with cookie → `200 OK`, cookie cleared; subsequent GET `/profile` → `401`.

- [x] T027 [US4] Add `handleSignOut` in `book-site/src/components/Auth/NavbarAuth.tsx` — calls `authClient.signOut()`; clears local session state; redirects to home page on success
- [x] T028 [US4] Verify `book-site/src/pages/profile.tsx` redirect logic (from T026) correctly handles post-logout navigation — if user navigates back via browser history after logout, `useSession()` returns null and redirect fires

**Checkpoint**: Click "Log Out" in navbar → redirected to home; navigate to `/profile` → redirected to `/login`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: CORS, error boundaries, env vars, `.gitignore`, startup docs.

- [x] T029 [P] Configure CORS on `auth-service/src/index.ts` — verify `Access-Control-Allow-Origin` matches both `http://localhost:3000` (Docusaurus dev) and `https://hassam-rauf.github.io`; verify `Access-Control-Allow-Credentials: true`
- [x] T030 [P] Configure CORS on FastAPI `backend/app/main.py` — add `http://localhost:3001` (auth-service) and verify profile endpoint allows credentials from Docusaurus origins
- [x] T031 [P] Add `auth-service` npm start script to root `package.json` (or create root `Makefile`) for running all services together
- [x] T032 Add `auth-service/` build/start instructions to `backend/README.md` — document: `cd auth-service && npm install && npm run dev`; document required env vars
- [x] T033 [P] Update `.env.example` at repo root — add `AUTH_SERVICE_URL=http://localhost:3001` and `BETTER_AUTH_SECRET=` entries
- [x] T034 Verify end-to-end quickstart.md scenarios pass: sign-up → login → get-profile → update-profile → logout → verify 401

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 + US2 (Phases 3–4)**: Both P1 — complete US1 first, then US2 (shares AuthProvider)
- **US3 + US4 (Phases 5–6)**: Both P2 — US3 first (profile page), US4 second (logout button uses NavbarAuth from US2)
- **Polish (Phase 7)**: After US1–US4 complete

### User Story Dependencies

- **US1 (P1)**: Foundational complete; no other story dependencies
- **US2 (P1)**: Depends on US1 (AuthProvider created in T013; LoginForm reuses it)
- **US3 (P2)**: Depends on US1+US2 (session cookie needed to test; FastAPI middleware from T021 is new)
- **US4 (P2)**: Depends on US2 (NavbarAuth from T020 gets signOut added in T027)

### Parallel Opportunities

- T003, T004 (auth-service config files) run in parallel during Setup
- T006, T010 (DB client and FastAPI middleware) can be worked in parallel during Foundational
- T013, T014, T015 (AuthProvider + SignupForm + page) can be developed in parallel during US1
- T017, T018 (LoginForm + login page) run in parallel during US2
- T021, T022, T025, T026 (FastAPI routes + Pydantic + frontend form + page) run in parallel during US3
- T029, T030, T031, T033 (CORS + startup scripts + env vars) all run in parallel in Polish

---

## Parallel Example: Phase 3 (US1)

```
T013 Create AuthProvider.tsx                    [P within US1]
T014 Create SignupForm.tsx                      [P within US1]
T015 Create signup.tsx page                     [P within US1]
— then sequentially —
T016 Update Root.tsx to wrap with AuthProvider  [depends on T013]
T012 Verify after:signUp hook                   [depends on T008 from Foundational]
T011 Create auth-service/src/index.ts           [depends on T008]
```

---

## Implementation Strategy

### MVP First (US1 + US2 only — sign-up and login)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational (T006–T010) — DB must be ready
3. Complete Phase 3: US1 sign-up (T011–T016)
4. Complete Phase 4: US2 login (T017–T020)
5. **STOP and VALIDATE**: Sign up → log in → session persists on refresh
6. Proceed to US3 profile edit and US4 logout

### Incremental Delivery

1. Setup + Foundational → auth-service boots, DB schema ready
2. US1 → sign-up works end-to-end (MVP for hackathon demo)
3. US2 → login/logout flow complete
4. US3 → profile view/edit works (enables F7 personalisation)
5. US4 → logout cleans up session
6. Polish → CORS hardened, env vars documented

---

## Notes

- [P] tasks operate on different files — safe to run in parallel
- **CRITICAL**: Use Neon WebSocket Pool (`@neondatabase/serverless` with `Pool`), NOT the HTTP driver — HTTP driver lacks transaction support and causes sign-up failures
- **CRITICAL**: Set `neonConfig.webSocketConstructor = ws` in `auth-service/src/db/client.ts` for Node.js environments
- Auth-service runs on port 3001; FastAPI on 8000; Docusaurus dev on 3000
- `BETTER_AUTH_SECRET` must be a 32+ character random string (`openssl rand -hex 32`)
- Session cookie name: `better-auth.session_token` (used by FastAPI middleware to read token)
