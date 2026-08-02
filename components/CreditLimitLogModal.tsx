"use client";

import { X } from "lucide-react";

interface LogEntry {
  date: string;
  changedBy: string;
  action: string;
  amount: string;
}

const staticLogEntries: LogEntry[] = [
  { date: "2026-07-28 14:12", changedBy: "John Sterling", action: "Top-up added", amount: "+500,000.00" },
  { date: "2026-06-15 09:47", changedBy: "John Doe", action: "Agent limit revised", amount: "+250,000.00" },
  { date: "2026-05-02 11:20", changedBy: "John Sterling", action: "Top-up added", amount: "+1,000,000.00" },
  { date: "2026-03-19 16:05", changedBy: "John Doe", action: "Initial limit set", amount: "+1,000,000.00" },
];

export default function CreditLimitLogModal({
  partnerName,
  onClose,
}: {
  partnerName: string | null;
  onClose: () => void;
}) {
  if (!partnerName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-heading/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted">CREDIT LIMIT LOG</p>
            <h2 className="text-lg font-bold text-heading">{partnerName}</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-heading">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/60 text-xs font-semibold text-muted">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Changed By</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {staticLogEntries.map((entry, index) => (
                <tr key={index} className="border-b border-border last:border-b-0">
                  <td className="px-3 py-2 text-heading/80">{entry.date}</td>
                  <td className="px-3 py-2 text-heading/80">{entry.changedBy}</td>
                  <td className="px-3 py-2 text-heading/80">{entry.action}</td>
                  <td className="px-3 py-2 text-right font-semibold text-brand-green-dark">
                    {entry.amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-brand-green px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-green-dark"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}