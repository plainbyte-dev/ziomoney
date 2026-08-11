"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import Button from "./Button";
import { useDataMode } from "@/contexts/DataModeContext";
import { getComplianceHoldRemittances } from "@/lib/transactionApi";
import { complianceHoldRemittanceRecords, type RemittanceTransactionRecord } from "@/data/transactionData";

export default function ComplianceTxnHoldsPanel() {
  const { isLive } = useDataMode();
  const [holds, setHolds] = useState<RemittanceTransactionRecord[]>(() =>
    isLive ? [] : complianceHoldRemittanceRecords
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  async function refresh() {
    if (!isLive) {
      setHolds(complianceHoldRemittanceRecords);
      return;
    }
    setLoading(true);
    setError(null);
    const response = await getComplianceHoldRemittances();
    setLoading(false);
    if (!response.success) {
      setError(response.message || "Could not load compliance holds.");
      return;
    }
    setHolds(response.data ?? []);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  const selected = holds.find((h) => h.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-heading">Transaction Compliance Holds</h1>
            <p className="mt-0.5 text-sm text-muted">
              {isLive ? "Live remittance API" : "Static demo data"} — remittances currently held by
              compliance. Read-only: no endpoint in this API clears a hold, so no action button is wired
              here — see the note below.
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

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Reference No</th>
                    <th className="px-4 py-3">Sender</th>
                    <th className="px-4 py-3">Receiver</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Txn Date</th>
                  </tr>
                </thead>
                <tbody>
                  {holds.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => setSelectedId((prev) => (prev === entry.id ? null : entry.id))}
                      className={`cursor-pointer border-b border-border last:border-b-0 ${
                        selectedId === entry.id ? "bg-brand-green-light/40" : "bg-panel"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-brand-blue">{entry.referenceNo}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.senderName}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.receiverName}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.destCountry}</td>
                      <td className="px-4 py-3 text-right text-heading/80">
                        {entry.payoutAmount.toLocaleString()} {entry.payoutCurrency}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {entry.remoteTxnStatus || entry.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                        {entry.txnDate.slice(0, 10)}
                      </td>
                    </tr>
                  ))}

                  {holds.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                        No transactions currently on compliance hold.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-bold text-heading">{selected.referenceNo}</h2>
          </div>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 bg-panel p-6 sm:grid-cols-3 sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Sender</p>
              <p className="mt-1 font-medium text-heading">{selected.senderName}</p>
              <p className="text-sm text-heading/70">
                {selected.senderCountry} · {selected.senderMobile}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Receiver</p>
              <p className="mt-1 font-medium text-heading">{selected.receiverName}</p>
              <p className="text-sm text-heading/70">
                {selected.receiverCountry} · {selected.receiverPhone}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Amount</p>
              <p className="mt-1 font-medium text-heading">
                {selected.payoutAmount.toLocaleString()} {selected.payoutCurrency}
              </p>
              <p className="text-sm text-heading/70">via {selected.paymentType}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Purpose</p>
              <p className="mt-1 font-medium text-heading">{selected.purposeOfTxn || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Payout Partner</p>
              <p className="mt-1 font-medium text-heading">{selected.payoutPartner}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Confirm ID</p>
              <p className="mt-1 font-medium text-heading">{selected.confirmId || "-"}</p>
            </div>
            <div className="sm:col-span-3">
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                This record has no dedicated "hold reason" field in the API response — status shown above
                ({selected.remoteTxnStatus || selected.status}) is the only signal available. What actually
                triggered the hold, and what endpoint clears it, are open questions for backend.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
