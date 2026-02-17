import { Check } from "lucide-react";
import type { Task } from "../../types";

interface FlowTaskItemProps {
  task: Task;
  completed: boolean;
  onToggle: () => void;
}

export function FlowTaskItem({ task, completed, onToggle }: FlowTaskItemProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-all ${
        completed
          ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
          : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
      }`}
    >
      <div
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-gray-300 dark:border-gray-600"
        }`}
      >
        {completed && <Check size={14} />}
      </div>
      <span
        className={`text-sm font-medium ${
          completed
            ? "text-green-700 line-through dark:text-green-400"
            : "text-gray-900 dark:text-gray-100"
        }`}
      >
        {task.title}
      </span>
    </button>
  );
}
