"use client";

import { RefreshCw } from "lucide-react";
import Button from "./Button";
import RemittanceRecordTable, { type RemittanceTableColumn } from "./RemittanceRecordTable";
import { useDataMode } from "@/contexts/DataModeContext";
import { useConfirmedRemittances } from "@/lib/useConfirmedRemittances";
import { formatAccounting, formatDate } from "@/lib/format";

const columns: RemittanceTableColumn[] = [
  { label: "Reference No", render: (e) => <span className="font-medium text-brand-blue">{e.referenceNo}</span> },
  { label: "Receiver", render: (e) => e.receiverName },
  { label: "Payout Amount", render: (e) => `${formatAccounting(e.payoutAmount)} ${e.payoutCurrency}`, align: "right" },
  { label: "Payout Partner", render: (e) => e.payoutPartner },
  { label: "Status", render: (e) => e.status },
  { label: "Confirm Date", render: (e) => formatDate(e.confirmTxnDate) },
];

// Track B — GET /getAllConformedRemittances: confirmed remittances ready to
// push to a payout partner.
export default function PendingTransactionPanel() {
  const { isLive } = useDataMode();
  const { entries, loading, error, refresh } = useConfirmedRemittances();

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-heading">Pending Transaction</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — confirmed remittances ready for payout.
            Read-only: whether pushing to the payout partner happens automatically once status reaches
            CONFIRMED, or needs an explicit action, is unconfirmed with backend — no "push to payout" button
            is wired here rather than guessing at an endpoint.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={refresh}
          disabled={loading}
          icon={<RefreshCw size={13} className={loading ? "animate-spin" : undefined} />}
        >
          Refresh
        </Button>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        <RemittanceRecordTable
          entries={entries}
          columns={columns}
          emptyMessage="No confirmed transactions pending payout."
        />
      </div>
    </div>
  );
}
