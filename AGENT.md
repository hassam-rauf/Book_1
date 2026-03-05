# Physical AI & Humanoid Robotics Textbook — Complete Project Workflow

Auto-generated from requirement analysis. Last updated: 2026-03-05

---

## 0. Executive Summary

This document is the single source of truth for building a **Physical AI & Humanoid Robotics textbook** as a hackathon project. It covers every aspect end-to-end.

### What We're Building
A Docusaurus static book site (19 content sections: 15 chapters + 4 appendices) with an embedded RAG chatbot, deployed to GitHub Pages. The chatbot uses Gemini (substituted for OpenAI) with Qdrant vectors and Neon Postgres. Four bonus features add authentication, content personalization, Urdu translation, and Claude Code subagents.

### Numbers at a Glance

| Metric | Count |
|--------|-------|
| Total sections (13 chapters + preface + capstone + 4 appendices) | 19 |
| Features (SDD pipeline each) | 9 |
| Build phases | 5 |
| API endpoints | 10 (4 base + 6 bonus) |
| Technologies | 11 |
| Subagents | 6 |
| Agent skills | 4 |
| Environment variables | 8 |
| Risks identified | 6 |
| Success metrics | 9 |
| Submission deliverables | 4 |
| Learning outcomes mapped | 6 |
| Assessments mapped | 4 |
| Max hackathon score | 300 pts (100 base + 200 bonus) |

### Document Sections

| # | Section | What It Covers |
|---|---------|---------------|
| 0 | Executive Summary | This overview |
| 1 | Project Overview | Goal, scoring breakdown |
| 1a | Technology Substitutions | OpenAI → Gemini swap justification |
| 2 | Active Technologies | 11 technologies with purpose |
| 3 | Project Structure | Full file tree (~80 files across 3 projects) |
| 4 | Feature Breakdown | 9 features, dependency graph, SDD pipeline |
| 5 | Phase-by-Phase Workflow | 5 phases with tasks, acceptance criteria per feature |
| 6 | API Contracts | 10 endpoints with request/response shapes |
| 7 | Environment Variables | 8 keys needed |
| 8 | Commands Reference | 16 dev + SDD + agent commands |
| 9 | Risk Register | 6 risks with mitigations |
| 10 | Success Metrics | 9 measurable targets |
| 11 | Submission Checklist | 4 deliverables + 10 pre-submission checks |
| 12 | Learning Outcomes Mapping | 6 outcomes + 4 assessments mapped to chapters |
| 13 | Appendix Chapters | 4 appendices (hardware, lab, cloud, software install) |

### Build Order (Quick Reference)

```
Phase 1: Foundation     → Scaffold Docusaurus + GitHub Pages CI/CD
Phase 2: Content        → Build 6 subagents + 4 skills, then write 19 content sections
Phase 3: RAG System     → FastAPI + Qdrant + Gemini backend, chat widget, text-selection Q&A
Phase 4: Bonus          → Auth (better-auth) → Personalization → Urdu Translation
Phase 5: Polish         → Integration testing, deployment verification, 90s demo video

Per-feature SDD pipeline (ALWAYS in this order):
  /sp.specify → /sp.clarify → /sp.plan → /sp.tasks → /sp.implement → /sp.git.commit_pr
```

### Tech Stack (Quick Reference)

```
Frontend:  Docusaurus 3 (React/TS) → GitHub Pages
Backend:   FastAPI (Python) → Railway/Render
LLM:       Gemini 2.0 Flash (google-genai SDK)
Embeddings:Gemini text-embedding-004 (768-dim)
Vector DB: Qdrant Cloud (free tier)
SQL DB:    Neon Serverless Postgres (free tier)
Auth:      better-auth (bonus)
Chat UI:   Custom React component
Dev Tools: Claude Code + Spec-Kit Plus (SDD workflow)
CI/CD:     GitHub Actions
```

---

## 1. Project Overview

**Goal:** Build a Docusaurus-based textbook on Physical AI & Humanoid Robotics with an embedded RAG chatbot, deployed to GitHub Pages.

**Scoring:**
- Base: 100 points (Book + RAG Chatbot)
- Bonus B1: +50 points (Claude Code Subagents & Agent Skills)
- Bonus B2: +50 points (Auth with better-auth + user profiling)
- Bonus B3: +50 points (Content Personalization per chapter)
- Bonus B4: +50 points (Urdu Translation per chapter)
- **Maximum: 300 points**

---

## 1a. Technology Substitutions

The original requirement specifies OpenAI SDKs. We substitute with Google Gemini due to API key availability. This does **not** affect functionality — only the underlying provider changes.

| Original (Requirement) | Our Substitution | Justification |
|------------------------|-----------------|---------------|
| OpenAI GPT-4o / GPT-4o-mini | **Google Gemini 2.0 Flash** | Free tier (15 RPM, 1M TPD). No credit card needed. Same RAG capability. |
| OpenAI text-embedding-3-small | **Gemini text-embedding-004** | 768-dim vectors. Compatible with Qdrant. Free tier. |
| OpenAI Agents SDK | **google-genai Python SDK** | Handles LLM calls + embeddings. Simpler integration for RAG. |
| OpenAI ChatKit SDK (React) | **Custom React Chat Component** | ChatKit is OpenAI-specific. Custom widget gives full control + matches Docusaurus theme. |

**What stays identical:** FastAPI, Qdrant Cloud, Neon Postgres, better-auth, Docusaurus, GitHub Pages, Spec-Kit Plus.

**Risk:** Judges may expect OpenAI. Mitigation: The requirement says "utilizing the OpenAI Agents/ChatKit SDKs" but the core evaluation is on **functionality** (RAG works, chatbot answers correctly, text selection works). The provider is an implementation detail. If needed, swapping back to OpenAI later requires only changing the service layer — all interfaces remain the same.

---

## 2. Active Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Book Frontend | Docusaurus 3 (React/TypeScript) | Static site for the textbook |
| Deployment | GitHub Pages | Free hosting for the book |
| Chat Widget | Custom React Component | Embedded chatbot UI (replaces OpenAI ChatKit) |
| Backend API | FastAPI (Python 3.11+) | REST API for RAG, auth, personalization |
| LLM | Google Gemini 2.0 Flash | Text generation, translation, personalization |
| Embeddings | Gemini text-embedding-004 | Convert text to vectors for semantic search |
| Vector DB | Qdrant Cloud (Free Tier) | Store and search book content embeddings |
| Relational DB | Neon Serverless Postgres | User accounts, chat history, metadata |
| Auth (Bonus) | better-auth | Signup/Signin with session management |
| Dev Tooling | Claude Code + Spec-Kit Plus | Spec-driven development workflow |
| Python SDK | google-genai | Gemini API client |

