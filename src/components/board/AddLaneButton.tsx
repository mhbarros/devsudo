import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

interface AddLaneButtonProps {
  workspaceId: string;
}

export function AddLaneButton({ workspaceId }: AddLaneButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createLane = useAppStore((s) => s.createLane);

  useEffect(() => {
    if (isAdding) inputRef.current?.focus();
  }, [isAdding]);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (trimmed) {
      createLane(workspaceId, trimmed);
    }
    setTitle("");
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className="w-72 shrink-0 rounded-xl bg-gray-100 p-3 dark:bg-gray-900/50">
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
          placeholder="Lane title..."
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex h-12 w-72 shrink-0 items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 text-sm text-gray-400 transition-colors hover:border-gray-400 hover:text-gray-500 dark:border-gray-700 dark:hover:border-gray-600"
    >
      <Plus size={16} />
      Add Lane
    </button>
  );
}
