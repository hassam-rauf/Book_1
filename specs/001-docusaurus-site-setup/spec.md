# Feature Specification: Docusaurus Book Site Setup

**Feature Branch**: `001-docusaurus-site-setup`
**Created**: 2026-03-05
**Status**: Draft
**Input**: User description: "F1: Docusaurus Book Site Setup - Initialize a Docusaurus 3 static site with the complete chapter structure for the Physical AI & Humanoid Robotics textbook. 15 chapters + preface + capstone + 4 appendices, sidebar navigation, custom theme, and deployment configuration for GitHub Pages."

## Clarifications

### Session 2026-03-05

- Q: Should the homepage be a dedicated landing page or docs-only mode? → A: Dedicated landing page with hero banner; docs served under `/docs/` path.

## User Scenarios & Testing

### User Story 1 - Browse Textbook Online (Priority: P1)

A reader visits the published GitHub Pages URL and sees a professionally styled textbook site with a sidebar listing all chapters in order. They can click any chapter to read its content, and the site supports both dark and light modes.

**Why this priority**: The entire hackathon project depends on a functional, deployed book site. Without this, no other features (RAG chatbot, auth, personalization) can exist.

**Independent Test**: Can be fully tested by visiting the deployed URL, verifying the homepage loads, sidebar shows all chapters, and clicking through chapter navigation delivers content.

**Acceptance Scenarios**:

1. **Given** the site is deployed to GitHub Pages, **When** a reader visits the root URL, **Then** they see a dedicated landing page with a hero banner displaying the book title "Physical AI & Humanoid Robotics" and a call-to-action to start reading (linking to `/docs/`)
2. **Given** the sidebar is visible, **When** a reader clicks on any chapter title, **Then** the chapter content page loads with the correct heading and placeholder content
3. **Given** a chapter page is loaded, **When** the reader clicks the next/previous navigation, **Then** they move to the adjacent chapter in order

---

### User Story 2 - Navigate Chapter Structure (Priority: P1)

A reader wants to find a specific topic (e.g., "NVIDIA Isaac Sim") and uses the sidebar to browse through modules and chapters organized by week and module grouping.

**Why this priority**: Proper information architecture is essential for a textbook. Readers must find content quickly without scrolling through a flat list.

**Independent Test**: Can be tested by verifying the sidebar shows grouped modules (Module 1-4) with chapters nested under each, and that clicking any item navigates correctly.

**Acceptance Scenarios**:

1. **Given** the sidebar is displayed, **When** a reader looks at the chapter list, **Then** chapters are organized into 4 module groups matching the syllabus
2. **Given** the sidebar shows module groups, **When** a reader expands Module 3, **Then** they see chapters covering NVIDIA Isaac topics (Weeks 8-10)
3. **Given** the site has 19 content sections, **When** a reader counts sidebar items, **Then** all 15 chapters + preface + capstone + 4 appendices are listed

---

### User Story 3 - Local Development Workflow (Priority: P2)

A developer (the hackathon participant) runs the site locally to preview changes before deploying. They start a development server, edit markdown files, and see live updates in the browser.

**Why this priority**: Fast iteration during content creation is important but secondary to the deployed site existing at all.

**Independent Test**: Can be tested by running the development server locally, opening the browser, editing a markdown file, and confirming the change appears without page reload.

**Acceptance Scenarios**:

1. **Given** the project is cloned and dependencies installed, **When** the developer runs the start command, **Then** a local server launches and the site opens in a browser
2. **Given** the local server is running, **When** the developer edits a chapter markdown file, **Then** the browser automatically refreshes to show the change
3. **Given** the developer wants to test the production build, **When** they run the build command, **Then** it completes without errors and produces static files

---

### User Story 4 - Automated Deployment (Priority: P2)

When changes are pushed to the main branch, the site automatically builds and deploys to GitHub Pages without manual intervention.

**Why this priority**: Automated deployment ensures the published site stays current and reduces manual steps during the hackathon.

**Independent Test**: Can be tested by pushing a commit to main and verifying the site updates on GitHub Pages within a few minutes.

**Acceptance Scenarios**:

1. **Given** a GitHub Actions workflow is configured, **When** a commit is pushed to the main branch, **Then** the workflow triggers, builds the site, and deploys to GitHub Pages
2. **Given** the deployment workflow runs, **When** the build succeeds, **Then** the updated site is accessible at the GitHub Pages URL within 5 minutes
3. **Given** the deployment workflow runs, **When** the build fails, **Then** the workflow reports the failure and the previously deployed version remains live

---

### Edge Cases

- What happens when a chapter markdown file has invalid frontmatter? The build should report an error with the file path and line number.
- How does the site handle chapters with no content (placeholder only)? It should display the chapter title and a "Content coming soon" message.
- What happens if the GitHub Pages deployment is attempted on a private repository? Deployment should still work (GitHub Pages supports private repos with GitHub Pro or organizational accounts).
- How does the sidebar behave with 19+ items on mobile? The sidebar should be collapsible and scrollable.

