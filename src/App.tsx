import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAppStore } from "./store/useAppStore";
import HomeScreen from "./pages/HomeScreen";
import WorkspaceView from "./pages/WorkspaceView";
import FlowModeView from "./pages/FlowModeView";

function AppContent() {
  const initialize = useAppStore((s) => s.initialize);
  const initialized = useAppStore((s) => s.initialized);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomeScreen />} />
      <Route path="/workspace/:id" element={<WorkspaceView />} />
      <Route path="/flow/:workspaceId" element={<FlowModeView />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
