import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { WorkspaceCard } from "../components/workspace/WorkspaceCard";
import { CreateWorkspaceDialog } from "../components/workspace/CreateWorkspaceDialog";
import { Button } from "../components/ui/Button";

export default function HomeScreen() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const rawWorkspaces = useAppStore((s) => s.workspaces);
  const workspaces = useMemo(
    () => [...rawWorkspaces].sort((a, b) => a.order - b.order),
    [rawWorkspaces],
  );

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              DevSudo
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Your workspaces
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus size={16} className="mr-1" />
            New Workspace
          </Button>
        </div>

        {workspaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg text-gray-400">No workspaces yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Create your first workspace to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws) => (
              <WorkspaceCard key={ws.id} workspace={ws} />
            ))}
          </div>
        )}
      </div>

      <CreateWorkspaceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
