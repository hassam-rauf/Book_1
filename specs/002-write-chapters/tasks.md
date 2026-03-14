# Tasks: Book Content — Write 19 Chapters

**Input**: Design documents from `/specs/002-write-chapters/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story. Phase 1 content (5 module tracks) can run in parallel. Capstone (Phase 2) runs last.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks
- **[Story]**: User story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Verify scaffold and establish shared chapter content standards

- [ ] T001 Verify all 18 placeholder chapter files exist in `book-site/docs/` (check frontmatter is intact)
- [ ] T002 Confirm `npm run build` passes on F1 scaffold in `book-site/` (exit code 0)
- [ ] T003 Document the standard chapter section template in `specs/002-write-chapters/chapter-template.md`
- [ ] T004 Document the standard appendix section template in `specs/002-write-chapters/appendix-template.md`

**Checkpoint**: Scaffold verified and templates documented — content generation can begin

---

## Phase 2: Foundational

**Purpose**: Write intro chapter (already seeded in F1 — verify completeness)

**⚠️ CRITICAL**: Verify intro before writing modules that reference it

- [ ] T005 Review `book-site/docs/intro/index.md` — confirm it has objectives, Mermaid diagram, code example, and exercise
- [ ] T006 Enhance `book-site/docs/intro/index.md` if missing required sections (objectives, exercise, cross-refs to ch01)

**Checkpoint**: Intro chapter complete — module writing can begin

---

## Phase 3: User Story 1 — Student Reads a Chapter (P1) 🎯 MVP

**Goal**: Write all main chapters (ch01–ch13) across 4 modules so any chapter is independently readable.

**Independent Test**: Open any single chapter in `npm start` dev server and verify it has objectives, diagram, 2+ code examples, exercise, and summary.

**Note**: Tracks A–E within this phase are fully parallel. Within each track, chapters are sequential.

---

### Track A: Module 1 — ROS 2 (5 chapters)

- [ ] T007 [US1] Write `book-site/docs/module-1/ch01-intro-physical-ai.md` using build-chapter skill — tutorial style, objectives, Mermaid diagram of Physical AI landscape, 2+ Python examples, exercise, summary
- [ ] T008 [US1] Write `book-site/docs/module-1/ch02-embodied-intelligence.md` — references ch01, Mermaid diagram of embodied vs disembodied AI, code examples, exercise
- [ ] T009 [US1] Write `book-site/docs/module-1/ch03-ros2-architecture.md` — ROS 2 node/topic/service diagram, Python publisher example, exercise
- [ ] T010 [US1] Write `book-site/docs/module-1/ch04-ros2-nodes-topics.md` — pub/sub diagram, talker/listener Python code with expected output, exercise
- [ ] T011 [US1] Write `book-site/docs/module-1/ch05-ros2-packages-python.md` — package structure diagram, setup.py + node code, colcon build exercise

**Track A Checkpoint**: Module 1 complete — ch01–ch05 readable in sequence

---

### Track B: Module 2 — Gazebo (2 chapters)

- [ ] T012 [P] [US1] Write `book-site/docs/module-2/ch06-gazebo-simulation.md` — Gazebo architecture Mermaid, Python launch file, spawn robot exercise
- [ ] T013 [P] [US1] Write `book-site/docs/module-2/ch07-urdf-sdf.md` — URDF structure diagram, XML model code, Gazebo loading exercise

**Track B Checkpoint**: Module 2 complete — ch06–ch07 readable

---

### Track C: Module 3 — NVIDIA Isaac (3 chapters)

- [ ] T014 [P] [US1] Write `book-site/docs/module-3/ch08-nvidia-isaac.md` — Isaac Sim architecture diagram, Python scene setup example, Isaac launch exercise
- [ ] T015 [P] [US1] Write `book-site/docs/module-3/ch09-perception-manipulation.md` — perception pipeline diagram, object detection Python code, pick-and-place exercise
- [ ] T016 [P] [US1] Write `book-site/docs/module-3/ch10-sim-to-real.md` — sim-to-real gap diagram, domain randomization code, transfer exercise

**Track C Checkpoint**: Module 3 complete — ch08–ch10 readable

---

### Track D: Module 4 — Humanoid Robotics (3 chapters)

- [ ] T017 [P] [US1] Write `book-site/docs/module-4/ch11-humanoid-kinematics.md` — forward/inverse kinematics diagram, Python IK solver example, joint pose exercise
- [ ] T018 [P] [US1] Write `book-site/docs/module-4/ch12-bipedal-locomotion.md` — gait cycle Mermaid diagram, walking controller Python code, balance exercise
- [ ] T019 [P] [US1] Write `book-site/docs/module-4/ch13-conversational-robotics.md` — VLA pipeline diagram, LLM-to-action Python code, voice command exercise

**Track D Checkpoint**: Module 4 complete — ch11–ch13 readable

---

### Track E: Appendices (4 chapters)

- [ ] T020 [P] [US4] Write `book-site/docs/appendices/a1-hardware-setup.md` — hardware list, wiring diagram (Mermaid), setup commands, verification steps
- [ ] T021 [P] [US4] Write `book-site/docs/appendices/a2-software-installation.md` — ROS 2 Humble install commands, verification (ros2 run demo_nodes_py talker), troubleshooting
- [ ] T022 [P] [US4] Write `book-site/docs/appendices/a3-cloud-lab-setup.md` — cloud provider setup (AWS/GCP free tier), Isaac cloud steps, verification
- [ ] T023 [P] [US4] Write `book-site/docs/appendices/a4-jetson-deployment.md` — Jetson Orin setup, Isaac on Jetson, deployment exercise, troubleshooting

**Track E Checkpoint**: All appendices complete — environment setup fully documented

---

**Phase 3 Checkpoint**: All 13 main chapters (ch01–ch13) + 4 appendices written. Each independently readable.

---

## Phase 4: User Story 2 — Student Follows Full Module (P2)

**Goal**: Write ch14 Capstone (references all 4 modules) and verify module-level continuity.

**Independent Test**: Read ch01→ch05 in sequence; verify ch02 references ch01 and builds on it without re-explaining basics.

**⚠️ DEPENDS ON**: Phase 3 complete (all module chapters written)

- [ ] T024 [US2] Write `book-site/docs/capstone/ch14-autonomous-humanoid.md` — integrates ROS 2 + Gazebo + Isaac + VLA; full system diagram; end-to-end Python code; capstone project exercise
- [ ] T025 [US2] Review Module 1 cross-references — verify ch02 links to ch01, ch03 links to ch02, etc. in `book-site/docs/module-1/`
- [ ] T026 [P] [US2] Review Module 2 cross-references — verify ch07 links to ch06 in `book-site/docs/module-2/`
- [ ] T027 [P] [US2] Review Module 3 cross-references — verify ch09→ch08, ch10→ch09 in `book-site/docs/module-3/`
- [ ] T028 [P] [US2] Review Module 4 cross-references — verify ch12→ch11, ch13→ch12 in `book-site/docs/module-4/`
- [ ] T029 [US2] Verify ch14 references all 4 module chapters with valid relative links in `book-site/docs/capstone/ch14-autonomous-humanoid.md`

**Phase 4 Checkpoint**: Capstone written; all cross-references verified across modules

---

## Phase 5: User Story 3 — Instructor Uses Exercises (P3)

**Goal**: Ensure every exercise is standalone-usable as a lab assignment.

**Independent Test**: Extract exercise section from any chapter and verify it has prerequisites, steps, and expected output.

- [ ] T030 [US3] Audit exercises in Module 1 chapters (ch01–ch05) — verify each has: prerequisites, numbered steps, expected terminal output
- [ ] T031 [P] [US3] Audit exercises in Module 2 chapters (ch06–ch07) — same criteria
- [ ] T032 [P] [US3] Audit exercises in Module 3 chapters (ch08–ch10) — same criteria
- [ ] T033 [P] [US3] Audit exercises in Module 4 chapters (ch11–ch13) — same criteria
- [ ] T034 [P] [US3] Audit exercise in Capstone ch14
- [ ] T035 [US3] Add `[Hardware Required]` callout + simulation alternative to any exercise requiring physical hardware across all chapters

**Phase 5 Checkpoint**: All exercises are standalone lab-ready

---

## Phase 6: User Story 4 — Student Uses Appendices (P4)

**Goal**: Ensure appendix setup commands are correct and lead to a working environment.

**Independent Test**: Follow a2-software-installation.md from scratch on Ubuntu 22.04; verify ROS 2 talker runs.

- [ ] T036 [US4] Verify all bash commands in `book-site/docs/appendices/a1-hardware-setup.md` are syntactically valid
- [ ] T037 [P] [US4] Verify all bash commands in `book-site/docs/appendices/a2-software-installation.md` — ROS 2 install sequence correct for Ubuntu 22.04 Humble
- [ ] T038 [P] [US4] Verify all bash commands in `book-site/docs/appendices/a3-cloud-lab-setup.md`
- [ ] T039 [P] [US4] Verify all bash commands in `book-site/docs/appendices/a4-jetson-deployment.md`
- [ ] T040 [US4] Add cross-reference from ch01 intro to appendices setup section in `book-site/docs/module-1/ch01-intro-physical-ai.md`

**Phase 6 Checkpoint**: All appendices verified; students can set up environment before starting Module 1

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality audit, build verification, final integration

- [ ] T041 Run `content-reviewer` subagent on all 19 chapters — generate consolidated quality report
- [ ] T042 Fix any critical issues flagged by content-reviewer across all chapter files in `book-site/docs/`
- [ ] T043 Run `npm run build` in `book-site/` — verify exit code 0 with all 19 chapters
- [ ] T044 [P] Verify all Mermaid diagrams render correctly by checking `book-site/build/` output
- [ ] T045 [P] Verify no broken internal links reported by Docusaurus build in `book-site/`
- [ ] T046 Update `specs/002-write-chapters/quickstart.md` inventory table — mark all 19 chapters as ✅ Complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1
- **Phase 3 (US1 + US4)**: Depends on Phase 2 — Tracks A, B, C, D, E run in **parallel**
- **Phase 4 (US2 Capstone)**: Depends on **all** Phase 3 tracks completing
- **Phase 5 (US3 Exercises)**: Can start after Phase 3 tracks complete (parallel with Phase 4)
- **Phase 6 (US4 Appendix verification)**: Can run in parallel with Phase 4 and 5
- **Phase 7 (Polish)**: Depends on Phases 4, 5, 6 complete

### Within-Track Dependencies (Phase 3)

```
Track A: T007 → T008 → T009 → T010 → T011 (sequential)
Track B: T012 → T013 (sequential)
Track C: T014 → T015 → T016 (sequential)
Track D: T017 → T018 → T019 (sequential)
Track E: T020 → T021 → T022 → T023 (sequential)
Tracks A–E: fully parallel with each other
```

### Parallel Opportunities

- Phase 3 Tracks A, B, C, D, E — all parallel
- Phases 4, 5, 6 — can overlap after Phase 3 completes
- T025–T028 (cross-reference reviews) — parallel within Phase 4
- T031–T034 (exercise audits) — parallel within Phase 5
- T037–T039 (appendix verification) — parallel within Phase 6

---

## Parallel Execution Example: Phase 3

```
# Launch 5 tracks simultaneously as background agents:

