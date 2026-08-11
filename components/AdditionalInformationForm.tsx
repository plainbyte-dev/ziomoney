"use client";

import SharedDateInput from "./DateInput";
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
    <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[220px_1fr] sm:items-center sm:gap-4">
      <div className="text-right text-sm font-semibold text-heading/70">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {required && <span className="text-red-500">*</span>}
      </div>
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
    <div className="w-40">
      <SharedDateInput value={value} onChange={onChange} />
    </div>
  );
}

export default function AdditionalInformationForm() {
  const { record, updateField } = useKyc();

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Additional Information</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <p className="border-b-2 border-brand-blue pb-2 text-base font-semibold text-heading/70">
          Additional Information
        </p>

        <div className="mx-auto mt-5 flex max-w-3xl flex-col gap-4">
          <FieldRow label={<span className="text-brand-blue">Primary ID No</span>} required>
            <input
              value={record.primaryIdNo}
              onChange={(event) => updateField("primaryIdNo", event.target.value)}
              placeholder="Enter ID Number"
              className={`${inputClass} w-full placeholder:italic`}
            />
          </FieldRow>

          <FieldRow label="Primary ID Issue Date">
            <DateInput
              value={record.primaryIdIssueDate}
              onChange={(value) => updateField("primaryIdIssueDate", value)}
            />
          </FieldRow>

          <FieldRow label="Primary ID Expire Date">
            <DateInput
              value={record.primaryIdExpiryDate}
              onChange={(value) => updateField("primaryIdExpiryDate", value)}
            />
          </FieldRow>

          <FieldRow label={<span className="text-brand-blue">Secondary ID No</span>}>
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