---

## 3. Project Structure

```text
Book_1/
├── AGENT.md                          ← This file (project workflow)
├── CLAUDE.md                         ← Claude Code instructions
├── requirement.md                    ← Original hackathon requirements
│
├── .specify/                         ← Spec-Kit Plus config
│   ├── memory/constitution.md        ← Project principles
│   ├── templates/                    ← SDD templates
│   └── scripts/                      ← Automation scripts
│
├── specs/                            ← Feature specifications (SDD artifacts)
│   ├── docusaurus-setup/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── book-content/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── rag-backend/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── chat-widget/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── text-selection-qa/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── auth-system/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── personalization/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   ├── urdu-translation/
│   │   ├── spec.md
│   │   ├── plan.md
│   │   └── tasks.md
│   └── subagents-skills/
│       ├── spec.md
│       ├── plan.md
│       └── tasks.md
│
├── history/                          ← PHRs and ADRs
│   ├── prompts/
│   │   ├── constitution/
│   │   ├── general/
│   │   ├── docusaurus-setup/
│   │   ├── book-content/
│   │   ├── rag-backend/
│   │   ├── chat-widget/
│   │   ├── text-selection-qa/
│   │   ├── auth-system/
│   │   ├── personalization/
│   │   ├── urdu-translation/
│   │   └── subagents-skills/
│   └── adr/
│
├── book-site/                        ← Docusaurus Project
│   ├── docusaurus.config.ts
│   ├── sidebars.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── docs/                         ← Book chapters (Markdown)
│   │   ├── 00-preface/
│   │   │   └── index.md
│   │   ├── 01-intro-to-physical-ai/
│   │   │   ├── index.md
│   │   │   ├── embodied-intelligence.md
│   │   │   └── humanoid-landscape.md
│   │   ├── 02-sensor-systems/
│   │   │   ├── index.md
│   │   │   ├── lidar-cameras.md
│   │   │   ├── imus.md
│   │   │   └── force-torque-sensors.md
│   │   ├── 03-ros2-architecture/
│   │   │   ├── index.md
│   │   │   ├── nodes-and-topics.md
│   │   │   └── services-and-actions.md
│   │   ├── 04-ros2-python/
│   │   │   ├── index.md
│   │   │   ├── building-packages.md
│   │   │   └── rclpy-basics.md
│   │   ├── 05-ros2-advanced/
│   │   │   ├── index.md
│   │   │   ├── launch-files.md
│   │   │   └── parameter-management.md
│   │   ├── 06-gazebo-simulation/
│   │   │   ├── index.md
│   │   │   ├── urdf-sdf-formats.md
│   │   │   └── physics-simulation.md
│   │   ├── 07-unity-visualization/
│   │   │   ├── index.md
│   │   │   ├── high-fidelity-rendering.md
│   │   │   └── sensor-simulation.md
│   │   ├── 08-isaac-sim/
│   │   │   ├── index.md
│   │   │   ├── photorealistic-simulation.md
│   │   │   └── synthetic-data.md
│   │   ├── 09-isaac-ros/
│   │   │   ├── index.md
│   │   │   ├── vslam-navigation.md
│   │   │   └── nav2-path-planning.md
│   │   ├── 10-reinforcement-learning/
│   │   │   ├── index.md
│   │   │   ├── rl-for-robotics.md
│   │   │   └── sim-to-real-transfer.md
│   │   ├── 11-humanoid-kinematics/
│   │   │   ├── index.md
│   │   │   ├── bipedal-locomotion.md
│   │   │   └── balance-control.md
│   │   ├── 12-manipulation-interaction/
│   │   │   ├── index.md
│   │   │   ├── grasping.md
│   │   │   └── human-robot-interaction.md
│   │   ├── 13-conversational-robotics/
│   │   │   ├── index.md
│   │   │   ├── speech-recognition.md
│   │   │   ├── llm-cognitive-planning.md
│   │   │   └── multimodal-interaction.md
│   │   └── 14-capstone-project/
│   │       ├── index.md
│   │       └── autonomous-humanoid.md
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWidget/
│   │   │   │   ├── ChatWidget.tsx
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── TextSelectionPopup.tsx
│   │   │   │   └── ChatWidget.module.css
│   │   │   ├── PersonalizeButton/
│   │   │   │   ├── PersonalizeButton.tsx
│   │   │   │   └── PersonalizeButton.module.css
│   │   │   ├── TranslateButton/
│   │   │   │   ├── TranslateButton.tsx
│   │   │   │   └── TranslateButton.module.css
│   │   │   └── AuthModal/
│   │   │       ├── SignIn.tsx
│   │   │       ├── SignUp.tsx
│   │   │       └── AuthModal.module.css
│   │   ├── hooks/
│   │   │   ├── useChat.ts
│   │   │   ├── useTextSelection.ts
│   │   │   └── useAuth.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   └── index.tsx
│   │   └── css/
│   │       └── custom.css
│   └── static/
│       └── img/
│
├── backend/                          ← FastAPI Project
│   ├── app/
│   │   ├── main.py                   ← FastAPI entry point
│   │   ├── config.py                 ← Environment config
│   │   ├── routers/
│   │   │   ├── chat.py               ← POST /api/chat
│   │   │   ├── chat_selection.py     ← POST /api/chat/selection
│   │   │   ├── ingest.py             ← POST /api/ingest
│   │   │   ├── auth.py               ← Auth endpoints (bonus)
│   │   │   ├── personalize.py        ← POST /api/personalize (bonus)
│   │   │   └── translate.py          ← POST /api/translate (bonus)
│   │   ├── services/
│   │   │   ├── gemini_service.py     ← Gemini LLM + Embeddings client
│   │   │   ├── rag_service.py        ← RAG orchestration logic
│   │   │   ├── qdrant_service.py     ← Qdrant vector DB client
│   │   │   ├── neon_service.py       ← Neon Postgres client
│   │   │   ├── chunking_service.py   ← Markdown → chunks splitter
│   │   │   ├── personalize_service.py← Content personalization (bonus)
│   │   │   └── translate_service.py  ← Urdu translation (bonus)
│   │   └── models/
│   │       ├── schemas.py            ← Pydantic request/response models
│   │       └── db_models.py          ← SQLAlchemy models
│   ├── scripts/
│   │   └── ingest_book.py            ← CLI script to ingest all chapters
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── .claude/
│   ├── commands/                     ← Agent skills (sp.* commands)
│   └── agents/                       ← Claude Code subagents
│       ├── chapter-writer.md
│       ├── content-reviewer.md
│       ├── rag-ingestor.md
│       ├── code-example-generator.md
│       ├── translator.md
│       └── personalizer.md
│
├── .github/
│   └── workflows/
│       └── deploy.yml                ← GitHub Actions: build + deploy
│
└── .env.example                      ← Required environment variables
```

