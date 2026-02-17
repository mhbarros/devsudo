import { useNavigate } from "react-router-dom";
import { Folder, Trash2, Wrench } from "lucide-react";
import type { Workspace } from "../../types";
import { useAppStore } from "../../store/useAppStore";

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const navigate = useNavigate();
  const deleteWorkspace = useAppStore((s) => s.deleteWorkspace);
  const tasks = useAppStore((s) => s.tasks);
  const lanes = useAppStore((s) => s.lanes);

  const workspaceLaneIds = lanes
    .filter((l) => l.workspaceId === workspace.id)
    .map((l) => l.id);
  const taskCount = tasks.filter((t) => workspaceLaneIds.includes(t.laneId)).length;

  return (
    <div
      onClick={() => navigate(`/workspace/${workspace.id}`)}
      className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-indigo-600"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2 dark:bg-indigo-900/50">
            {workspace.isWorkbench ? (
              <Wrench size={20} className="text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Folder size={20} className="text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {workspace.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {taskCount} {taskCount === 1 ? "task" : "tasks"}
            </p>
          </div>
        </div>
        {!workspace.isWorkbench && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteWorkspace(workspace.id);
            }}
            className="rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 dark:hover:bg-red-900/30"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
