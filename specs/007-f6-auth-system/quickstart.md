# Quickstart: Auth System (F6)

**Feature**: 007-f6-auth-system
**Date**: 2026-03-15

---

## Prerequisites

1. **Node.js ≥ 20** for auth-service
2. **Python 3.11+** for FastAPI backend
3. **Neon Postgres** connection string in `.env`
4. Environment variables:

```bash
# auth-service/.env
DATABASE_URL=postgres://user:pass@your-project.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=your-32-char-random-secret
BETTER_AUTH_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3000,https://hassam-rauf.github.io

# backend/.env (add to existing)
DATABASE_URL=postgres://user:pass@your-project.neon.tech/neondb?sslmode=require
```

---

## Scenario 1: Sign Up a New Student

**Start auth-service**:
```bash
cd auth-service && npm run dev   # starts on port 3001
```

**Register via curl**:
```bash
curl -X POST http://localhost:3001/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test Student",
    "experienceLevel": "beginner",
    "programmingBackground": "Python basics",
    "hardware": "laptop-only",
    "preferredLanguage": "en"
  }'
```

**Expected**: `200 OK` with user object; `cookies.txt` contains `better-auth.session_token`.

**Verify profile created in Neon**:
```sql
SELECT * FROM user_profile WHERE user_id = '<returned user id>';
```

---

## Scenario 2: Log In and Get Profile

```bash
# Sign in
curl -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email": "test@example.com", "password": "password123"}'

# Get profile via FastAPI (uses session cookie)
curl -X GET http://localhost:8000/profile \
  -b cookies.txt
```

**Expected**: Profile JSON with all 4 fields.

---

## Scenario 3: Update Profile

```bash
curl -X PUT http://localhost:8000/profile \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"experience_level": "intermediate", "hardware": "gpu-workstation"}'
```

**Expected**: `200 OK` with updated profile; `updated_at` timestamp refreshed.

---

## Scenario 4: Log Out and Verify Session Invalidated

```bash
# Sign out
curl -X POST http://localhost:3001/api/auth/sign-out \
  -b cookies.txt -c cookies.txt

# Attempt to access profile — should fail
curl -X GET http://localhost:8000/profile \
  -b cookies.txt
```

**Expected**: `401 Unauthorized` with `"Authentication required"`.

---

## Scenario 5: Frontend Integration (Docusaurus)

In a Docusaurus React component:

```tsx
import { authClient } from '@site/src/components/Auth/AuthProvider';

// Sign up
await authClient.signUp.email({
  email: 'student@example.com',
  password: 'password123',
  name: 'Jane',
  fetchOptions: {
    onSuccess: () => window.location.href = '/',
  },
});

// Get current session
const { data: session } = authClient.useSession();
console.log(session?.user?.email);

// Sign out
await authClient.signOut();
```

---

## Scenario 6: Access Profile Page (Protected Route)

Navigate to `http://localhost:3000/profile` while **not logged in**.

**Expected**: Redirect to `/login?redirect=/profile`.

Navigate to `http://localhost:3000/profile` while **logged in**.

**Expected**: Profile form pre-populated with current values.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `unable_to_create_user` on sign-up | Switch from Neon HTTP driver to WebSocket Pool (`@neondatabase/serverless` with `Pool`) |
| CORS error in browser | Add Docusaurus origin to `ALLOWED_ORIGINS` in auth-service `.env` |
| Session cookie not sent to FastAPI | Ensure `credentials: 'include'` in fetch calls and `Access-Control-Allow-Credentials: true` on FastAPI CORS |
| `401` on `GET /profile` despite being logged in | Cookie domain mismatch — auth-service and FastAPI must share the same domain or use a proxy |
| Profile fields null after sign-up | Check better-auth `after:signUp` hook — `context.body` may not contain custom fields without explicit schema declaration |
| `BETTER_AUTH_SECRET` not set | Generate with `openssl rand -hex 32` and set in `auth-service/.env` |
