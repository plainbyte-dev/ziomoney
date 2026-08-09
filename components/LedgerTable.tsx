"use client";

import { Eye, Trash2 } from "lucide-react";
import type { LedgerEntry } from "@/data/ledgerData";

interface LedgerTableProps {
  entries: LedgerEntry[];
  isLive: boolean;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onView: (entry: LedgerEntry) => void;
  onDeleteSingle: (entry: LedgerEntry) => void;
}

export default function LedgerTable({
  entries,
  isLive,
  selectionMode,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onView,
  onDeleteSingle,
}: LedgerTableProps) {
  const allOnPageSelected =
    entries.length > 0 && entries.every((entry) => selectedIds.has(entry.id));

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface/60 text-xs font-semibold text-muted">
            {selectionMode && (
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allOnPageSelected}
                  onChange={onToggleSelectAll}
                  className="h-4 w-4 rounded border-border accent-brand-green"
                />
              </th>
            )}
            <th className="px-4 py-3">Ledger ID</th>
            <th className="px-4 py-3">Closed By</th>
            <th className="px-4 py-3">Ledger Name</th>
            <th className="px-4 py-3">Country</th>
            <th className="px-4 py-3">Account Type</th>
            <th className="px-4 py-3">Balance</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const checked = selectedIds.has(entry.id);
            return (
              <tr
                key={entry.id}
                className={`border-b border-border last:border-b-0 ${
                  checked ? "bg-brand-green-light/40" : "bg-panel"
                }`}
              >
                {selectionMode && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleSelect(entry.id)}
                      className="h-4 w-4 rounded border-border accent-brand-green"
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-heading/80">{entry.id}</td>
                <td className="px-4 py-3 text-heading/80">{entry.closedBy}</td>
                <td className="px-4 py-3 font-medium text-heading">
                  {entry.ledgerName}
                </td>
                <td className="px-4 py-3 text-heading/80">{entry.country}</td>
                <td className="px-4 py-3 text-heading/80">{entry.accountType}</td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    entry.isNegative ? "text-red-500" : "text-heading"
                  }`}
                >
                  {entry.balanceDisplay}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => onView(entry)}
                      aria-label={`View ${entry.ledgerName}`}
                      className="text-muted hover:text-brand-blue"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onDeleteSingle(entry)}
                      aria-label={`Delete ${entry.ledgerName}`}
                      className="text-muted hover:text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {entries.length === 0 && (
            <tr>
              <td
                colSpan={selectionMode ? 8 : 7}
                className="px-4 py-10 text-center text-sm text-muted"
              >
                {isLive
                  ? "The remittance API has no ledger endpoints — this list is demo-only and stays empty in Live mode."
                  : "No ledger entries to show."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
