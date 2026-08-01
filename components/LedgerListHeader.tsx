"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

interface LedgerListHeaderProps {
  selectionMode: boolean;
  selectedCount: number;
  onStartSelection: () => void;
  onCancelSelection: () => void;
  onRequestBulkDelete: () => void;
}

export default function LedgerListHeader({
  selectionMode,
  selectedCount,
  onStartSelection,
  onCancelSelection,
  onRequestBulkDelete,
}: LedgerListHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold text-heading">Ledger List</h1>

      <div className="flex items-center gap-4">
        {selectionMode && (
          <>
            <span className="text-sm font-semibold text-brand-blue">
              {selectedCount} Selected
            </span>
            <button
              onClick={onCancelSelection}
              className="text-sm font-semibold text-heading/70 hover:text-heading"
            >
              Cancel
            </button>
          </>
        )}

        {!selectionMode && (
          <Link
            href="/ledger/create"
            className="flex items-center gap-1.5 rounded-full border border-border bg-white px-5 py-2.5 text-sm font-semibold text-heading hover:bg-surface"
          >
            <Plus size={16} />
            Create Ledger
          </Link>
        )}

        <button
          onClick={selectionMode ? onRequestBulkDelete : onStartSelection}
          disabled={selectionMode && selectedCount === 0}
          className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {selectionMode && selectedCount > 0 ? "Delete Selected" : "Bulk Delete"}
        </button>
      </div>
    </div>
  );
}
