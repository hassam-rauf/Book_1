# Implementation Plan: Docusaurus Book Site Setup

**Branch**: `001-docusaurus-site-setup` | **Date**: 2026-03-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-docusaurus-site-setup/spec.md`

## Summary

Scaffold a Docusaurus 3 static site with TypeScript configuration, 19 chapter placeholder files organized into module-based sidebar groups, a dedicated landing page with hero banner, Mermaid diagram support, and automated GitHub Pages deployment via GitHub Actions.

## Technical Context

**Language/Version**: TypeScript 5.x (config), Markdown/MDX (content)
**Primary Dependencies**: Docusaurus 3 (classic preset), @docusaurus/theme-mermaid, React 18
**Storage**: N/A (static site, no database)
**Testing**: Build verification (`npm run build`), manual sidebar/navigation check
**Target Platform**: GitHub Pages (static hosting)
**Project Type**: Single project (`book-site/`)
**Performance Goals**: Site loads < 3s, build < 2min, dev server start < 30s
**Constraints**: Must use GitHub Pages, must support 19 content sections, dark/light mode required
**Scale/Scope**: 19 markdown files, 7 sidebar groups, 1 landing page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | ✅ PASS | Following full SDD pipeline: specify → clarify → plan → tasks → implement |
| II. Smallest Viable Diff | ✅ PASS | Only scaffolding structure + placeholders; no content writing |
| III. Content Accuracy First | ✅ PASS | Placeholder files only; real content deferred to F2 |
| IV. Provider-Agnostic Service Layer | N/A | No backend in this feature |
| V. Free-Tier Resilient | ✅ PASS | GitHub Pages is free; no paid services |
| VI. Security by Default | ✅ PASS | No secrets needed for static site scaffolding |
| VII. Subagent Reusability | N/A | No subagent work in this feature |

**Gate result**: PASS — all applicable principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/001-docusaurus-site-setup/
├── plan.md              # This file
├── research.md          # Phase 0 output (7 research decisions)
├── quickstart.md        # Phase 1 output (setup instructions)
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
book-site/
├── docs/
│   ├── intro/
│   │   ├── _category_.json          # "Introduction" group, position 1
│   │   └── index.md                 # Preface & Course Overview
│   ├── module-1/
│   │   ├── _category_.json          # "Module 1: The Robotic Nervous System", position 2
│   │   ├── ch01-intro-physical-ai.md
│   │   ├── ch02-embodied-intelligence.md
│   │   ├── ch03-ros2-architecture.md
│   │   ├── ch04-ros2-nodes-topics.md
│   │   └── ch05-ros2-packages-python.md
│   ├── module-2/
│   │   ├── _category_.json          # "Module 2: The Digital Twin", position 3
│   │   ├── ch06-gazebo-simulation.md
│   │   └── ch07-urdf-sdf.md
│   ├── module-3/
│   │   ├── _category_.json          # "Module 3: The AI-Robot Brain", position 4
│   │   ├── ch08-nvidia-isaac.md
│   │   ├── ch09-perception-manipulation.md
│   │   └── ch10-sim-to-real.md
│   ├── module-4/
│   │   ├── _category_.json          # "Module 4: Vision-Language-Action", position 5
│   │   ├── ch11-humanoid-kinematics.md
│   │   ├── ch12-bipedal-locomotion.md
│   │   └── ch13-conversational-robotics.md
│   ├── capstone/
│   │   ├── _category_.json          # "Capstone Project", position 6
│   │   └── ch14-autonomous-humanoid.md
│   └── appendices/
│       ├── _category_.json          # "Appendices", position 7
│       ├── a1-hardware-setup.md
│       ├── a2-software-installation.md
│       ├── a3-cloud-lab-setup.md
│       └── a4-jetson-deployment.md
├── src/
│   ├── css/
│   │   └── custom.css               # Theme colors (dark/light mode)
│   └── pages/
│       └── index.tsx                 # Landing page with hero banner
├── static/
│   └── img/                          # Logo and hero images
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Pages deployment workflow
├── docusaurus.config.ts              # Site configuration
├── sidebars.ts                       # Auto-generated sidebar config
├── package.json
└── tsconfig.json
```

**Structure Decision**: Single project structure under `book-site/`. No backend or separate frontend — this feature is purely a static site scaffold. The backend (F3) and other features will be separate directories at the repo root.

## Implementation Approach

### Step 1: Initialize Docusaurus Project

Create the project using the classic TypeScript preset. Remove the default blog plugin (not needed for a textbook). Configure `docusaurus.config.ts` with:
- Site title and tagline
- GitHub Pages URL and baseUrl
- Docs plugin pointing to `./docs`
- Mermaid theme enabled
- Dark/light mode color configuration
- Prism syntax highlighting for Python, C++, YAML, bash

### Step 2: Create Docs Folder Structure

Create 7 top-level folders under `docs/` matching the sidebar groups. Each folder gets a `_category_.json` file defining:
- `label`: Human-readable group name
- `position`: Sidebar order (1-7)
- `collapsible`: true
- `collapsed`: false (for active reading)

### Step 3: Create 19 Chapter Placeholder Files

Each chapter file gets frontmatter:
```yaml
---
sidebar_position: N
title: "Chapter Title"
description: "Brief chapter description"
---
```

Body content: chapter title heading + "Content coming soon" placeholder paragraph.

### Step 4: Create Landing Page

Build `src/pages/index.tsx` with:
- Hero section: book title, subtitle, description
- "Start Reading" CTA button linking to `/docs/intro`
- Brief course overview (modules summary)
- Responsive layout (mobile-friendly)

### Step 5: Configure Theme

Update `src/css/custom.css` with:
- Primary color palette for light mode
- Primary color palette for dark mode
- Font adjustments for readability

### Step 6: Set Up GitHub Actions Deployment

Create `.github/workflows/deploy.yml`:
- Trigger: push to `main` branch
- Steps: checkout → setup Node 18 → install deps → build → deploy to Pages
- Use `actions/deploy-pages@v4`

### Step 7: Verify Build

- Run `npm run build` to confirm zero errors
- Run `npm start` to verify local dev server
- Verify all 19 pages accessible in sidebar
- Verify dark/light toggle works
- Verify landing page renders correctly

## Complexity Tracking

No constitution violations. No complexity justifications needed.

## Data Model

N/A — this feature is a static site with no data persistence. Chapter content is stored as markdown files with YAML frontmatter metadata.

## API Contracts

N/A — no APIs in this feature. The Docusaurus site is purely static.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Docusaurus breaking change in latest version | Build fails | Pin exact version in package.json |
| GitHub Pages quota exceeded | Deployment fails | Site is small (~19 pages); well within limits |
| Mermaid plugin compatibility | Diagrams don't render | Use built-in @docusaurus/theme-mermaid (officially supported) |
