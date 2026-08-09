"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadState, saveState } from "@/lib/persist";

export type DataMode = "static" | "live";

interface DataModeContextValue {
  mode: DataMode;
  isLive: boolean;
  setMode: (mode: DataMode) => void;
  toggle: () => void;
}

const STORAGE_KEY = "zio-data-mode";

// The static-demo/live-API switch is a local development convenience — a
// production deployment must always talk to the real backend, never show
// fabricated demo data to a real user.
export const DATA_MODE_TOGGLE_ALLOWED = process.env.NODE_ENV !== "production";

const DataModeContext = createContext<DataModeContextValue | null>(null);

export function DataModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DataMode>(DATA_MODE_TOGGLE_ALLOWED ? "static" : "live");

  useEffect(() => {
    if (!DATA_MODE_TOGGLE_ALLOWED) return;
    const saved = loadState<DataMode>(STORAGE_KEY);
    if (saved === "static" || saved === "live") setModeState(saved);
  }, []);

  const skipNextSave = useRef(true);
  useEffect(() => {
    if (!DATA_MODE_TOGGLE_ALLOWED) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = useCallback(
    (next: DataMode) => {
      if (DATA_MODE_TOGGLE_ALLOWED) setModeState(next);
    },
    []
  );
  const toggle = useCallback(() => {
    if (DATA_MODE_TOGGLE_ALLOWED) setModeState((prev) => (prev === "static" ? "live" : "static"));
  }, []);

  const value = useMemo(
    () => ({ mode, isLive: mode === "live", setMode, toggle }),
    [mode, setMode, toggle]
  );

  return <DataModeContext.Provider value={value}>{children}</DataModeContext.Provider>;
}

export function useDataMode() {
  const ctx = useContext(DataModeContext);
  if (!ctx) {
    throw new Error("useDataMode must be used within a DataModeProvider");
  }
  return ctx;
}
