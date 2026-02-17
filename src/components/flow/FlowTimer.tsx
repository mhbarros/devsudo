import { Pause, Play } from "lucide-react";
import { formatTime } from "../../lib/utils";

interface FlowTimerProps {
  seconds: number;
  isRunning: boolean;
  onToggle: () => void;
  compact?: boolean;
}

export function FlowTimer({ seconds, isRunning, onToggle, compact = false }: FlowTimerProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={onToggle}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          {isRunning ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <span className="font-mono text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-200">
          {formatTime(seconds)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <span className="font-mono text-3xl font-bold tabular-nums text-gray-900 dark:text-gray-50">
        {formatTime(seconds)}
      </span>
      <button
        onClick={onToggle}
        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
          isRunning
            ? "bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-900/70"
        }`}
      >
        {isRunning ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </div>
  );
}
