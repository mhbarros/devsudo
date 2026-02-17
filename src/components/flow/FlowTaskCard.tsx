import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import type { Task } from "../../types";
import { PRIORITY_COLORS } from "../../lib/constants";
import { useAppStore } from "../../store/useAppStore";

interface FlowTaskCardProps {
  task: Task;
}

export function FlowTaskCard({ task }: FlowTaskCardProps) {
  const removeTaskFromFlowZone = useAppStore((s) => s.removeTaskFromFlowZone);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex cursor-grab items-center gap-2 rounded-lg border border-indigo-200 bg-white/80 p-2.5 active:cursor-grabbing dark:border-indigo-800 dark:bg-gray-800/80"
      {...attributes}
      {...listeners}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {task.title}
        </p>
        {task.priority && (
          <span
            className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[task.priority]}`}
          >
            {task.priority}
          </span>
        )}
      </div>
      <button
        onClick={() => removeTaskFromFlowZone(task.id)}
        className="shrink-0 rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-gray-600 group-hover:opacity-100 dark:hover:bg-gray-700"
      >
        <X size={14} />
      </button>
    </div>
  );
}
