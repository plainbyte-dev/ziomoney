"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import RadioPill from "./RadioPill";
import DateInput from "./DateInput";
import Button from "./Button";
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
    <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[220px_1fr] sm:items-center sm:gap-4">
      <div className="text-right text-sm font-semibold text-heading/70">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {required && <span className="text-red-500">*</span>}
      </div>
    </div>
  );
}

export default function PersonalContactDetailsForm() {
  const { record, updateField } = useKyc();

  const [zip1, setZip1] = useState("");
  const [zip2, setZip2] = useState("");

  function handleZipChange(part: "zip1" | "zip2", value: string) {
    const nextZip1 = part === "zip1" ? value : zip1;
    const nextZip2 = part === "zip2" ? value : zip2;
    if (part === "zip1") setZip1(value);
    else setZip2(value);
    updateField("zipCode", nextZip2 ? `${nextZip1}-${nextZip2}` : nextZip1);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Personal Details</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <p className="border-b-2 border-brand-blue pb-2 text-base font-semibold text-heading/70">
          Personal Details
        </p>

        <div className="mx-auto mt-5 flex max-w-3xl flex-col gap-4">
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
        </div>

        <p className="mt-8 border-b-2 border-brand-blue pb-2 text-base font-semibold text-heading/70">
          Contact Details
        </p>

        <div className="mx-auto mt-5 flex max-w-3xl flex-col gap-4">
          <FieldRow label="Zip Code" required>
            <input
              value={zip1}
              onChange={(event) => handleZipChange("zip1", event.target.value)}
              className={`${inputClass} w-24`}
            />
            <span className="text-heading/50">-</span>
            <input
              value={zip2}
              onChange={(event) => handleZipChange("zip2", event.target.value)}
              className={`${inputClass} w-24`}
            />
            <Button type="button" variant="secondary" size="md" icon={<Search size={14} />}>
              Search
            </Button>
          </FieldRow>

          <FieldRow label="Prefecture">
            <input
              value={record.prefecture}
              onChange={(event) => updateField("prefecture", event.target.value)}
              className={`${inputClass} w-full`}
            />
          </FieldRow>

          <FieldRow label="City">
            <input
              value={record.city}
              onChange={(event) => updateField("city", event.target.value)}
              className={`${inputClass} w-full`}
            />
          </FieldRow>

          <FieldRow label="Town">
            <input
              value={record.town}
              onChange={(event) => updateField("town", event.target.value)}
              className={`${inputClass} w-full`}
            />
          </FieldRow>

          <FieldRow label="Street Address - Japanese">
            <input
              value={record.streetAddress}
              onChange={(event) => updateField("streetAddress", event.target.value)}
              className={`${inputClass} w-full`}
            />
          </FieldRow>
        </div>
      </div>
    </div>
  );
}