---

## 4. Feature Breakdown & SDD Pipeline

### Feature Registry

| ID | Feature | Phase | Dependencies | Points |
|----|---------|-------|-------------|--------|
| F1 | docusaurus-setup | Phase 1 | None | Base |
| F2 | book-content | Phase 2 | F1 | Base |
| F3 | rag-backend | Phase 3 | F1, F2 | Base |
| F4 | chat-widget | Phase 3 | F1, F3 | Base |
| F5 | text-selection-qa | Phase 3 | F4 | Base |
| F6 | auth-system | Phase 4 | F1, F3 | Bonus +50 |
| F7 | personalization | Phase 4 | F6 | Bonus +50 |
| F8 | urdu-translation | Phase 4 | F6 | Bonus +50 |
| F9 | subagents-skills | Phase 2-3 | F1 | Bonus +50 |

### Feature Dependency Graph

```
F1 (docusaurus-setup)
 ├──► F2 (book-content)
 │     └──► F3 (rag-backend)
 │           ├──► F4 (chat-widget)
 │           │     └──► F5 (text-selection-qa)
 │           └──► F6 (auth-system)
 │                 ├──► F7 (personalization)
 │                 └──► F8 (urdu-translation)
 └──► F9 (subagents-skills) [parallel from Phase 2]
```

---

## 5. Phase-by-Phase Workflow

---

### PHASE 1: Foundation (F1 — docusaurus-setup)

**Objective:** Scaffold Docusaurus, configure GitHub Pages deployment, verify build pipeline.

#### SDD Commands:
```
/sp.constitution          → Set project principles (one-time)
/sp.specify               → specs/docusaurus-setup/spec.md
/sp.clarify               → Resolve ambiguities
/sp.plan                  → specs/docusaurus-setup/plan.md
/sp.tasks                 → specs/docusaurus-setup/tasks.md
/sp.implement             → Execute all tasks
/sp.git.commit_pr         → Commit and create PR
```

#### Tasks Breakdown:
1. Install Node.js 18+ and verify environment
2. Create Docusaurus project: `npx create-docusaurus@latest book-site classic --typescript`
3. Configure `docusaurus.config.ts`:
   - Site title: "Physical AI & Humanoid Robotics"
   - URL: GitHub Pages URL
   - Organization/project settings
   - Theme customization (dark/light mode)
4. Configure `sidebars.ts` with chapter structure (14 chapters)
5. Create placeholder `index.md` for each chapter folder
6. Set up GitHub Actions workflow (`.github/workflows/deploy.yml`):
   - Trigger on push to `main`
   - Build Docusaurus
   - Deploy to GitHub Pages
7. Test local dev server: `cd book-site && npm start`
8. Test production build: `npm run build`
9. Push to GitHub and verify GitHub Pages deployment
10. Verify site is accessible at the public URL

#### Acceptance Criteria:
- [ ] `npm start` serves book locally at localhost:3000
- [ ] `npm run build` completes without errors
- [ ] GitHub Pages deployment works via GitHub Actions
- [ ] All 14 chapter placeholders are visible in sidebar
- [ ] Dark/light mode toggle works

---

### PHASE 2: Content (F2 — book-content + F9 — subagents-skills)

**Objective:** Write all 13 chapters + capstone. Build subagents to accelerate writing.

#### F9: Subagents & Skills (built first to help with F2)

##### SDD Commands:
```
/sp.specify               → specs/subagents-skills/spec.md
/sp.clarify               → Resolve: agent scope, tool access, skill orchestration
/sp.plan                  → specs/subagents-skills/plan.md
/sp.tasks                 → specs/subagents-skills/tasks.md
/sp.implement             → Execute all tasks
```

##### 6 Subagents to Build:

**1. chapter-writer** (`.claude/agents/chapter-writer.md`)
```
Input:  Chapter topic, syllabus points, target audience
Output: Complete chapter in Docusaurus-compatible Markdown
Skills: Generates introduction, theory sections, code examples,
        diagrams (mermaid), key takeaways, exercises
```

**2. content-reviewer** (`.claude/agents/content-reviewer.md`)
```
Input:  Chapter markdown file path
Output: Review report (accuracy, completeness, readability, consistency)
Skills: Checks technical accuracy, cross-references with syllabus,
        validates code examples, checks formatting
```

**3. code-example-generator** (`.claude/agents/code-example-generator.md`)
```
Input:  Topic, language (Python/C++), framework (ROS2/Gazebo/Isaac)
Output: Working code example with comments and explanations
Skills: Generates runnable code snippets, test cases, expected output
```

**4. rag-ingestor** (`.claude/agents/rag-ingestor.md`)
```
Input:  Path to book docs/ folder
Output: Chunks uploaded to Qdrant, metadata in Neon Postgres
Skills: Reads markdown, splits into semantic chunks, generates
        embeddings via Gemini, upserts to Qdrant
```

**5. translator** (`.claude/agents/translator.md`)
```
Input:  Chapter markdown content
Output: Urdu-translated content preserving markdown formatting
Skills: Uses Gemini for translation, preserves code blocks,
        handles technical terms, maintains formatting
```

**6. personalizer** (`.claude/agents/personalizer.md`)
```
Input:  Chapter content + user profile (background, experience)
Output: Personalized chapter content adapted to user level
Skills: Adjusts depth, adds/removes prerequisites, changes
        examples based on user's hardware/software background
```

##### 4 Agent Skills to Build:

**1. /build-chapter** (`.claude/commands/build-chapter.md`)
```
Orchestrates: chapter-writer → code-example-generator → content-reviewer
Usage: /build-chapter "ROS 2 Architecture" --chapter 03
```

**2. /ingest-book** (`.claude/commands/ingest-book.md`)
```
Orchestrates: rag-ingestor across all chapters
Usage: /ingest-book
```

