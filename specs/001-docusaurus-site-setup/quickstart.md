# Quickstart: Docusaurus Site Setup

## Prerequisites

- Node.js 18+ installed
- npm available
- Git repository initialized

## Setup Steps

```bash
# 1. Create Docusaurus project
npx create-docusaurus@latest book-site classic --typescript

# 2. Navigate to project
cd book-site

# 3. Install Mermaid theme
npm install @docusaurus/theme-mermaid

# 4. Start development server
npm start
```

## Folder Structure After Setup

```
book-site/
├── docs/
│   ├── intro/
│   │   └── index.md              # Preface
│   ├── module-1/
│   │   ├── _category_.json       # "Module 1: The Robotic Nervous System"
│   │   ├── ch01-intro-physical-ai.md
│   │   ├── ch02-embodied-intelligence.md
│   │   ├── ch03-ros2-architecture.md
│   │   ├── ch04-ros2-nodes-topics.md
│   │   └── ch05-ros2-packages-python.md
│   ├── module-2/
│   │   ├── _category_.json       # "Module 2: The Digital Twin"
│   │   ├── ch06-gazebo-simulation.md
│   │   └── ch07-urdf-sdf.md
│   ├── module-3/
│   │   ├── _category_.json       # "Module 3: The AI-Robot Brain"
│   │   ├── ch08-nvidia-isaac.md
│   │   ├── ch09-perception-manipulation.md
│   │   └── ch10-sim-to-real.md
│   ├── module-4/
│   │   ├── _category_.json       # "Module 4: Vision-Language-Action"
│   │   ├── ch11-humanoid-kinematics.md
│   │   ├── ch12-bipedal-locomotion.md
│   │   └── ch13-conversational-robotics.md
│   ├── capstone/
│   │   ├── _category_.json       # "Capstone Project"
│   │   └── ch14-autonomous-humanoid.md
│   └── appendices/
│       ├── _category_.json       # "Appendices"
│       ├── a1-hardware-setup.md
│       ├── a2-software-installation.md
│       ├── a3-cloud-lab-setup.md
│       └── a4-jetson-deployment.md
├── src/
│   ├── css/custom.css
│   └── pages/index.tsx           # Landing page with hero banner
├── static/
│   └── img/                      # Book logo, hero images
├── docusaurus.config.ts
├── sidebars.ts
├── package.json
└── tsconfig.json
```

## Key Commands

```bash
npm start          # Dev server with hot-reload
npm run build      # Production build
npm run serve      # Serve production build locally
npm run deploy     # Deploy to GitHub Pages (if configured)
```

## Verification

After setup, verify:
1. `npm start` launches site at localhost:3000
2. Sidebar shows all 7 groups (Intro, Module 1-4, Capstone, Appendices)
3. All 19 pages are navigable
4. Dark/light toggle works
5. `npm run build` completes without errors
