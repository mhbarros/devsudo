# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DevSudo is a desktop task management app for engineers built with **Tauri 2 + React 19 + TypeScript + Zustand**. All data is local (no external APIs). Package manager is **pnpm**.

## Commands

```bash
pnpm dev              # Start Vite dev server (port 1420)
pnpm build            # TypeScript check + Vite production build
pnpm tauri dev        # Launch full Tauri desktop app (runs pnpm dev internally)
pnpm tauri build      # Build production desktop binary
```

No test framework or linter is configured.

## Architecture

### Routing (React Router)

- `/` → HomeScreen — workspace selector
- `/workspace/:id` → WorkspaceView — Kanban board with flow zone sidebar
- `/flow/:workspaceId` → FlowModeView — focused task execution (resizes to 420x640 in Tauri)

### State Management

Single Zustand store (`src/store/useAppStore.ts`) holds all app state: workspaces, lanes, tasks, categories. Every mutation calls `persistState()` immediately.

**Persistence** (`src/store/persistence.ts`): Uses Tauri Store plugin (`devsudo-store.json`) when running in Tauri, falls back to localStorage in browser. App shows a loading state during async initialization.

### Core Data Model (`src/types/index.ts`)

- **Workspace** — contains lanes; one default "Workbench" workspace (isWorkbench=true, cannot be deleted)
- **Lane** — Kanban column belonging to a workspace; defaults: Backlog → To do → Doing → Done
- **Task** — belongs to a lane; has priority (P0–P3), optional category, `inFlowZone` flag
- **Category** — reusable label with color

All entities use `nanoid()` for IDs, numeric `order` fields for sorting, and ISO 8601 timestamps.

### Component Organization

- `src/components/ui/` — Base primitives (Button, Dialog, Input)
- `src/components/board/` — Kanban board with DND Kit drag-and-drop
- `src/components/flow/` — Flow mode: stopwatch timer, task completion with confetti
- `src/components/task/` — Task editor dialog, priority/category selectors
- `src/components/workspace/` — Workspace cards and creation dialog

### Key Patterns

- Tailwind CSS with dark mode via `prefers-color-scheme` (media strategy)
- Custom hook `useStopwatch` for flow mode timer
- Priority constants with colors defined in `src/lib/constants.ts`
- Utility helpers in `src/lib/utils.ts` (includes `cn()` for classname merging)
- Vite config disables clear screen to preserve Rust compiler errors, excludes `src-tauri/` from watch
