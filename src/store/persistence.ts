import { STORE_KEY } from "../lib/constants";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

let storeInstance: Awaited<ReturnType<typeof import("@tauri-apps/plugin-store").load>> | null = null;

async function getStore() {
  if (!isTauri()) return null;
  if (!storeInstance) {
    const { load } = await import("@tauri-apps/plugin-store");
    storeInstance = await load("devsudo-store.json", { autoSave: true, defaults: {} });
  }
  return storeInstance;
}

// Fallback to localStorage when not in Tauri
function getLocalStorageData<T>(): T | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setLocalStorageData<T>(data: T): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export async function loadPersistedState<T>(): Promise<T | null> {
  try {
    const store = await getStore();
    if (store) {
      const data = await store.get<T>(STORE_KEY);
      return data ?? null;
    }
    return getLocalStorageData<T>();
  } catch {
    return getLocalStorageData<T>();
  }
}

export async function persistState<T>(state: T): Promise<void> {
  try {
    const store = await getStore();
    if (store) {
      await store.set(STORE_KEY, state);
    } else {
      setLocalStorageData(state);
    }
  } catch (e) {
    console.error("Failed to persist state:", e);
    setLocalStorageData(state);
  }
}