**3. /review-all** (`.claude/commands/review-all.md`)
```
Orchestrates: content-reviewer across all chapters
Usage: /review-all → outputs quality report
```

**4. /deploy** (`.claude/commands/deploy.md`)
```
Orchestrates: build → ingest → deploy to GitHub Pages
Usage: /deploy
```

#### F2: Book Content

##### SDD Commands:
```
/sp.specify               → specs/book-content/spec.md
/sp.clarify               → Resolve: chapter depth, code language, target audience level
/sp.plan                  → specs/book-content/plan.md
/sp.tasks                 → specs/book-content/tasks.md
/sp.implement             → Execute (use /build-chapter skill)
```

##### Chapter Writing Order & Content:

**Chapter 00: Preface**
- About this book, how to use it, prerequisites

**Chapter 01: Introduction to Physical AI (Week 1)**
- What is Physical AI? Embodied intelligence concept
- History: from industrial robots to humanoids
- The human-robot partnership future
- Physical AI vs. Digital AI comparison

**Chapter 02: Sensor Systems (Week 2)**
- LiDAR: how it works, point clouds, applications
- Cameras: RGB, depth, stereo vision
- IMUs: accelerometers, gyroscopes, sensor fusion
- Force/torque sensors for manipulation
- Hands-on: reading sensor data in Python

**Chapter 03: ROS 2 Architecture (Week 3)**
- Why ROS 2? (vs ROS 1)
- Core concepts: nodes, topics, publishers, subscribers
- Services: request/response pattern
- Actions: long-running tasks with feedback
- DDS middleware and QoS profiles

**Chapter 04: ROS 2 with Python (Week 4)**
- Setting up ROS 2 workspace
- Creating packages with `ros2 pkg create`
- Writing nodes with `rclpy`
- Publisher/subscriber examples
- Custom message types

**Chapter 05: ROS 2 Advanced (Week 5)**
- Launch files: composing complex systems
- Parameter server and dynamic reconfiguration
- URDF: describing robot geometry
- TF2: coordinate frame transforms
- Bridging Python agents to ROS controllers

**Chapter 06: Gazebo Simulation (Week 6)**
- Gazebo setup and architecture
- SDF world files
- Loading URDF robots into Gazebo
- Physics engines: ODE, Bullet, DART
- Simulating gravity, collisions, friction

**Chapter 07: Unity & Sensor Simulation (Week 7)**
- Unity for robotics visualization
- Unity-ROS 2 bridge
- Simulating LiDAR in virtual environments
- Depth camera simulation
- IMU simulation and noise models

**Chapter 08: NVIDIA Isaac Sim (Week 8)**
- Isaac Sim overview and installation
- Omniverse and USD assets
- Photorealistic robot simulation
- Synthetic data generation for training
- Isaac Sim + ROS 2 integration

**Chapter 09: Isaac ROS & Navigation (Week 9)**
- Isaac ROS packages
- Hardware-accelerated VSLAM
- Visual SLAM: mapping and localization
- Nav2: path planning for robots
- Bipedal movement path planning

**Chapter 10: Reinforcement Learning for Robotics (Week 10)**
- RL fundamentals for robot control
- Training in simulation (Isaac Gym)
- Reward function design
- Sim-to-real transfer techniques
- Domain randomization

**Chapter 11: Humanoid Kinematics (Week 11)**
- Forward and inverse kinematics
- Denavit-Hartenberg parameters
- Bipedal locomotion: walking gaits
- Balance control: ZMP, capture point
- Dynamics: Newton-Euler, Lagrangian

**Chapter 12: Manipulation & Interaction (Week 12)**
- Humanoid hand design
- Grasp planning and execution
- Object detection for manipulation
- Natural human-robot interaction
- Safety in human-robot collaboration

**Chapter 13: Conversational Robotics (Week 13)**
- Speech recognition with Whisper
- Natural language understanding
- LLM cognitive planning: "Clean the room" → ROS 2 actions
- Multi-modal interaction: speech + gesture + vision
- Voice-to-action pipeline

**Chapter 14: Capstone Project**
- The Autonomous Humanoid project
- System architecture (all modules combined)
- Voice command → path planning → navigation → object manipulation
- Step-by-step implementation guide
- Testing and evaluation

##### Per-Chapter Structure Template:
```markdown
---
sidebar_position: N
title: "Chapter Title"
description: "Brief description"
---

# Chapter N: Title

## Learning Objectives
- Objective 1
- Objective 2

## N.1 First Section
[Theory + explanation]

### Code Example
```python
# Working code example
```

## N.2 Second Section
[Theory + explanation]

## Key Takeaways
- Takeaway 1
- Takeaway 2

## Exercises
1. Exercise 1
2. Exercise 2

## Further Reading
- Resource 1
- Resource 2
```

#### Acceptance Criteria:
- [ ] All 15 files (preface + 14 chapters) written and rendered
- [ ] Each chapter has: learning objectives, theory, code examples, exercises
- [ ] Code examples are syntactically correct
- [ ] Sidebar navigation works with correct ordering
- [ ] All chapters build without Docusaurus errors

---

### PHASE 3: RAG System (F3 + F4 + F5)

#### F3: RAG Backend

##### SDD Commands:
```
/sp.specify               → specs/rag-backend/spec.md
/sp.clarify               → Resolve: chunk size, embedding model, retrieval strategy
/sp.plan                  → specs/rag-backend/plan.md
/sp.tasks                 → specs/rag-backend/tasks.md
/sp.implement             → Execute all tasks
```

##### Architecture:

```
                    ┌─────────────────┐
                    │   FastAPI App    │
                    │   (main.py)      │
                    └────┬───────┬────┘
                         │       │
              ┌──────────▼─┐  ┌──▼──────────┐
              │ /api/chat  │  │ /api/ingest  │
              └──────┬─────┘  └──────┬───────┘
                     │               │
              ┌──────▼─────────────┐ │
              │   rag_service.py   │ │
              └──┬──────────┬──────┘ │
                 │          │        │
          ┌──────▼───┐ ┌────▼────┐   │
          │  Gemini   │ │ Qdrant  │◄──┘
          │  LLM API  │ │ Cloud   │
          └──────────┘ └─────────┘
```

##### Tasks Breakdown:

**1. Project Setup**
```bash
mkdir backend && cd backend
python -m venv venv
pip install fastapi uvicorn google-genai qdrant-client psycopg2-binary
pip install sqlalchemy alembic python-dotenv pydantic
```

