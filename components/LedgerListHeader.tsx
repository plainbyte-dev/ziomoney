"use client";

import { Plus } from "lucide-react";
import Button from "./Button";
import { useTabs } from "@/contexts/TabsContext";

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
  const { openTab } = useTabs();

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
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
          <Button
            variant="secondary"
            onClick={() =>
              openTab({ key: "ledger-create", title: "Create New Ledger" })
            }
            icon={<Plus size={16} />}
          >
            Create Ledger
          </Button>
        )}

        <Button
          variant="danger"
          onClick={selectionMode ? onRequestBulkDelete : onStartSelection}
          disabled={selectionMode && selectedCount === 0}
        >
          {selectionMode && selectedCount > 0 ? "Delete Selected" : "Bulk Delete"}
        </Button>
      </div>
    </div>
  );
}