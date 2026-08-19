"use client";

import RadioPill from "./RadioPill";
import DateInput from "./DateInput";
import FormSectionHeading from "./FormSectionHeading";
import { useKyc } from "@/contexts/KycContext";
import { genderOptions, nationalityOptions } from "@/data/customerDetailsData";

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

export default function PersonalDetailsForm() {
  const { record, updateField } = useKyc();

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-panel shadow-card">
      <FormSectionHeading title="Personal Details" />

      <div className="bg-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4">
          <FieldRow label="User Name" required>
            <input
              value={record.userName}
              onChange={(event) => updateField("userName", event.target.value)}
              placeholder="Unique login/reference name"
              className={`${inputClass} w-full`}
            />
          </FieldRow>

          <FieldRow
            label={
              <>
                <p>Senders Name (alphabet)</p>
                <a href="#" className="font-semibold text-brand-blue hover:underline">
                  Check Sanction List
                </a>
              </>
            }
          >
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-heading/50">First*</span>
              <input
                value={record.firstName}
                onChange={(event) => updateField("firstName", event.target.value)}
                className={`${inputClass} w-full`}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-heading/50">Mid</span>
              <input
                value={record.middleName}
                onChange={(event) => updateField("middleName", event.target.value)}
                className={`${inputClass} w-full`}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-heading/50">Last</span>
              <input
                value={record.lastName}
                onChange={(event) => updateField("lastName", event.target.value)}
                className={`${inputClass} w-full`}
              />
            </div>
          </FieldRow>

          <FieldRow label="Gender">
            {genderOptions.map((option) => (
              <RadioPill
                key={option}
                label={option}
                checked={record.gender === option}
                onSelect={() => updateField("gender", option)}
              />
            ))}
          </FieldRow>

          <FieldRow label="Nationality" required>
            <select
              value={record.nationality}
              onChange={(event) => updateField("nationality", event.target.value)}
              className={`${inputClass} w-full`}
            >
              <option value="">--SELECT--</option>
              {nationalityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Date of Birth" required>
            <div className="w-40">
              <DateInput value={record.dob} onChange={(value) => updateField("dob", value)} />
            </div>
          </FieldRow>

          <FieldRow label="Email ID">
            <input
              type="email"
              value={record.emailAddress}
              onChange={(event) => updateField("emailAddress", event.target.value)}
              className={`${inputClass} w-full`}
            />
          </FieldRow>

          <FieldRow label="Telephone">
            <input
              value={record.telephoneNo}
              onChange={(event) => updateField("telephoneNo", event.target.value)}
              className={`${inputClass} w-full`}
            />
          </FieldRow>

          <FieldRow label="Mobile No" required>
            <input
              value={record.mobileNo}
              onChange={(event) => updateField("mobileNo", event.target.value)}
              placeholder="Enter Mobile No"
              className={`${inputClass} w-full placeholder:italic`}
            />
          </FieldRow>
          <FieldRow label="Source of Income" required>
            <input
              value={record.sourceOfincome}
              onChange={(event) => updateField("sourceOfincome", event.target.value)}
              placeholder="Enter Source of Income"
              className={`${inputClass} w-full placeholder:italic`}
            />
          </FieldRow>
          <FieldRow label="Occupation" required>
            <input
              value={record.occupation}
              onChange={(event) => updateField("occupation", event.target.value)}
              placeholder="Enter Occupation"
              className={`${inputClass} w-full placeholder:italic`}
            />
          </FieldRow>
        </div>
      </div>
    </div>
  );
}
