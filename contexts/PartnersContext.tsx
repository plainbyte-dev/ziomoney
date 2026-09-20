"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { loadState, saveState } from "@/lib/persist";
import { useNotifications } from "./NotificationsContext";
import { useDataMode } from "./DataModeContext";
import {
  listRemittancePartners,
  obtainRemittancePartnerCountries,
  type RemittancePartnerRecord,
} from "@/lib/partnersApi";
import { partnerEntries as initialEntries, normalizedPartnerName, type PartnerEntry } from "@/data/partnerData";

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
  const [restored, setRestored] = useState(false);

  // Only meaningful in demo mode — a live session gets its list from the API,
  // never from a locally persisted demo snapshot.
  useEffect(() => {
    if (!isLive) {
      const saved = loadState<PartnerEntry[]>(STORAGE_KEY);
      if (saved) setEntries(saved);
    }
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gated on `restored` state (not a ref-based "skip the first run" flag) so
  // this can't fire before the restore effect above has actually committed.
  // A ref flip isn't enough — React 18 Strict Mode double-invokes every
  // effect on mount in dev using the SAME pre-restore render's closure, so a
  // ref consumed by the first invocation lets the second one straight
  // through, overwriting a real demo-mode snapshot with the pre-restore seed
  // data moments before the real state change re-fires this correctly.
  // `restored` only flips via a real committed render, so both Strict Mode
  // invocations on the initial (pre-restore) render see it as false.
  useEffect(() => {
    if (!restored) return;
    saveState(STORAGE_KEY, entries);
  }, [restored, entries]);

  // listRemittancePartners has no way to report txnCurrencies back (it's set
  // via its own insert-only endpoint with no list counterpart) — so a
  // refresh keeps whatever was already known locally for that field, matched
  // by partner name, instead of wiping it back to empty. destCountries now
  // has a real list endpoint (obtainRemittancePartnerCountries) fetched per
  // partner below, but still falls back to this local value if that fetch
  // fails. Seeded straight from localStorage (not from `entries`, which
  // starts at [] in live mode) so even the very first refresh right after a
  // Live-mode page reload has something to merge/fall back to — otherwise
  // the restore-from-storage effect above (demo-only) never gets a chance to
  // run before refreshEntries already wiped these fields back to nothing.
  const entriesRef = useRef<PartnerEntry[]>(loadState<PartnerEntry[]>(STORAGE_KEY) ?? entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const refreshEntries = useCallback(async () => {
    // In static/demo mode there's no backend to refresh from — the list
    // already reflects whatever the admin has done locally.
    if (!isLive) return;

    const previousByName = new Map(
      entriesRef.current.map((entry) => [normalizedPartnerName(entry.partnerName), entry])
    );

    // Wipe out whatever was there (e.g. demo-mode entries, if this refresh
    // was triggered by just switching into live mode) before fetching —
    // demo data must never linger on screen while Live API is active.
    setEntries([]);
    setEntriesLoading(true);
    setEntriesError(null);

    const response = await listRemittancePartners();
    console.log("obtainAllRemittancePartner", response);
    setEntriesLoading(false);

    if (!response.success) {
      setEntriesError(response.message || "Could not load remittance partners.");
      // A failed fetch (e.g. the token expiring mid-session, a 401) must not
      // leave the list wiped to nothing until the next successful refresh —
      // restore whatever was known before this attempt so a transient/auth
      // failure doesn't look identical to "there are no partners."
      setEntries(entriesRef.current);
      return;
    }

    const mappedEntries = (response.data ?? []).map((record) => {
      const mapped = mapPartnerRecord(record);
      const previous = previousByName.get(normalizedPartnerName(mapped.partnerName));
      return previous ? { ...mapped, txnCurrencies: previous.txnCurrencies, destCountries: previous.destCountries } : mapped;
    });
    setEntries(mappedEntries);

    // Real list endpoint for destCountries — fetch per partner, in parallel,
    // and only overwrite the merged-from-local value above once each call
    // resolves. A failed call or an unexpected (non-array) shape leaves that
    // partner's local/previous value in place rather than wiping it. Matched
    // back by normalized name (not array index) so this still lands
    // correctly even if the list changed (e.g. addEntry/removeEntry) while
    // these calls were in flight.
    const destCountriesByName = new Map<string, string[]>();
    await Promise.all(
      mappedEntries.map(async (entry) => {
        const result = await obtainRemittancePartnerCountries(entry.partnerName);
        if (result.success && Array.isArray(result.data)) {
          destCountriesByName.set(normalizedPartnerName(entry.partnerName), result.data);
        }
      })
    );
    setEntries((current) =>
      current.map((entry) => {
        const destCountries = destCountriesByName.get(normalizedPartnerName(entry.partnerName));
        return destCountries ? { ...entry, destCountries } : entry;
      })
    );
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
