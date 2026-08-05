"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadState, saveState } from "@/lib/persist";
import { useNotifications } from "./NotificationsContext";
import { partnerEntries as initialEntries, type PartnerEntry } from "@/data/partnerData";

interface PartnersContextValue {
  entries: PartnerEntry[];
  addEntry: (entry: PartnerEntry) => void;
  removeEntry: (id: string) => void;
}

const STORAGE_KEY = "zio-partners-state";

const PartnersContext = createContext<PartnersContextValue | null>(null);

export function PartnersProvider({ children }: { children: React.ReactNode }) {
  const { notify } = useNotifications();
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
      return;
    }
    saveState(STORAGE_KEY, entries);
  }, [entries]);

  const addEntry = useCallback(
    (entry: PartnerEntry) => {
      setEntries((prev) => [entry, ...prev]);
      notify({ title: "Partner created", message: `${entry.partnerName} was registered.` });
    },
    [notify]
  );

  const removeEntry = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const removed = prev.find((entry) => entry.id === id);
        if (removed) notify({ title: "Partner removed", message: `${removed.partnerName} was removed.` });
        return prev.filter((entry) => entry.id !== id);
      });
    },
    [notify]
  );

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
