"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import RadioPill from "./RadioPill";
import Button from "./Button";
import { agentOptions, branchOptions, kycModeOptions, type KycMode } from "@/data/corporateCustomerData";
import type { KycApprovalFields, KycRecord } from "@/data/kycData";

interface KycApprovalModalProps {
  target: KycRecord | null;
  action: "approve" | "compliance" | null;
  submitting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: (fields: KycApprovalFields) => void;
}

export default function KycApprovalModal({
  target,
  action,
  submitting,
  error,
  onCancel,
  onConfirm,
}: KycApprovalModalProps) {
  const [registrantAgent, setRegistrantAgent] = useState("");
  const [registrantBranch, setRegistrantBranch] = useState("");
  const [kycMode, setKycMode] = useState<KycMode | null>(null);
  const [remarks, setRemarks] = useState("");

  if (!target || !action) return null;

  const isCompliance = action === "compliance";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onConfirm({
      registrantAgent,
      registrantBranch,
      kycMode: kycMode ?? "",
      remarks,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-panel p-6 shadow-card">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-green-light text-brand-green-dark">
          <ShieldCheck size={20} />
        </div>
        <h2 className="mt-4 text-lg font-bold text-heading">
          {isCompliance ? "Compliance Approval" : "Approve KYC"}
        </h2>
        <p className="mt-1 text-sm text-muted">
          {target.fullName || target.userName} ({target.userName}) —{" "}
          {isCompliance
            ? "final approval, OFAC/AML screening is skipped since it's already on compliance hold."
            : "runs OFAC/AML screening before approving."}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Registrant Agent</label>
            <select
              value={registrantAgent}
              onChange={(event) => setRegistrantAgent(event.target.value)}
              required
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              <option value="">--Select--</option>
              {agentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Registrant Branch</label>
            <select
              value={registrantBranch}
              onChange={(event) => setRegistrantBranch(event.target.value)}
              required
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              <option value="">--Select--</option>
              {branchOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">KYC Mode</label>
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

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-1 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {submitting ? "Submitting..." : isCompliance ? "Compliance Approve" : "Approve"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
