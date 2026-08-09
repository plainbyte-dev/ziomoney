"use client";

import { useState } from "react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import TextField from "./TextField";
import Spinner from "./Spinner";
import { emptyCountryCurrencyPayload, type CountryCurrencyUpsertPayload } from "@/data/countryCurrencyData";

export default function CountryCurrencyPanel() {
  const { isLive } = useDataMode();
  const { countryCurrencies, saveCountryCurrency } = useRates();

  const [form, setForm] = useState<CountryCurrencyUpsertPayload>(emptyCountryCurrencyPayload());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function updateField<K extends keyof CountryCurrencyUpsertPayload>(
    field: K,
    value: CountryCurrencyUpsertPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaving(true);
    const ok = await saveCountryCurrency(form);
    setSaving(false);
    if (!ok) {
      setSaveError("Could not save the country/currency row. Please try again.");
      return;
    }
    setForm(emptyCountryCurrencyPayload());
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Country / Currency</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — ISO-3166 / ISO-4217 reference data.
          </p>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Alpha-2</th>
                    <th className="px-4 py-3">Alpha-3</th>
                    <th className="px-4 py-3">Numeric</th>
                    <th className="px-4 py-3">Currency Code</th>
                  </tr>
                </thead>
                <tbody>
                  {countryCurrencies.map((entry) => (
                    <tr key={entry.id} className="border-b border-border bg-panel last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">{entry.countryName}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.isoAlpha2}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.isoAlpha3}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.isoNumeric}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.currencyCode}</td>
                    </tr>
                  ))}

                  {countryCurrencies.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                        {isLive
                          ? "The remittance API has no \"list all\" endpoint for this data — rows appear here after you save one below."
                          : "No country/currency rows yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-heading">Upsert Country / Currency Row</h2>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-3 sm:p-8">
          <TextField
            label="Country Name:"
            required
            value={form.countryName}
            onChange={(v) => updateField("countryName", v)}
          />
          <TextField
            label="ISO Alpha-2:"
            required
            value={form.isoAlpha2}
            onChange={(v) => updateField("isoAlpha2", v.toUpperCase())}
          />
          <TextField
            label="ISO Alpha-3:"
            required
            value={form.isoAlpha3}
            onChange={(v) => updateField("isoAlpha3", v.toUpperCase())}
          />
          <TextField
            label="ISO Numeric:"
            value={String(form.isoNumeric)}
            onChange={(v) => updateField("isoNumeric", Number(v) || 0)}
          />
          <TextField
            label="Currency Code:"
            required
            value={form.currencyCode}
            onChange={(v) => updateField("currencyCode", v.toUpperCase())}
          />
          <TextField label="FJ Date:" value={form.fjdate} onChange={(v) => updateField("fjdate", v)} />

          <div className="sm:col-span-3 mt-2 border-t border-border pt-5">
            {saveError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
            >
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Row"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
