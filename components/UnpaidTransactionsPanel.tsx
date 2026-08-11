"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";
import Button from "./Button";
import RemittanceRecordTable, { type RemittanceTableColumn } from "./RemittanceRecordTable";
import { useDataMode } from "@/contexts/DataModeContext";
import { useConfirmedRemittances } from "@/lib/useConfirmedRemittances";
import { formatAccounting, formatDate } from "@/lib/format";
import type { RemittanceTransactionRecord } from "@/data/transactionData";

const columns: RemittanceTableColumn[] = [
  { label: "Reference No", render: (e) => <span className="font-medium text-brand-blue">{e.referenceNo}</span> },
  { label: "Receiver", render: (e) => e.receiverName },
  { label: "Payout Amount", render: (e) => `${formatAccounting(e.payoutAmount)} ${e.payoutCurrency}`, align: "right" },
  { label: "Payout Partner", render: (e) => e.payoutPartner },
  { label: "Remote Status", render: (e) => e.remoteTxnStatus || "-" },
  { label: "Confirm Date", render: (e) => formatDate(e.confirmTxnDate) },
];

// STUB — remoteTxnStatus's real values are not documented. Until confirmed
// with backend, this always returns true (i.e. shows every confirmed
// remittance, same as Pending Payout Queue) rather than guessing at a
// condition like `=== "UNPAID"` that might not match reality.
function isUnpaid(_txn: RemittanceTransactionRecord): boolean {
  return true;
}

// No dedicated endpoint exists for this screen — it's a client-side filter
// over GET /getAllConformedRemittances (same source/hook as
// PendingTransactionPanel), not a separate fetch.
export default function UnpaidTransactionsPanel() {
  const { isLive } = useDataMode();
  const { entries, loading, error, refresh } = useConfirmedRemittances();
  const unpaid = useMemo(() => entries.filter(isUnpaid), [entries]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-heading">Unpaid Transactions</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — filtered from confirmed remittances, not a
            separate API call.
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
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          The filter that should narrow this down to genuinely unpaid transactions is stubbed —
          <code className="mx-1">remoteTxnStatus</code>'s real values aren't documented, so this currently
          shows every confirmed remittance (identical to Pending Payout Queue) rather than guessing at a
          condition. Update <code>isUnpaid()</code> once backend confirms the real values.
        </p>
        <RemittanceRecordTable
          entries={unpaid}
          columns={columns}
          emptyMessage="No unpaid transactions."
        />
      </div>
    </div>
  );
}
