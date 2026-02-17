import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useAppStore } from "../../store/useAppStore";
import { LaneColumn } from "./LaneColumn";
import { AddLaneButton } from "./AddLaneButton";
import { TaskEditorDialog } from "../task/TaskEditorDialog";
import type { Task } from "../../types";

interface KanbanBoardProps {
  workspaceId: string;
  flowZoneElement?: React.ReactNode;
}

export function KanbanBoard({ workspaceId, flowZoneElement }: KanbanBoardProps) {
  const allLanes = useAppStore((s) => s.lanes);
  const allTasks = useAppStore((s) => s.tasks);
  const moveTask = useAppStore((s) => s.moveTask);
  const addTaskToFlowZone = useAppStore((s) => s.addTaskToFlowZone);
  const removeTaskFromFlowZone = useAppStore((s) => s.removeTaskFromFlowZone);
  const reorderTaskInLane = useAppStore((s) => s.reorderTaskInLane);
  const reorderFlowTasks = useAppStore((s) => s.reorderFlowTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const lanes = useMemo(
    () =>
      allLanes
        .filter((l) => l.workspaceId === workspaceId)
        .sort((a, b) => a.order - b.order),
    [allLanes, workspaceId],
  );

  const getTasksForLane = (laneId: string) =>
    allTasks
      .filter((t) => t.laneId === laneId && !t.inFlowZone)
      .sort((a, b) => a.order - b.order);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  // Custom collision detection: pointerWithin works best for nested containers,
  // with rectIntersection as fallback for edge cases
  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;
    return rectIntersection(args);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = allTasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (_event: DragOverEvent) => {};

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = allTasks.find((t) => t.id === taskId);
    if (!task) return;

    const overData = over.data.current;

    if (over.id === "flow-zone") {
      if (!task.inFlowZone) {
        addTaskToFlowZone(taskId);
      }
      return;
    }

    // Handle reorder within flow zone
    if (overData?.type === "task") {
      const overTask = overData.task as Task;

      if (task.inFlowZone && overTask.inFlowZone) {
        reorderFlowTasks(taskId, overTask.id, workspaceId);
        return;
      }

      // Same-lane reorder (neither in flow zone)
      if (!task.inFlowZone && !overTask.inFlowZone && task.laneId === overTask.laneId) {
        reorderTaskInLane(taskId, overTask.id);
        return;
      }
    }

    let toLaneId: string | undefined;
    let targetOrder: number;

    if (overData?.type === "lane") {
      toLaneId = overData.laneId as string;
      const laneTasks = getTasksForLane(toLaneId);
      targetOrder = laneTasks.length;
    } else if (overData?.type === "task") {
      const overTask = overData.task as Task;
      if (overTask.inFlowZone) return;
      toLaneId = overTask.laneId;
      targetOrder = overTask.order;
    } else {
      return;
    }

    if (!toLaneId) return;

    if (task.inFlowZone) {
      removeTaskFromFlowZone(taskId);
    }

    moveTask(taskId, toLaneId, targetOrder);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full">
          <div className="flex flex-1 gap-4 overflow-x-auto p-4">
            <SortableContext
              items={lanes.map((l) => l.id)}
              strategy={horizontalListSortingStrategy}
            >
              {lanes.map((lane) => (
                <LaneColumn
                  key={lane.id}
                  lane={lane}
                  tasks={getTasksForLane(lane.id)}
                  onEditTask={setEditingTask}
                />
              ))}
            </SortableContext>
            <AddLaneButton workspaceId={workspaceId} />
          </div>
          {flowZoneElement}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="w-64 rounded-lg border border-indigo-300 bg-white p-3 shadow-lg dark:border-indigo-600 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {activeTask.title}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <TaskEditorDialog
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        task={editingTask}
      />
    </>
  );
}
