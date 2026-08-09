"use client";

import SharedDateInput from "./DateInput";
import Button from "./Button";
import { useKyc } from "@/contexts/KycContext";
import {
  customerVisaTypeOptions,
  occupationOptions,
  customerIdTypeOptions,
  idIssueCountryOptions,
  idIssuingJurisdictionOptions,
  sourceOfFundsOptions,
} from "@/data/customerDetailsData";

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
  const { record, updateField, saving, saveError, saveSuccess, saveCustomer } = useKyc();

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    saveCustomer();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Additional Information</h1>
      </div>

      <form onSubmit={handleSave} className="bg-panel p-6 sm:p-8">
        <p className="border-b-2 border-brand-blue pb-2 text-base font-semibold text-heading/70">
          Additional Information
        </p>

        <div className="mx-auto mt-5 flex max-w-3xl flex-col gap-4">
          <FieldRow label="Customer Visa Type">
            <select defaultValue="" className={`${inputClass} w-full`}>
              <option value="">--Select--</option>
              {customerVisaTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Occupation" required>
            <select defaultValue="" className={`${inputClass} w-full`}>
              <option value="">--Select--</option>
              {occupationOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label={<span className="text-brand-blue">Primary Customer ID</span>} required>
            <select defaultValue="" className={`${inputClass} w-full max-w-[200px]`}>
              <option value="">--Select--</option>
              {customerIdTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              value={record.primaryIdNo}
              onChange={(event) => updateField("primaryIdNo", event.target.value)}
              placeholder="Enter ID Number"
              className={`${inputClass} flex-1 placeholder:italic`}
            />
          </FieldRow>

          <FieldRow label="ID1 Issue Country" required>
            <select defaultValue="" className={`${inputClass} w-full max-w-[200px]`}>
              <option value=""></option>
              {idIssueCountryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input className={`${inputClass} flex-1`} />
          </FieldRow>

          <FieldRow label="ID Issuing Jurisdiction" required>
            <select defaultValue="" className={`${inputClass} w-full`}>
              <option value="">--SELECT--</option>
              {idIssuingJurisdictionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Issue Date">
            <DateInput
              value={record.primaryIdIssueDate}
              onChange={(value) => updateField("primaryIdIssueDate", value)}
            />
          </FieldRow>

          <FieldRow label="Expire Date">
            <DateInput
              value={record.primaryIdExpiryDate}
              onChange={(value) => updateField("primaryIdExpiryDate", value)}
            />
          </FieldRow>

          <FieldRow label={<span className="text-brand-blue">Secondary Customer ID</span>}>
            <select defaultValue="" className={`${inputClass} w-full max-w-[200px]`}>
              <option value="">--Select--</option>
              {customerIdTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              value={record.secondaryIdNo}
              onChange={(event) => updateField("secondaryIdNo", event.target.value)}
              placeholder="Enter ID Number 2"
              className={`${inputClass} flex-1 placeholder:italic`}
            />
          </FieldRow>

          <FieldRow label="ID2 Issue Country">
            <select defaultValue="" className={`${inputClass} w-full`}>
              <option value="">--SELECT--</option>
              {idIssueCountryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="ID Issuing Jurisdiction">
            <select defaultValue="" className={`${inputClass} w-full`}>
              <option value="">--SELECT--</option>
              {idIssuingJurisdictionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Issue Date">
            <DateInput />
          </FieldRow>

          <FieldRow label="Expire Date">
            <DateInput />
          </FieldRow>

          <FieldRow label="Source of funds">
            <select defaultValue="" className={`${inputClass} w-full`}>
              <option value="">--Select--</option>
              {sourceOfFundsOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          {saveError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {saveError}
            </p>
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
      </form>
    </div>
  );
}
