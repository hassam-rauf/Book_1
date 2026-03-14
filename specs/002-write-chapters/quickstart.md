# Quickstart: Write 19 Chapters

**Date**: 2026-03-08 | **Feature**: 002-write-chapters

## Prerequisites

- F1 complete: `book-site/` scaffold with 19 placeholder `.md` files
- Claude Code running in `/mnt/d/Projects/Hackathon-1/Book_1`
- Branch `002-write-chapters` checked out

## Phase 1: Generate Modules + Appendices (Parallel)

Run each track in a separate Claude Code session or as background agents.

### Track A — Module 1: ROS 2 (5 chapters)

```
/build-chapter ch01-intro-physical-ai
/build-chapter ch02-embodied-intelligence
/build-chapter ch03-ros2-architecture
/build-chapter ch04-ros2-nodes-topics
/build-chapter ch05-ros2-packages-python
```

### Track B — Module 2: Gazebo (2 chapters)

```
/build-chapter ch06-gazebo-simulation
/build-chapter ch07-urdf-sdf
```

### Track C — Module 3: NVIDIA Isaac (3 chapters)

```
/build-chapter ch08-nvidia-isaac
/build-chapter ch09-perception-manipulation
/build-chapter ch10-sim-to-real
```

### Track D — Module 4: Humanoid Robotics (3 chapters)

```
/build-chapter ch11-humanoid-kinematics
/build-chapter ch12-bipedal-locomotion
/build-chapter ch13-conversational-robotics
```

### Track E — Appendices (4 chapters)

```
/build-chapter a1-hardware-setup
/build-chapter a2-software-installation
/build-chapter a3-cloud-lab-setup
/build-chapter a4-jetson-deployment
```

## Phase 2: Capstone (after all Phase 1 tracks complete)

```
/build-chapter ch14-autonomous-humanoid
```

## Verification

After all chapters are written:

```bash
cd book-site
npm run build
```

Expected: `[SUCCESS] Generated static files in "build"` (exit code 0)

Run full quality audit:
```
/review-all
```

Expected: All 19 chapters pass with no critical issues.

## Chapter Context to Pass to build-chapter

Each `/build-chapter` invocation should include:

```
Chapter: <chapter-title>
File: book-site/docs/<module>/<filename>.md
Module: <module-name>
Prerequisites: <previous chapters in this module>
Target audience: Beginner, basic Python knowledge, no robotics background
Style: Tutorial-style, "why before how", heavy explanations
ROS 2 version: Humble (Ubuntu 22.04)
Requirements:
  - 3–5 learning objectives
  - At least 1 Mermaid diagram
  - At least 2 annotated code examples with expected output
  - Hands-on exercise with prerequisites, steps, expected output
  - Summary section
  - Cross-references to related chapters
```

## Chapter File Inventory

| File | Module | Status |
|------|--------|--------|
| `docs/intro/index.md` | Intro | ✅ Seeded (F1) |
| `docs/module-1/ch01-intro-physical-ai.md` | Module 1 | ⬜ Placeholder |
| `docs/module-1/ch02-embodied-intelligence.md` | Module 1 | ⬜ Placeholder |
| `docs/module-1/ch03-ros2-architecture.md` | Module 1 | ⬜ Placeholder |
| `docs/module-1/ch04-ros2-nodes-topics.md` | Module 1 | ⬜ Placeholder |
| `docs/module-1/ch05-ros2-packages-python.md` | Module 1 | ⬜ Placeholder |
| `docs/module-2/ch06-gazebo-simulation.md` | Module 2 | ⬜ Placeholder |
| `docs/module-2/ch07-urdf-sdf.md` | Module 2 | ⬜ Placeholder |
| `docs/module-3/ch08-nvidia-isaac.md` | Module 3 | ⬜ Placeholder |
| `docs/module-3/ch09-perception-manipulation.md` | Module 3 | ⬜ Placeholder |
| `docs/module-3/ch10-sim-to-real.md` | Module 3 | ⬜ Placeholder |
| `docs/module-4/ch11-humanoid-kinematics.md` | Module 4 | ⬜ Placeholder |
| `docs/module-4/ch12-bipedal-locomotion.md` | Module 4 | ⬜ Placeholder |
| `docs/module-4/ch13-conversational-robotics.md` | Module 4 | ⬜ Placeholder |
| `docs/capstone/ch14-autonomous-humanoid.md` | Capstone | ⬜ Placeholder |
| `docs/appendices/a1-hardware-setup.md` | Appendices | ⬜ Placeholder |
| `docs/appendices/a2-software-installation.md` | Appendices | ⬜ Placeholder |
| `docs/appendices/a3-cloud-lab-setup.md` | Appendices | ⬜ Placeholder |
| `docs/appendices/a4-jetson-deployment.md` | Appendices | ⬜ Placeholder |
