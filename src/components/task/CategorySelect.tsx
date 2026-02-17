import { useState, useRef, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { CATEGORY_COLORS } from "../../lib/constants";

interface CategorySelectProps {
  value?: string;
  onChange: (categoryId: string | undefined) => void;
}

export function CategorySelect({ value, onChange }: CategorySelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const categories = useAppStore((s) => s.categories);
  const createCategory = useAppStore((s) => s.createCategory);

  const selected = categories.find((c) => c.id === value);
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const canCreate = search.trim() && !categories.some(
    (c) => c.name.toLowerCase() === search.trim().toLowerCase(),
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreate = () => {
    const name = search.trim();
    if (!name) return;
    const color = CATEGORY_COLORS[categories.length % CATEGORY_COLORS.length];
    createCategory(name, color);
    // Read updated categories from store
    const newCat = useAppStore.getState().categories;
    const created = newCat.find((c) => c.name === name);
    if (created) onChange(created.id);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="flex min-h-[34px] cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800"
      >
        {selected ? (
          <span className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: selected.color }}
            />
            <span className="dark:text-gray-100">{selected.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="ml-1 text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
          </span>
        ) : (
          <span className="text-gray-400">Select category...</span>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-2">
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCreate) handleCreate();
                if (e.key === "Escape") setIsOpen(false);
              }}
              placeholder="Search or create..."
              className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {filtered.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  onChange(cat.id);
                  setSearch("");
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="dark:text-gray-100">{cat.name}</span>
              </button>
            ))}
            {canCreate && (
              <button
                type="button"
                onClick={handleCreate}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
              >
                Create "{search.trim()}"
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
