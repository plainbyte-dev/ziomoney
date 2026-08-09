"use client";

import { LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({
  open,
  onCancel,
  onConfirm,
}: LogoutConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-heading/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-panel p-6 shadow-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-green-light text-brand-green-dark">
          <LogOut size={20} />
        </div>
        <h2 className="mt-4 text-lg font-bold text-heading">Log out?</h2>
        <p className="mt-1 text-sm text-muted">
          You'll need to sign in again to access your Zio Money admin account.
        </p>

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
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
