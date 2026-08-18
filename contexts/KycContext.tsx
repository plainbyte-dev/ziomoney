"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, useEffect } from "react";
import { useDataMode } from "./DataModeContext";
import { useNotifications } from "./NotificationsContext";
import { loadState, saveState } from "@/lib/persist";
import type { ApiResponse } from "@/lib/apiClient";
import { useAsyncMutation } from "@/lib/useAsyncMutation";
import { useAsyncQuery } from "@/lib/useAsyncQuery";
import {
  approveKyc,
  complianceApproveKyc,
  getApprovedKycs,
  getPendingKycs,
  getComplianceHoldKycs,
  updateCustomer as updateCustomerApi,
} from "@/lib/kycApi";
import {
  emptyCustomerRecord,
  mapKycApiRecord,
  pendingKycRecords,
  complianceHoldKycRecords,
  approvedKycRecords,
  type ApproveKycPayload,
  type CustomerRecord,
  type KycApiRecord,
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
  saveCustomer: (fields: KycApprovalFields) => Promise<void>;

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

  updatingCustomer: boolean;
  updateCustomerError: string | null;
  updateCustomerRecord: (target: KycRecord, payload: CustomerRecord) => Promise<boolean>;
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveMutation = useAsyncMutation();
  const listsQuery = useAsyncQuery();
  const approveMutation = useAsyncMutation();
  const updateMutation = useAsyncMutation();

  // Seed data is demo-only — a live session must never render it, not even
  // for the instant before the first live fetch resolves.
  const [pendingList, setPendingList] = useState<KycRecord[]>(() => (isLive ? [] : pendingKycRecords));
  const [complianceHoldList, setComplianceHoldList] = useState<KycRecord[]>(() =>
    isLive ? [] : complianceHoldKycRecords
  );
  const [approvedList, setApprovedList] = useState<KycRecord[]>(() => (isLive ? [] : approvedKycRecords));

  // Restore any admin-made changes (submissions/approvals) from a previous
  // session so a page refresh doesn't silently drop them back to the seed data.
  // Only meaningful in demo mode — a live session gets its records from the
  // API, never from a locally persisted demo snapshot.
  useEffect(() => {
    if (isLive) return;
    const saved = loadState<PersistedKycState>(STORAGE_KEY);
    if (saved) {
      setPendingList(saved.pendingList);
      setComplianceHoldList(saved.complianceHoldList);
      setApprovedList(saved.approvedList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Inserts the customer already-approved via InsertApprovedKYC (which runs
  // OFAC screening first) rather than the two-step updateCustomer-then-approve
  // flow — this is the direct "Add Customer" path, so it needs the same
  // registrant/KYC-mode fields the approval modal collects.
  const saveCustomer = useCallback(
    async (fields: KycApprovalFields) => {
      setSaveSuccess(false);

      // fullName is always derived from the name parts rather than tracked
      // separately, so it can never drift out of sync with what's on screen.
      // fields.remarks supersedes the record's own remarks, same convention
      // as the KYC approval modal.
      const { remarks: _recordRemarks, ...customerFields } = record;
      const payload: ApproveKycPayload = {
        ...customerFields,
        fullName: [record.firstName, record.middleName, record.lastName].filter(Boolean).join(" "),
        ...fields,
      };

      await saveMutation.run<void>({
        isLive,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 400));
          setApprovedList((prev) => [
            {
              ...payload,
              id: `KYC-LOCAL-${++localIdCounter}`,
              status: "VERIFIED",
              submittedDate: new Date().toISOString().slice(0, 10),
            },
            ...prev,
          ]);
          setSaveSuccess(true);
          notify({
            title: "Customer added",
            message: `${payload.fullName || payload.userName} was added as a verified customer.`,
          });
        },
        live: () => approveKyc(payload),
        onLiveSuccess: (response) => {
          setApprovedList((prev) => [mapKycApiRecord(response.data as KycApiRecord), ...prev]);
          setSaveSuccess(true);
          notify({
            title: "Customer added",
            message: `${payload.fullName || payload.userName} was added as a verified customer.`,
          });
        },
        failValue: undefined,
        fallbackErrorMessage: "Could not insert the KYC.",
      });
    },
    [isLive, notify, record, saveMutation]
  );

  const refreshLists = useCallback(async () => {
    await listsQuery.run<[KycApiRecord[], KycApiRecord[], KycApiRecord[]]>({
      isLive,
      // Wipe out whatever was there (e.g. demo-mode records, if this refresh
      // was triggered by just switching into live mode) before fetching —
      // demo data must never linger on screen while Live API is active.
      clear: () => {
        setPendingList([]);
        setComplianceHoldList([]);
        setApprovedList([]);
      },
      fetch: async () => {
        const [pending, hold, approved] = await Promise.all([
          getPendingKycs(),
          getComplianceHoldKycs(),
          getApprovedKycs(),
        ]);
        const firstError = [pending, hold, approved].find((r) => !r.success);
        if (firstError) {
          return firstError as unknown as ApiResponse<[KycApiRecord[], KycApiRecord[], KycApiRecord[]]>;
        }
        return {
          success: true,
          message: "",
          errorCode: null,
          timestamp: new Date().toISOString(),
          data: [pending.data ?? [], hold.data ?? [], approved.data ?? []],
        };
      },
      onSuccess: ([pending, hold, approved]) => {
        setPendingList(pending.map(mapKycApiRecord));
        setComplianceHoldList(hold.map(mapKycApiRecord));
        setApprovedList(approved.map(mapKycApiRecord));
      },
      fallbackErrorMessage: "Could not load KYC records.",
    });
  }, [isLive, listsQuery]);

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
    async (target: KycRecord, fields: KycApprovalFields) =>
      approveMutation.run<boolean>({
        isLive,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 400));
          moveToApproved(target, fields);
          notify({ title: "KYC approved", message: `${target.fullName || target.userName} is now verified.` });
          return true;
        },
        live: () => approveKyc(buildApprovePayload(target, fields)),
        onLiveSuccess: (response) => {
          moveToApprovedRecord(target.id, mapKycApiRecord(response.data as KycApiRecord));
          notify({ title: "KYC approved", message: `${target.fullName || target.userName} is now verified.` });
          return true;
        },
        failValue: false,
        fallbackErrorMessage: "Could not approve this KYC.",
      }),
    [isLive, moveToApproved, moveToApprovedRecord, notify, approveMutation]
  );

  const complianceApprove = useCallback(
    async (target: KycRecord, fields: KycApprovalFields) =>
      approveMutation.run<boolean>({
        isLive,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 400));
          moveToApproved(target, fields);
          notify({
            title: "KYC approved (compliance)",
            message: `${target.fullName || target.userName} cleared compliance review.`,
          });
          return true;
        },
        live: () => complianceApproveKyc(buildApprovePayload(target, fields)),
        onLiveSuccess: (response) => {
          moveToApprovedRecord(target.id, mapKycApiRecord(response.data as KycApiRecord));
          notify({
            title: "KYC approved (compliance)",
            message: `${target.fullName || target.userName} cleared compliance review.`,
          });
          return true;
        },
        failValue: false,
        fallbackErrorMessage: "Could not complete compliance approval.",
      }),
    [isLive, moveToApproved, moveToApprovedRecord, notify, approveMutation]
  );

  // Partial update keyed on userName — target's id/status/audit fields are
  // preserved locally since /updateCustomer only echoes back the profile
  // fields it was given, same shape gap as the approve endpoints.
  const updateCustomerRecord = useCallback(
    async (target: KycRecord, payload: CustomerRecord) =>
      updateMutation.run<boolean>({
        isLive,
        demo: async () => {
          await new Promise((resolve) => setTimeout(resolve, 400));
          setApprovedList((prev) =>
            prev.map((entry) => (entry.id === target.id ? { ...entry, ...payload } : entry))
          );
          notify({
            title: "Customer updated",
            message: `${payload.fullName || payload.userName} was updated.`,
          });
          return true;
        },
        live: () => updateCustomerApi(payload),
        onLiveSuccess: (response) => {
          const updated = mapKycApiRecord(response.data as KycApiRecord);
          setApprovedList((prev) =>
            prev.map((entry) => (entry.id === target.id ? { ...updated, id: target.id } : entry))
          );
          notify({
            title: "Customer updated",
            message: `${updated.fullName || updated.userName} was updated.`,
          });
          return true;
        },
        failValue: false,
        fallbackErrorMessage: "Could not update this customer.",
      }),
    [isLive, notify, updateMutation]
  );

  const value = useMemo(
    () => ({
      record,
      updateField,
      saving: saveMutation.loading,
      saveError: saveMutation.error,
      saveSuccess,
      saveCustomer,
      pendingList,
      complianceHoldList,
      approvedList,
      listsLoading: listsQuery.loading,
      listsError: listsQuery.error,
      refreshLists,
      approving: approveMutation.loading,
      approveError: approveMutation.error,
      approve,
      complianceApprove,
      updatingCustomer: updateMutation.loading,
      updateCustomerError: updateMutation.error,
      updateCustomerRecord,
    }),
    [
      record,
      updateField,
      saveMutation.loading,
      saveMutation.error,
      saveSuccess,
      saveCustomer,
      pendingList,
      complianceHoldList,
      approvedList,
      listsQuery.loading,
      listsQuery.error,
      refreshLists,
      approveMutation.loading,
      approveMutation.error,
      approve,
      complianceApprove,
      updateMutation.loading,
      updateMutation.error,
      updateCustomerRecord,
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
