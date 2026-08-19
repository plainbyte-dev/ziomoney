"use client";

import { useState } from "react";
import PersonalDetailsForm from "./PersonalDetailsForm";
import ContactDetailsForm from "./ContactDetailsForm";
import AdditionalInformationForm from "./AdditionalInformationForm";
import FormSectionHeading from "./FormSectionHeading";
import RadioPill from "./RadioPill";
import Button from "./Button";
import { useKyc } from "@/contexts/KycContext";
import { usePartners } from "@/contexts/PartnersContext";
import { kycModeOptions, type KycMode } from "@/data/corporateCustomerData";

// Add Customer inserts already-approved via InsertApprovedKYC (OFAC
// screening runs as part of that call) rather than the separate
// submit-then-approve queue flow, so this form collects the same
// registrant/KYC-mode fields the KYC Approval Queue's modal does.
export default function CustomerDetailsPanel() {
  const { record, updateField, saving, saveError, saveSuccess, saveCustomer } = useKyc();
  const { entries: partners } = usePartners();

  // Registrant Agent is sourced from the actual registered partners, not a
  // static placeholder list — only partners registered as an "Agent" apply.
  const agentOptions = partners.filter((p) => p.partnerType === "Agent").map((p) => p.partnerName);

  const [registrantAgent, setRegistrantAgent] = useState("");
  const [registrantBranch, setRegistrantBranch] = useState("");
  const [kycMode, setKycMode] = useState<KycMode | null>(null);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    saveCustomer({
      registrantAgent,
      registrantBranch,
      kycMode: kycMode ?? "",
      remarks: record.remarks,
    });
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {/* Registrant — its own box, separated from everything below. */}
      <div className="overflow-hidden rounded-2xl border border-border bg-panel shadow-card">
        <FormSectionHeading title="Registrant" />
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 sm:grid-cols-2 sm:p-8">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">
              Registrant Agent <span className="text-red-500">*</span>
            </label>
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
            <label className="text-sm text-heading/70">
              Registrant Branch <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={registrantBranch}
              onChange={(event) => setRegistrantBranch(event.target.value)}
              required
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>
        </div>
      </div>

      {/* Personal Details (own box) | Contact Information and Additional
          Information (each its own box, stacked, same gap rhythm as the
          grid around them for consistent alignment). */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PersonalDetailsForm />

        <div className="flex flex-col gap-6">
          <ContactDetailsForm />
          <AdditionalInformationForm />
        </div>
      </div>

      {/* KYC Mode & Remarks — its own full-width box at the bottom. */}
      <div className="overflow-hidden rounded-2xl border border-border bg-panel shadow-card">
        <FormSectionHeading title="KYC Mode & Remarks" />
        <div className="flex flex-col gap-4 p-6 sm:p-8">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">KYC Mode</label>
            <div className="flex flex-wrap items-center gap-4">
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
              rows={3}
              value={record.remarks}
              onChange={(event) => updateField("remarks", event.target.value)}
              placeholder="Notes for this customer"
              className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>
        </div>

        <div className="border-t border-border px-6 py-4 sm:px-8">
          {saveError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>}
          {saveSuccess && !saveError && (
            <p className="mb-3 rounded-lg bg-brand-green-light px-3 py-2 text-sm text-brand-green-dark">
              Customer added.
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
