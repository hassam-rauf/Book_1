---
name: deploy
description: |
  Orchestrates the full deployment pipeline: build Docusaurus site, run RAG ingestion, and deploy to GitHub Pages.
  This skill should be used when users want to deploy the complete textbook application or run a pre-submission check.
---

# Deploy

Orchestrate full build, ingest, and deploy pipeline.

## How This Skill Works

```
User: "/deploy [--skip-ingest] [--dry-run]"
       ↓
1. Pre-flight checks (env vars, dependencies)
       ↓
2. Build Docusaurus static site
       ↓
3. Run RAG ingestion (unless --skip-ingest)
       ↓
4. Run quality review summary
       ↓
5. Deploy to GitHub Pages
       ↓
Output: Live URL + deployment report
```

## What This Skill Does

- Runs pre-flight validation (env, deps, git state)
- Builds the Docusaurus site with production config
- Triggers RAG ingestion pipeline
- Deploys static site to GitHub Pages
- Produces deployment report

## What This Skill Does NOT Do

- Write or modify chapter content
- Set up cloud services (Qdrant, Neon) from scratch
- Manage DNS or custom domains
- Deploy the backend API (that runs separately)

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | `book-site/` structure, `backend/` config, `package.json` scripts |
| **Conversation** | Deploy target, skip flags, dry-run preference |
| **Skill References** | ingest-book skill for RAG pipeline |
| **User Guidelines** | Constitution principles (free-tier resilient, security) |

## Input

| Parameter | Required | Description |
|-----------|----------|-------------|
| --skip-ingest | No | Skip RAG ingestion step |
| --dry-run | No | Run all steps except actual deployment |
| --skip-review | No | Skip quality review step |

## Execution Steps

### Step 1: Pre-Flight Checks

Verify all requirements:

```
Environment:
- [ ] Node.js >= 18 installed
- [ ] Python >= 3.11 installed
- [ ] npm/pnpm available

Git State:
- [ ] Working directory clean (no uncommitted changes)
- [ ] On correct branch

Environment Variables (if not --skip-ingest):
- [ ] GEMINI_API_KEY set
- [ ] QDRANT_URL set
- [ ] QDRANT_API_KEY set
- [ ] DATABASE_URL set

Dependencies:
- [ ] book-site/node_modules exists (or run npm install)
- [ ] backend/requirements.txt satisfied (or run pip install)
```

If any check fails, report and stop.

### Step 2: Build Docusaurus Site

```bash
cd book-site && npm run build
```

Verify:
- Build completes without errors
- `book-site/build/` directory exists
- Index.html is present

### Step 3: Run RAG Ingestion (unless --skip-ingest)

Invoke ingest-book skill.
Wait for completion and verify chunk count.

### Step 4: Quick Quality Check (unless --skip-review)

Run a lightweight review:
- All chapters have frontmatter
- No broken internal links
- Code blocks have language tags
- Report any Critical issues (do not block deploy for Warnings)

### Step 5: Deploy to GitHub Pages

```bash
cd book-site && npm run deploy
```

Or via GitHub Actions if configured:
```bash
git push origin main  # triggers GH Pages action
```

Confirm deployment by checking the GitHub Pages URL.

### Step 6: Post-Deploy Verification

- [ ] Site loads at GitHub Pages URL
- [ ] Navigation works (sidebar, chapter links)
- [ ] Chatbot widget loads (if backend is running)
- [ ] No console errors in browser

### Step 7: Report

```
Deployment Complete:
- Site URL: https://<user>.github.io/<repo>/
- Build time: Xs
- Chapters deployed: N
- RAG chunks indexed: M (or "skipped")
- Quality check: passed / N warnings
- Git commit: <sha>
```

## Error Handling

| Error | Action |
|-------|--------|
| Build fails | Show error log, suggest fixing and retrying |
| Dirty git state | List uncommitted files, ask user to commit or stash |
| Missing node_modules | Run `npm install` automatically |
| Deploy permission denied | Check gh-pages branch exists, suggest `npm run deploy` setup |
| Post-deploy site 404 | Check baseUrl in docusaurus.config.js, verify GH Pages settings |

## Pre-Submission Checklist Mode

When deploying for hackathon submission, also verify:

- [ ] All 15 chapters + preface + capstone present
- [ ] RAG chatbot functional
- [ ] GitHub repo is public
- [ ] Demo video link in README (if required)
- [ ] Submission form URL accessible