## Requirements

### Functional Requirements

- **FR-001**: System MUST generate a Docusaurus 3 static site with TypeScript configuration
- **FR-002**: System MUST include 19 content sections organized as: 1 preface, 13 weekly chapters, 1 capstone project, and 4 appendices
- **FR-003**: System MUST organize chapters into 4 module groups in the sidebar matching the syllabus structure (Module 1: Weeks 1-5, Module 2: Weeks 6-7, Module 3: Weeks 8-10, Module 4: Weeks 11-13)
- **FR-004**: System MUST provide placeholder markdown files for each chapter with correct frontmatter (sidebar_position, title, description)
- **FR-005**: System MUST support dark mode and light mode toggling
- **FR-006**: System MUST provide a dedicated landing page at the root URL with a hero banner displaying the book title "Physical AI & Humanoid Robotics" and a call-to-action linking to the docs section at `/docs/`
- **FR-007**: System MUST include next/previous chapter navigation at the bottom of each chapter page
- **FR-008**: System MUST produce a static build that can be hosted on GitHub Pages
- **FR-009**: System MUST include a GitHub Actions workflow that automatically builds and deploys on push to main
- **FR-010**: System MUST support a local development server with hot-reload for content editing
- **FR-011**: System MUST render Mermaid diagrams within markdown content
- **FR-012**: System MUST render code blocks with syntax highlighting for Python, C++, YAML, and bash

### Chapter Structure

The following 19 sections MUST be present:

| # | Section | Sidebar Group | Syllabus Mapping |
|---|---------|---------------|-----------------|
| 0 | Preface & Course Overview | Introduction | Course intro |
| 1 | Introduction to Physical AI | Module 1 | Week 1 |
| 2 | Embodied Intelligence & Sensors | Module 1 | Week 2 |
| 3 | ROS 2 Architecture & Core Concepts | Module 1 | Week 3 |
| 4 | ROS 2 Nodes, Topics & Services | Module 1 | Week 4 |
| 5 | Building ROS 2 Packages with Python | Module 1 | Week 5 |
| 6 | Gazebo Simulation Environment | Module 2 | Week 6 |
| 7 | Robot Description: URDF & SDF | Module 2 | Week 7 |
| 8 | NVIDIA Isaac SDK & Isaac Sim | Module 3 | Week 8 |
| 9 | AI-Powered Perception & Manipulation | Module 3 | Week 9 |
| 10 | Sim-to-Real Transfer | Module 3 | Week 10 |
| 11 | Humanoid Kinematics & Dynamics | Module 4 | Week 11 |
| 12 | Bipedal Locomotion & Balance | Module 4 | Week 12 |
| 13 | Conversational Robotics & VLA | Module 4 | Week 13 |
| 14 | Capstone Project: Autonomous Humanoid | Capstone | Final project |
| A1 | Hardware Setup Guide | Appendices | Reference |
| A2 | Software Installation Guide | Appendices | Reference |
| A3 | Cloud Lab Setup | Appendices | Reference |
| A4 | Jetson Deployment Guide | Appendices | Reference |

### Key Entities

- **Chapter**: A markdown file representing one unit of content, with frontmatter metadata (title, position, description) and body content
- **Module**: A logical grouping of chapters in the sidebar corresponding to a syllabus module
- **Sidebar**: A hierarchical navigation component with collapsible module groups
- **Site Configuration**: The central configuration file controlling site metadata, theme, plugins, and deployment settings

## Success Criteria

### Measurable Outcomes

- **SC-001**: All 19 content sections are accessible via sidebar navigation and direct URL
- **SC-002**: Site builds successfully with zero errors in under 2 minutes on a standard machine
- **SC-003**: Deployed site loads in under 3 seconds on a standard internet connection
- **SC-004**: Readers can navigate from any chapter to any other chapter in 2 clicks or fewer (via sidebar)
- **SC-005**: Dark/light mode toggle works without page reload
- **SC-006**: Automated deployment completes within 5 minutes of pushing to main branch
- **SC-007**: Local development server starts in under 30 seconds with hot-reload functional
- **SC-008**: Site renders correctly on mobile viewports (sidebar collapses to hamburger menu)

## Assumptions

- Node.js 18+ is available in the development environment
- The GitHub repository is already created and accessible
- GitHub Pages is enabled on the repository (or can be enabled)
- The "classic" Docusaurus theme is appropriate for a textbook format
- TypeScript is preferred over JavaScript for configuration files
- The chapter content will be added later (Feature F2) — this feature only creates the structure with placeholders
- Mermaid diagram support is included via Docusaurus MDX plugin (built-in since Docusaurus 3)