**2. Environment Configuration** (`.env.example`)
```env
GEMINI_API_KEY=your-gemini-api-key
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
NEON_DATABASE_URL=postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/dbname
CORS_ORIGINS=http://localhost:3000,https://your-github-pages-url
```

**3. Gemini Service** (`services/gemini_service.py`)
```
- init_client(): Initialize google-genai client
- generate_embedding(text) → list[float]: text-embedding-004
- generate_response(query, context_chunks) → str: gemini-2.0-flash
- System prompt: "You are a helpful textbook assistant..."
```

**4. Chunking Service** (`services/chunking_service.py`)
```
- read_markdown(file_path) → str
- split_into_chunks(text, chunk_size=500, overlap=50) → list[Chunk]
- Each Chunk has: text, chapter, section, position
- Preserve code blocks as single chunks
- Strip markdown formatting for embedding, keep for display
```

**5. Qdrant Service** (`services/qdrant_service.py`)
```
- init_collection("book_chunks", vector_size=768)
- upsert_chunks(chunks_with_embeddings)
- search_similar(query_embedding, top_k=5) → list[ScoredPoint]
- delete_collection() for re-indexing
```

**6. Neon Service** (`services/neon_service.py`)
```
Tables:
  - chat_sessions(id, created_at)
  - chat_messages(id, session_id, role, content, created_at)
  - book_metadata(id, chapter, section, chunk_count, last_indexed)
  - users(id, email, password_hash, profile, created_at)  [bonus]

- save_message(session_id, role, content)
- get_history(session_id) → list[Message]
- save_metadata(chapter, section, chunk_count)
```

**7. RAG Service** (`services/rag_service.py`)
```
- process_query(question, session_id):
    1. Generate embedding for question
    2. Search Qdrant for top-5 similar chunks
    3. Build context from retrieved chunks
    4. Get chat history from Neon (last 5 messages)
    5. Call Gemini with: system_prompt + context + history + question
    6. Save Q&A to Neon
    7. Return response + source references
```

**8. API Endpoints**

```python
# POST /api/chat
Request:  { "question": str, "session_id": str | None }
Response: { "answer": str, "sources": list[Source], "session_id": str }

# POST /api/ingest
Request:  { "docs_path": str }  (admin only)
Response: { "status": str, "chunks_indexed": int }

# GET /api/health
Response: { "status": "ok", "qdrant": bool, "neon": bool }
```

**9. Ingestion Script** (`scripts/ingest_book.py`)
```
1. Scan book-site/docs/ for all .md files
2. For each file:
   a. Read content
   b. Split into chunks
   c. Generate embeddings (batch)
   d. Upsert to Qdrant with metadata
   e. Save metadata to Neon
3. Report: total chunks, time taken
```

**10. CORS & Middleware**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-pages-url"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

##### Acceptance Criteria:
- [ ] `POST /api/chat` returns relevant answers from book content
- [ ] Responses include source references (chapter, section)
- [ ] Chat history persists across messages in a session
- [ ] Ingestion script processes all chapters without errors
- [ ] Health endpoint reports Qdrant and Neon connectivity
- [ ] CORS allows requests from Docusaurus frontend

---

#### F4: Chat Widget

##### SDD Commands:
```
/sp.specify               → specs/chat-widget/spec.md
/sp.clarify               → Resolve: widget placement, theme integration, mobile UX
/sp.plan                  → specs/chat-widget/plan.md
/sp.tasks                 → specs/chat-widget/tasks.md
/sp.implement             → Execute all tasks
```

##### Component Architecture:

```
ChatWidget (floating button → expandable panel)
├── ChatHeader (title, minimize/close buttons)
├── ChatMessages (scrollable message list)
│   ├── ChatMessage (user message)
│   └── ChatMessage (bot message with sources)
├── ChatInput (text input + send button)
└── ChatWidget.module.css (styling)
```

##### Tasks Breakdown:

1. Create `ChatWidget.tsx` — floating chat button (bottom-right corner)
2. Create `ChatMessage.tsx` — message bubble component (user/bot variants)
3. Create `useChat.ts` hook:
   - Manages messages state
   - Sends POST to `/api/chat`
   - Handles loading/error states
   - Manages session ID (localStorage)
4. Style the widget with CSS modules (matches Docusaurus theme)
5. Integrate as a Docusaurus plugin/component (loaded on every page)
6. Add markdown rendering in bot responses (code blocks, lists)
7. Add "Powered by Gemini" footer
8. Add auto-scroll to latest message
9. Add typing indicator during API call
10. Test on mobile viewport

##### Acceptance Criteria:
- [ ] Chat widget appears as floating button on all pages
- [ ] Clicking opens chat panel
- [ ] User can type questions and receive answers
- [ ] Bot responses render markdown correctly
- [ ] Source references are clickable (link to chapter)
- [ ] Works on mobile screens
- [ ] Session persists across page navigations

---

#### F5: Text Selection Q&A

##### SDD Commands:
```
/sp.specify               → specs/text-selection-qa/spec.md
/sp.clarify               → Resolve: selection UX, minimum text length, context passing
/sp.plan                  → specs/text-selection-qa/plan.md
/sp.tasks                 → specs/text-selection-qa/tasks.md
/sp.implement             → Execute all tasks
```

##### How It Works:

```
User selects text on the page
        │
        ▼
TextSelectionPopup appears near selection
  "Ask about this text?"
        │
        ▼
User clicks → Chat widget opens with selected text as context
        │
        ▼
POST /api/chat/selection
  { "selected_text": "...", "question": "Explain this", "session_id": "..." }
        │
        ▼
Backend uses selected_text as direct context (no Qdrant search)
  → Gemini answers based ONLY on the selected text
        │
        ▼
Response shown in chat widget
```

##### Tasks Breakdown:

1. Create `useTextSelection.ts` hook:
   - Listen for `mouseup` / `touchend` events
   - Capture `window.getSelection().toString()`
   - Calculate popup position near selection
2. Create `TextSelectionPopup.tsx`:
   - Small tooltip with "Ask about this" button
   - Appears when text is selected (>10 characters)
   - Disappears on click elsewhere
3. Create backend endpoint `POST /api/chat/selection`:
   - Takes `selected_text` + `question`
   - Passes selected text directly as context to Gemini
   - No vector search — uses the selected text only
   - System prompt: "Answer based ONLY on the following text..."
