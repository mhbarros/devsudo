import { useState, useEffect } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { PrioritySelect } from "./PrioritySelect";
import { CategorySelect } from "./CategorySelect";
import { useAppStore } from "../../store/useAppStore";
import type { Task, Priority } from "../../types";

interface TaskEditorDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export function TaskEditorDialog({ open, onClose, task }: TaskEditorDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const updateTask = useAppStore((s) => s.updateTask);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
      setCategoryId(task.categoryId);
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !title.trim()) return;
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      categoryId,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="Edit Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <Input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Priority
          </label>
          <PrioritySelect value={priority} onChange={setPriority} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <CategorySelect value={categoryId} onChange={setCategoryId} />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
