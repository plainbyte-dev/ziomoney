"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import TextField from "./TextField";
import SelectField from "./SelectField";
import RadioPill from "./RadioPill";
import { ledgerCountryOptions, ledgerCurrencyOptions } from "@/data/ledgerData";

export default function CreateLedgerForm() {
  const router = useRouter();
  const [currency, setCurrency] = useState<(typeof ledgerCurrencyOptions)[number]>(
    "NPR"
  );
  const [saving, setSaving] = useState(false);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    // Static demo: pretend to save, then return to the ledger list.
    setTimeout(() => {
      router.push("/ledger");
    }, 400);
  }

  return (
    <div className="rounded-2xl border border-border bg-panel p-6 shadow-card sm:p-8">
      <h1 className="text-2xl font-bold text-heading">Create New Ledger</h1>

      <form
        onSubmit={handleSave}
        className="mt-6 rounded-2xl border border-border bg-white p-6"
      >
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <TextField label="Ledger Name" placeholder="e.g. TEST PRIVATE LIMITED" required />
          <TextField label="Ledger Short Code" placeholder="e.g. 905789" required />
          <TextField label="Description" placeholder="e.g. NOORULLAH ROAD" />
          <SelectField
            label="Country"
            options={ledgerCountryOptions}
            defaultValue={ledgerCountryOptions[0]}
          />
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <div className="flex items-center gap-6">
            {ledgerCurrencyOptions.map((option) => (
              <RadioPill
                key={option}
                label={option}
                checked={currency === option}
                onSelect={() => setCurrency(option)}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
