"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import KycQueueTable from "./KycQueueTable";
import KycApprovalModal from "./KycApprovalModal";
import { useKyc } from "@/contexts/KycContext";
import { useDataMode } from "@/contexts/DataModeContext";
import type { KycApprovalFields, KycRecord } from "@/data/kycData";

type PendingAction = { target: KycRecord; action: "approve" | "compliance" } | null;

export default function KycApprovalQueuePanel() {
  const { isLive } = useDataMode();
  const {
    pendingList,
    complianceHoldList,
    listsLoading,
    listsError,
    refreshLists,
    approving,
    approveError,
    approve,
    complianceApprove,
  } = useKyc();

  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  useEffect(() => {
    refreshLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  async function handleConfirm(fields: KycApprovalFields) {
    if (!pendingAction) return;
    const success =
      pendingAction.action === "approve"
        ? await approve(pendingAction.target, fields)
        : await complianceApprove(pendingAction.target, fields);
    if (success) setPendingAction(null);
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
        <button
          onClick={refreshLists}
          disabled={listsLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-panel px-3 py-1.5 text-xs font-medium text-heading/80 hover:bg-surface disabled:opacity-60"
        >
          <RefreshCw size={13} className={listsLoading ? "animate-spin" : undefined} />
          Refresh
        </button>
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
    </div>
  );
}
