"use client";

import { useEffect, useState } from "react";
import { dailyTransactionGroups, dailyReportFilters } from "@/data/correspondenceReportData";

interface DailyTransactionTableProps {
  fromDate: string;
  toDate: string;
  partnerFilter?: string;
  onBack: () => void;
}

export default function DailyTransactionTable({
  fromDate,
  toDate,
  partnerFilter,
  onBack,
}: DailyTransactionTableProps) {
  const [selectedPartner, setSelectedPartner] = useState<string | undefined>(partnerFilter);

  useEffect(() => {
    setSelectedPartner(partnerFilter);
  }, [partnerFilter]);

  const groups = selectedPartner
    ? dailyTransactionGroups.filter((group) => group.partnerName === selectedPartner)
    : [];

  const totalTxn = groups.reduce((sum, group) => sum + group.rows.length, 0);

  const filters = [
    ...dailyReportFilters,
    { label: "FROMDATE", value: fromDate },
    { label: "TODATE", value: toDate },
    { label: "CUSTOMER_TYPE", value: "ALL" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-xs font-semibold text-brand-blue hover:underline">
          ← Back to summary
        </button>
        <div className="text-right">
          <h2 className="text-sm font-bold text-heading">Transaction Report</h2>
          <p className="text-xs text-muted">Total TXN: {totalTxn}</p>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-muted">
        {filters.map((filter, index) => (
          <span key={`${filter.label}-${index}`}>
            {index > 0 && " | "}
            {filter.label}={filter.value}
          </span>
        ))}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <label htmlFor="daily-report-partner" className="text-xs font-medium text-heading/80">
          Partner
        </label>
        <select
          id="daily-report-partner"
          value={selectedPartner ?? ""}
          onChange={(event) => setSelectedPartner(event.target.value || undefined)}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs text-heading focus:outline-none"
        >
          <option value="">Select a partner…</option>
          {dailyTransactionGroups.map((group) => (
            <option key={group.partnerName} value={group.partnerName}>
              {group.partnerName}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex flex-col gap-6">
        {selectedPartner === undefined && (
          <p className="rounded-xl border border-border bg-white p-6 text-center text-sm text-muted">
            Select a partner above to view their daily transactions.
          </p>
        )}

        {groups.map((group) => (
          <div key={group.partnerName} className="overflow-x-auto rounded-xl border border-border">
            <p className="border-b border-border bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
              {group.partnerName}
            </p>
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-surface text-[11px] uppercase tracking-wide text-muted">
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">#</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Customer ID</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Tran ID</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Pinno</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Deposit Type</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Sender Details</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">DOT (Date of TXN)</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Paid Date</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Receiver&apos;s Name</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Country</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Status</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-semibold">Payment Type</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-right font-semibold">Collected Amount</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-right font-semibold">Transfer Amount</th>
                  <th className="whitespace-nowrap border-b border-border px-3 py-2 text-right font-semibold">Service Charge</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((row, index) => (
                  <tr key={row.tranId} className={index % 2 === 0 ? "bg-white" : "bg-surface/50"}>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.no}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-brand-blue">{row.customerId}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-brand-blue">{row.tranId}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.pinno}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.depositType}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-heading">{row.senderDetails}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.dot}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.paidDate || "—"}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-medium text-heading">{row.receiverName}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">{row.country}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <span className="rounded-full bg-brand-green-light px-2 py-0.5 text-[11px] font-semibold text-brand-green-dark">
                        {row.status} [{row.statusTag}]
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-heading/80">
                      {row.paymentType}
                      {row.paymentRef && (
                        <span className="block text-[11px] text-muted">{row.paymentRef}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.collectedAmount}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.transferAmount}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-heading/80">{row.serviceCharge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {selectedPartner !== undefined && groups.length === 0 && (
          <p className="rounded-xl border border-border bg-white p-6 text-center text-sm text-muted">
            No daily transactions found for this partner in the selected date range.
          </p>
        )}
      </div>
    </div>
  );
}
