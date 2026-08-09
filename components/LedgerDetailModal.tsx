"use client";

import { X } from "lucide-react";
import type { LedgerEntry } from "@/data/ledgerData";
import Button from "./Button";

export default function LedgerDetailModal({
  entry,
  onClose,
}: {
  entry: LedgerEntry | null;
  onClose: () => void;
}) {
  if (!entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-panel p-6 shadow-card">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted">REF {entry.id}</p>
            <h2 className="text-lg font-bold text-heading">{entry.ledgerName}</h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-heading">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <DetailItem label="Short Code" value={entry.shortCode} />
          <DetailItem label="Country" value={entry.country} />
          <DetailItem label="Account Type" value={entry.accountType} />
          <DetailItem label="Closed By" value={entry.closedBy} />
          <DetailItem
            label="Balance"
            value={entry.balanceDisplay}
            accent={entry.isNegative ? "text-red-500" : "text-heading"}
          />
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-semibold tracking-wide text-muted">DESCRIPTION</p>
          <p className="mt-1 text-sm text-heading/80">{entry.description}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted">{label}</span>
      <span className={`font-medium ${accent ?? "text-heading"}`}>{value}</span>
    </div>
  );
}
