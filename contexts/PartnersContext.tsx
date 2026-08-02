"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadState, saveState } from "@/lib/persist";
import { partnerEntries as initialEntries, type PartnerEntry } from "@/data/partnerData";

interface PartnersContextValue {
  entries: PartnerEntry[];
  addEntry: (entry: PartnerEntry) => void;
  removeEntry: (id: string) => void;
}

const STORAGE_KEY = "zio-partners-state";

const PartnersContext = createContext<PartnersContextValue | null>(null);

export function PartnersProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<PartnerEntry[]>(initialEntries);

  useEffect(() => {
    const saved = loadState<PartnerEntry[]>(STORAGE_KEY);
    if (saved) setEntries(saved);
  }, []);

  // Skip the very first save (still holds the pre-restore default state) so it
  // can't race the restore effect above and clobber what's in localStorage.
  const skipNextSave = useRef(true);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
    } else {
      saveState(STORAGE_KEY, entries);
    }
    return () => {
      skipNextSave.current = true;
    };
  }, [entries]);

  const addEntry = useCallback((entry: PartnerEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const value = useMemo(
    () => ({ entries, addEntry, removeEntry }),
    [entries, addEntry, removeEntry]
  );

  return <PartnersContext.Provider value={value}>{children}</PartnersContext.Provider>;
}

export function usePartners() {
  const ctx = useContext(PartnersContext);
  if (!ctx) {
    throw new Error("usePartners must be used within a PartnersProvider");
  }
  return ctx;
}
