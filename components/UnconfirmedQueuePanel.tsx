"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import Button from "./Button";
import RemittanceRecordTable, { type RemittanceTableColumn } from "./RemittanceRecordTable";
import { useDataMode } from "@/contexts/DataModeContext";
import { viewTransaction, type TransactionApiResponse } from "@/lib/transactionApi";
import { formatAccounting, formatDate } from "@/lib/format";
import type { RemittanceTransactionRecord } from "@/data/transactionData";

const columns: RemittanceTableColumn[] = [
  { label: "Reference No", render: (e) => <span className="font-medium text-brand-blue">{e.referenceNo}</span> },
  { label: "Sender", render: (e) => e.senderName },
  { label: "Receiver", render: (e) => e.receiverName },
  { label: "Payout Amount", render: (e) => `${formatAccounting(e.payoutAmount)} ${e.payoutCurrency}`, align: "right" },
  { label: "Status", render: (e) => e.status },
  { label: "Sending Agent", render: (e) => e.sendingAgent },
  { label: "Txn Date", render: (e) => formatDate(e.txnDate) },
];

// Shared implementation for both Unconfirmed queues — same table/detail UI,
// but each source (admin-inserted vs. partner-API-inserted) is a distinct
// queue per the API, not two views of one list. Callers pass a title/badge
// so they stay visually distinct even though the underlying component is
// the same.
export default function UnconfirmedQueuePanel({
  title,
  sourceBadge,
  sourceBadgeClass,
  description,
  fetcher,
  demoSeed,
}: {
  title: string;
  sourceBadge: string;
  sourceBadgeClass: string;
  description: string;
  fetcher: () => Promise<TransactionApiResponse<RemittanceTransactionRecord[]>>;
  demoSeed: RemittanceTransactionRecord[];
}) {
  const { isLive } = useDataMode();
  const [entries, setEntries] = useState<RemittanceTransactionRecord[]>(() => (isLive ? [] : demoSeed));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<RemittanceTransactionRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  async function refresh() {
    if (!isLive) {
      setEntries(demoSeed);
      return;
    }
    setLoading(true);
    setError(null);
    const response = await fetcher();
    setLoading(false);
    if (!response.success) {
      setError(response.message || "Could not load this queue.");
      return;
    }
    if (!Array.isArray(response.data)) {
      setError("Unexpected response shape (not an array) — confirm the real response format with backend.");
      return;
    }
    setEntries(response.data);
  }

  useEffect(() => {
    refresh();
    setSelectedId(null);
    setDetail(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  async function handleRowClick(entry: RemittanceTransactionRecord) {
    setSelectedId((prev) => (prev === entry.id ? null : entry.id));
    if (selectedId === entry.id) {
      setDetail(null);
      return;
    }
    if (!isLive) {
      setDetail(entry);
      return;
    }
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);
    const response = await viewTransaction({ confirmId: entry.confirmId });
    setDetailLoading(false);
    if (!response.success || !response.data) {
      setDetailError(response.message || "Could not load transaction detail.");
      return;
    }
    setDetail(response.data);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-heading">{title}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${sourceBadgeClass}`}>
                {sourceBadge}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-muted">
              {isLive ? "Live remittance API" : "Static demo data"} — {description}
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
            onRowClick={handleRowClick}
            selectedId={selectedId}
            emptyMessage="No transactions in this queue."
          />
        </div>
      </div>

      {selectedId !== null && (
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-base font-bold text-heading">Detail</h2>
          </div>
          <div className="bg-panel p-6 sm:p-8">
            {detailLoading && <p className="text-sm text-muted">Loading detail...</p>}
            {detailError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{detailError}</p>}
            {detail && (
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                <Field label="Reference No" value={detail.referenceNo} />
                <Field label="Confirm ID" value={detail.confirmId} />
                <Field label="Status" value={detail.status} />
                <Field label="Sender" value={`${detail.senderName} (${detail.senderCountry})`} />
                <Field label="Receiver" value={`${detail.receiverName} (${detail.receiverCountry})`} />
                <Field label="Payout" value={`${formatAccounting(detail.payoutAmount)} ${detail.payoutCurrency}`} />
                <Field label="Payment Type" value={detail.paymentType} />
                <Field label="Payout Partner" value={detail.payoutPartner} />
                <Field label="Sending Agent" value={detail.sendingAgent} />
                <Field label="Purpose" value={detail.purposeOfTxn || "-"} />
                <Field label="Txn Date" value={formatDate(detail.txnDate)} />
              </div>
            )}
            <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              No endpoint in this API is documented for approving/rejecting a queued transaction — no action
              button is wired here rather than guessing. Confirm with backend before adding one.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-medium text-heading">{value}</p>
    </div>
  );
}
