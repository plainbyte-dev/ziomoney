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

const DataModeContext = createContext<DataModeContextValue | null>(null);

export function DataModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DataMode>("static");

  useEffect(() => {
    const saved = loadState<DataMode>(STORAGE_KEY);
    if (saved === "static" || saved === "live") setModeState(saved);
  }, []);

  const skipNextSave = useRef(true);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState(STORAGE_KEY, mode);
  }, [mode]);

  const setMode = useCallback((next: DataMode) => setModeState(next), []);
  const toggle = useCallback(
    () => setModeState((prev) => (prev === "static" ? "live" : "static")),
    []
  );

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
