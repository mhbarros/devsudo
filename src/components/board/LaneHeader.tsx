import { Trash2 } from "lucide-react";
import type { Lane } from "../../types";
import { useAppStore } from "../../store/useAppStore";

interface LaneHeaderProps {
  lane: Lane;
  taskCount: number;
}

export function LaneHeader({ lane, taskCount }: LaneHeaderProps) {
  const deleteLane = useAppStore((s) => s.deleteLane);

  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {lane.title}
        </h3>
        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
          {taskCount}
        </span>
      </div>
      {!lane.isDefault && (
        <button
          onClick={() => deleteLane(lane.id)}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}
