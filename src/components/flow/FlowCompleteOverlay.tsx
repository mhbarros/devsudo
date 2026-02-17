import { Trophy } from "lucide-react";
import { Button } from "../ui/Button";
import { formatTime } from "../../lib/utils";

interface FlowCompleteOverlayProps {
  completedCount: number;
  totalCount: number;
  elapsedSeconds: number;
  onDismiss: () => void;
}

export function FlowCompleteOverlay({
  completedCount,
  totalCount,
  elapsedSeconds,
  onDismiss,
}: FlowCompleteOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl dark:bg-gray-800">
        <div className="mb-4 inline-flex rounded-full bg-yellow-100 p-4 dark:bg-yellow-900/50">
          <Trophy size={40} className="text-yellow-500" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Flow Complete!
        </h2>
        <p className="mb-1 text-gray-600 dark:text-gray-400">
          You completed {completedCount} of {totalCount} tasks
        </p>
        <p className="mb-6 font-mono text-lg text-gray-500 dark:text-gray-400">
          {formatTime(elapsedSeconds)}
        </p>
        <Button onClick={onDismiss} size="lg" className="w-full">
          Back to Board
        </Button>
      </div>
    </div>
  );
}
