# Research: Docusaurus Site Setup

**Feature**: 001-docusaurus-site-setup
**Date**: 2026-03-05

## R1: Docusaurus 3 Project Initialization

**Decision**: Use `npx create-docusaurus@latest book-site classic --typescript`
**Rationale**: The classic preset includes docs, blog (removable), and pages plugins pre-configured. TypeScript is required by constitution. Docusaurus 3 uses MDX v3 by default.
**Alternatives considered**:
- Manual setup from scratch — rejected: unnecessary complexity for a hackathon
- Docusaurus 2 — rejected: Docusaurus 3 has built-in Mermaid support and better MDX

## R2: Sidebar Configuration Strategy

**Decision**: Use category-based sidebar with `_category_.json` files per module folder
**Rationale**: Docusaurus supports auto-generated sidebars from folder structure. Using `_category_.json` in each module folder gives us collapsible module groups without manual `sidebars.ts` maintenance. Each chapter's `sidebar_position` in frontmatter controls ordering within the group.
**Alternatives considered**:
- Manual `sidebars.ts` with explicit items array — rejected: harder to maintain as chapters are added
- Single flat folder with all chapters — rejected: no module grouping in sidebar

## R3: Docs Folder Structure

**Decision**: Nested folder structure under `book-site/docs/`:
```
docs/
├── intro/           (Preface)
├── module-1/        (Chapters 1-5)
├── module-2/        (Chapters 6-7)
├── module-3/        (Chapters 8-10)
├── module-4/        (Chapters 11-13)
├── capstone/        (Chapter 14)
└── appendices/      (A1-A4)
```
**Rationale**: Maps directly to syllabus modules. Each folder becomes a collapsible sidebar category. `_category_.json` in each folder sets the group label and position.
**Alternatives considered**:
- Flat structure with all .md in docs/ — rejected: no sidebar grouping
- Numbered folders (01-module-1/) — rejected: folder names become URL slugs; cleaner without numbers

## R4: GitHub Pages Deployment

**Decision**: Use GitHub Actions with `actions/deploy-pages@v4` triggered on push to main
**Rationale**: Official GitHub-recommended approach for static site deployment. Docusaurus build output goes to `book-site/build/`, which is uploaded as an artifact and deployed to Pages.
**Alternatives considered**:
- `docusaurus deploy` with SSH — rejected: requires SSH key management
- Vercel — rejected: hackathon requires GitHub Pages as primary deployment target

## R5: Landing Page Implementation

**Decision**: Use Docusaurus pages plugin with a custom `src/pages/index.tsx` landing page
**Rationale**: Per clarification, the site needs a dedicated hero landing page at root URL. Docusaurus classic preset includes pages plugin. Docs are served at `/docs/` path. Landing page includes hero banner with book title and "Start Reading" CTA.
**Alternatives considered**:
- docs-only mode with `routeBasePath: '/'` — rejected: user chose dedicated landing page
- Static HTML — rejected: doesn't integrate with Docusaurus theme/navigation

## R6: Mermaid Diagram Support

**Decision**: Use `@docusaurus/theme-mermaid` plugin (built-in to Docusaurus 3)
**Rationale**: Native Docusaurus integration, no external dependencies. Enable via `markdown.mermaid: true` in config and add theme to `themes` array.
**Alternatives considered**:
- `mdx-mermaid` plugin — rejected: third-party, less maintained than built-in

## R7: Theme Customization

**Decision**: Use classic theme with custom color palette (dark/light) via `themeConfig.colorMode`
**Rationale**: Dark/light toggle is a FR (FR-005). Classic theme provides this out of the box. Custom colors can be set in `src/css/custom.css` using CSS variables.
**Alternatives considered**:
- Custom theme from scratch — rejected: over-engineering for a hackathon
