"use client";

import { useState } from "react";
import { RefreshCw, Download, X } from "lucide-react";
import Button from "./Button";
import Pagination from "./Pagination";
import { useDataMode } from "@/contexts/DataModeContext";
import { useRates } from "@/contexts/RatesContext";
import { usePaginatedTransfers } from "@/lib/useTransfers";
import { demoTransferRecords, type TransferRecord } from "@/data/transferData";
import { getOrComputeBreakdown } from "@/lib/transferMath";
import type { TransferRateBreakdown } from "@/data/transferData";
import { formatAccounting } from "@/lib/format";
import { downloadHtmlTableAsExcel } from "@/lib/exportExcel";

const PAGE_SIZE = 10;

const NOT_AVAILABLE = "—";

function formatRate(value: number | null): string {
  return value !== null ? value.toFixed(4) : NOT_AVAILABLE;
}

function formatMoney(value: number | null, currency: string): string {
  return value !== null ? `${formatAccounting(value)} ${currency}` : NOT_AVAILABLE;
}

export default function TransactionRateReportPanel() {
  const { isLive } = useDataMode();
  const { exchangeRates, partnerOfferRates, commissions, serviceCharges, margins } = useRates();
  const { entries, page, setPage, totalPages, totalElements, loading, error, refresh } =
    usePaginatedTransfers(demoTransferRecords, PAGE_SIZE);

  const [selected, setSelected] = useState<TransferRecord | null>(null);

  function breakdownFor(transfer: TransferRecord): TransferRateBreakdown {
    return getOrComputeBreakdown(transfer, { exchangeRates, partnerOfferRates, commissions, serviceCharges, margins });
  }

  function handleExport() {
    const rows = demoTransferRecords
      .map((t) => {
        const b = breakdownFor(t);
        return `<tr>
          <td>${t.referenceNumber}</td>
          <td>${t.senderName}</td>
          <td>${t.receiverName}</td>
          <td>${t.amount} ${t.sourceCurrency}</td>
          <td>${b.retailRate ?? ""}</td>
          <td>${b.wholesaleRate ?? ""}</td>
          <td>${b.fxSpread ?? ""}</td>
          <td>${t.fee}</td>
          <td>${b.commission}</td>
          <td>${b.marginRate ?? ""}</td>
          <td>${b.netEarning ?? ""}</td>
          <td>${b.agentName}</td>
          <td>${t.status}</td>
        </tr>`;
      })
      .join("");
    const table = `<table>
      <thead><tr>
        <th>Reference</th><th>Sender</th><th>Receiver</th><th>Amount</th>
        <th>Retail Rate</th><th>Wholesale Rate</th><th>FX Spread</th><th>Fee</th>
        <th>Commission</th><th>Margin Rate</th><th>Net Earning</th><th>Agent</th><th>Status</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
    downloadHtmlTableAsExcel("transaction-rate-report.xls", table);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-bold text-heading">Transaction Rate Report</h1>
            <p className="mt-0.5 text-sm text-muted">
              {isLive ? "Live remittance API" : "Static demo data"} — the retail/wholesale rate, service fee,
              commission, margin and net earning that applied to each transaction. Click a row for the full
              breakdown.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport} icon={<Download size={13} />}>
              Export
            </Button>
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
        </div>

        <div className="bg-panel p-6 sm:p-8">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1400px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Reference No</th>
                    <th className="px-4 py-3">Sender → Receiver</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Retail Rate</th>
                    <th className="px-4 py-3 text-right">Wholesale Rate</th>
                    <th className="px-4 py-3 text-right">FX Spread</th>
                    <th className="px-4 py-3 text-right">Fee</th>
                    <th className="px-4 py-3 text-right">Commission</th>
                    <th className="px-4 py-3 text-right">Margin Rate</th>
                    <th className="px-4 py-3 text-right">Net Earning</th>
                    <th className="px-4 py-3">Agent</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    const b = breakdownFor(entry);
                    return (
                      <tr
                        key={entry.id}
                        onClick={() => setSelected(entry)}
                        className="cursor-pointer border-b border-border bg-panel last:border-b-0 hover:bg-brand-green-light/30"
                      >
                        <td className="px-4 py-3 font-medium text-brand-blue">{entry.referenceNumber}</td>
                        <td className="px-4 py-3 text-heading/80">
                          {entry.senderName} → {entry.receiverName}
                        </td>
                        <td className="px-4 py-3 text-right text-heading/80">
                          {entry.amount.toLocaleString()} {entry.sourceCurrency}
                        </td>
                        <td className="px-4 py-3 text-right text-heading/80">{formatRate(b.retailRate)}</td>
                        <td className="px-4 py-3 text-right text-heading/80">{formatRate(b.wholesaleRate)}</td>
                        <td className="px-4 py-3 text-right text-heading/80">
                          {formatMoney(b.fxSpread, entry.sourceCurrency)}
                        </td>
                        <td className="px-4 py-3 text-right text-heading/80">
                          {entry.fee.toLocaleString()} {entry.sourceCurrency}
                        </td>
                        <td className="px-4 py-3 text-right text-heading/80">
                          {formatMoney(b.commission, entry.sourceCurrency)}
                        </td>
                        <td className="px-4 py-3 text-right text-heading/80">
                          {b.marginRate !== null ? b.marginRate : NOT_AVAILABLE}
                        </td>
                        <td className="px-4 py-3 text-right text-heading/80">
                          {formatMoney(b.netEarning, entry.sourceCurrency)}
                        </td>
                        <td className="px-4 py-3 text-heading/80">{b.agentName || NOT_AVAILABLE}</td>
                        <td className="px-4 py-3 text-heading/80">{entry.status}</td>
                      </tr>
                    );
                  })}

                  {entries.length === 0 && (
                    <tr>
                      <td colSpan={12} className="px-4 py-10 text-center text-sm text-muted">
                        No transactions found.
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

      {selected && <DetailModal transfer={selected} breakdown={breakdownFor(selected)} onClose={() => setSelected(null)} />}
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-medium text-heading">{value}</p>
    </div>
  );
}

function DetailModal({
  transfer,
  breakdown,
  onClose,
}: {
  transfer: TransferRecord;
  breakdown: TransferRateBreakdown;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-panel shadow-card">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-heading">{transfer.referenceNumber}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-border hover:text-heading"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 sm:p-8">
          <DetailField label="Sender" value={transfer.senderName} />
          <DetailField label="Receiver" value={transfer.receiverName} />
          <DetailField label="Amount Sent" value={`${transfer.amount.toLocaleString()} ${transfer.sourceCurrency}`} />
          <DetailField
            label="Receiver Gets"
            value={`${transfer.receiverAmount.toLocaleString()} ${transfer.destinationCurrency}`}
          />
          <DetailField label="Retail Rate" value={formatRate(breakdown.retailRate)} />
          <DetailField label="Wholesale Rate" value={formatRate(breakdown.wholesaleRate)} />
          <DetailField label="FX Spread" value={formatMoney(breakdown.fxSpread, transfer.sourceCurrency)} />
          <DetailField label="Fee" value={`${transfer.fee.toLocaleString()} ${transfer.sourceCurrency}`} />
          <DetailField label="Commission" value={formatMoney(breakdown.commission, transfer.sourceCurrency)} />
          <DetailField
            label="Margin Rate"
            value={breakdown.marginRate !== null ? String(breakdown.marginRate) : NOT_AVAILABLE}
          />
          <DetailField label="Net Earning" value={formatMoney(breakdown.netEarning, transfer.sourceCurrency)} />
          <DetailField label="Agent" value={breakdown.agentName || NOT_AVAILABLE} />
        </div>
      </div>
    </div>
  );
}
