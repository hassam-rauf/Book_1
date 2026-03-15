# Feature Specification: Content Personalization

**Feature Branch**: `008-f7-personalization`
**Created**: 2026-03-15
**Status**: Draft
**Input**: User description: "F7 Personalization — adapt Physical AI textbook chapter content to each student's profile."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Receive Personalized Chapter on First Visit (Priority: P1)

A logged-in student navigates to any chapter. The system detects their profile (experience level, programming background, hardware, preferred language) and delivers a version of the chapter tailored to them — with code examples that match their hardware, explanations pitched at their experience level, and terminology suited to their background. The student never has to ask for personalization; it happens automatically.

**Why this priority**: This is the core value of F7. Without it, none of the other personalization stories are testable or meaningful. It is the MVP that justifies the feature's existence.

**Independent Test**: Log in as a "beginner / laptop-only" student and navigate to Chapter 1. Verify the chapter contains beginner-friendly language and CPU-only code examples. Log in as an "advanced / gpu-workstation" student and navigate to the same chapter. Verify the chapter contains GPU-accelerated examples and advanced terminology.

**Acceptance Scenarios**:

1. **Given** a student is logged in with `experience_level=beginner, hardware=laptop-only`, **When** they open any chapter, **Then** the displayed content uses beginner-friendly language and CPU-only code examples.
2. **Given** a student is logged in with `experience_level=advanced, hardware=gpu-workstation`, **When** they open the same chapter, **Then** the displayed content uses advanced terminology and GPU-accelerated code examples.
3. **Given** a student is NOT logged in, **When** they open any chapter, **Then** the default (non-personalized) chapter content is displayed without modification.

---

### User Story 2 — Cached Personalization on Repeat Visits (Priority: P1)

A student who has already received a personalized version of a chapter returns to the same chapter. The personalized content loads immediately — without waiting for a new generation call — because the system cached it after the first visit.

**Why this priority**: Generation is slow (multi-second AI call). Without caching, every page load would be unusably slow. This is a functional requirement for any real use.

**Independent Test**: Navigate to a chapter as a logged-in student (first visit triggers generation). Navigate away and return to the same chapter. The second load must serve cached content. Modifying the profile and returning must trigger a fresh generation.

**Acceptance Scenarios**:

1. **Given** a personalized chapter version has been generated for a student, **When** they navigate to that chapter again, **Then** the cached version is served without re-generating.
2. **Given** a student updates their profile (e.g., changes `experience_level`), **When** they next visit a chapter, **Then** a fresh personalized version is generated and replaces the cached one.

---

### User Story 3 — Transparent Content Swap (Priority: P2)

A logged-in student sees only the personalized version of the chapter inline — not a separate link or page. The swap is transparent: the chapter URL stays the same, the sidebar and navigation are unchanged, and the personalized content replaces the default body without visible disruption.

**Why this priority**: The user experience of personalization depends on it being seamless. A separate URL would be confusing and break bookmarks.

**Independent Test**: Open any chapter as a logged-in student. Verify the URL does not change. Verify the sidebar is present. Verify the heading and structure match the default but the body content reflects the student's profile.

**Acceptance Scenarios**:

1. **Given** a logged-in student with a complete profile opens a chapter, **When** the page finishes loading, **Then** the chapter body shows personalized content while the URL, title, sidebar, and navigation remain unchanged.
2. **Given** the personalization service is unavailable, **When** a logged-in student opens a chapter, **Then** the default content is displayed and no error is shown to the student.

---

### User Story 4 — Profile Update Invalidates Cache (Priority: P2)

When a student updates their profile, their previously cached personalized chapters are automatically invalidated. The next time they open any chapter, fresh content is generated for the new profile. They do not need to manually clear anything.

**Why this priority**: Personalization loses value if it doesn't reflect the student's current profile. Profile updates must propagate automatically.

**Independent Test**: Generate a personalized chapter for a student. Update the student's `hardware` field via the profile page. Navigate back to the chapter. Verify the content reflects the new hardware.

**Acceptance Scenarios**:

