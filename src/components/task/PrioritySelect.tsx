import type { Priority } from "../../types";
import { PRIORITY_COLORS, PRIORITY_LABELS } from "../../lib/constants";

interface PrioritySelectProps {
  value?: Priority;
  onChange: (value: Priority | undefined) => void;
}

const priorities: Priority[] = ["P0", "P1", "P2", "P3"];

export function PrioritySelect({ value, onChange }: PrioritySelectProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {priorities.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(value === p ? undefined : p)}
          className={`rounded px-2 py-1 text-xs font-semibold transition-all ${
            value === p
              ? PRIORITY_COLORS[p]
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
          }`}
        >
          {p} — {PRIORITY_LABELS[p]}
        </button>
      ))}
    </div>
  );
}
