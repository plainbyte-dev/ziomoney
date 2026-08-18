"use client";

import { useState } from "react";
import { RefreshCw, Search, X, Ban, CheckCircle2 } from "lucide-react";
import Button from "./Button";
import TextField from "./TextField";
import Pagination from "./Pagination";
import { useDataMode } from "@/contexts/DataModeContext";
import { usePaginatedTransfers } from "@/lib/useTransfers";
import { cancelTransfer, getTransferByRef } from "@/lib/transferApi";
import { demoTransferRecords, type TransferRecord } from "@/data/transferData";
import { useRates } from "@/contexts/RatesContext";
import { getOrComputeBreakdown } from "@/lib/transferMath";
import { formatAccounting } from "@/lib/format";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-brand-blue-light text-brand-blue-dark",
  PAID: "bg-brand-green-light text-brand-green-dark",
  COMPLETED: "bg-brand-green-light text-brand-green-dark",
  CANCELLED: "bg-red-50 text-red-600",
};

// Admin-only breakdown — never rendered by the agent-facing
// TransactionSendPanel. Fields beyond fee/exchangeRate/receiverAmount
// (which the real /transfers response already returns) are only
// meaningful once WHOLESALE_RETAIL_SPLIT_CONFIRMED is true; see
// config/businessRules.ts.
function AdminRateBreakdown({ transfer }: { transfer: TransferRecord }) {
  const { exchangeRates, partnerOfferRates, commissions, serviceCharges, margins } = useRates();

  const breakdown = getOrComputeBreakdown(transfer, {
    exchangeRates,
    partnerOfferRates,
    commissions,
    serviceCharges,
    margins,
  });

  const NOT_AVAILABLE = "Not available — pending backend confirmation";
  const rows: { label: string; value: string }[] = [
    {
      label: "Retail Rate",
      value: breakdown.retailRate !== null ? breakdown.retailRate.toFixed(4) : NOT_AVAILABLE,
    },
    {
      label: "Wholesale Rate",
      value: breakdown.wholesaleRate !== null ? breakdown.wholesaleRate.toFixed(4) : NOT_AVAILABLE,
    },
    {
      label: "FX Spread",
      value:
        breakdown.fxSpread !== null
          ? `${formatAccounting(breakdown.fxSpread)} ${transfer.sourceCurrency}`
          : NOT_AVAILABLE,
    },
    {
      label: "Commission",
      value: `${formatAccounting(breakdown.commission)} ${transfer.sourceCurrency}`,
    },
    {
      label: "Margin Rate",
      value: breakdown.marginRate !== null ? `${breakdown.marginRate}` : NOT_AVAILABLE,
    },
    {
      label: "Net Earning",
      value:
        breakdown.netEarning !== null
          ? `${formatAccounting(breakdown.netEarning)} ${transfer.sourceCurrency}`
          : NOT_AVAILABLE,
    },
  ];

  return (
    <div className="sm:col-span-2">
      <p className="text-xs uppercase tracking-wide text-muted">Admin Rate Breakdown</p>
      <div className="mt-2 grid grid-cols-1 gap-2 rounded-lg border border-border bg-surface p-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-[11px] uppercase tracking-wide text-muted">{row.label}</p>
            <p className="mt-0.5 text-sm font-medium text-heading">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function statusClass(status: string) {
  return STATUS_STYLES[status.toUpperCase()] ?? "bg-surface text-heading/70";
}

const PAGE_SIZE = 10;

export default function TransfersPanel() {
  const { isLive } = useDataMode();
  const { entries, page, setPage, totalPages, totalElements, loading, error, refresh } =
    usePaginatedTransfers(demoTransferRecords, PAGE_SIZE);

  const [selected, setSelected] = useState<TransferRecord | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const [refQuery, setRefQuery] = useState("");
  const [refSearching, setRefSearching] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);

  async function handleRefSearch(event: React.FormEvent) {
    event.preventDefault();
    if (!refQuery.trim()) return;
    setRefError(null);

    if (!isLive) {
      const match = demoTransferRecords.find((t) => t.referenceNumber === refQuery.trim());
      if (!match) {
        setRefError("No transfer found with that reference number.");
        return;
      }
      setSelected(match);
      return;
    }

    setRefSearching(true);
    const response = await getTransferByRef(refQuery.trim());
    setRefSearching(false);
    if (!response.success || !response.data) {
      setRefError(response.message || "No transfer found with that reference number.");
      return;
    }
    setSelected(response.data);
  }

  // No live endpoint exists for this action — the real /transfers API only
  // lists, looks up, and cancels (see the header note above). This follows
  // the same client-side-governance-flag pattern already used by
  // BeneficiariesContext.verifyBeneficiaryKyc: a local status override
  // layered on top of a backend with no matching endpoint, demo mode only.
  async function handleMarkDelivered(target: TransferRecord) {
    if (isLive) return;
    setCompleting(true);
    setCompleteError(null);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const record = demoTransferRecords.find((t) => t.id === target.id);
    if (record) record.status = "COMPLETED";
    setCompleting(false);
    setSelected((prev) => (prev ? { ...prev, status: "COMPLETED" } : prev));
    refresh();
  }

  async function handleCancel(target: TransferRecord) {
    setCancelling(true);
    setCancelError(null);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setCancelling(false);
      setSelected((prev) => (prev ? { ...prev, status: "CANCELLED" } : prev));
      return;
    }

    const response = await cancelTransfer(target.id);
    setCancelling(false);
    if (!response.success) {
      setCancelError(response.message || "Could not cancel this transfer.");
      return;
    }
    setSelected(response.data ?? { ...target, status: "CANCELLED" });
    refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-heading">Transfers</h1>
            <p className="mt-0.5 text-sm text-muted">
              {isLive ? "Live remittance API" : "Static demo data"} — sent transfers. Click a row to view
              details or cancel. There's no approve action here — this endpoint only lists, looks up, and
              cancels; status alone reflects where each transfer stands.
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

        <form onSubmit={handleRefSearch} className="flex flex-wrap items-end gap-3 border-b border-border bg-panel px-6 py-4 sm:px-8">
          <div className="w-full max-w-xs">
            <TextField
              label="Look up by reference number"
              placeholder="TRF-2026-000501"
              value={refQuery}
              onChange={setRefQuery}
            />
          </div>
          <Button type="submit" variant="secondary" size="md" loading={refSearching} icon={<Search size={14} />}>
            {refSearching ? "Searching..." : "Look Up"}
          </Button>
          {refError && <p className="text-sm text-red-600">{refError}</p>}
        </form>

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
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => setSelected(entry)}
                      className="cursor-pointer border-b border-border bg-panel last:border-b-0 hover:bg-brand-green-light/30"
                    >
                      <td className="px-4 py-3 font-medium text-brand-blue">{entry.referenceNumber}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.senderName}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.receiverName}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.destinationCountry}</td>
                      <td className="px-4 py-3 text-right text-heading/80">
                        {entry.amount.toLocaleString()} {entry.sourceCurrency}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                        No transfers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalElements > 0 && (
            <Pagination
              currentPage={page + 1}
              totalPages={Math.max(totalPages, 1)}
              totalResults={totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={(nextPage) => setPage(nextPage - 1)}
            />
          )}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-panel shadow-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-heading">{selected.referenceNumber}</h2>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(selected.status)}`}>
                  {selected.status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setCancelError(null);
                }}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted hover:bg-border hover:text-heading"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 sm:p-8">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Sender</p>
                <p className="mt-1 font-medium text-heading">{selected.senderName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Receiver</p>
                <p className="mt-1 font-medium text-heading">{selected.receiverName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Amount Sent</p>
                <p className="mt-1 font-medium text-heading">
                  {selected.amount.toLocaleString()} {selected.sourceCurrency}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Receiver Gets</p>
                <p className="mt-1 font-medium text-heading">
                  {selected.receiverAmount.toLocaleString()} {selected.destinationCurrency}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Fee</p>
                <p className="mt-1 font-medium text-heading">
                  {selected.fee.toLocaleString()} {selected.sourceCurrency}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Exchange Rate</p>
                <p className="mt-1 font-medium text-heading">{selected.exchangeRate}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Destination</p>
                <p className="mt-1 font-medium text-heading">{selected.destinationCountry}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Purpose</p>
                <p className="mt-1 font-medium text-heading">{selected.purpose || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Provider</p>
                <p className="mt-1 font-medium text-heading">{selected.provider || "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Provider Reference</p>
                <p className="mt-1 font-medium text-heading">{selected.providerReference || "-"}</p>
              </div>
              {selected.remarks && (
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted">Remarks</p>
                  <p className="mt-1 font-medium text-heading">{selected.remarks}</p>
                </div>
              )}
              <AdminRateBreakdown transfer={selected} />
            </div>

            <div className="border-t border-border px-6 py-4 sm:px-8">
              {cancelError && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{cancelError}</p>
              )}
              {completeError && (
                <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{completeError}</p>
              )}
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={<CheckCircle2 size={14} />}
                  loading={completing}
                  disabled={selected.status.toUpperCase() !== "CONFIRMED" || isLive}
                  title={
                    isLive
                      ? "No live endpoint exists for marking a transfer delivered — demo mode only."
                      : selected.status.toUpperCase() !== "CONFIRMED"
                        ? "Only a confirmed transfer can be marked delivered."
                        : undefined
                  }
                  onClick={() => handleMarkDelivered(selected)}
                >
                  {selected.status.toUpperCase() === "COMPLETED" ? "Delivered" : "Mark Delivered"}
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  icon={<Ban size={14} />}
                  loading={cancelling}
                  disabled={selected.status.toUpperCase() === "CANCELLED"}
                  onClick={() => handleCancel(selected)}
                >
                  {cancelling
                    ? "Cancelling..."
                    : selected.status.toUpperCase() === "CANCELLED"
                    ? "Already Cancelled"
                    : "Cancel Transfer"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
