"use client";

import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Heart } from "lucide-react";

const STORAGE_KEY = "aquaku-saved-v1";
type Snapshot = { saved: string[]; ready: boolean };
const SERVER_SNAPSHOT: Snapshot = { saved: [], ready: false };
const SavedContext = createContext<
  Snapshot & { toggle: (slug: string) => void }
>({ ...SERVER_SNAPSHOT, toggle: () => {} });

function readSaved(): string[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed)
      ? Array.from(
          new Set(
            parsed.filter(
              (value): value is string => typeof value === "string",
            ),
          ),
        ).slice(0, 100)
      : [];
  } catch {
    return [];
  }
}

function createSavedStore() {
  let snapshot = SERVER_SNAPSHOT;
  const listeners = new Set<() => void>();
  function publish(saved: string[]) {
    snapshot = { saved, ready: true };
    listeners.forEach((listener) => listener());
  }
  return {
    getSnapshot() {
      if (!snapshot.ready) snapshot = { saved: readSaved(), ready: true };
      return snapshot;
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY || event.key === null)
          publish(readSaved());
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
    toggle(slug: string) {
      const next = snapshot.saved.includes(slug)
        ? snapshot.saved.filter((value) => value !== slug)
        : [...snapshot.saved, slug].slice(0, 100);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* Keep the in-memory collection usable when browser storage is unavailable. */
      }
      publish(next);
    },
  };
}

export function SavedProductsProvider({ children }: { children: ReactNode }) {
  // The store is per mounted provider, never shared between server requests.
  const [store] = useState(createSavedStore);
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => SERVER_SNAPSHOT,
  );
  return (
    <SavedContext.Provider value={{ ...snapshot, toggle: store.toggle }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSavedProducts() {
  return useContext(SavedContext);
}

export function SaveProductButton({
  slug,
  name,
  detailed = false,
}: {
  slug: string;
  name: string;
  detailed?: boolean;
}) {
  const { saved, ready, toggle } = useSavedProducts();
  const active = saved.includes(slug);
  return (
    <button
      type="button"
      disabled={!ready}
      aria-pressed={active}
      aria-label={`${active ? "Batal menyimpan" : "Simpan"} ${name}`}
      onClick={() => toggle(slug)}
      className={
        detailed
          ? "button-secondary"
          : "absolute right-2 top-2 z-10 flex size-10 items-center justify-center rounded-full border border-border bg-surface/95 text-muted hover:text-brand"
      }
    >
      <Heart
        size={detailed ? 18 : 16}
        className={active ? "fill-brand text-brand" : ""}
        aria-hidden="true"
      />
      {detailed ? (active ? "Tersimpan" : "Simpan") : null}
    </button>
  );
}
