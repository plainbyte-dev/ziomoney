"use client";

import type { KycRecord } from "@/data/kycData";

interface KycQueueTableProps {
  title: string;
  entries: KycRecord[];
  emptyMessage: string;
  onApprove: (record: KycRecord) => void;
  approveLabel: string;
  toneClassName?: string;
}

export default function KycQueueTable({
  title,
  entries,
  emptyMessage,
  onApprove,
  approveLabel,
  toneClassName,
}: KycQueueTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className={`px-4 py-2.5 text-sm font-semibold ${toneClassName ?? "bg-brand-green-light/50 text-heading/80"}`}>
        {title} ({entries.length})
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/60 text-xs font-semibold uppercase tracking-wide text-heading/70">
              <th className="px-4 py-3">User Name</th>
              <th className="px-4 py-3">Full Name</th>
              <th className="px-4 py-3">Nationality</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="border-b border-border bg-panel last:border-b-0">
                <td className="px-4 py-3 font-medium text-heading">{entry.userName}</td>
                <td className="px-4 py-3 text-heading/80">{entry.fullName}</td>
                <td className="px-4 py-3 text-heading/80">{entry.nationality}</td>
                <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                  {entry.submittedDate}
                </td>
                <td className="max-w-[220px] truncate px-4 py-3 text-heading/70">
                  {entry.remarks || "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onApprove(entry)}
                    className="rounded-lg border border-border bg-panel px-3 py-1.5 text-xs font-semibold text-heading hover:bg-surface"
                  >
                    {approveLabel}
                  </button>
                </td>
              </tr>
            ))}

            {entries.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
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
