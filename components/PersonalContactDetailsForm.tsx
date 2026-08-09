"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import RadioPill from "./RadioPill";
import Checkbox from "./Checkbox";
import DateInput from "./DateInput";
import Spinner from "./Spinner";
import { useKyc } from "@/contexts/KycContext";
import {
  contactCountryOptions,
  genderOptions,
  nationalityOptions,
  addressEntryMethodOptions,
  type AddressEntryMethod,
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

export default function PersonalContactDetailsForm() {
  const { record, updateField, saving, saveError, saveSuccess, saveCustomer } = useKyc();

  const [secondLastName, setSecondLastName] = useState(false);
  const [receiveOffers, setReceiveOffers] = useState(false);
  const [entryMethod, setEntryMethod] = useState<AddressEntryMethod>(
    addressEntryMethodOptions[0]
  );
  const [zip1, setZip1] = useState("");
  const [zip2, setZip2] = useState("");

  function handleZipChange(part: "zip1" | "zip2", value: string) {
    const nextZip1 = part === "zip1" ? value : zip1;
    const nextZip2 = part === "zip2" ? value : zip2;
    if (part === "zip1") setZip1(value);
    else setZip2(value);
    updateField("zipCode", nextZip2 ? `${nextZip1}-${nextZip2}` : nextZip1);
  }

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    saveCustomer();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Personal Details</h1>
      </div>

      <form onSubmit={handleSave} className="bg-panel p-6 sm:p-8">
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
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-medium text-heading hover:bg-surface"
            >
              <Search size={14} />
              Search
            </button>
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

          <FieldRow label="Sender Address- Japanese">
            <input disabled className={`${inputClass} w-full bg-surface text-muted`} />
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
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
          >
            {saving && <Spinner className="h-4 w-4" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
