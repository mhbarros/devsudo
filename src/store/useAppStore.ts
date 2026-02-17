import { create } from "zustand";
import { nanoid } from "nanoid";
import type { Task, Lane, Category, Workspace } from "../types";
import { DEFAULT_LANES } from "../lib/constants";
import { getNextOrder } from "../lib/utils";
import { persistState, loadPersistedState } from "./persistence";

interface PersistedData {
  workspaces: Workspace[];
  lanes: Lane[];
  tasks: Task[];
  categories: Category[];
  flowNotes: Record<string, string>;
}

interface AppState extends PersistedData {
  initialized: boolean;

  initialize: () => Promise<void>;

  createWorkspace: (name: string) => void;
  deleteWorkspace: (id: string) => void;

  createLane: (workspaceId: string, title: string) => void;
  deleteLane: (id: string) => void;
  reorderLanes: (workspaceId: string, laneIds: string[]) => void;

  createTask: (laneId: string, title: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, toLaneId: string, newOrder: number) => void;
  addTaskToFlowZone: (taskId: string) => void;
  removeTaskFromFlowZone: (taskId: string) => void;
  clearFlowZone: (workspaceId: string) => void;
  completeFlowTasks: (workspaceId: string, completedTaskIds: string[]) => void;

  reorderTaskInLane: (taskId: string, overTaskId: string) => void;
  reorderFlowTasks: (taskId: string, overTaskId: string, workspaceId: string) => void;

  setFlowNotes: (workspaceId: string, notes: string) => void;

  completeTask: (taskId: string) => void;
  createCategory: (name: string, color: string) => void;
}

function getPersistedData(state: AppState): PersistedData {
  return {
    workspaces: state.workspaces,
    lanes: state.lanes,
    tasks: state.tasks,
    categories: state.categories,
    flowNotes: state.flowNotes,
  };
}

