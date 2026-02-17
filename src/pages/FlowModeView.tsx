import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Minimize2, Maximize2, StickyNote } from "lucide-react";
import confetti from "canvas-confetti";
import { useAppStore } from "../store/useAppStore";
import { useStopwatch } from "../hooks/useStopwatch";
import { FlowTimer } from "../components/flow/FlowTimer";
import { FlowTaskList } from "../components/flow/FlowTaskList";
import { ConcluirFlowButton } from "../components/flow/ConcluirFlowButton";
import { CancelFlowDialog } from "../components/flow/CancelFlowDialog";
import { FlowCompleteOverlay } from "../components/flow/FlowCompleteOverlay";

const REGULAR_WIDTH = 420;
const REGULAR_HEIGHT = 640;
const MINI_WIDTH = 320;
const MINI_HEIGHT = 380;

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export default function FlowModeView() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const workspaces = useAppStore((s) => s.workspaces);
  const allLanes = useAppStore((s) => s.lanes);
  const allTasks = useAppStore((s) => s.tasks);
  const clearFlowZone = useAppStore((s) => s.clearFlowZone);
  const completeFlowTasks = useAppStore((s) => s.completeFlowTasks);
  const flowNotes = useAppStore((s) => s.flowNotes);
  const setFlowNotes = useAppStore((s) => s.setFlowNotes);

  const isWorkbench = useMemo(
    () => workspaces.find((w) => w.id === workspaceId)?.isWorkbench ?? false,
    [workspaces, workspaceId],
  );

  const flowTasks = useMemo(() => {
    let laneIds: string[];
    if (isWorkbench) {
      // Workbench: gather flow tasks from ALL non-workbench workspaces
      const nonWbIds = new Set(workspaces.filter((w) => !w.isWorkbench).map((w) => w.id));
      laneIds = allLanes.filter((l) => nonWbIds.has(l.workspaceId)).map((l) => l.id);
    } else {
      laneIds = allLanes.filter((l) => l.workspaceId === (workspaceId ?? "")).map((l) => l.id);
    }
    return allTasks
      .filter((t) => t.inFlowZone && laneIds.includes(t.laneId))
      .sort((a, b) => a.order - b.order);
  }, [allLanes, allTasks, workspaceId, workspaces, isWorkbench]);

  const { seconds, isRunning, start, stop, reset } = useStopwatch();
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [mini, setMini] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [originalSize, setOriginalSize] = useState<{ width: number; height: number } | null>(null);
  const [originalPosition, setOriginalPosition] = useState<{ x: number; y: number } | null>(null);
  const notesDebounceRef = useRef<number | null>(null);

  const notesValue = workspaceId ? (flowNotes[workspaceId] ?? "") : "";

  const handleNotesChange = (value: string) => {
    if (!workspaceId) return;
    // Optimistic local update via store, debounce persist
    if (notesDebounceRef.current) clearTimeout(notesDebounceRef.current);
    notesDebounceRef.current = window.setTimeout(() => {
      setFlowNotes(workspaceId, value);
    }, 400);
    // Immediate store update (without persist) for responsive typing
    useAppStore.setState((s) => ({
      flowNotes: { ...s.flowNotes, [workspaceId]: value },
    }));
  };

  const toggleTimer = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  useEffect(() => {
    if (isTauri()) {
      import("@tauri-apps/api/webviewWindow").then(({ getCurrentWebviewWindow }) => {
        import("@tauri-apps/api/dpi").then(({ LogicalSize }) => {
          const appWindow = getCurrentWebviewWindow();
          Promise.all([appWindow.innerSize(), appWindow.outerPosition()]).then(
            ([size, position]) => {
              setOriginalSize({ width: size.width, height: size.height });
              setOriginalPosition({ x: position.x, y: position.y });
              appWindow.setSize(new LogicalSize(REGULAR_WIDTH, REGULAR_HEIGHT));
              appWindow.setDecorations(false);
              appWindow.setAlwaysOnTop(true);
              appWindow.setTitle("DevSudo — Flow Mode");
            },
          );
        });
      });
    }
    start();

    return () => {
      reset();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setWindowSize = useCallback(async (width: number, height: number) => {
    if (!isTauri()) return;
    const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const { LogicalSize } = await import("@tauri-apps/api/dpi");
    const appWindow = getCurrentWebviewWindow();
    await appWindow.setSize(new LogicalSize(width, height));
  }, []);

  const handleToggleMini = useCallback(() => {
    setMini((prev) => {
      const next = !prev;
      if (next) {
        setWindowSize(MINI_WIDTH, MINI_HEIGHT);
      } else {
        setWindowSize(REGULAR_WIDTH, REGULAR_HEIGHT);
      }
      return next;
    });
  }, [setWindowSize]);

  const restoreWindow = useCallback(async () => {
    if (!isTauri()) return;
    const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const { LogicalSize, LogicalPosition } = await import("@tauri-apps/api/dpi");
    const appWindow = getCurrentWebviewWindow();
    await appWindow.setDecorations(true);
    await appWindow.setAlwaysOnTop(false);
    if (originalSize) {
      await appWindow.setSize(new LogicalSize(originalSize.width, originalSize.height));
    } else {
      await appWindow.setSize(new LogicalSize(1200, 800));
    }
    if (originalPosition) {
      await appWindow.setPosition(new LogicalPosition(originalPosition.x, originalPosition.y));
    }
    await appWindow.setTitle("DevSudo");
  }, [originalSize, originalPosition]);

  const handleToggle = (taskId: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleCancel = async () => {
    if (workspaceId) {
      clearFlowZone(workspaceId);
    }
    await restoreWindow();
    navigate(`/workspace/${workspaceId}`);
  };

  const handleComplete = async () => {
    if (workspaceId) {
      completeFlowTasks(workspaceId, Array.from(completedIds));
    }

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
    });

    setShowComplete(true);
  };

  const handleDismiss = async () => {
    await restoreWindow();
    navigate(`/workspace/${workspaceId}`);
  };

  if (!workspaceId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Invalid workspace</p>
      </div>
    );
  }

  if (mini) {
    return (
      <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-950">
        {/* Draggable header */}
        <header
          data-tauri-drag-region
          className="flex shrink-0 cursor-move items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-800"
        >
          <button
            onClick={() => setCancelDialogOpen(true)}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={16} />
          </button>
          <FlowTimer seconds={seconds} isRunning={isRunning} onToggle={toggleTimer} compact />
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setShowNotes((v) => !v)}
              className={`rounded p-1 transition-colors ${
                showNotes
                  ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400"
                  : "text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              }`}
              title="Quick Notes"
            >
              <StickyNote size={14} />
            </button>
            <button
              onClick={handleToggleMini}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
              title="Regular size"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </header>

        {/* Quick Notes (collapsible) */}
        {showNotes && (
          <div className="border-b border-gray-200 px-2 py-1.5 dark:border-gray-800">
            <textarea
              value={notesValue}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Quick notes..."
              className="w-full resize-none rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
              rows={3}
            />
          </div>
        )}

        {/* Compact task list */}
        <div className="flex-1 overflow-y-auto px-2 py-1.5">
          <div className="flex flex-col gap-1">
            {flowTasks.map((task) => {
              const done = completedIds.has(task.id);
              return (
                <button
                  key={task.id}
                  onClick={() => handleToggle(task.id)}
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-left transition-all ${
                    done
                      ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                      done
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {done && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`truncate text-xs font-medium ${
                      done
                        ? "text-green-700 line-through dark:text-green-400"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {task.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mini footer */}
        <div className="border-t border-gray-200 p-2 dark:border-gray-800">
          <ConcluirFlowButton onClick={handleComplete} />
        </div>

        <CancelFlowDialog
          open={cancelDialogOpen}
          onClose={() => setCancelDialogOpen(false)}
          onConfirm={handleCancel}
        />

        {showComplete && (
          <FlowCompleteOverlay
            completedCount={completedIds.size}
            totalCount={flowTasks.length}
            elapsedSeconds={seconds}
            onDismiss={handleDismiss}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-950">
      {/* Draggable header */}
      <header
        data-tauri-drag-region
        className="flex shrink-0 cursor-move items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-800"
      >
        <button
          onClick={() => setCancelDialogOpen(true)}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-indigo-500" />
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Flow Mode
          </span>
        </div>
        <button
          onClick={handleToggleMini}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          title="Mini size"
        >
          <Minimize2 size={16} />
        </button>
      </header>

      {/* Prominent timer */}
      <div className="border-b border-gray-200 px-4 dark:border-gray-800">
        <FlowTimer seconds={seconds} isRunning={isRunning} onToggle={toggleTimer} />
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-4">
        <FlowTaskList
          tasks={flowTasks}
          completedIds={completedIds}
          onToggle={handleToggle}
        />
      </div>

      {/* Quick Notes */}
      <div className="border-t border-gray-200 px-4 pt-2 dark:border-gray-800">
        <div className="mb-1.5 flex items-center gap-1.5">
          <StickyNote size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Quick Notes</span>
        </div>
        <textarea
          value={notesValue}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Jot down thoughts, blockers, ideas..."
          className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          rows={3}
        />
      </div>

      <div className="p-4 pt-2">
        <ConcluirFlowButton onClick={handleComplete} />
      </div>

      <CancelFlowDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancel}
      />

      {showComplete && (
        <FlowCompleteOverlay
          completedCount={completedIds.size}
          totalCount={flowTasks.length}
          elapsedSeconds={seconds}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
