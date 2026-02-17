import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { KanbanBoard } from "../components/board/KanbanBoard";
import { FlowZone } from "../components/flow/FlowZone";
import { WorkbenchView } from "../components/workspace/WorkbenchView";

export default function WorkspaceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flowZoneCollapsed, setFlowZoneCollapsed] = useState(false);
  const workspaces = useAppStore((s) => s.workspaces);
  const workspace = workspaces.find((w) => w.id === id);

  if (!workspace || !id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-400">Workspace not found</p>
      </div>
    );
  }

  if (workspace.isWorkbench) {
    return (
      <div className="flex h-screen flex-col">
        <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <button
            onClick={() => navigate("/")}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Workbench
          </h1>
        </header>
        <div className="flex-1 overflow-hidden">
          <WorkbenchView />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <button
          onClick={() => navigate("/")}
          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {workspace.name}
        </h1>
      </header>
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          workspaceId={id}
          flowZoneElement={
            <FlowZone
              workspaceId={id}
              collapsed={flowZoneCollapsed}
              onToggleCollapse={() => setFlowZoneCollapsed((c) => !c)}
            />
          }
        />
      </div>
    </div>
  );
}
