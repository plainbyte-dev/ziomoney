"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import DateInput from "./DateInput";
import Button from "./Button";
import {
  prefectureOptions,
  businessLineOptions,
  corporateTypeOptions,
  companyIdOptions,
  idPlaceOfIssueOptions,
  idIssuingAuthorityOptions,
} from "@/data/corporateCustomerData";

function FieldRow({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[220px_1fr] sm:items-center sm:gap-4">
      <label className="text-right text-sm font-semibold text-heading/70 sm:text-right">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {children}
        {required && <span className="text-red-500">*</span>}
      </div>
    </div>
  );
}

const inputClass =
  "rounded-lg border border-border bg-panel px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

export default function CompanyProfileForm() {
  const [companyId, setCompanyId] = useState("");
  const [saving, setSaving] = useState(false);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 400);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Company Profile</h1>
      </div>

      <form onSubmit={handleSave} className="bg-panel p-6 sm:p-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
          <FieldRow label="SMBC Card Number">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Yucho Card Number">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <div className="grid grid-cols-1 items-start gap-2 sm:grid-cols-[220px_1fr] sm:gap-4">
            <div className="text-right text-sm font-semibold text-heading/70">
              <p>Corporate Name (English notation)</p>
              <a href="#" className="font-semibold text-brand-blue hover:underline">
                Check Sanction List
              </a>
            </div>
            <div className="flex items-center gap-2">
              <input className={`${inputClass} w-full`} />
              <span className="text-red-500">*</span>
            </div>
          </div>

          <FieldRow label="Company Email" required>
            <input type="email" className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Person incharge First Name" required>
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Person incharge Last Name" required>
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Representative's Title" required>
            <input className={`${inputClass} w-full max-w-xs`} />
          </FieldRow>

          <FieldRow label="Zip Code" required>
            <input className={`${inputClass} w-24`} />
            <span className="text-heading/50">-</span>
            <input className={`${inputClass} w-24`} />
            <Button type="button" variant="secondary" size="md" icon={<Search size={14} />}>
              Search
            </Button>
          </FieldRow>

          <FieldRow label="Prefecture" required>
            <select defaultValue="" className={`${inputClass} w-full max-w-xs`}>
              <option value="">--SELECT--</option>
              {prefectureOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="City" required>
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Town" required>
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Street Address - Japanese">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Company Address- Japanese">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Telephone Number" required>
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Fax Number" required>
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Business Line" required>
            <select defaultValue="" className={`${inputClass} w-full`}>
              <option value="">--Select--</option>
              {businessLineOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Corporate Type" required>
            <select defaultValue="" className={`${inputClass} w-full`}>
              <option value="">--Select--</option>
              {corporateTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Company id">
            <select
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
              className={`${inputClass} w-full max-w-xs`}
            >
              <option value="">--Select--</option>
              {companyIdOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              disabled={!companyId}
              placeholder="Enter ID Number"
              className={`${inputClass} w-full disabled:bg-surface disabled:text-muted`}
            />
          </FieldRow>

          <FieldRow label="Id Place Of Issue">
            <select defaultValue="" className={`${inputClass} w-full max-w-xs`}>
              <option value=""></option>
              {idPlaceOfIssueOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Company Issue Date" required>
            <div className="w-40">
              <DateInput />
            </div>
          </FieldRow>

          <FieldRow label="Company Expire Date" required>
            <div className="w-40">
              <DateInput />
            </div>
          </FieldRow>

          <FieldRow label="Id Issuing Authority" required>
            <select defaultValue="" className={`${inputClass} w-full`}>
              <option value="">--Select--</option>
              {idIssuingAuthorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <Button type="submit" loading={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
