"use client";

import PersonalContactDetailsForm from "./PersonalContactDetailsForm";
import AdditionalInformationForm from "./AdditionalInformationForm";
import Button from "./Button";
import { useKyc } from "@/contexts/KycContext";

export default function CustomerDetailsPanel() {
  const { record, updateField, saving, saveError, saveSuccess, saveCustomer } = useKyc();

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    saveCustomer();
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <PersonalContactDetailsForm />
      <AdditionalInformationForm />

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Remarks</h1>
        </div>
        <div className="bg-panel p-6 sm:p-8">
          <textarea
            rows={3}
            value={record.remarks}
            onChange={(event) => updateField("remarks", event.target.value)}
            placeholder="Notes for this KYC submission"
            className="w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
        </div>
        <div className="border-t border-border bg-panel px-6 py-4 sm:px-8">
          {saveError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>
          )}
          {saveSuccess && !saveError && (
            <p className="mb-3 rounded-lg bg-brand-green-light px-3 py-2 text-sm text-brand-green-dark">
              Customer details saved.
            </p>
          )}
          <Button type="submit" loading={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </form>
  );
}
