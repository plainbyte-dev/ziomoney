"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ChangePasswordPanel() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canSave = oldPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0;

  function handleSave() {
    setSaved(false);

    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match.");
      return;
    }
    if (newPassword === oldPassword) {
      setError("New Password must be different from Old Password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New Password must be at least 6 characters.");
      return;
    }

    setError(null);
    setSaved(true);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Change Password</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="max-w-md space-y-4">
          <FormRow label="Old Password:" required>
            <input
              type="password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              className={inputClass}
            />
          </FormRow>

          <FormRow label="New Password:" required>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className={inputClass}
            />
          </FormRow>

          <FormRow label="Confirm Password:" required>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className={inputClass}
            />
          </FormRow>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}
          {saved && (
            <p className="flex items-center gap-1.5 rounded-lg bg-brand-green-light/40 px-3 py-2 text-sm text-brand-green-dark">
              <CheckCircle2 size={14} />
              Password updated successfully.
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
          <p className="text-xs text-red-500">* are required fields</p>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border px-3 py-1.5 text-sm focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

function FormRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-44 shrink-0 text-sm text-heading/80">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="min-w-[200px] flex-1">{children}</div>
    </div>
  );
}
