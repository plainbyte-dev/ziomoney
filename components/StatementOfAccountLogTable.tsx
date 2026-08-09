"use client";

import { RefreshCw } from "lucide-react";
import Button from "./Button";
import type { SoaBatchLogEntry } from "@/data/statementOfAccountData";

interface StatementOfAccountLogTableProps {
  entries: SoaBatchLogEntry[];
  onRefresh: () => void;
  onViewReport: (entry: SoaBatchLogEntry, index: number) => void;
  onExport: (entry: SoaBatchLogEntry, index: number) => void;
}

export default function StatementOfAccountLogTable({
  entries,
  onRefresh,
  onViewReport,
  onExport,
}: StatementOfAccountLogTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
            <th className="px-4 py-3">Batch Date (KL Time)</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Run By</th>
            <th className="px-4 py-3 text-right">
              <Button
                variant="secondary"
                size="sm"
                className="normal-case tracking-normal"
                onClick={onRefresh}
                icon={<RefreshCw size={13} />}
              >
                Refresh
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.id} className="border-b border-border bg-panel last:border-b-0">
              <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                {entry.batchDate}
              </td>
              <td className="px-4 py-3 text-heading/80">{entry.description}</td>
              <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                {entry.runBy}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-right">
                <button
                  onClick={() => onViewReport(entry, index)}
                  className="font-medium text-brand-blue hover:underline"
                >
                  [Report]
                </button>{" "}
                <button
                  onClick={() => onExport(entry, index)}
                  className="font-medium text-brand-blue hover:underline"
                >
                  [Excel]
                </button>
              </td>
            </tr>
          ))}

          {entries.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                No batch runs yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
