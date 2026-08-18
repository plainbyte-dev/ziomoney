"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import Button from "./Button";
import EditCustomerModal from "./EditCustomerModal";
import { useKyc } from "@/contexts/KycContext";
import { useDataMode } from "@/contexts/DataModeContext";
import type { CustomerRecord, KycRecord } from "@/data/kycData";

export default function ApprovedKycsPanel() {
  const { isLive } = useDataMode();
  const {
    approvedList,
    listsLoading,
    listsError,
    refreshLists,
    updatingCustomer,
    updateCustomerError,
    updateCustomerRecord,
  } = useKyc();

  const [selected, setSelected] = useState<KycRecord | null>(null);

  useEffect(() => {
    refreshLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  // Keep the open modal in sync with the underlying list (e.g. right after
  // a save updates the record in place) instead of showing stale data.
  useEffect(() => {
    if (!selected) return;
    const fresh = approvedList.find((entry) => entry.id === selected.id);
    if (fresh && fresh !== selected) setSelected(fresh);
    if (!fresh) setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvedList]);

  async function handleSave(payload: CustomerRecord) {
    if (!selected) return;
    const success = await updateCustomerRecord(selected, payload);
    if (success) setSelected(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-heading">Approved KYCs</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — verified customer records.
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

      <div className="bg-panel p-6 sm:p-8">
        {listsError && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{listsError}</p>
        )}

        <div className="overflow-hidden rounded-xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                  <th className="px-4 py-3">User Name</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Nationality</th>
                  <th className="px-4 py-3">Registrant Agent</th>
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">KYC Mode</th>
                  <th className="px-4 py-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {approvedList.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => setSelected(entry)}
                    className="cursor-pointer border-b border-border bg-panel last:border-b-0 hover:bg-brand-green-light/30"
                  >
                    <td className="px-4 py-3 font-medium text-heading">{entry.userName}</td>
                    <td className="px-4 py-3 text-heading/80">{entry.fullName}</td>
                    <td className="px-4 py-3 text-heading/80">{entry.nationality}</td>
                    <td className="px-4 py-3 text-heading/80">{entry.registrantAgent || "-"}</td>
                    <td className="px-4 py-3 text-heading/80">{entry.registrantBranch || "-"}</td>
                    <td className="px-4 py-3 text-heading/80">{entry.kycMode || "-"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                      {entry.submittedDate}
                    </td>
                  </tr>
                ))}

                {approvedList.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                      No approved KYC records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <EditCustomerModal
        target={selected}
        submitting={updatingCustomer}
        error={updateCustomerError}
        onClose={() => setSelected(null)}
        onSave={handleSave}
      />
    </div>
  );
}
