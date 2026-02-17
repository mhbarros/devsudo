import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

interface AddTaskButtonProps {
  laneId: string;
}

export function AddTaskButton({ laneId }: AddTaskButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createTask = useAppStore((s) => s.createTask);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed) {
      createTask(laneId, trimmed);
    }
    setTitle("");
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className="p-1">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") {
              setTitle("");
              setIsAdding(false);
            }
          }}
          onBlur={handleSubmit}
          placeholder="Task title..."
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex w-full items-center gap-1 rounded-md p-2 text-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700/50 dark:hover:text-gray-300"
    >
      <Plus size={16} />
      Add task
    </button>
  );
}
