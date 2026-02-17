export type Priority = "P0" | "P1" | "P2" | "P3";

export interface Task {
  id: string;
  title: string;
  description: string;
  laneId: string;
  categoryId?: string;
  priority?: Priority;
  createdAt: string;
  updatedAt: string;
  order: number;
  inFlowZone: boolean;
}

export interface Lane {
  id: string;
  workspaceId: string;
  title: string;
  order: number;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Workspace {
  id: string;
  name: string;
  isWorkbench: boolean;
  createdAt: string;
  order: number;
}
