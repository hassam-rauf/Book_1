# Feature Specification: Auth System

**Feature Branch**: `007-f6-auth-system`
**Created**: 2026-03-15
**Status**: Draft
**Input**: User description: "F6 Auth System — add user authentication to the Physical AI textbook using better-auth. Students can sign up with email/password, log in, and their profile (experience level, programming background, available hardware, preferred language) is stored. The profile is used by the personalization (F7) and translation (F8) features. Auth is session-based. The Docusaurus frontend shows login/signup pages and a profile page. The FastAPI backend exposes auth endpoints. No server-side rendering — Docusaurus is SSG so auth state is managed client-side. Use Neon Postgres for user storage."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Sign Up and Create a Profile (Priority: P1)

A new student arrives at the textbook site and clicks "Sign Up." They enter their email and password, then complete a short onboarding form capturing their experience level, programming background, available hardware, and preferred language. After submitting, they are logged in and redirected to the book's home page with a personalised greeting.

**Why this priority**: Without account creation the entire auth system has no entry point. All downstream personalisation and translation features (F7, F8) depend on a stored user profile.

**Independent Test**: Register a new account with email + password + full profile; verify the account appears in storage, session cookie is set, and the profile data is retrievable.

**Acceptance Scenarios**:

1. **Given** a visitor is on the Sign Up page, **When** they submit a valid email, password (≥ 8 characters), and profile fields, **Then** an account is created, a session is started, and they are redirected to the book home page.
2. **Given** a visitor submits a Sign Up form with an already-registered email, **When** the form is submitted, **Then** an error message "Email already in use" is shown and no duplicate account is created.
3. **Given** a visitor submits a Sign Up form with a password shorter than 8 characters, **When** the form is submitted, **Then** a validation error "Password must be at least 8 characters" is shown client-side before the request is sent.
4. **Given** a new account is created, **When** the profile data is retrieved, **Then** all four profile fields (experience level, programming background, hardware, preferred language) are stored and returned correctly.

---

### User Story 2 — Log In and Restore Session (Priority: P1)

A returning student visits the site and clicks "Log In." They enter their email and password, are authenticated, and their session is restored. They see their name and the book adapts to their previously saved profile.

**Why this priority**: Equal priority with Sign Up — without login, returning users cannot access their profile or personalised content.

**Independent Test**: Create an account, close the browser tab, navigate back and log in; verify the session is restored and the correct profile is returned.

**Acceptance Scenarios**:

1. **Given** a student is on the Log In page, **When** they submit correct credentials, **Then** a session is started and they are redirected to the book home page.
2. **Given** a student submits incorrect credentials, **When** the form is submitted, **Then** an error "Invalid email or password" is shown and no session is created.
3. **Given** a student is logged in, **When** they close and reopen the browser (within the session lifetime), **Then** they remain logged in without re-entering credentials.
4. **Given** a student's session has expired, **When** they visit a protected page, **Then** they are redirected to the Log In page with a message "Your session has expired. Please log in again."

---

### User Story 3 — View and Edit Profile (Priority: P2)

A logged-in student navigates to their Profile page. They can see their current experience level, programming background, hardware, and preferred language, and update any field. Changes are saved immediately and reflected in subsequent personalised content.

**Why this priority**: Profile editing is needed for F7 (personalisation) to function correctly when a student's situation changes. P2 because the initial profile from Sign Up (US1) provides a working starting point.

**Independent Test**: Log in, navigate to Profile, change the experience level from "beginner" to "advanced", save, log out, log back in, and verify the updated value is returned.

**Acceptance Scenarios**:

1. **Given** a logged-in student navigates to the Profile page, **When** the page loads, **Then** all four profile fields are pre-populated with their current values.
2. **Given** a student changes one or more profile fields and clicks "Save", **When** the form is submitted, **Then** the changes are persisted and a success message "Profile updated" is shown.
3. **Given** a student submits a profile update with an invalid value (e.g., empty experience level), **When** the form is submitted, **Then** a validation error is shown and the previous value is preserved.
4. **Given** a student is not logged in and navigates directly to the Profile page URL, **When** the page loads, **Then** they are redirected to the Log In page.

---

### User Story 4 — Log Out (Priority: P2)

A logged-in student clicks "Log Out." Their session is invalidated, they are redirected to the home page, and no protected data remains accessible.

