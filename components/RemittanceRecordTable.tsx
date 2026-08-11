"use client";

import type { RemittanceTransactionRecord } from "@/data/transactionData";

export interface RemittanceTableColumn {
  label: string;
  render: (entry: RemittanceTransactionRecord) => React.ReactNode;
  align?: "right";
}

export default function RemittanceRecordTable({
  entries,
  columns,
  onRowClick,
  selectedId,
  emptyMessage,
}: {
  entries: RemittanceTransactionRecord[];
  columns: RemittanceTableColumn[];
  onRowClick?: (entry: RemittanceTransactionRecord) => void;
  selectedId?: number | null;
  emptyMessage: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
              {columns.map((col) => (
                <th key={col.label} className={`px-4 py-3 ${col.align === "right" ? "text-right" : ""}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                onClick={onRowClick ? () => onRowClick(entry) : undefined}
                className={`border-b border-border last:border-b-0 ${onRowClick ? "cursor-pointer" : ""} ${
                  selectedId === entry.id ? "bg-brand-green-light/40" : "bg-panel"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.label}
                    className={`px-4 py-3 text-heading/80 ${col.align === "right" ? "text-right" : ""}`}
                  >
                    {col.render(entry)}
                  </td>
                ))}
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
