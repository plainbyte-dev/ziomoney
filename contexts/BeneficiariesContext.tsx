"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDataMode } from "./DataModeContext";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationsContext";
import { loadState, saveState } from "@/lib/persist";
import {
  addBeneficiary as addBeneficiaryApi,
  deleteBeneficiary as deleteBeneficiaryApi,
  listBeneficiaries,
} from "@/lib/beneficiaryApi";
import {
  beneficiaryRecords,
  type AddBeneficiaryPayload,
  type Beneficiary,
  type BeneficiaryApiRecord,
} from "@/data/beneficiaryData";
import type { KycStatus } from "@/data/kycData";

interface BeneficiaryLink {
  senderUserName: string;
  beneficiaryKycStatus: KycStatus;
}

interface BeneficiariesContextValue {
  entries: Beneficiary[];
  entriesLoading: boolean;
  entriesError: string | null;
  refreshEntries: () => Promise<void>;
  addEntry: (payload: AddBeneficiaryPayload, senderUserName: string) => Promise<boolean>;
  removeEntry: (id: number) => Promise<boolean>;
  // No endpoint exists for this — a purely local governance flag layered on
  // top of a backend that has no concept of receiver-side KYC at all.
  verifyBeneficiaryKyc: (id: number) => void;
  getEntriesForSender: (senderUserName: string) => Beneficiary[];
}

const BeneficiariesContext = createContext<BeneficiariesContextValue | null>(null);

const LINKS_STORAGE_KEY = "zio-beneficiary-links";

const UNLINKED: BeneficiaryLink = { senderUserName: "", beneficiaryKycStatus: "NOT_VERIFIED" };

function seedLinks(): Record<number, BeneficiaryLink> {
  const seed: Record<number, BeneficiaryLink> = {};
  for (const record of beneficiaryRecords) {
    seed[record.id] = {
      senderUserName: record.senderUserName,
      beneficiaryKycStatus: record.beneficiaryKycStatus,
    };
  }
  return seed;
}

let demoIdCounter = 1000;

export function BeneficiariesProvider({ children }: { children: React.ReactNode }) {
  const { isLive } = useDataMode();
  const { user } = useAuth();
  const { notify } = useNotifications();

  // Raw records — exactly what demo data or the live API returned, with no
  // sender/KYC info attached. Seed data is demo-only, same convention as the
  // other contexts — a live session must never render it.
  const [rawEntries, setRawEntries] = useState<BeneficiaryApiRecord[]>(() =>
    isLive ? [] : beneficiaryRecords
  );
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  // Client-side-only sender link + beneficiary KYC status, keyed by
  // beneficiary id — the one thing the real API has no field for at all
  // (see data/beneficiaryData.ts). Unlike the rest of this app's demo-only
  // persisted state, this map is NOT reset when switching live/demo mode —
  // it's the sole source of truth for this data in both modes, so there's
  // nothing for a live refresh to legitimately overwrite it with.
  const [links, setLinks] = useState<Record<number, BeneficiaryLink>>(() => {
    const saved = loadState<Record<number, BeneficiaryLink>>(LINKS_STORAGE_KEY);
    return saved ?? seedLinks();
  });

  const skipNextLinksSave = useRef(true);
  useEffect(() => {
    if (skipNextLinksSave.current) {
      skipNextLinksSave.current = false;
      return;
    }
    saveState(LINKS_STORAGE_KEY, links);
  }, [links]);

  // Beneficiaries fetched live before this feature existed (or added by
  // some other client) simply have no link yet — shown as unlinked/
  // NOT_VERIFIED rather than guessed at.
  const entries = useMemo<Beneficiary[]>(
    () => rawEntries.map((record) => ({ ...record, ...(links[record.id] ?? UNLINKED) })),
    [rawEntries, links]
  );

  const refreshEntries = useCallback(async () => {
    if (!isLive) {
      setRawEntries(beneficiaryRecords);
      return;
    }
    setRawEntries([]);
    setEntriesLoading(true);
    setEntriesError(null);
    const response = await listBeneficiaries();
    setEntriesLoading(false);
    if (!response.success) {
      setEntriesError(response.message || "Could not load beneficiaries.");
      return;
    }
    setRawEntries(response.data ?? []);
  }, [isLive]);

  useEffect(() => {
    refreshEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  const addEntry = useCallback(
    async (payload: AddBeneficiaryPayload, senderUserName: string) => {
      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const now = new Date().toISOString();
        const id = ++demoIdCounter;
        const record: BeneficiaryApiRecord = {
          id,
          username: user?.username ?? "",
          ...payload,
          createdAt: now,
          updatedAt: now,
        };
        setRawEntries((prev) => [record, ...prev]);
        setLinks((prev) => ({ ...prev, [id]: { senderUserName, beneficiaryKycStatus: "NOT_VERIFIED" } }));
        notify({ title: "Beneficiary added", message: `${payload.fullName} was linked to ${senderUserName}.` });
        return true;
      }

      const response = await addBeneficiaryApi(payload);
      if (!response.success || !response.data) {
        setEntriesError(response.message || "Could not add beneficiary.");
        return false;
      }
      const created = response.data;
      setRawEntries((prev) => [created, ...prev]);
      setLinks((prev) => ({
        ...prev,
        [created.id]: { senderUserName, beneficiaryKycStatus: "NOT_VERIFIED" },
      }));
      notify({ title: "Beneficiary added", message: `${payload.fullName} was linked to ${senderUserName}.` });
      return true;
    },
    [isLive, notify, user]
  );

  const removeEntry = useCallback(
    async (id: number) => {
      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setRawEntries((prev) => prev.filter((b) => b.id !== id));
        setLinks((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        return true;
      }
      const response = await deleteBeneficiaryApi(id);
      if (!response.success) {
        setEntriesError(response.message || "Could not delete beneficiary.");
        return false;
      }
      setRawEntries((prev) => prev.filter((b) => b.id !== id));
      setLinks((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      return true;
    },
    [isLive]
  );

  const verifyBeneficiaryKyc = useCallback(
    (id: number) => {
      let verifiedName = "Beneficiary";
      setLinks((prev) => {
        const current = prev[id] ?? UNLINKED;
        return { ...prev, [id]: { ...current, beneficiaryKycStatus: "VERIFIED" } };
      });
      const target = rawEntries.find((b) => b.id === id);
      if (target) verifiedName = target.fullName;
      notify({ title: "Beneficiary KYC verified", message: `${verifiedName} is now KYC verified.` });
    },
    [rawEntries, notify]
  );

  const getEntriesForSender = useCallback(
    (senderUserName: string) => entries.filter((b) => b.senderUserName === senderUserName),
    [entries]
  );

  const value = useMemo(
    () => ({
      entries,
      entriesLoading,
      entriesError,
      refreshEntries,
      addEntry,
      removeEntry,
      verifyBeneficiaryKyc,
      getEntriesForSender,
    }),
    [entries, entriesLoading, entriesError, refreshEntries, addEntry, removeEntry, verifyBeneficiaryKyc, getEntriesForSender]
  );

  return <BeneficiariesContext.Provider value={value}>{children}</BeneficiariesContext.Provider>;
}

export function useBeneficiaries() {
  const ctx = useContext(BeneficiariesContext);
  if (!ctx) {
    throw new Error("useBeneficiaries must be used within a BeneficiariesProvider");
  }
  return ctx;
}
