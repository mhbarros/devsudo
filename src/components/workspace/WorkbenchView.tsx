import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Pencil, Trash2, Zap } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { DEFAULT_LANES, PRIORITY_COLORS } from "../../lib/constants";
import { TaskEditorDialog } from "../task/TaskEditorDialog";
import type { Task, Category } from "../../types";

export function WorkbenchView() {
  const navigate = useNavigate();
  const workspaces = useAppStore((s) => s.workspaces);
  const allLanes = useAppStore((s) => s.lanes);
  const allTasks = useAppStore((s) => s.tasks);
  const categories = useAppStore((s) => s.categories);
  const completeTask = useAppStore((s) => s.completeTask);
  const deleteTask = useAppStore((s) => s.deleteTask);
  const addTaskToFlowZone = useAppStore((s) => s.addTaskToFlowZone);
  const removeTaskFromFlowZone = useAppStore((s) => s.removeTaskFromFlowZone);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const nonWorkbenchWorkspaces = useMemo(
    () => workspaces.filter((w) => !w.isWorkbench),
    [workspaces],
  );

  // Map each lane to its workspace and title
  const laneInfo = useMemo(() => {
    const map = new Map<string, { workspaceId: string; title: string }>();
    for (const lane of allLanes) {
      map.set(lane.id, { workspaceId: lane.workspaceId, title: lane.title });
    }
    return map;
  }, [allLanes]);

  // Build workspace name lookup
  const workspaceNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const ws of workspaces) {
      map.set(ws.id, ws.name);
    }
    return map;
  }, [workspaces]);

  // Group tasks from non-workbench workspaces into the 4 default columns
  const columns = useMemo(() => {
    const nonWbIds = new Set(nonWorkbenchWorkspaces.map((w) => w.id));
    const cols: Record<string, Task[]> = {};
    for (const title of DEFAULT_LANES) {
      cols[title] = [];
    }

    for (const task of allTasks) {
      if (task.inFlowZone) continue;
      const info = laneInfo.get(task.laneId);
      if (!info || !nonWbIds.has(info.workspaceId)) continue;
      if (cols[info.title]) {
        cols[info.title].push(task);
      }
    }

    // Sort each column by order
    for (const title of DEFAULT_LANES) {
      cols[title].sort((a, b) => a.order - b.order);
    }

    return cols;
  }, [allTasks, laneInfo, nonWorkbenchWorkspaces]);

  // Flow tasks from all non-workbench workspaces
  const flowTasks = useMemo(() => {
    const nonWbIds = new Set(nonWorkbenchWorkspaces.map((w) => w.id));
    return allTasks
      .filter((t) => {
        if (!t.inFlowZone) return false;
        const info = laneInfo.get(t.laneId);
        return info && nonWbIds.has(info.workspaceId);
      })
      .sort((a, b) => a.order - b.order);
  }, [allTasks, laneInfo, nonWorkbenchWorkspaces]);

  // Get the workbench workspace ID for "Start Flow" navigation
  const workbenchId = useMemo(
    () => workspaces.find((w) => w.isWorkbench)?.id ?? "",
    [workspaces],
  );

  if (nonWorkbenchWorkspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-gray-400">No workspaces yet</p>
        <p className="mt-1 text-sm text-gray-400">
          Create workspaces from the home screen to see tasks here
        </p>
      </div>
    );
  }

  const getWorkspaceName = (task: Task) => {
    const info = laneInfo.get(task.laneId);
    if (!info) return "";
    return workspaceNames.get(info.workspaceId) ?? "";
  };

  const isDone = (task: Task) => {
    const info = laneInfo.get(task.laneId);
    return info?.title === "Done";
  };

  return (
    <>
      <div className="flex h-full">
        <div className="flex flex-1 gap-4 overflow-x-auto p-4">
          {DEFAULT_LANES.map((title) => (
            <div
              key={title}
              className="flex w-72 shrink-0 flex-col rounded-xl bg-gray-100 p-3 dark:bg-gray-900/50"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {title}
                </h3>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {columns[title].length}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto" style={{ minHeight: 40 }}>
                {columns[title].map((task) => (
                  <WorkbenchTaskCard
                    key={task.id}
                    task={task}
                    workspaceName={getWorkspaceName(task)}
                    category={categories.find((c) => c.id === task.categoryId)}
                    done={isDone(task)}
                    onComplete={() => completeTask(task.id)}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => deleteTask(task.id)}
                    onAddToFlow={() => addTaskToFlowZone(task.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Flow Zone Sidebar */}
        <div className="flex w-72 shrink-0 flex-col border-l border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <Zap size={18} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Flow Zone
            </h2>
            {flowTasks.length > 0 && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {flowTasks.length}
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3" style={{ minHeight: 100 }}>
            {flowTasks.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
                <Zap size={32} className="mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Click the bolt icon on tasks to add them to flow
                </p>
              </div>
            ) : (
              flowTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-start gap-2 rounded-lg border border-indigo-200 bg-indigo-50 p-2.5 dark:border-indigo-800 dark:bg-indigo-950/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {task.title}
                    </p>
                    <span className="mt-1 inline-block rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {getWorkspaceName(task)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeTaskFromFlowZone(task.id)}
                    className="shrink-0 rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700"
                    title="Remove from flow"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 p-3 dark:border-gray-800">
            <button
              disabled={flowTasks.length === 0}
              onClick={() => navigate(`/flow/${workbenchId}`)}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                flowTasks.length > 0
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-gray-200 text-gray-400 dark:bg-gray-800"
              }`}
            >
              <Zap size={16} />
              Start Flow
            </button>
          </div>
        </div>
      </div>

      <TaskEditorDialog
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
      />
    </>
  );
}

function WorkbenchTaskCard({
  task,
  workspaceName,
  category,
  done,
  onComplete,
  onEdit,
  onDelete,
  onAddToFlow,
}: {
  task: Task;
  workspaceName: string;
  category?: Category;
  done: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddToFlow: () => void;
}) {
  return (
    <div className="group rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-sm font-medium ${done ? "text-gray-400 line-through dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}
        >
          {task.title}
        </p>
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {!done && (
            <>
              <button
                onClick={onComplete}
                className="rounded p-1 text-gray-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30"
                title="Mark as done"
              >
                <Check size={14} />
              </button>
              <button
                onClick={onAddToFlow}
                className="rounded p-1 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30"
                title="Add to flow"
              >
                <Zap size={14} />
              </button>
            </>
          )}
          <button
            onClick={onEdit}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
          {workspaceName}
        </span>
        {task.priority && (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[task.priority]}`}
          >
            {task.priority}
          </span>
        )}
        {category && (
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        )}
      </div>
    </div>
  );
}
