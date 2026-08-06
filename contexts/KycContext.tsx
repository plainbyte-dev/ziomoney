"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDataMode } from "./DataModeContext";
import { useNotifications } from "./NotificationsContext";
import { loadState, saveState } from "@/lib/persist";
import {
  updateCustomer,
  approveKyc,
  complianceApproveKyc,
  getApprovedKycs,
  getPendingKycs,
  getComplianceHoldKycs,
} from "@/lib/kycApi";
import {
  emptyCustomerRecord,
  mapKycApiRecord,
  pendingKycRecords,
  complianceHoldKycRecords,
  approvedKycRecords,
  type ApproveKycPayload,
  type CustomerRecord,
  type KycApprovalFields,
  type KycRecord,
} from "@/data/kycData";

// The approve endpoints want the full customer record (minus its own
// `remarks`) plus the approval-specific fields, whose `remarks` supersedes it.
function buildApprovePayload(target: KycRecord, fields: KycApprovalFields): ApproveKycPayload {
  const { remarks: _customerRemarks, id: _id, status: _status, submittedDate: _submittedDate, registrantAgent: _ra, registrantBranch: _rb, kycMode: _km, ...customerFields } = target;
  return { ...customerFields, ...fields };
}

interface KycContextValue {
  record: CustomerRecord;
  updateField: <K extends keyof CustomerRecord>(field: K, value: CustomerRecord[K]) => void;
  saving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
  saveCustomer: () => Promise<void>;

  pendingList: KycRecord[];
  complianceHoldList: KycRecord[];
  approvedList: KycRecord[];
  listsLoading: boolean;
  listsError: string | null;
  refreshLists: () => Promise<void>;

  approving: boolean;
  approveError: string | null;
  approve: (target: KycRecord, fields: KycApprovalFields) => Promise<boolean>;
  complianceApprove: (target: KycRecord, fields: KycApprovalFields) => Promise<boolean>;
}

const KycContext = createContext<KycContextValue | null>(null);

const STORAGE_KEY = "zio-kyc-state";

interface PersistedKycState {
  pendingList: KycRecord[];
  complianceHoldList: KycRecord[];
  approvedList: KycRecord[];
}

let localIdCounter = 2000;

