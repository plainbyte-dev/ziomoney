"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadState, saveState } from "@/lib/persist";
import { tabRegistry } from "@/data/tabRegistry";

export interface TabDef {
  key: string;
  title: string;
  closable?: boolean;
}

interface TabsContextValue {
  openTabs: TabDef[];
  activeKey: string;
  openTab: (tab: TabDef) => void;
  closeTab: (key: string) => void;
  setActiveKey: (key: string) => void;
}

const STORAGE_KEY = "zio-tabs-state-v2";
const MAX_OPEN_TABS = 8;

const TabsContext = createContext<TabsContextValue | null>(null);

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [openTabs, setOpenTabs] = useState<TabDef[]>([]);
  const [activeKey, setActiveKeyState] = useState<string>("");

  // Restore from localStorage after mount (avoids SSR/client hydration mismatch).
  useEffect(() => {
    const saved = loadState<{ openTabs: TabDef[]; activeKey: string }>(STORAGE_KEY);
    if (saved && saved.openTabs.length > 0) {
      setOpenTabs(saved.openTabs);
      setActiveKeyState(saved.activeKey);
    }
  }, []);

  // Skip the very first save (still holds the pre-restore default state) so it
  // can't race the restore effect above and clobber what's in localStorage.
  const skipNextSave = useRef(true);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState(STORAGE_KEY, { openTabs, activeKey });
  }, [openTabs, activeKey]);

  const openTab = useCallback((tab: TabDef) => {
    setOpenTabs((prev) => {
      if (prev.some((t) => t.key === tab.key)) return prev;

      if (prev.length < MAX_OPEN_TABS) return [...prev, tab];

      const oldestClosableIndex = prev.findIndex(
        (t) => tabRegistry[t.key]?.closable !== false
      );
      const withRoom =
        oldestClosableIndex === -1
          ? prev.slice(1)
          : [...prev.slice(0, oldestClosableIndex), ...prev.slice(oldestClosableIndex + 1)];

      return [...withRoom, tab];
    });
    setActiveKeyState(tab.key);
  }, []);

  const closeTab = useCallback((key: string) => {
    setOpenTabs((prev) => {
      const index = prev.findIndex((t) => t.key === key);
      if (index === -1) return prev;

      const next = prev.filter((t) => t.key !== key);

      setActiveKeyState((currentActive) => {
        if (currentActive !== key) return currentActive;
        const fallback = next[index - 1] ?? next[0];
        return fallback ? fallback.key : "";
      });

      return next;
    });
  }, []);

  const setActiveKey = useCallback((key: string) => {
    setActiveKeyState(key);
  }, []);

  const value = useMemo(
    () => ({ openTabs, activeKey, openTab, closeTab, setActiveKey }),
    [openTabs, activeKey, openTab, closeTab, setActiveKey]
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error("useTabs must be used within a TabsProvider");
  }
  return ctx;
}