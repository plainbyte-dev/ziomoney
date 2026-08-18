"use client";

import { useEffect, useState } from "react";
import TextField from "./TextField";
import SelectField from "./SelectField";
import CurrencySelect from "./CurrencySelect";
import Button from "./Button";
import { useTabs } from "@/contexts/TabsContext";
import { useToast } from "@/contexts/ToastContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useRates } from "@/contexts/RatesContext";

export default function CreateLedgerForm() {
  const { openTab } = useTabs();
  const { showToast } = useToast();
  const { isLive } = useDataMode();
  const { countryCurrencies } = useRates();

  const countryOptions = [...new Set(countryCurrencies.map((c) => c.countryName).filter(Boolean))].sort();
  const currencyOptions = [...new Set(countryCurrencies.map((c) => c.currencyCode).filter(Boolean))].sort();

  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [saving, setSaving] = useState(false);

  function currencyForCountry(countryName: string): string {
    return countryCurrencies.find((c) => c.countryName === countryName)?.currencyCode ?? "";
  }

  function handleCountryChange(value: string) {
    setCountry(value);
    setCurrency(currencyForCountry(value) || currencyOptions[0] || "");
  }

  // Country/currency load asynchronously (imported via the Country/Currency
  // tab) — once the list is available, default to its first country and the
  // currency that goes with it, re-pointing if the previous selection no
  // longer exists in the list.
  useEffect(() => {
    if (countryOptions.length === 0) return;
    const next = countryOptions.includes(country) ? country : countryOptions[0];
    if (next !== country) setCountry(next);
    const matchedCurrency = currencyForCountry(next) || currencyOptions[0] || "";
    if (matchedCurrency !== currency) setCurrency(matchedCurrency);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryOptions.join("|")]);

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

          {countryOptions.length > 0 ? (
            <SelectField
              label="Country"
              options={countryOptions}
              defaultValue={countryOptions[0]}
              value={country}
              onChange={handleCountryChange}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Country</label>
              <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
                No countries uploaded — add rows on the Country/Currency tab first.
              </p>
            </div>
          )}

          <CurrencySelect options={currencyOptions} value={currency} onChange={setCurrency} />
        </div>

        <div className="mt-6 flex items-center justify-end border-t border-border pt-5">
          <Button type="submit" loading={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
