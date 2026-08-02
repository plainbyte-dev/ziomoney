"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadState, saveState } from "@/lib/persist";
import type { VoucherLogEntry } from "@/data/voucherEntryData";

interface VouchersContextValue {
  entries: VoucherLogEntry[];
  addEntry: (entry: VoucherLogEntry) => void;
  approveEntry: (id: string) => void;
  removeEntry: (id: string) => void;
}

const STORAGE_KEY = "zio-vouchers-state";

const VouchersContext = createContext<VouchersContextValue | null>(null);

export function VouchersProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<VoucherLogEntry[]>([]);

  useEffect(() => {
    const saved = loadState<VoucherLogEntry[]>(STORAGE_KEY);
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

  const addEntry = useCallback((entry: VoucherLogEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const approveEntry = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, status: "Approved" } : entry))
    );
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const value = useMemo(
    () => ({ entries, addEntry, approveEntry, removeEntry }),
    [entries, addEntry, approveEntry, removeEntry]
  );

  return <VouchersContext.Provider value={value}>{children}</VouchersContext.Provider>;
}

export function useVouchers() {
  const ctx = useContext(VouchersContext);
  if (!ctx) {
    throw new Error("useVouchers must be used within a VouchersProvider");
  }
  return ctx;
}
