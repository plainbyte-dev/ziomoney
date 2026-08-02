"use client";

import { useState } from "react";
import RadioPill from "./RadioPill";
import {
  kycStatusOptions,
  kycModeOptions,
  agentOptions,
  branchOptions,
  type KycMode,
} from "@/data/corporateCustomerData";

export default function KycMethodPanel() {
  const [kycStatus, setKycStatus] = useState(kycStatusOptions[0]);
  const [kycMode, setKycMode] = useState<KycMode | null>(null);
  const [agent, setAgent] = useState("");
  const [branch, setBranch] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    setTimeout(() => setSaving(false), 400);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">KYC Method</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <p className="border-b-2 border-brand-blue pb-2 text-base font-semibold text-heading/70">
          KYC Details
        </p>

        <div className="mt-5 flex flex-col gap-4 sm:max-w-2xl">
          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <label className="text-sm font-semibold text-heading/70">KYC Status</label>
            <select
              value={kycStatus}
              onChange={(event) => setKycStatus(event.target.value)}
              className="w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              {kycStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <label className="text-sm font-semibold text-heading/70">KYC Mode</label>
            <div className="flex items-center gap-6">
              {kycModeOptions.map((option) => (
                <RadioPill
                  key={option}
                  label={option}
                  checked={kycMode === option}
                  onSelect={() => setKycMode(option)}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[160px_1fr] items-start gap-4">
            <label className="pt-2 text-sm font-semibold text-heading/70">Remarks</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <label className="text-sm font-semibold text-heading/70">Choose Agent:</label>
            <select
              value={agent}
              onChange={(event) => setAgent(event.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              <option value="">--Select--</option>
              {agentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-[160px_1fr] items-center gap-4">
            <label className="text-sm font-semibold text-heading/70">Choose Branch:</label>
            <select
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              className="w-full max-w-xs rounded-lg border border-border bg-white px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              <option value="">--Select--</option>
              {branchOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-panel px-6 py-4 sm:px-8">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