1. **Given** a student has cached personalized chapters, **When** they update any profile field, **Then** all previously cached personalized versions for that student are invalidated.
2. **Given** a student's cache has been invalidated, **When** they open a chapter, **Then** a fresh personalized version is generated using the updated profile.

---

### Edge Cases

- What if the student's `programming_background` is empty? → Personalization proceeds with available fields; empty background defaults to generic introductory framing.
- What if a chapter has no code examples? → Personalization still adjusts explanation depth and terminology; hardware field has reduced effect.
- What if generation takes longer than 30 seconds? → Default content is displayed immediately; no error shown to the student.
- What if the student is logged in but has no profile row yet? → Default content is displayed; no error surfaced.
- What if two students have identical profiles? → Both receive equivalent personalized content; the cache may be shared by profile identity.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST automatically detect a logged-in student's profile when they open a chapter and serve personalized content without any manual action.
- **FR-002**: The system MUST adjust code examples in personalized chapters to match the student's `hardware` field (laptop-only, gpu-workstation, jetson-kit, robot).
- **FR-003**: The system MUST adjust explanation depth and vocabulary in personalized chapters to match the student's `experience_level` (beginner, intermediate, advanced).
- **FR-004**: The system MUST incorporate the student's `programming_background` free-text field when adjusting terminology and analogies.
- **FR-005**: The system MUST cache personalized chapter versions so that repeat visits to the same chapter by a student with the same profile do not trigger re-generation.
- **FR-006**: The system MUST invalidate a student's cached personalized chapters when any of their profile fields change.
- **FR-007**: The system MUST display the default chapter content to non-logged-in students — personalization is only available to authenticated users.
- **FR-008**: The system MUST fall back to default content if personalization generation fails or times out — no error page, no broken layout.
- **FR-009**: The system MUST preserve chapter URL, navigation structure, sidebar, and heading hierarchy — only the chapter body content is personalized.
- **FR-010**: Personalized content generation MUST complete within 30 seconds for a typical chapter.
- **FR-011**: The system MUST expose an endpoint for the frontend to retrieve the personalized version of a specific chapter given an authenticated session.

### Key Entities

- **PersonalizedChapter**: A cached, profile-specific rendering of a chapter. Identified by `(user_id, chapter_slug)`. Contains the personalized body markdown and a creation timestamp.
- **Chapter**: A textbook chapter identified by its URL slug. Has a canonical (default) body and zero or more cached personalized versions.
- **UserProfile**: The four profile fields (`experience_level`, `hardware`, `programming_background`, `preferred_language`) sourced from F6 — drives what personalization is generated.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Logged-in students receive personalized chapter content within 30 seconds on first visit; repeat visits load the cached version in under 2 seconds.
- **SC-002**: 100% of logged-in students with a complete profile see personalized content when opening a chapter — fallback to default only if generation fails.
- **SC-003**: Profile updates take effect on the student's next chapter visit — no manual cache-clearing required.
- **SC-004**: Non-logged-in students always see default content — personalization is never served to anonymous visitors.
- **SC-005**: Chapter URL, sidebar, and navigation remain identical whether personalized or default content is shown — no duplicate pages or broken bookmarks.
- **SC-006**: The system handles personalization service unavailability gracefully — students see default content, not error pages.

## Assumptions

- F6 Auth System is operational: session cookies are set and `user_profile` rows exist for logged-in students.
- The `personalizer` subagent (`.claude/agents/personalizer.md`) exists and can generate profile-adapted chapter content given a profile dict and raw chapter markdown.
- Personalization targets English content only in F7. Urdu language generation is handled by F8 (Translation). The `preferred_language` field is available but `ur` output is out of scope here.
- All 19 chapters are available as source markdown under `book-site/docs/`.
- Cache is server-side (persisted across student devices), not browser-local storage.
- Personalized content is a full replacement of the chapter body, not a partial overlay or annotation.

## Dependencies

- **F6 Auth System** (`007-f6-auth-system`): Session validation and `user_profile` table must be present before F7 can read profile fields.
- **Personalizer subagent** (`.claude/agents/personalizer.md`): Must be callable from the backend to generate personalized markdown.
- **Book chapters** (`book-site/docs/**/*.md`): Source content that the personalizer reads and rewrites.