4. Connect popup → chat widget (pre-fill context)
5. Visual indicator in chat showing "Context: [selected text preview...]"
6. Test with various text lengths and page layouts

##### Acceptance Criteria:
- [ ] Selecting text on any chapter page shows popup
- [ ] Clicking popup opens chat with selected text as context
- [ ] Bot answers are grounded in selected text only
- [ ] Works with code blocks, tables, and regular text
- [ ] Popup doesn't interfere with normal text selection

---

### PHASE 4: Bonus Features (F6 + F7 + F8)

#### F6: Auth System (Bonus +50)

##### SDD Commands:
```
/sp.specify               → specs/auth-system/spec.md
/sp.clarify               → Resolve: session strategy, profile fields
/sp.plan                  → specs/auth-system/plan.md
/sp.tasks                 → specs/auth-system/tasks.md
/sp.implement             → Execute all tasks
```

##### Architecture:

```
better-auth (TypeScript library)
  ├── Signup form
  │   ├── Email + Password
  │   └── Profiling Questions:
  │       ├── "Programming experience level?" (Beginner/Intermediate/Advanced)
  │       ├── "Which languages do you know?" (Python/C++/Java/Other)
  │       ├── "Robotics experience?" (None/Hobbyist/Professional)
  │       ├── "Available hardware?" (Laptop only/GPU Workstation/Jetson Kit/Robot)
  │       └── "Learning goal?" (Career/Academic/Hobby)
  ├── Signin form
  ├── Session management (cookies/JWT)
  └── User profile storage (Neon Postgres)
```

##### Tasks Breakdown:

1. Install better-auth: `npm install better-auth` in book-site
2. Configure better-auth with Neon Postgres as session store
3. Create `AuthContext.tsx` — React context for auth state
4. Create `SignUp.tsx` — registration form with profiling questions
5. Create `SignIn.tsx` — login form
6. Create `AuthModal.tsx` — modal wrapper (triggered from navbar)
7. Add "Sign In" button to Docusaurus navbar
8. Create backend auth endpoints (or use better-auth server adapter)
9. Store user profile in Neon `users` table:
   ```sql
   users(id, email, password_hash, experience_level,
         languages, robotics_exp, hardware, learning_goal,
         created_at)
   ```
10. Protect personalization/translation endpoints (require auth)
11. Test signup → signin → session persistence flow

##### Acceptance Criteria:
- [ ] User can sign up with email + password + profile
- [ ] User can sign in and session persists across pages
- [ ] Profile data is stored in Neon Postgres
- [ ] "Sign In" button appears in navbar
- [ ] Signed-in user sees their name/avatar in navbar
- [ ] Signing out clears session

---

#### F7: Content Personalization (Bonus +50)

##### SDD Commands:
```
/sp.specify               → specs/personalization/spec.md
/sp.clarify               → Resolve: adaptation depth, caching strategy, profile fields used
/sp.plan                  → specs/personalization/plan.md
/sp.tasks                 → specs/personalization/tasks.md
/sp.implement             → Execute all tasks
```

##### How It Works:

```
Logged-in user visits Chapter 03
        │
        ▼
"Personalize for Me" button at top of chapter
        │
        ▼
Click → POST /api/personalize
  {
    "chapter_content": "...(markdown)...",
    "user_profile": {
      "experience_level": "beginner",
      "languages": ["python"],
      "robotics_exp": "none",
      "hardware": "laptop_only"
    }
  }
        │
        ▼
Backend → Gemini prompt:
  "Rewrite this chapter content for a beginner who knows
   Python but has no robotics experience and only has a
   laptop. Add more explanations for complex concepts.
   Simplify code examples. Keep markdown formatting."
        │
        ▼
Personalized content replaces chapter content on page
  (with "Show Original" toggle button)
```

##### Tasks Breakdown:

1. Create `PersonalizeButton.tsx` component
2. Create `POST /api/personalize` endpoint
3. Create `personalize_service.py`:
   - Build dynamic Gemini prompt from user profile
   - Stream response for long chapters
   - Cache personalized content (Neon) to avoid re-generation
4. Add button to chapter layout (Docusaurus swizzle)
5. Implement content swap (original ↔ personalized) in React state
6. Add loading spinner during generation
7. Cache personalized content per user + chapter in Neon
8. Test with different user profiles

##### Acceptance Criteria:
- [ ] Button appears only for logged-in users
- [ ] Clicking generates personalized version
- [ ] Content adapts to user's experience level
- [ ] "Show Original" restores default content
- [ ] Personalized content is cached (no re-generation on revisit)

---

#### F8: Urdu Translation (Bonus +50)

##### SDD Commands:
```
/sp.specify               → specs/urdu-translation/spec.md
/sp.clarify               → Resolve: technical term handling, RTL scope, code block behavior
/sp.plan                  → specs/urdu-translation/plan.md
/sp.tasks                 → specs/urdu-translation/tasks.md
/sp.implement             → Execute all tasks
```

##### How It Works:

```
Logged-in user visits any chapter
        │
        ▼
"اردو میں پڑھیں" (Read in Urdu) button at top
        │
        ▼
Click → POST /api/translate
  { "chapter_content": "...", "target_language": "urdu" }
        │
        ▼
Backend → Gemini prompt:
  "Translate to Urdu. Keep all code blocks in English.
   Keep technical terms in English with Urdu transliteration
   in parentheses. Preserve markdown formatting. Use RTL."
        │
        ▼
Urdu content replaces chapter content
  (with "English" toggle button)
  Page direction switches to RTL
```

##### Tasks Breakdown:

1. Create `TranslateButton.tsx` component
2. Create `POST /api/translate` endpoint
3. Create `translate_service.py`:
   - Gemini prompt for technical Urdu translation
   - Preserve code blocks untranslated
   - Handle technical terms (keep English + Urdu transliteration)
4. Add RTL CSS support for Urdu content
5. Add button to chapter layout (next to Personalize button)
6. Implement content swap (English ↔ Urdu)
7. Cache translations in Neon per chapter
8. Test RTL rendering with mixed English/Urdu/code content

##### Acceptance Criteria:
- [ ] Button appears only for logged-in users
- [ ] Clicking generates Urdu translation
- [ ] Code blocks remain in English
- [ ] Technical terms show English + Urdu transliteration
- [ ] Page renders correctly in RTL
- [ ] "English" button restores original content
- [ ] Translations are cached

---

### PHASE 5: Integration, Testing & Deployment

