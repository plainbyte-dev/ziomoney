"use client";

import SharedDateInput from "./DateInput";
import FormSectionHeading from "./FormSectionHeading";
import { useKyc } from "@/contexts/KycContext";

const inputClass =
  "rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

function FieldRow({
  label,
  required,
  children,
}: {
  label: React.ReactNode;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[140px_1fr] sm:items-center sm:gap-4">
      <div className="text-sm font-semibold text-heading/70 sm:text-right">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function DateInput({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="w-full min-w-[7rem]">
      <SharedDateInput value={value} onChange={onChange} />
    </div>
  );
}

export default function AdditionalInformationForm() {
  const { record, updateField } = useKyc();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-panel shadow-card">
      <FormSectionHeading title="Additional Information" />

      <div className="bg-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <FieldRow label="Primary ID No" required>
            <input
              value={record.primaryIdNo}
              onChange={(event) => updateField("primaryIdNo", event.target.value)}
              placeholder="Enter ID Number"
              className={`${inputClass} w-full placeholder:italic`}
            />
          </FieldRow>

          <FieldRow label="Primary ID Issue / Expire Date" required>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-heading/50">Issue Date</span>
                <DateInput
                  value={record.primaryIdIssueDate}
                  onChange={(value) => updateField("primaryIdIssueDate", value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-heading/50">Expire Date</span>
                <DateInput
                  value={record.primaryIdExpiryDate}
                  onChange={(value) => updateField("primaryIdExpiryDate", value)}
                />
              </div>
            </div>
          </FieldRow>

          <FieldRow label="Secondary ID No">
            <input
              value={record.secondaryIdNo}
              onChange={(event) => updateField("secondaryIdNo", event.target.value)}
              placeholder="Enter ID Number 2"
              className={`${inputClass} w-full placeholder:italic`}
            />
          </FieldRow>
        </div>
      </div>
    </div>
  );
}
