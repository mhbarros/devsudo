import { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useAppStore } from "../../store/useAppStore";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateWorkspaceDialog({ open, onClose }: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const createWorkspace = useAppStore((s) => s.createWorkspace);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    createWorkspace(trimmed);
    setName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} title="New Workspace">
      <form onSubmit={handleSubmit}>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workspace name..."
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Create
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
