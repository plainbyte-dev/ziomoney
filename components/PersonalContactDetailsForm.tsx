"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import RadioPill from "./RadioPill";
import Checkbox from "./Checkbox";
import DateInput from "./DateInput";
import {
  contactCountryOptions,
  genderOptions,
  nationalityOptions,
  addressEntryMethodOptions,
  type Gender,
  type AddressEntryMethod,
} from "@/data/customerDetailsData";

const inputClass =
  "rounded-lg border border-border bg-white px-3 py-2 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green";

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
  const [secondLastName, setSecondLastName] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [receiveOffers, setReceiveOffers] = useState(false);
  const [entryMethod, setEntryMethod] = useState<AddressEntryMethod>(
    addressEntryMethodOptions[0]
  );
  const [saving, setSaving] = useState(false);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 400);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="bg-brand-blue px-6 py-4">
        <h1 className="text-lg font-bold text-white">Personal Details</h1>
      </div>

      <form onSubmit={handleSave} className="bg-panel p-6 sm:p-8">
        <p className="border-b-2 border-brand-blue pb-2 text-base font-semibold text-heading/70">
          Personal Details
        </p>

        <div className="mx-auto mt-5 flex max-w-3xl flex-col gap-4">
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
              <input className={`${inputClass} w-full`} />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-heading/50">Mid</span>
              <input className={`${inputClass} w-full`} />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-xs text-heading/50">Last</span>
              <input className={`${inputClass} w-full`} />
            </div>
          </FieldRow>

          <FieldRow label="">
            <Checkbox
              checked={secondLastName}
              onToggle={() => setSecondLastName((v) => !v)}
              label="If Second Last Name."
            />
          </FieldRow>

          <FieldRow label="Alternate Name (in Kana)">
            <input className={`${inputClass} flex-1`} />
            <input className={`${inputClass} flex-1`} />
            <input className={`${inputClass} flex-1`} />
          </FieldRow>

          <FieldRow label="Alternate Name (in Kanji)">
            <input className={`${inputClass} flex-1`} />
            <input className={`${inputClass} flex-1`} />
          </FieldRow>

          <FieldRow label="Smbc Card Number:">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Lawson Card Number">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Yucho Card Number">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Gender">
            {genderOptions.map((option) => (
              <RadioPill
                key={option}
                label={option}
                checked={gender === option}
                onSelect={() => setGender(option)}
              />
            ))}
          </FieldRow>

          <FieldRow label="Nationality" required>
            <select defaultValue="" className={`${inputClass} w-full`}>
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
              <DateInput />
            </div>
          </FieldRow>

          <FieldRow label="Email ID">
            <input type="email" className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="">
            <Checkbox
              checked={receiveOffers}
              onToggle={() => setReceiveOffers((v) => !v)}
              label="I want to receive emails about special offers and promotions."
            />
          </FieldRow>

          <FieldRow label="Alternate Email">
            <input type="email" className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Country">
            <select defaultValue={contactCountryOptions[0]} className={`${inputClass} w-full`}>
              {contactCountryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Telephone">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Mobile No" required>
            <input placeholder="Enter Mobile No" className={`${inputClass} w-full placeholder:italic`} />
          </FieldRow>
        </div>

        <p className="mt-8 border-b-2 border-brand-blue pb-2 text-base font-semibold text-heading/70">
          Contact Details
        </p>

        <div className="mx-auto mt-5 flex max-w-3xl flex-col gap-4">
          <FieldRow label="Select entry method">
            <div className="flex flex-col gap-2">
              {addressEntryMethodOptions.map((option) => (
                <RadioPill
                  key={option}
                  label={option}
                  checked={entryMethod === option}
                  onSelect={() => setEntryMethod(option)}
                />
              ))}
            </div>
          </FieldRow>

          <FieldRow label="Zip Code" required>
            <input className={`${inputClass} w-24`} />
            <span className="text-heading/50">-</span>
            <input className={`${inputClass} w-24`} />
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-heading hover:bg-surface"
            >
              <Search size={14} />
              Search
            </button>
          </FieldRow>

          <FieldRow label="Prefecture">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="City">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Town">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Street Address - Japanese">
            <input className={`${inputClass} w-full`} />
          </FieldRow>

          <FieldRow label="Sender Address- Japanese">
            <input disabled className={`${inputClass} w-full bg-surface text-muted`} />
          </FieldRow>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
