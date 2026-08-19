"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import Button from "./Button";
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

export default function ContactDetailsForm() {
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
    <div className="overflow-hidden rounded-2xl border border-border bg-panel shadow-card">
      <FormSectionHeading title="Contact Information" />

      <div className="bg-panel p-6 sm:p-8">
        <div className="flex flex-col gap-4">
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
