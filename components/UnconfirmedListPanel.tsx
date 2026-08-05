"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { agentFilterOptions, unconfirmedListRows } from "@/data/remittanceListsData";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayIso() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export default function UnconfirmedListPanel() {
  const [agentName, setAgentName] = useState(agentFilterOptions[0]);
  const [applyFilter, setApplyFilter] = useState(false);
  const [fromDate, setFromDate] = useState(yesterdayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [rows] = useState(unconfirmedListRows);

  const totalTxn = rows.reduce((sum, row) => sum + row.noOfTxn, 0);
  const totalCollected = rows.reduce((sum, row) => sum + row.collectedAmt, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Un-Confirmed List</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-white p-4">
          <label className="flex items-center gap-2 text-sm text-heading/80">
            Agent Name:
            <select
              value={agentName}
              onChange={(event) => setAgentName(event.target.value)}
              className="rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              {agentFilterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1.5 text-sm text-heading/80">
            <input
              type="checkbox"
              checked={applyFilter}
              onChange={(event) => setApplyFilter(event.target.checked)}
            />
            Apply Filter
          </label>

          <label className="flex items-center gap-2 text-sm text-heading/80">
            From:
            <input
              type="date"
              value={fromDate}
              disabled={!applyFilter}
              onChange={(event) => setFromDate(event.target.value)}
              className="rounded-lg border border-border px-2 py-1.5 text-sm disabled:bg-surface disabled:text-heading/50"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-heading/80">
            To:
            <input
              type="date"
              value={toDate}
              disabled={!applyFilter}
              onChange={(event) => setToDate(event.target.value)}
              className="rounded-lg border border-border px-2 py-1.5 text-sm disabled:bg-surface disabled:text-heading/50"
            />
          </label>

          <button className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-1.5 text-sm font-semibold text-heading/80 hover:bg-border">
            <Eye size={14} />
            View
          </button>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface text-[11px] uppercase tracking-wide text-muted">
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Sno.</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Payout Country</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Sending Agent</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">No of Txn</th>
                <th className="whitespace-nowrap border-b border-border px-4 py-2.5 text-left font-semibold">Collected Amt</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={5} className="px-4 py-3 text-xs text-muted">
                    No Un-Confirmed Transaction Pending
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.sno} className="bg-white">
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.sno}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.payoutCountry}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.sendingAgent}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.noOfTxn}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-heading/80">{row.collectedAmt.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-surface font-semibold text-heading">
                <td colSpan={3} className="px-4 py-2.5">
                  Total:
                </td>
                <td className="px-4 py-2.5">{totalTxn}</td>
                <td className="px-4 py-2.5">{totalCollected.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
