"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadState, saveState } from "@/lib/persist";
import { useNotifications } from "./NotificationsContext";
import { useDataMode } from "./DataModeContext";
import { listRemittancePartners, type RemittancePartnerRecord } from "@/lib/partnersApi";
import { partnerEntries as initialEntries, type PartnerEntry } from "@/data/partnerData";

interface PartnersContextValue {
  entries: PartnerEntry[];
  entriesLoading: boolean;
  entriesError: string | null;
  refreshEntries: () => Promise<void>;
  addEntry: (entry: PartnerEntry) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, patch: Partial<PartnerEntry>) => void;
}

const STORAGE_KEY = "zio-partners-state";

const PartnersContext = createContext<PartnersContextValue | null>(null);

// The API record has no `blocked`/`hasBank` concept — those stay UI-local,
// defaulted false for anything loaded live.
function mapPartnerRecord(record: RemittancePartnerRecord): PartnerEntry {
  return {
    id: String(record.id),
    partnerName: record.userName,
    partnerId: record.partnerCode,
    country: record.partnerCountry.toUpperCase(),
    partnerType: record.remitterType,
    creditLimit: record.accountBalance,
    hasBank: false,
    blocked: false,
    email: record.email,
    acceptPartnerPin: record.acceptPartnerPin,
    description: record.description,
    partnerAddress: record.partnerAddress,
    settlementCurrency: record.settlementCurrency,
    apiUser: record.apiUser,
    balance: record.balance,
    registeredDate: record.registeredDate,
    updatedDate: record.updatedDate,
  };
}

export function PartnersProvider({ children }: { children: React.ReactNode }) {
  const { notify } = useNotifications();
  const { isLive } = useDataMode();
  // Seed data is demo-only — a live session must never render it, not even
  // for the instant before the first live fetch resolves.
  const [entries, setEntries] = useState<PartnerEntry[]>(() => (isLive ? [] : initialEntries));
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  // Only meaningful in demo mode — a live session gets its list from the API,
  // never from a locally persisted demo snapshot.
  useEffect(() => {
    if (isLive) return;
    const saved = loadState<PartnerEntry[]>(STORAGE_KEY);
    if (saved) setEntries(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const refreshEntries = useCallback(async () => {
    // In static/demo mode there's no backend to refresh from — the list
    // already reflects whatever the admin has done locally.
    if (!isLive) return;

    // Wipe out whatever was there (e.g. demo-mode entries, if this refresh
    // was triggered by just switching into live mode) before fetching —
    // demo data must never linger on screen while Live API is active.
    setEntries([]);
    setEntriesLoading(true);
    setEntriesError(null);

    const response = await listRemittancePartners();
    setEntriesLoading(false);

    if (!response.success) {
      setEntriesError(response.message || "Could not load remittance partners.");
      return;
    }

    setEntries((response.data ?? []).map(mapPartnerRecord));
  }, [isLive]);

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

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

  const updateEntry = useCallback((id: string, patch: Partial<PartnerEntry>) => {
    setEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  }, []);

  const value = useMemo(
    () => ({ entries, entriesLoading, entriesError, refreshEntries, addEntry, removeEntry, updateEntry }),
    [entries, entriesLoading, entriesError, refreshEntries, addEntry, removeEntry, updateEntry]
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