**Why this priority**: Required for shared-device scenarios and basic security hygiene. P2 because it is not blocking for hackathon scoring but must exist for a complete auth system.

**Independent Test**: Log in, click "Log Out", attempt to access the Profile page; verify the session is gone and the user is redirected to Log In.

**Acceptance Scenarios**:

1. **Given** a logged-in student clicks "Log Out", **When** the action completes, **Then** their session is invalidated and they are redirected to the home page.
2. **Given** a student has logged out, **When** they navigate to the Profile page, **Then** they are redirected to the Log In page.
3. **Given** a student has logged out, **When** they use the browser back button to revisit a previously authenticated page, **Then** no protected data is visible (page redirects or shows the public view).

---

### Edge Cases

- What happens if a student signs up with a valid email but the mail server bounces it?
- What if two tabs are open and the student logs out in one — does the other tab eventually de-authenticate?
- What if the Neon Postgres connection is unavailable during a login attempt?
- What happens if a student submits the profile form with all fields unchanged?
- What if the session token is tampered with or corrupted?
- What if a student tries to sign up while already logged in?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a visitor to create an account with a unique email address and a password of at least 8 characters.
- **FR-002**: The system MUST store a user profile containing: experience level (beginner / intermediate / advanced), programming background (free text, max 200 chars), available hardware (laptop-only / gpu-workstation / jetson-kit / robot), and preferred language (English / Urdu).
- **FR-003**: The system MUST authenticate returning users via email and password and issue a session that persists across browser refreshes within the session lifetime.
- **FR-004**: The system MUST allow a logged-in user to view and update all four profile fields at any time.
- **FR-005**: The system MUST allow a logged-in user to log out, invalidating their session immediately.
- **FR-006**: The system MUST protect the Profile page — unauthenticated visitors MUST be redirected to the Log In page.
- **FR-007**: The system MUST expose the current user's profile as a client-accessible data object so that F7 (personalisation) and F8 (translation) features can read it without additional API calls.
- **FR-008**: The system MUST validate all input before submission: email format, password minimum length, required profile fields.
- **FR-009**: The backend MUST expose auth endpoints (sign-up, sign-in, sign-out, get-profile, update-profile) that the Docusaurus frontend can call via standard HTTP requests.
- **FR-010**: All auth state MUST be managed client-side (no server-side rendering) because Docusaurus is a statically-generated site.

### Key Entities

- **User**: Represents a registered student — has `id`, `email`, `password_hash`, `created_at`.
- **UserProfile**: Linked to a User — has `experience_level`, `programming_background`, `hardware`, `preferred_language`, `updated_at`.
- **Session**: Represents an active login — has `session_token`, `user_id`, `expires_at`, `created_at`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new student can complete the Sign Up flow (email + password + profile) in under 2 minutes.
- **SC-002**: A returning student can log in and reach their personalised content in under 30 seconds.
- **SC-003**: 100% of profile fields submitted during Sign Up or Profile Edit are retrievable without data loss.
- **SC-004**: The Profile page is inaccessible to unauthenticated users — 0% of unauthenticated requests reach protected content.
- **SC-005**: Log Out invalidates the session within 1 second and prevents any further access to protected pages.
- **SC-006**: The user's profile data is available to the frontend within 500ms of a successful login, enabling F7 and F8 to personalise content on first page load.

## Assumptions

- better-auth is the chosen auth library for the FastAPI backend; it handles session management, password hashing, and token lifecycle.
- Neon Postgres (already in the stack for F3 RAG metadata) is used to store users, profiles, and sessions.
- No email verification is required at sign-up (reducing friction for the hackathon demo).
- No OAuth / social login is in scope (email/password only).
- Session lifetime is 7 days by default (standard web app practice); users remain logged in across browser restarts within this window.
- The Docusaurus site stores the session token in an HTTP-only cookie set by the backend; the frontend reads the auth state via a `/auth/me` or equivalent endpoint on page load.
- The Profile page is implemented as a Docusaurus custom React page (not a generated doc page).
- Password reset / forgot password is out of scope for this feature.

## Out of Scope

- Email verification on sign-up.
- OAuth / social login (Google, GitHub, etc.).
- Password reset or forgot-password flow.
- Admin user roles or role-based access control.
- Rate limiting on auth endpoints (can be added in a hardening pass).
- Two-factor authentication.
- Audit logging of auth events.