export function KycProvider({ children }: { children: React.ReactNode }) {
  const { isLive } = useDataMode();
  const { notify } = useNotifications();

  const [record, setRecord] = useState<CustomerRecord>(emptyCustomerRecord());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [pendingList, setPendingList] = useState<KycRecord[]>(pendingKycRecords);
  const [complianceHoldList, setComplianceHoldList] =
    useState<KycRecord[]>(complianceHoldKycRecords);
  const [approvedList, setApprovedList] = useState<KycRecord[]>(approvedKycRecords);
  const [listsLoading, setListsLoading] = useState(false);
  const [listsError, setListsError] = useState<string | null>(null);

  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  // Restore any admin-made changes (submissions/approvals) from a previous
  // session so a page refresh doesn't silently drop them back to the seed data.
  useEffect(() => {
    const saved = loadState<PersistedKycState>(STORAGE_KEY);
    if (saved) {
      setPendingList(saved.pendingList);
      setComplianceHoldList(saved.complianceHoldList);
      setApprovedList(saved.approvedList);
    }
  }, []);

  const skipNextSave = useRef(true);
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveState<PersistedKycState>(STORAGE_KEY, { pendingList, complianceHoldList, approvedList });
  }, [pendingList, complianceHoldList, approvedList]);

  const updateField = useCallback(
    <K extends keyof CustomerRecord>(field: K, value: CustomerRecord[K]) => {
      setRecord((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const saveCustomer = useCallback(async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    // fullName is always derived from the name parts rather than tracked
    // separately, so it can never drift out of sync with what's on screen.
    const payload: CustomerRecord = {
      ...record,
      fullName: [record.firstName, record.middleName, record.lastName]
        .filter(Boolean)
        .join(" "),
    };

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setPendingList((prev) => [
        {
          ...payload,
          id: `KYC-LOCAL-${++localIdCounter}`,
          status: "NOT_VERIFIED",
          submittedDate: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
      setSaving(false);
      setSaveSuccess(true);
      notify({
        title: "KYC submitted",
        message: `${payload.fullName || payload.userName} was added to the approval queue.`,
      });
      return;
    }

    const response = await updateCustomer(payload);
    setSaving(false);
    if (!response.success) {
      setSaveError(response.message || "Could not update the customer.");
      return;
    }
    setSaveSuccess(true);
    notify({
      title: "KYC submitted",
      message: `${payload.fullName || payload.userName} was submitted for review.`,
    });
  }, [isLive, notify, record]);

  const refreshLists = useCallback(async () => {
    // In static/demo mode there's no backend to refresh from — the lists
    // already reflect whatever the admin has done locally, restored from
    // localStorage on load, so refreshing is a no-op rather than a reset.
    if (!isLive) return;

    setListsLoading(true);
    setListsError(null);

    const [pending, hold, approved] = await Promise.all([
      getPendingKycs(),
      getComplianceHoldKycs(),
      getApprovedKycs(),
    ]);

    setListsLoading(false);

    const firstError = [pending, hold, approved].find((r) => !r.success);
    if (firstError) {
      setListsError(firstError.message || "Could not load KYC records.");
      return;
    }

    setPendingList((pending.data ?? []).map(mapKycApiRecord));
    setComplianceHoldList((hold.data ?? []).map(mapKycApiRecord));
    setApprovedList((approved.data ?? []).map(mapKycApiRecord));
  }, [isLive]);

  const moveToApproved = useCallback((target: KycRecord, fields: KycApprovalFields) => {
    setPendingList((prev) => prev.filter((r) => r.id !== target.id));
    setComplianceHoldList((prev) => prev.filter((r) => r.id !== target.id));
    setApprovedList((prev) => [
      { ...target, ...fields, status: "VERIFIED" },
      ...prev,
    ]);
  }, []);

  // Live path: the API returns the authoritative record (its own id, status,
  // kycUniqueCode, ...) rather than us guessing it by merging locally.
  const moveToApprovedRecord = useCallback((previousId: string, record: KycRecord) => {
    setPendingList((prev) => prev.filter((r) => r.id !== previousId));
    setComplianceHoldList((prev) => prev.filter((r) => r.id !== previousId));
    setApprovedList((prev) => [record, ...prev]);
  }, []);

  const approve = useCallback(
    async (target: KycRecord, fields: KycApprovalFields) => {
      setApproving(true);
      setApproveError(null);

      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        moveToApproved(target, fields);
        setApproving(false);
        notify({ title: "KYC approved", message: `${target.fullName || target.userName} is now verified.` });
        return true;
      }

      const response = await approveKyc(buildApprovePayload(target, fields));
      setApproving(false);
      if (!response.success || !response.data) {
        setApproveError(response.message || "Could not approve this KYC.");
        return false;
      }
      moveToApprovedRecord(target.id, mapKycApiRecord(response.data));
      notify({ title: "KYC approved", message: `${target.fullName || target.userName} is now verified.` });
      return true;
    },
    [isLive, moveToApproved, moveToApprovedRecord, notify]
  );

  const complianceApprove = useCallback(
    async (target: KycRecord, fields: KycApprovalFields) => {
      setApproving(true);
      setApproveError(null);

      if (!isLive) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        moveToApproved(target, fields);
        setApproving(false);
        notify({
          title: "KYC approved (compliance)",
          message: `${target.fullName || target.userName} cleared compliance review.`,
        });
        return true;
      }

      const response = await complianceApproveKyc(buildApprovePayload(target, fields));
      setApproving(false);
      if (!response.success || !response.data) {
        setApproveError(response.message || "Could not complete compliance approval.");
        return false;
      }
      moveToApprovedRecord(target.id, mapKycApiRecord(response.data));
      notify({
        title: "KYC approved (compliance)",
        message: `${target.fullName || target.userName} cleared compliance review.`,
      });
      return true;
    },
    [isLive, moveToApproved, moveToApprovedRecord, notify]
  );

  const value = useMemo(
    () => ({
      record,
      updateField,
      saving,
      saveError,
      saveSuccess,
      saveCustomer,
      pendingList,
      complianceHoldList,
      approvedList,
      listsLoading,
      listsError,
      refreshLists,
      approving,
      approveError,
      approve,
      complianceApprove,
    }),
    [
      record,
      updateField,
      saving,
      saveError,
      saveSuccess,
      saveCustomer,
      pendingList,
      complianceHoldList,
      approvedList,
      listsLoading,
      listsError,
      refreshLists,
      approving,
      approveError,
      approve,
      complianceApprove,
    ]
  );

  return <KycContext.Provider value={value}>{children}</KycContext.Provider>;
}

export function useKyc() {
  const ctx = useContext(KycContext);
  if (!ctx) {
    throw new Error("useKyc must be used within a KycProvider");
  }
  return ctx;
}
