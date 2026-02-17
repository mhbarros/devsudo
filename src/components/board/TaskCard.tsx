import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Check, Pencil, Trash2 } from "lucide-react";
import type { Task, Category } from "../../types";
import { PRIORITY_COLORS } from "../../lib/constants";
import { useAppStore } from "../../store/useAppStore";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const deleteTask = useAppStore((s) => s.deleteTask);
  const completeTask = useAppStore((s) => s.completeTask);
  const lanes = useAppStore((s) => s.lanes);
  const categories = useAppStore((s) => s.categories);
  const currentLane = lanes.find((l) => l.id === task.laneId);
  const isDone = currentLane?.title === "Done";
  const category = categories.find((c) => c.id === task.categoryId);

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
      className="group cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-gray-700 dark:bg-gray-800"
      {...attributes}
      {...listeners}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${isDone ? "text-gray-400 line-through dark:text-gray-500" : "text-gray-900 dark:text-gray-100"}`}>
            {task.title}
          </p>
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {!isDone && (
              <button
                onClick={() => completeTask(task.id)}
                className="rounded p-1 text-gray-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30"
                title="Mark as done"
              >
                <Check size={14} />
              </button>
            )}
            <button
              onClick={() => onEdit(task)}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => deleteTask(task.id)}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {task.priority && (
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${PRIORITY_COLORS[task.priority]}`}
            >
              {task.priority}
            </span>
          )}
          {category && <CategoryBadge category={category} />}
        </div>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
      style={{ backgroundColor: category.color }}
    >
      {category.name}
    </span>
  );
}