#### Integration Tasks:

1. **Connect frontend ↔ backend:**
   - Verify all API endpoints work from Docusaurus
   - Test CORS configuration
   - Handle API errors gracefully in UI

2. **End-to-end testing:**
   - Book renders all chapters correctly
   - Chat widget answers questions accurately
   - Text selection Q&A works
   - Auth flow works (signup → signin → session)
   - Personalization generates adapted content
   - Urdu translation renders correctly in RTL
   - All features work on mobile

3. **Performance:**
   - Chat response time < 5 seconds
   - Page load time < 3 seconds
   - Personalization/translation cached after first generation

4. **Deployment checklist:**
   - [ ] Book deployed to GitHub Pages
   - [ ] Backend deployed to Railway/Render (free tier)
   - [ ] Qdrant Cloud collection populated with book content
   - [ ] Neon Postgres tables created and migrated
   - [ ] Environment variables set in all environments
   - [ ] CORS configured for production URLs
   - [ ] All features verified on production

5. **Demo video (90 seconds):**
   - 0-15s: Show the book (navigation, chapters)
   - 15-35s: Chat with the RAG chatbot (ask a question)
   - 35-50s: Text selection Q&A demo
   - 50-60s: Sign up with profile
   - 60-70s: Personalize a chapter
   - 70-80s: Translate a chapter to Urdu
   - 80-90s: Show subagents/skills in Claude Code

---

## 6. API Contracts

### Base Endpoints

```
GET  /api/health
POST /api/chat              { question, session_id? } → { answer, sources, session_id }
POST /api/chat/selection    { selected_text, question, session_id? } → { answer, session_id }
POST /api/ingest            { docs_path } → { status, chunks_indexed }
```

### Bonus Endpoints

```
POST /api/auth/signup       { email, password, profile } → { user, session }
POST /api/auth/signin       { email, password } → { user, session }
POST /api/auth/signout      {} → { success }
GET  /api/auth/me           → { user, profile }
POST /api/personalize       { chapter_content, user_profile } → { personalized_content }
POST /api/translate         { chapter_content, target_language } → { translated_content }
```

---

## 7. Environment Variables

```env
# Gemini
GEMINI_API_KEY=

# Qdrant Cloud
QDRANT_URL=
QDRANT_API_KEY=

# Neon Postgres
NEON_DATABASE_URL=

# App
CORS_ORIGINS=http://localhost:3000
BACKEND_URL=http://localhost:8000
SECRET_KEY=           # For session/JWT signing

# better-auth (bonus)
BETTER_AUTH_SECRET=
```

---

## 8. Commands Reference

| Command | Purpose | When to Run |
|---------|---------|-------------|
| `npm start` | Run Docusaurus dev server | During development |
| `npm run build` | Build static site | Before deployment |
| `uvicorn app.main:app --reload` | Run FastAPI dev server | During development |
| `python scripts/ingest_book.py` | Index book content into Qdrant | After content changes |
| `/sp.specify` | Create feature spec | Start of each feature |
| `/sp.clarify` | Clarify spec ambiguities | After spec creation |
| `/sp.plan` | Create architecture plan | After spec is clear |
| `/sp.tasks` | Generate implementation tasks | After plan is approved |
| `/sp.analyze` | Cross-check spec/plan/tasks | Before implementation |
| `/sp.implement` | Execute tasks | After tasks are approved |
| `/sp.git.commit_pr` | Commit and create PR | After implementation |
| `/sp.adr` | Document architecture decision | When significant decision made |
| `/build-chapter` | Write a chapter (subagent) | During content phase |
| `/ingest-book` | Re-index all content (subagent) | After content changes |
| `/review-all` | Quality check all chapters (subagent) | Before submission |
| `/deploy` | Full build + ingest + deploy (subagent) | Final deployment |

---

## 9. Risk Register

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini free tier rate limits | Chat becomes slow/unavailable | Implement request queuing, caching, show "busy" state |
| Qdrant free tier storage limit | Can't index all chapters | Optimize chunk sizes, reduce overlap |
| Neon free tier compute limit | DB connections drop | Connection pooling, minimize queries |
| Large chapter content exceeds Gemini context | Personalization/translation fails | Chunk chapters for processing, reassemble |
| RTL rendering breaks Docusaurus layout | Urdu content looks broken | CSS isolation for translated content |
| better-auth + Docusaurus SSG conflict | Auth doesn't work with static site | Client-side auth only, no SSR auth |

---

## 10. Success Metrics

| Metric | Target |
|--------|--------|
| All 14 chapters rendered | 100% |
| Chat answers relevant to book | >80% accuracy |
| Text selection Q&A works | All content types |
| GitHub Pages deployment | Automated via CI |
| Auth signup/signin flow | Complete cycle |
| Personalization response time | <10 seconds |
| Translation response time | <10 seconds |
| Demo video length | ≤90 seconds |
| Subagents created | 6 agents + 4 skills |

---

## 11. Submission Checklist

Per the hackathon requirement, the following **4 items** must be submitted via the Google Form before the deadline:

| # | Deliverable | Details | Status |
|---|------------|---------|--------|
| 1 | **Public GitHub Repo Link** | Repository must be public. Contains: Docusaurus book, FastAPI backend, subagents/skills, all specs. | [ ] |
| 2 | **Published Book Link** | Live URL on GitHub Pages or Vercel. Must include: rendered book, embedded chatbot, all bonus features deployed. | [ ] |
| 3 | **Demo Video Link** | Must be **under 90 seconds**. Judges only watch the first 90s. Can use NotebookLM or screen recording. Must showcase: book, chatbot, text-selection Q&A, auth, personalization, Urdu translation, subagents. | [ ] |
| 4 | **WhatsApp Number** | For live presentation invitation (top submissions only). | [ ] |

**Submission Form:** https://forms.gle/CQsSEGM3GeCrL43c8

**Pre-submission verification:**
- [ ] GitHub repo is set to **public**
- [ ] GitHub Pages URL loads without errors
- [ ] RAG chatbot responds to questions on the live site
- [ ] Text selection popup works on the live site
- [ ] Auth signup/signin works on the live site
- [ ] Personalize button generates adapted content
- [ ] Urdu translate button generates RTL content
- [ ] Demo video is uploaded and link is accessible
- [ ] Demo video is ≤90 seconds
- [ ] All environment variables are set in production (no exposed secrets)

---

## 12. Learning Outcomes Mapping

