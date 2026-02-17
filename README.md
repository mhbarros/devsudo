<div align="center">

# DevSudo

**Task management built for engineers who ship.**

[![Tauri](https://img.shields.io/badge/Tauri-2-24C8D8?logo=tauri&logoColor=white)](https://v2.tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Zustand](https://img.shields.io/badge/Zustand-5-433E38?logo=react&logoColor=white)](https://zustand.docs.pmnd.rs)
[![License](https://img.shields.io/badge/License-Private-red)]()

</div>

---

## The Problem

Most task management tools are built for managers, not makers. They're bloated with notifications, integrations, and dashboards that pull you *out* of focus instead of keeping you *in* it. Engineers don't need another SaaS with 47 Slack pings — they need a fast, local, distraction-free tool that lives on their desktop and stays out of the way.

## The Solution

DevSudo is a lightweight desktop app that combines **Kanban boards** with a **Flow Mode** — a focused execution environment where you pick a task, start a timer, and get it done. No accounts, no cloud sync, no distractions. Your data stays on your machine.

### Key Features

- **Kanban Board** — Organize tasks across customizable lanes (Backlog → To Do → Doing → Done) with drag-and-drop powered by DND Kit
- **Flow Mode** — Enter a focused, resized window (420×640) with a stopwatch timer, work on one task at a time, and celebrate completions with confetti
- **Workspaces** — Separate boards for different projects, plus a persistent Workbench for quick captures
- **Priorities** — P0 through P3 with color-coded indicators so you always know what matters
- **Categories** — Reusable color-coded labels to tag and filter tasks
- **100% Offline** — All data persisted locally via Tauri Store plugin, zero network requests
- **Dark Mode** — Automatic theme based on system preference

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Runtime | [Tauri 2](https://v2.tauri.app) (Rust) |
| Frontend | [React 19](https://react.dev) + [TypeScript 5.8](https://www.typescriptlang.org) |
| Bundler | [Vite 7](https://vite.dev) |
| State Management | [Zustand 5](https://zustand.docs.pmnd.rs) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) |
| Drag & Drop | [DND Kit](https://dndkit.com) |
| Routing | [React Router 7](https://reactrouter.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Persistence | Tauri Store plugin → `devsudo-store.json` (falls back to localStorage in browser) |

## Project Structure

```
devsudo/
├── src/
│   ├── components/
│   │   ├── board/          # Kanban board: lanes, task cards, drag-and-drop
│   │   ├── flow/           # Flow Mode: timer, task list, completion overlay
│   │   ├── task/           # Task editor dialog, priority & category selectors
│   │   ├── ui/             # Base primitives (Button, Dialog, Input)
│   │   └── workspace/      # Workspace cards and creation dialog
│   ├── hooks/
│   │   └── useStopwatch.ts # Timer hook for Flow Mode
│   ├── lib/
│   │   ├── constants.ts    # Priority levels, colors, defaults
│   │   └── utils.ts        # Utility helpers (cn, etc.)
│   ├── pages/
│   │   ├── HomeScreen.tsx       # Workspace selector (/)
│   │   ├── WorkspaceView.tsx    # Kanban board (/workspace/:id)
│   │   └── FlowModeView.tsx     # Focused execution (/flow/:workspaceId)
│   ├── store/
│   │   ├── useAppStore.ts  # Single Zustand store for all app state
│   │   └── persistence.ts  # Tauri Store / localStorage adapter
│   ├── types/
│   │   └── index.ts        # Core data model (Workspace, Lane, Task, Category)
│   ├── styles/             # Global styles
│   ├── App.tsx             # Root component with router
│   └── main.tsx            # Entry point
├── src-tauri/
│   ├── src/                # Rust backend
│   ├── tauri.conf.json     # Tauri app configuration
│   ├── Cargo.toml          # Rust dependencies
│   └── icons/              # App icons for all platforms
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (LTS)
- [pnpm](https://pnpm.io)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri 2 prerequisites](https://v2.tauri.app/start/prerequisites/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/devsudo.git
cd devsudo

# Install dependencies
pnpm install

# Run in browser (dev server only)
pnpm dev

# Run as desktop app
pnpm tauri dev
```

### Build for Production

```bash
pnpm tauri build
```

The built binary will be in `src-tauri/target/release/`.

## Data Model

```
Workspace (1) ──→ (N) Lane (1) ──→ (N) Task
                                        ├── priority: P0–P3
                                        ├── category?: Category
                                        └── inFlowZone: boolean
```

- All entities use `nanoid()` for IDs
- Numeric `order` fields for drag-and-drop sorting
- ISO 8601 timestamps for creation and updates
- One default **Workbench** workspace that cannot be deleted

## Screens

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Home | Select or create workspaces |
| `/workspace/:id` | Workspace | Kanban board with Flow Zone sidebar |
| `/flow/:workspaceId` | Flow Mode | Focused task execution with timer |