Track A (Module 1): build-chapter ch01 → ch02 → ch03 → ch04 → ch05
Track B (Module 2): build-chapter ch06 → ch07
Track C (Module 3): build-chapter ch08 → ch09 → ch10
Track D (Module 4): build-chapter ch11 → ch12 → ch13
Track E (Appendices): build-chapter a1 → a2 → a3 → a4

# After all tracks complete:
Phase 4: build-chapter ch14 (capstone)
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (T001–T004)
2. Complete Phase 2 (T005–T006)
3. Complete Phase 3 Track A only (T007–T011) — Module 1 is readable
4. **STOP and VALIDATE**: Open dev server, read ch01–ch05 in sequence
5. Proceed to remaining tracks when validated

### Full Delivery (all stories)

1. Phases 1–2 (setup + foundation)
2. Phase 3 Tracks A–E in parallel (18 chapters)
3. Phase 4 (capstone) + Phases 5–6 in parallel
4. Phase 7 (polish + build check)
5. Commit to `002-write-chapters` branch

---

## Notes

- Each chapter uses the `build-chapter` skill: chapter-writer → code-example-generator → content-reviewer
- Chapter is marked ✅ only when content-reviewer passes with no critical issues
- Use `TODO(verify)` for any code examples you cannot verify for correctness (Constitution III)
- Commit after each module track completes (not per chapter)
- Total: 46 tasks across 7 phases
