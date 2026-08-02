"use client";

import { SquarePen } from "lucide-react";
import type { CreditLimitEntry } from "@/data/creditLimitData";
import { getTotalLimit, getAvailableLimit } from "@/data/creditLimitData";
import { formatAmount, formatAccounting } from "@/lib/format";

interface CreditLimitTableProps {
  entries: CreditLimitEntry[];
  addLimitValues: Record<string, string>;
  onAddLimitChange: (id: string, value: string) => void;
  onUpdate: (entry: CreditLimitEntry) => void;
  onViewLog: (entry: CreditLimitEntry) => void;
}

export default function CreditLimitTable({
  entries,
  addLimitValues,
  onAddLimitChange,
  onUpdate,
  onViewLog,
}: CreditLimitTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[1080px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
            <th className="px-4 py-3">Country</th>
            <th className="px-4 py-3">Partner</th>
            <th className="px-4 py-3">Agent Limit</th>
            <th className="px-4 py-3">Top-up Limit</th>
            <th className="px-4 py-3">
              Total Limit
              <br />
              (Current)
            </th>
            <th className="px-4 py-3">Current Balance</th>
            <th className="px-4 py-3">Avail. Limit</th>
            <th className="px-4 py-3">Add Limit</th>
            <th className="px-4 py-3">User Limit</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const totalLimit = getTotalLimit(entry);
            const availLimit = getAvailableLimit(entry);

            return (
              <tr key={entry.id} className="border-b border-border bg-white last:border-b-0">
                <td className="px-4 py-3 text-heading/80">{entry.country}</td>
                <td className="px-4 py-3 font-medium text-heading">{entry.partner}</td>
                <td className="px-4 py-3 text-heading/80">{formatAmount(entry.agentLimit)}</td>
                <td className="px-4 py-3 text-heading/80">{formatAmount(entry.topUpLimit)}</td>
                <td className="px-4 py-3 text-heading/80">{formatAmount(totalLimit)}</td>
                <td className="px-4 py-3 text-heading/80">
                  {formatAccounting(entry.currentBalance)}
                </td>
                <td className="px-4 py-3 font-semibold text-heading">
                  {formatAccounting(availLimit)}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    value={addLimitValues[entry.id] ?? ""}
                    onChange={(event) => onAddLimitChange(entry.id, event.target.value)}
                    placeholder="0.00"
                    className="w-28 rounded-lg border border-border bg-white px-2 py-1.5 text-sm text-heading placeholder:text-muted focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                  />
                </td>
                <td className="px-4 py-3 text-heading/80">
                  {formatAmount(entry.userLimit)}({entry.userLimitCurrency})
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onUpdate(entry)}
                      className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-heading hover:bg-surface"
                    >
                      <SquarePen size={14} />
                      Update
                    </button>
                    <button
                      onClick={() => onViewLog(entry)}
                      className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-heading hover:bg-surface"
                    >
                      Log
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {entries.length === 0 && (
            <tr>
              <td colSpan={10} className="px-4 py-10 text-center text-sm text-muted">
                No partners match the selected country.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}