The syllabus defines 6 learning outcomes. This table maps each outcome to the chapters that cover it, ensuring complete coverage:

| # | Learning Outcome | Covered By Chapters | Assessment |
|---|-----------------|--------------------|-----------|
| LO1 | Understand Physical AI principles and embodied intelligence | Ch 01 (Intro to Physical AI), Ch 02 (Sensor Systems) | Exercises in Ch 01-02 |
| LO2 | Master ROS 2 for robotic control | Ch 03 (ROS 2 Architecture), Ch 04 (ROS 2 Python), Ch 05 (ROS 2 Advanced) | ROS 2 package development project |
| LO3 | Simulate robots with Gazebo and Unity | Ch 06 (Gazebo Simulation), Ch 07 (Unity & Sensor Sim) | Gazebo simulation implementation |
| LO4 | Develop with NVIDIA Isaac AI robot platform | Ch 08 (Isaac Sim), Ch 09 (Isaac ROS & Nav), Ch 10 (Reinforcement Learning) | Isaac-based perception pipeline |
| LO5 | Design humanoid robots for natural interactions | Ch 11 (Humanoid Kinematics), Ch 12 (Manipulation & HRI) | Exercises in Ch 11-12 |
| LO6 | Integrate GPT/LLM models for conversational robotics | Ch 13 (Conversational Robotics), Ch 14 (Capstone) | Capstone: Simulated humanoid with conversational AI |

### Assessments Mapping

The syllabus defines 4 formal assessments. Each maps to specific chapters:

| Assessment | Chapters | Description |
|-----------|----------|-------------|
| ROS 2 package development project | Ch 03, 04, 05 | Build a complete ROS 2 package with nodes, topics, services, launch files |
| Gazebo simulation implementation | Ch 06, 07 | Create a simulated environment with a robot, physics, and sensors |
| Isaac-based perception pipeline | Ch 08, 09, 10 | Build a perception pipeline using Isaac Sim/ROS with VSLAM and navigation |
| Capstone: Simulated humanoid with conversational AI | Ch 11, 12, 13, 14 | Full autonomous humanoid: voice command → plan → navigate → detect → manipulate |

---

## 13. Appendix Chapters (Added)

The book content plan (Phase 2) is extended with 4 appendix chapters to cover hardware, software setup, and reference material from the syllabus:

### Updated Chapter List (Appendices)

| Chapter | Title | Content |
|---------|-------|---------|
| **A1** | Hardware Setup Guide | Digital Twin Workstation specs (GPU RTX 4070 Ti+, CPU, 64GB RAM, Ubuntu 22.04). Edge Kit: Jetson Orin Nano, RealSense D435i, ReSpeaker mic, IMU. Full Economy Kit breakdown ($700). |
| **A2** | Robot Lab Options | Option A: Proxy approach (Unitree Go2, ~$1,800-3,000). Option B: Miniature humanoid (Unitree G1 ~$16k, Hiwonder TonyPi ~$600). Option C: Premium (Unitree G1 for sim-to-real). Lab architecture table. |
| **A3** | Cloud Lab Setup | AWS g5.2xlarge / g6e.xlarge setup. NVIDIA Isaac Sim on Omniverse Cloud. Cost calculation (~$205/quarter). Latency trap: train in cloud, deploy to Jetson. |
| **A4** | Software Installation Guide | ROS 2 Humble/Iron installation on Ubuntu 22.04. Gazebo setup. NVIDIA Isaac Sim installation. Unity + ROS 2 bridge. Python environment setup. |

### Updated Docusaurus docs/ Structure (Appendices)

```text
docs/
├── ... (chapters 00-14 unchanged)
├── A1-hardware-setup/
│   ├── index.md              ← Overview
│   ├── workstation-specs.md  ← Digital Twin Workstation requirements
│   ├── edge-kit.md           ← Jetson + RealSense + ReSpeaker kit
│   └── economy-kit.md        ← $700 student kit breakdown table
├── A2-robot-lab/
│   ├── index.md              ← Overview
│   ├── proxy-approach.md     ← Unitree Go2 (budget)
│   ├── miniature-humanoid.md ← Unitree G1 / Hiwonder TonyPi
│   └── premium-lab.md        ← Full sim-to-real setup
├── A3-cloud-lab/
│   ├── index.md              ← Overview
│   ├── aws-setup.md          ← AWS g5/g6e instance config
│   ├── cost-calculator.md    ← Pricing breakdown
│   └── latency-solutions.md  ← Train cloud → deploy Jetson
└── A4-software-installation/
    ├── index.md              ← Overview
    ├── ros2-install.md       ← ROS 2 Humble on Ubuntu 22.04
    ├── gazebo-install.md     ← Gazebo setup
    ├── isaac-install.md      ← NVIDIA Isaac Sim setup
    └── unity-ros2-bridge.md  ← Unity + ROS 2 integration
```

### Updated Sidebar Count

- **Before:** 15 chapters (00-preface through 14-capstone)
- **After:** 15 chapters + 4 appendices = **19 content sections**

### Updated Acceptance Criteria for Phase 2

- [ ] All 15 chapter files (preface + 14 chapters) written and rendered
- [ ] All 4 appendix sections written with hardware/software/cloud/lab content
- [ ] Economy Jetson Kit table matches requirement.md exactly
- [ ] Lab architecture summary table included
- [ ] Cloud cost calculations included
- [ ] Each chapter has: learning objectives, theory, code examples, exercises
- [ ] Each learning outcome (LO1-LO6) is covered by at least one chapter
- [ ] Each assessment is covered by its mapped chapters
- [ ] Code examples are syntactically correct
- [ ] Sidebar navigation works with correct ordering (chapters + appendices)
- [ ] All content builds without Docusaurus errors

---

**Version**: 1.2.1 | **Created**: 2026-03-05 | **Updated**: 2026-03-05 | **Status**: Ready for Phase 1

### Changelog
- **v1.0.0** — Initial workflow document (13 sections)
- **v1.1.0** — Added: Technology Substitutions (1a), Submission Checklist (11), Learning Outcomes Mapping (12), Appendix Chapters (13)
- **v1.2.0** — Added: Executive Summary (0) with numbers-at-a-glance, section index, quick references for build order and tech stack
- **v1.2.1** — Fixed: Added `/sp.clarify` step to ALL 9 feature SDD pipelines (was missing from F9, F2, F4, F5, F7, F8). Added per-feature pipeline reference in Executive Summary.
