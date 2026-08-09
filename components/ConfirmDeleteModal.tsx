"use client";

interface ConfirmDeleteModalProps {
  open: boolean;
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  open,
  count,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  const message =
    count === 1
      ? "Are you sure you want to delete this ledger entry? This action cannot be undone."
      : `Are you sure you want to delete ${count} ledger entries? This action cannot be undone.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-heading/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-panel p-6 shadow-card">
        <h2 className="text-lg font-bold text-heading">Confirm Bulk Delete</h2>
        <p className="mt-2 text-sm text-muted">{message}</p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-full border border-border bg-panel px-6 py-2.5 text-sm font-semibold text-heading hover:bg-surface"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}
