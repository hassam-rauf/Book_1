# Quickstart: Chat Widget (F4)

**Prerequisites**: F3 RAG backend running with book content ingested.

---

## 1. Start the Backend (F3 + F4 combined)

```bash
cd backend/
source .venv/bin/activate
# Ensure GEMINI_API_KEY is in .env (also used for /chat endpoint)
uvicorn app.main:app --reload --port 8000
```

Verify both endpoints:

```bash
# F3: RAG search
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "ROS 2 nodes", "top_k": 3}'

# F4: Chat (new endpoint)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How do ROS 2 nodes communicate?",
    "context_passages": [
      {
        "text": "Nodes communicate via topics using the DDS middleware...",
        "chapter_title": "Chapter 3: ROS 2 Architecture",
        "section_heading": "3.3 Publisher-Subscriber",
        "score": 0.9
      }
    ]
  }'
# Expect: SSE stream of ChatChunk events
```

---

## 2. Start the Docusaurus Site

```bash
cd book-site/
npm install
npm start
# Opens http://localhost:3000
```

Verify chat widget:
- Look for floating chat button (💬) in the bottom-right corner
- Click it to open the chat panel
- Type a question and press Enter or click Send
- Verify answer streams in and citations appear below

---

## 3. Integration Test Scenario

**Scenario A: Basic Q&A**
1. Open `http://localhost:3000/docs/module-1/ros2-architecture`
2. Click the floating chat button
3. Type: "What is DDS middleware in ROS 2?"
4. Press Enter
5. Expected: Answer starts appearing within 2 seconds. Citations show "Chapter 3" source.

**Scenario B: Error Handling**
1. Stop the backend: `Ctrl+C` in the backend terminal
2. Submit any question in the widget
3. Expected: "Something went wrong. Please try again." error message. No crash.

**Scenario C: Empty Input**
1. Click chat button, leave input empty, click Send
2. Expected: Validation hint appears. No network request fired.

**Scenario D: Widget Persistence Across Pages**
1. Open widget on the homepage
2. Ask a question, get an answer
3. Navigate to `http://localhost:3000/docs/module-1/ch01-intro-physical-ai`
4. Expected: Widget is still visible. (Conversation may or may not persist — per spec assumption, session resets on navigation.)

---

## 4. Environment Variables

Add to `backend/.env`:

```bash
# Existing F3 vars
GEMINI_API_KEY=your_key_here
QDRANT_URL=https://...
QDRANT_API_KEY=...
QDRANT_COLLECTION=physical-ai-book
ALLOWED_ORIGINS=http://localhost:3000

# No new vars needed for F4 — reuses GEMINI_API_KEY
```

Add to `book-site/.env.development.local` (Docusaurus):

```bash
# Backend URL for chat widget
DOCUSAURUS_BACKEND_URL=http://localhost:8000
```

---

## 5. Running Tests

```bash
# Backend tests (F3 + F4)
cd backend/
pytest tests/ -v

# Frontend component tests
cd book-site/
npm test -- --watchAll=false
```
