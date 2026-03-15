# Quickstart: Subagents and Agent Skills

**Feature**: 006-f9-subagents-and-agent-skills
**Date**: 2026-03-15

This guide shows how to verify and use the 6 subagents and 4 skills after implementation is complete.

---

## Prerequisites

1. **Claude Code** installed and running from repo root (`/mnt/d/Projects/Hackathon-1/Book_1` or `D:\Projects\Hackathon-1\Book_1`)
2. **Environment variables** in `.env`:
   ```bash
   GEMINI_API_KEY=your-key
   QDRANT_URL=https://your-cluster.qdrant.io
   QDRANT_API_KEY=your-key
   QDRANT_COLLECTION=book_chunks
   DATABASE_URL=postgres://...neon.tech/...
   ```
3. **Node.js ≥ 18** installed (for deploy skill)
4. **Python 3.11+** with backend dependencies installed (`pip install -r backend/requirements.txt`)

---

## Scenario 1: Verify All Subagents Load

In Claude Code, type:
```
/agents
```

Expected output includes all 6 agents:
```
chapter-writer         — Generates complete textbook chapters...
code-example-generator — Generates working, well-commented code examples...
content-reviewer       — Reviews textbook chapters for technical accuracy...
rag-ingestor           — Chunks book markdown content, generates embeddings...
personalizer           — Rewrites textbook chapter content adapted to a user's...
translator             — Translates textbook chapter content from English to Urdu...
```

If any agent is missing, restart Claude Code and check `.claude/agents/` for valid YAML frontmatter.

---

## Scenario 2: Create a New Chapter (build-chapter)

```
/build-chapter 20 "Legged Locomotion: Bipedal and Quadruped Robots"
```

The skill will:
1. Call `chapter-writer` → creates `book-site/docs/legged-locomotion.md`
2. Call `code-example-generator` → adds ROS 2 and Gazebo code examples
3. Call `content-reviewer` → produces `legged-locomotion-review.md`

Final output:
```
✅ Chapter created: book-site/docs/legged-locomotion.md
   Word count: ~2,400
   Code blocks: 4
   Review verdict: PASS (0 issues)
```

---

## Scenario 3: Re-index RAG After Content Changes (ingest-book)

```
/ingest-book
```

Expected output:
```
Ingestion Complete:
- Files processed: 19
- Total chunks: ~760
- Qdrant vectors: 760 (verified)
- Time taken: ~5 minutes
- Errors: none
```

For a dry run (no uploads):
```
/ingest-book --dry-run
```

---

## Scenario 4: Full Deployment (deploy)

Pre-submission check without actually deploying:
```
/deploy --dry-run
```

Full deployment to GitHub Pages:
```
/deploy
```

Expected output:
```
Deployment Complete:
- Site URL: https://hassam-rauf.github.io/Book_1/
- Build time: ~45s
- Chapters deployed: 19
- RAG chunks indexed: 760
- Quality check: passed
```

---

## Scenario 5: Quality Audit Before Submission (review-all)

```
/review-all
```

Expected output (saved to `book-site/review-report.md`):
```
# Quality Review Report
Generated: 2026-03-15

| Chapter | Verdict | Issues |
|---------|---------|--------|
| intro   | PASS    | 0      |
| ch-01   | PASS    | 0      |
| ch-02   | WARN    | 2      |
...

Summary: 18 PASS, 1 WARN, 0 FAIL
```

---

## Scenario 6: Personalise a Chapter

Use Claude Code's Agent tool directly (or integrate into F7 feature):
```
Use the personalizer agent to rewrite book-site/docs/deep-learning-robotics.md
for a user profile: experience=beginner, languages=[python], hardware=laptop-only,
profile_id=user_123
```

Output: `book-site/docs/personalized/user_123/deep-learning-robotics.md`

---

## Scenario 7: Translate a Chapter to Urdu

```
Use the translator agent to translate book-site/docs/intro.md to Urdu
```

Output: `book-site/docs/urdu/intro.md`

All code blocks and technical terms (ROS 2, Gazebo, NVIDIA Isaac, Python) will be unchanged.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Agent not listed in `/agents` | Check `.claude/agents/<name>.md` for valid YAML frontmatter; restart Claude Code |
| `ingest-book` reports missing env vars | Verify `.env` file has all 4 required vars; reload shell |
| `ingest-book` gets 429 from Gemini | Rate limit hit; script auto-retries with backoff; wait and re-run |
| `deploy --dry-run` fails pre-flight | Check Node.js version (`node --version` ≥ 18) and git working tree clean state |
| `review-all` produces empty report | Check `book-site/docs/` has `.md` files; verify content-reviewer agent loaded |
| chapter-writer produces `[TODO]` tokens | Content gap — run `/build-chapter` again for that chapter or fill manually |
