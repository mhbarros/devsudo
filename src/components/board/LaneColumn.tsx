import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Lane, Task } from "../../types";
import { LaneHeader } from "./LaneHeader";
import { TaskCard } from "./TaskCard";
import { AddTaskButton } from "./AddTaskButton";

interface LaneColumnProps {
  lane: Lane;
  tasks: Task[];
  onEditTask: (task: Task) => void;
}

export function LaneColumn({ lane, tasks, onEditTask }: LaneColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `lane-${lane.id}`,
    data: { type: "lane", laneId: lane.id },
  });

  return (
    <div
      className={`flex w-72 shrink-0 flex-col rounded-xl p-3 transition-colors ${
        isOver
          ? "bg-indigo-50 dark:bg-indigo-900/20"
          : "bg-gray-100 dark:bg-gray-900/50"
      }`}
    >
      <LaneHeader lane={lane} taskCount={tasks.length} />
      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto"
        style={{ minHeight: 40 }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))}
        </SortableContext>
      </div>
      <div className="mt-2">
        <AddTaskButton laneId={lane.id} />
      </div>
    </div>
  );
}
