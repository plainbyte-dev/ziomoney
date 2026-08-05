"use client";

import { useState } from "react";
import { Eye, Plus } from "lucide-react";
import { pendingDateFilterOptions, pendingTransactionRows } from "@/data/remittanceListsData";

type StatusFilter = "Pending Only" | "Proceed Transaction" | "All";

const statusFilters: StatusFilter[] = ["Pending Only", "Proceed Transaction", "All"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayIso() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export default function PendingTransactionPanel() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Pending Only");
  const [fromDate, setFromDate] = useState(yesterdayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [dateFilterType, setDateFilterType] = useState(pendingDateFilterOptions[0]);
  const [rows] = useState(pendingTransactionRows);

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Pending Transaction</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="space-y-3 rounded-xl border border-border bg-white p-4">
          <div className="flex flex-wrap items-center gap-6">
            {statusFilters.map((option) => (
              <label key={option} className="flex items-center gap-1.5 text-sm text-heading/80">
                <input
                  type="radio"
                  name="pendingStatus"
                  checked={statusFilter === option}
                  onChange={() => setStatusFilter(option)}
                  className="h-4 w-4 text-brand-blue focus:ring-brand-blue"
                />
                {option}
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-heading/80">
              From:
              <input
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
                className="rounded-lg border border-border px-2 py-1.5 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-heading/80">
              To:
              <input
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
                className="rounded-lg border border-border px-2 py-1.5 text-sm"
              />
            </label>
            <select
              value={dateFilterType}
              onChange={(event) => setDateFilterType(event.target.value)}
              className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              {pendingDateFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-heading/80 hover:bg-border">
              <Eye size={14} />
              View Detail
            </button>
            <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-heading/80 hover:bg-border">
              <Plus size={14} />
              Add New
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface text-[11px] uppercase tracking-wide text-muted">
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Sno</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Pinno</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Dest. Country</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Receiver</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Sending Agent</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Amount</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={7} className="px-4 py-3 text-xs text-muted">
                    No pending transactions found for the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.sno} className="bg-white">
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.sno}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-brand-blue">{row.pinno}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.destCountry}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.receiver}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.sendingAgent}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.amount}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
