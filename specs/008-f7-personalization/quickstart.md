# Quickstart: Content Personalization (F7)

**Feature**: 008-f7-personalization
**Date**: 2026-03-15

---

## Prerequisites

1. F6 Auth System running (auth-service on port 3001, session cookie set)
2. FastAPI backend running on port 8000 with `DATABASE_URL` set
3. `GEMINI_API_KEY` set in `backend/.env`
4. Docusaurus dev server on port 3000

---

## Scenario 1: First Visit — Cache Miss, Generation Enqueued

Sign in first:
```bash
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "student@example.com", "password": "password123"}'
```

Request personalized chapter (first visit — cache miss):
```bash
curl http://localhost:8000/personalize/module-1/ch01-intro-physical-ai \
  -b cookies.txt
```

**Expected**:
```json
{
  "content": "# Chapter 1: Introduction to Physical AI\n\n...(default content)...",
  "cached": false,
  "generating": true,
  "profile": {"experience_level": "beginner", "hardware": "laptop-only"}
}
```

Wait 20–30 seconds for background generation, then re-request.

---

## Scenario 2: Repeat Visit — Cache Hit

After generation completes (Scenario 1), request the same chapter again:

```bash
curl http://localhost:8000/personalize/module-1/ch01-intro-physical-ai \
  -b cookies.txt
```

**Expected**:
```json
{
  "content": "# Chapter 1: Introduction to Physical AI\n\n...(personalized markdown adapted for beginner + laptop-only)...",
  "cached": true,
  "generating": false,
  "profile": {"experience_level": "beginner", "hardware": "laptop-only"}
}
```

Response must arrive in under 2 seconds.

---

## Scenario 3: Profile Update Invalidates Cache

Update the student's profile:
```bash
curl -X PUT http://localhost:8000/profile \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"experience_level": "advanced", "hardware": "gpu-workstation"}'
```

**Expected**: `200 OK` with updated profile AND background cache invalidation runs.

Then verify the next personalization request triggers re-generation:
```bash
curl http://localhost:8000/personalize/module-1/ch01-intro-physical-ai \
  -b cookies.txt
```

**Expected**: `"cached": false` (or stale with `"generating": true`), content eventually reflects `advanced` + `gpu-workstation` profile.

---

## Scenario 4: Verify in Docusaurus Frontend

1. Start Docusaurus dev server: `cd book-site && npm start`
2. Open `http://localhost:3000/Book_1/docs/module-1/ch01-intro-physical-ai`
3. **Not logged in** → default chapter content shown
4. Log in via `/login`
5. Navigate back to the chapter
6. **Expected**: Personalized content appears (may take ~30s on first visit); URL unchanged; sidebar intact

---

## Scenario 5: Unauthenticated Access

```bash
# No cookie jar — unauthenticated request
curl http://localhost:8000/personalize/module-1/ch01-intro-physical-ai
```

**Expected**: `401 Unauthorized`
```json
{ "detail": "Authentication required" }
```

In the Docusaurus frontend, unauthenticated users see the default chapter content without any API call being made.

---

## Scenario 6: Invalid Chapter Slug

```bash
curl http://localhost:8000/personalize/does-not-exist/ch99-fake \
  -b cookies.txt
```

**Expected**: `404 Not Found`
```json
{ "detail": "Chapter not found: does-not-exist/ch99-fake" }
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `generating: true` but content never updates | Check `GEMINI_API_KEY` is set; check FastAPI logs for generation errors |
| `401` on personalize endpoint | Ensure F6 auth-service is running and session cookie is valid |
| Personalized content doesn't reflect profile update | Cache invalidation runs in background — wait 1–2s after `PUT /profile` |
| `404` on chapter slug | Check slug matches file path in `book-site/docs/` without `.md` extension |
| Frontend shows default after login | Check `PersonalizationWrapper` is mounted; verify backend URL in `.env` |
| Gemini generation fails | Check free-tier quota; generation falls back to default content gracefully |
