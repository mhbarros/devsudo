import type { Task } from "../../types";
import { FlowTaskItem } from "./FlowTaskItem";

interface FlowTaskListProps {
  tasks: Task[];
  completedIds: Set<string>;
  onToggle: (taskId: string) => void;
}

export function FlowTaskList({ tasks, completedIds, onToggle }: FlowTaskListProps) {
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task) => (
        <FlowTaskItem
          key={task.id}
          task={task}
          completed={completedIds.has(task.id)}
          onToggle={() => onToggle(task.id)}
        />
      ))}
    </div>
  );
}
