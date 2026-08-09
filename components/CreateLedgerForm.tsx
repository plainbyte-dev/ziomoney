"use client";

import { useState } from "react";
import TextField from "./TextField";
import SelectField from "./SelectField";
import RadioPill from "./RadioPill";
import Button from "./Button";
import { ledgerCountryOptions, ledgerCurrencyOptions } from "@/data/ledgerData";
import { useTabs } from "@/contexts/TabsContext";
import { useToast } from "@/contexts/ToastContext";
import { useDataMode } from "@/contexts/DataModeContext";

export default function CreateLedgerForm() {
  const { openTab } = useTabs();
  const { showToast } = useToast();
  const { isLive } = useDataMode();
  const [currency, setCurrency] = useState<(typeof ledgerCurrencyOptions)[number]>(
    "NPR"
  );
  const [saving, setSaving] = useState(false);

  function handleSave(event: React.FormEvent) {
    event.preventDefault();

    // The remittance API has no ledger-create endpoint at all, so there's
    // nothing to actually call in live mode — faking a success toast would
    // claim a live action happened when it didn't.
    if (isLive) {
      showToast("The remittance API has no ledger-create endpoint — this form is demo-only.", "error");
      return;
    }

    setSaving(true);
    // Static demo: pretend to save, then return to the ledger list.
    setTimeout(() => {
      showToast("Ledger created successfully.");
      openTab({ key: "ledger-list", title: "Ledger List" });
    }, 400);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Create New Ledger</h1>
        <p className="mt-0.5 text-sm text-muted">
          {isLive ? "Live remittance API has no ledger-create endpoint — demo only" : "Static demo data"}
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl bg-panel p-6 sm:p-8"
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

          <Button type="submit" loading={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
