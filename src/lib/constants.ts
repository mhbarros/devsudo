export const DEFAULT_LANES = ["Backlog", "To do", "Doing", "Done"] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  P0: "bg-red-500 text-white",
  P1: "bg-orange-400 text-white",
  P2: "bg-yellow-400 text-gray-900",
  P3: "bg-blue-400 text-white",
};

export const PRIORITY_LABELS: Record<string, string> = {
  P0: "Critical",
  P1: "High",
  P2: "Medium",
  P3: "Low",
};

export const CATEGORY_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export const STORE_KEY = "devsudo-data";
