import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { FlowTaskCard } from "./FlowTaskCard";
import { StartFlowButton } from "./StartFlowButton";

interface FlowZoneProps {
  workspaceId: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function FlowZone({ workspaceId, collapsed = false, onToggleCollapse }: FlowZoneProps) {
  const navigate = useNavigate();
  const allLanes = useAppStore((s) => s.lanes);
  const allTasks = useAppStore((s) => s.tasks);

  const flowTasks = useMemo(() => {
    const laneIds = allLanes
      .filter((l) => l.workspaceId === workspaceId)
      .map((l) => l.id);
    return allTasks
      .filter((t) => t.inFlowZone && laneIds.includes(t.laneId))
      .sort((a, b) => a.order - b.order);
  }, [allLanes, allTasks, workspaceId]);

  const { setNodeRef, isOver } = useDroppable({
    id: "flow-zone",
    data: { type: "flow-zone" },
  });

  if (collapsed) {
    return (
      <div
        ref={setNodeRef}
        className={`flex w-10 shrink-0 flex-col items-center border-l border-gray-200 py-3 dark:border-gray-800 ${
          isOver ? "flow-zone-glow bg-indigo-50/50 dark:bg-indigo-950/30" : ""
        }`}
      >
        <button
          onClick={onToggleCollapse}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          title="Expand Flow Zone"
        >
          <ChevronLeft size={16} />
        </button>
        <Zap size={16} className="mt-2 text-indigo-500" />
        {flowTasks.length > 0 && (
          <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
            {flowTasks.length}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex w-72 shrink-0 flex-col border-l border-gray-200 dark:border-gray-800 ${
        isOver ? "flow-zone-glow bg-indigo-50/50 dark:bg-indigo-950/30" : ""
      }`}
    >
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
        <div className="flex-1" />
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            title="Collapse Flow Zone"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto p-3"
        style={{ minHeight: 100 }}
      >
        {flowTasks.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
            <Zap size={32} className="mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Drag tasks here to add them to your flow
            </p>
          </div>
        ) : (
          <SortableContext
            items={flowTasks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {flowTasks.map((task) => (
              <FlowTaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        )}
      </div>

      <div className="border-t border-gray-200 p-3 dark:border-gray-800">
        <StartFlowButton
          disabled={flowTasks.length === 0}
          onClick={() => navigate(`/flow/${workspaceId}`)}
        />
      </div>
    </div>
  );
}