export const useAppStore = create<AppState>()((set, get) => ({
  workspaces: [],
  lanes: [],
  tasks: [],
  categories: [],
  flowNotes: {},
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;
    const data = await loadPersistedState<PersistedData>();
    if (data && data.workspaces && data.workspaces.length > 0) {
      set({ ...data, flowNotes: data.flowNotes ?? {}, initialized: true });
    } else {
      const workbenchId = nanoid();
      const now = new Date().toISOString();
      const workbench: Workspace = {
        id: workbenchId,
        name: "Workbench",
        isWorkbench: true,
        createdAt: now,
        order: 0,
      };
      const defaultLanes: Lane[] = DEFAULT_LANES.map((title, i) => ({
        id: nanoid(),
        workspaceId: workbenchId,
        title,
        order: i,
        isDefault: true,
      }));
      const newState = {
        workspaces: [workbench],
        lanes: defaultLanes,
        tasks: [],
        categories: [],
        flowNotes: {},
        initialized: true,
      };
      set(newState);
      await persistState(getPersistedData({ ...get(), ...newState }));
    }
  },

  createWorkspace: (name) => {
    const id = nanoid();
    const now = new Date().toISOString();
    const workspace: Workspace = {
      id,
      name,
      isWorkbench: false,
      createdAt: now,
      order: getNextOrder(get().workspaces),
    };
    const defaultLanes: Lane[] = DEFAULT_LANES.map((title, i) => ({
      id: nanoid(),
      workspaceId: id,
      title,
      order: i,
      isDefault: true,
    }));
    set((s) => ({
      workspaces: [...s.workspaces, workspace],
      lanes: [...s.lanes, ...defaultLanes],
    }));
    persistState(getPersistedData(get()));
  },

  deleteWorkspace: (id) => {
    const ws = get().workspaces.find((w) => w.id === id);
    if (!ws || ws.isWorkbench) return;
    const laneIds = get()
      .lanes.filter((l) => l.workspaceId === id)
      .map((l) => l.id);
    set((s) => ({
      workspaces: s.workspaces.filter((w) => w.id !== id),
      lanes: s.lanes.filter((l) => l.workspaceId !== id),
      tasks: s.tasks.filter((t) => !laneIds.includes(t.laneId)),
    }));
    persistState(getPersistedData(get()));
  },

  createLane: (workspaceId, title) => {
    const lane: Lane = {
      id: nanoid(),
      workspaceId,
      title,
      order: getNextOrder(get().lanes.filter((l) => l.workspaceId === workspaceId)),
      isDefault: false,
    };
    set((s) => ({ lanes: [...s.lanes, lane] }));
    persistState(getPersistedData(get()));
  },

  deleteLane: (id) => {
    const lane = get().lanes.find((l) => l.id === id);
    if (!lane || lane.isDefault) return;
    set((s) => ({
      lanes: s.lanes.filter((l) => l.id !== id),
      tasks: s.tasks.filter((t) => t.laneId !== id),
    }));
    persistState(getPersistedData(get()));
  },

  reorderLanes: (workspaceId, laneIds) => {
    set((s) => ({
      lanes: s.lanes.map((l) => {
        if (l.workspaceId !== workspaceId) return l;
        const newOrder = laneIds.indexOf(l.id);
        return newOrder >= 0 ? { ...l, order: newOrder } : l;
      }),
    }));
    persistState(getPersistedData(get()));
  },

  createTask: (laneId, title) => {
    const now = new Date().toISOString();
    const task: Task = {
      id: nanoid(),
      title,
      description: "",
      laneId,
      createdAt: now,
      updatedAt: now,
      order: getNextOrder(get().tasks.filter((t) => t.laneId === laneId)),
      inFlowZone: false,
    };
    set((s) => ({ tasks: [...s.tasks, task] }));
    persistState(getPersistedData(get()));
  },

  updateTask: (id, updates) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
      ),
    }));
    persistState(getPersistedData(get()));
  },

  deleteTask: (id) => {
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    persistState(getPersistedData(get()));
  },

  moveTask: (taskId, toLaneId, newOrder) => {
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, laneId: toLaneId, order: newOrder, inFlowZone: false, updatedAt: new Date().toISOString() };
        }
        // Shift tasks in the target lane at or after the insertion point
        if (t.laneId === toLaneId && t.order >= newOrder) {
          return { ...t, order: t.order + 1 };
        }
        return t;
      }),
    }));
    persistState(getPersistedData(get()));
  },

  addTaskToFlowZone: (taskId) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, inFlowZone: true, updatedAt: new Date().toISOString() } : t,
      ),
    }));
    persistState(getPersistedData(get()));
  },

  removeTaskFromFlowZone: (taskId) => {
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, inFlowZone: false, updatedAt: new Date().toISOString() } : t,
      ),
    }));
    persistState(getPersistedData(get()));
  },

  clearFlowZone: (workspaceId) => {
    const ws = get().workspaces.find((w) => w.id === workspaceId);
    const isWorkbench = ws?.isWorkbench ?? false;
    const laneIds = isWorkbench
      ? get().lanes.filter((l) => {
          const lws = get().workspaces.find((w) => w.id === l.workspaceId);
          return lws && !lws.isWorkbench;
        }).map((l) => l.id)
      : get().lanes.filter((l) => l.workspaceId === workspaceId).map((l) => l.id);
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.inFlowZone && laneIds.includes(t.laneId)
          ? { ...t, inFlowZone: false, updatedAt: new Date().toISOString() }
          : t,
      ),
    }));
    persistState(getPersistedData(get()));
  },

  completeFlowTasks: (workspaceId, completedTaskIds) => {
    const ws = get().workspaces.find((w) => w.id === workspaceId);
    const isWorkbench = ws?.isWorkbench ?? false;

    // Build a map of each task's own workspace todoLane
    const todoLaneByWorkspace = new Map<string, string>();
    const allWorkspaceIds = isWorkbench
      ? get().workspaces.filter((w) => !w.isWorkbench).map((w) => w.id)
      : [workspaceId];

    for (const wsId of allWorkspaceIds) {
      const todoLane = get().lanes.find((l) => l.workspaceId === wsId && l.title === "To do");
      if (todoLane) todoLaneByWorkspace.set(wsId, todoLane.id);
    }

    const relevantLaneIds = new Set(
      get().lanes.filter((l) => allWorkspaceIds.includes(l.workspaceId)).map((l) => l.id),
    );

    set((s) => ({
      tasks: s.tasks
        .filter((t) => !completedTaskIds.includes(t.id))
        .map((t) => {
          if (t.inFlowZone && relevantLaneIds.has(t.laneId)) {
            const lane = get().lanes.find((l) => l.id === t.laneId);
            const todoLaneId = lane ? todoLaneByWorkspace.get(lane.workspaceId) : undefined;
            return {
              ...t,
              inFlowZone: false,
              ...(todoLaneId ? { laneId: todoLaneId } : {}),
              updatedAt: new Date().toISOString(),
            };
          }
          return t;
        }),
    }));
    persistState(getPersistedData(get()));
  },

  setFlowNotes: (workspaceId, notes) => {
    set((s) => ({
      flowNotes: { ...s.flowNotes, [workspaceId]: notes },
    }));
    persistState(getPersistedData(get()));
  },

  reorderTaskInLane: (taskId, overTaskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    const overTask = get().tasks.find((t) => t.id === overTaskId);
    if (!task || !overTask || task.laneId !== overTask.laneId) return;

    const laneTasks = get()
      .tasks.filter((t) => t.laneId === task.laneId && !t.inFlowZone)
      .sort((a, b) => a.order - b.order);

    const oldIndex = laneTasks.findIndex((t) => t.id === taskId);
    const newIndex = laneTasks.findIndex((t) => t.id === overTaskId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = [...laneTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const orderMap = new Map(reordered.map((t, i) => [t.id, i]));
    set((s) => ({
      tasks: s.tasks.map((t) => {
        const newOrder = orderMap.get(t.id);
        return newOrder !== undefined ? { ...t, order: newOrder } : t;
      }),
    }));
    persistState(getPersistedData(get()));
  },

  reorderFlowTasks: (taskId, overTaskId, workspaceId) => {
    const laneIds = get()
      .lanes.filter((l) => l.workspaceId === workspaceId)
      .map((l) => l.id);
    const flowTasks = get()
      .tasks.filter((t) => t.inFlowZone && laneIds.includes(t.laneId))
      .sort((a, b) => a.order - b.order);

    const oldIndex = flowTasks.findIndex((t) => t.id === taskId);
    const newIndex = flowTasks.findIndex((t) => t.id === overTaskId);
    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

    const reordered = [...flowTasks];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const orderMap = new Map(reordered.map((t, i) => [t.id, i]));
    set((s) => ({
      tasks: s.tasks.map((t) => {
        const newOrder = orderMap.get(t.id);
        return newOrder !== undefined ? { ...t, order: newOrder } : t;
      }),
    }));
    persistState(getPersistedData(get()));
  },

  completeTask: (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    const lane = get().lanes.find((l) => l.id === task.laneId);
    if (!lane) return;
    const doneLane = get().lanes.find(
      (l) => l.workspaceId === lane.workspaceId && l.title === "Done",
    );
    if (!doneLane) return;
    const doneTasks = get().tasks.filter((t) => t.laneId === doneLane.id);
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              laneId: doneLane.id,
              order: doneTasks.length,
              inFlowZone: false,
              updatedAt: new Date().toISOString(),
            }
          : t,
      ),
    }));
    persistState(getPersistedData(get()));
  },

  createCategory: (name, color) => {
    const category: Category = { id: nanoid(), name, color };
    set((s) => ({ categories: [...s.categories, category] }));
    persistState(getPersistedData(get()));
  },
}));
