"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import KycQueueTable from "./KycQueueTable";
import KycApprovalModal from "./KycApprovalModal";
import EditCustomerModal from "./EditCustomerModal";
import Button from "./Button";
import { useKyc } from "@/contexts/KycContext";
import { useDataMode } from "@/contexts/DataModeContext";
import type { CustomerRecord, KycApprovalFields, KycRecord } from "@/data/kycData";

type PendingAction = { target: KycRecord; action: "approve" | "compliance" } | null;

export default function KycApprovalQueuePanel() {
  const { isLive } = useDataMode();
  const {
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
    updatingCustomer,
    updateCustomerError,
    updateCustomerRecord,
  } = useKyc();

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  // Opened right after an approval succeeds, so a beneficiary can be added
  // for that customer immediately — without navigating to Approved KYCs.
  // Tracked by userName rather than the record itself: `approve()`/
  // `complianceApprove()` resolve before the setState inside them has
  // flushed, so `approvedList` here is still stale the instant they return —
  // this gets resolved to the real record once the list actually updates.
  const [pendingApprovedUserName, setPendingApprovedUserName] = useState<string | null>(null);
  const [justApproved, setJustApproved] = useState<KycRecord | null>(null);

  useEffect(() => {
    refreshLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  // Resolve the pending userName to its real approved record once it
  // actually shows up in approvedList.
  useEffect(() => {
    if (!pendingApprovedUserName) return;
    const approved = approvedList.find((entry) => entry.userName === pendingApprovedUserName);
    if (approved) {
      setJustApproved(approved);
      setPendingApprovedUserName(null);
    }
  }, [approvedList, pendingApprovedUserName]);

  // Keep the just-approved modal in sync with the underlying list, same
  // convention as ApprovedKycsPanel.
  useEffect(() => {
    if (!justApproved) return;
    const fresh = approvedList.find((entry) => entry.id === justApproved.id);
    if (fresh && fresh !== justApproved) setJustApproved(fresh);
    if (!fresh) setJustApproved(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedList]);

  async function handleConfirm(fields: KycApprovalFields) {
    if (!pendingAction) return;
    const targetUserName = pendingAction.target.userName;
    const success =
      pendingAction.action === "approve"
        ? await approve(pendingAction.target, fields)
        : await complianceApprove(pendingAction.target, fields);
    if (success) {
      setPendingAction(null);
      setPendingApprovedUserName(targetUserName);
    }
  }

  async function handleSaveJustApproved(payload: CustomerRecord) {
    if (!justApproved) return;
    const success = await updateCustomerRecord(justApproved, payload);
    if (success) setJustApproved(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-heading">KYC Approval Queue</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — pending and compliance-hold
            customer KYCs.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refreshLists}
          disabled={listsLoading}
          icon={<RefreshCw size={13} className={listsLoading ? "animate-spin" : undefined} />}
        >
          Refresh
        </Button>
      </div>

      <div className="flex flex-col gap-6 bg-panel p-6 sm:p-8">
        {listsError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{listsError}</p>
        )}

        <KycQueueTable
          title="Pending KYC (Not Verified)"
          entries={pendingList}
          emptyMessage="No pending KYC records."
          onApprove={(record) => setPendingAction({ target: record, action: "approve" })}
          approveLabel="Approve"
        />

        <KycQueueTable
          title="Compliance Hold"
          entries={complianceHoldList}
          emptyMessage="Nothing on compliance hold."
          toneClassName="bg-amber-50 text-amber-800"
          onApprove={(record) => setPendingAction({ target: record, action: "compliance" })}
          approveLabel="Compliance Approve"
        />
      </div>

      <KycApprovalModal
        target={pendingAction?.target ?? null}
        action={pendingAction?.action ?? null}
        submitting={approving}
        error={approveError}
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirm}
      />

      <EditCustomerModal
        target={justApproved}
        submitting={updatingCustomer}
        error={updateCustomerError}
        onClose={() => setJustApproved(null)}
        onSave={handleSaveJustApproved}
      />
    </div>
  );
}
