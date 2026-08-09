"use client";

import { useState } from "react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Spinner from "./Spinner";
import {
  emptyMarginPayload,
  marginStatusValues,
  marginTypeValues,
  type MarginUpsertPayload,
} from "@/data/marginSetupData";

export default function MarginSetupPanel() {
  const { isLive } = useDataMode();
  const { margins, saveMargin } = useRates();

  const [form, setForm] = useState<MarginUpsertPayload>(emptyMarginPayload());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function updateField<K extends keyof MarginUpsertPayload>(field: K, value: MarginUpsertPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaving(true);
    const ok = await saveMargin(form);
    setSaving(false);
    if (!ok) {
      setSaveError("Could not save the margin setup. Please try again.");
      return;
    }
    setForm(emptyMarginPayload());
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Margin Setup</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — per-partner margin overrides on top of upstream
            rates.
          </p>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Target Partner</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Remittance Type</th>
                    <th className="px-4 py-3">Margin Rate</th>
                    <th className="px-4 py-3">Vs. Parent</th>
                    <th className="px-4 py-3">Bind String</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {margins.map((entry) => (
                    <tr key={entry.id} className="border-b border-border bg-panel last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">{entry.targetPartner}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.service}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.remittanceType}</td>
                      <td className="px-4 py-3 text-heading/80">
                        {entry.marginRate}
                        {entry.marginType === "PERCENT" ? "%" : ""}
                      </td>
                      <td className="px-4 py-3 text-heading/80">
                        {entry.marginRateWrtParent}
                        {entry.marginType === "PERCENT" ? "%" : ""}
                      </td>
                      <td className="px-4 py-3 text-heading/80">{entry.marginBindString}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.status}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                        {entry.expiryDate.slice(0, 10)}
                      </td>
                    </tr>
                  ))}

                  {margins.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                        {isLive
                          ? "The remittance API has no \"list all\" endpoint for this data — rows appear here after you save one below."
                          : "No margin overrides configured yet."}
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
          <h2 className="text-base font-bold text-heading">Add / Update Margin</h2>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-3 sm:p-8">
          <TextField
            label="Target Partner:"
            required
            value={form.targetPartner}
            onChange={(v) => updateField("targetPartner", v)}
          />
          <TextField label="Service:" value={form.service} onChange={(v) => updateField("service", v)} />
          <TextField
            label="Remittance Type:"
            value={form.remittanceType}
            onChange={(v) => updateField("remittanceType", v)}
          />
          <TextField
            label="Margin Rate:"
            value={String(form.marginRate)}
            onChange={(v) => updateField("marginRate", Number(v) || 0)}
          />
          <TextField
            label="Margin Rate (vs. Parent):"
            value={String(form.marginRateWrtParent)}
            onChange={(v) => updateField("marginRateWrtParent", Number(v) || 0)}
          />
          <SelectField
            label="Margin Type:"
            options={marginTypeValues}
            defaultValue={marginTypeValues[0]}
            value={form.marginType}
            onChange={(v) => updateField("marginType", v)}
          />
          <TextField
            label="Bind String:"
            value={form.marginBindString}
            onChange={(v) => updateField("marginBindString", v)}
          />
          <SelectField
            label="Status:"
            options={marginStatusValues}
            defaultValue={marginStatusValues[0]}
            value={form.status}
            onChange={(v) => updateField("status", v)}
          />
          <TextField
            label="Expiry Date:"
            placeholder="YYYY-MM-DD"
            value={form.expiryDate}
            onChange={(v) => updateField("expiryDate", v)}
          />

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
              {saving ? "Saving..." : "Save Margin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
