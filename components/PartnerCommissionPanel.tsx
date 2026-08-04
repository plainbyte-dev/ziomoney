"use client";

import { useState } from "react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import TextField from "./TextField";
import SelectField from "./SelectField";
import { commissionTypeValues, emptyCommissionPayload, type CommissionUpsertPayload } from "@/data/partnerCommissionData";

export default function PartnerCommissionPanel() {
  const { isLive } = useDataMode();
  const { commissions, saveCommission } = useRates();

  const [form, setForm] = useState<CommissionUpsertPayload>(emptyCommissionPayload());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function updateField<K extends keyof CommissionUpsertPayload>(field: K, value: CommissionUpsertPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaving(true);
    const ok = await saveCommission(form);
    setSaving(false);
    if (!ok) {
      setSaveError("Could not save the partner commission. Please try again.");
      return;
    }
    setForm(emptyCommissionPayload());
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="bg-brand-blue px-6 py-4">
          <h1 className="text-lg font-bold text-white">Partner Commission</h1>
          <p className="mt-0.5 text-sm text-white/80">
            {isLive ? "Live remittance API" : "Static demo data"} — per-partner commission configuration.
          </p>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Partner</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Send Currency</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="px-4 py-3">Remittance Type</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((entry) => (
                    <tr key={entry.id} className="border-b border-border bg-white last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">{entry.remittancePartner}</td>
                      <td className="px-4 py-3 text-heading/80">
                        {entry.commissionRate}
                        {entry.commissionType === "PERCENT" ? "%" : ""}
                      </td>
                      <td className="px-4 py-3 text-heading/80">{entry.commissionType}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.service}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.sendCurrency}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.destinationCountry}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.remittanceType}</td>
                    </tr>
                  ))}

                  {commissions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
                        No partner commissions configured yet.
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
        <div className="bg-brand-blue px-6 py-4">
          <h2 className="text-base font-bold text-white">Insert / Update Commission</h2>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-3 sm:p-8">
          <TextField
            label="Partner User Name:"
            required
            value={form.userName}
            onChange={(v) => updateField("userName", v)}
          />
          <TextField
            label="Commission Rate:"
            value={String(form.commissionRate)}
            onChange={(v) => updateField("commissionRate", Number(v) || 0)}
          />
          <SelectField
            label="Commission Type:"
            options={commissionTypeValues}
            defaultValue={commissionTypeValues[0]}
            value={form.commissionType}
            onChange={(v) => updateField("commissionType", v as CommissionUpsertPayload["commissionType"])}
          />
          <TextField label="Service:" value={form.service} onChange={(v) => updateField("service", v)} />
          <TextField
            label="Send Currency:"
            required
            value={form.sendCurrency}
            onChange={(v) => updateField("sendCurrency", v.toUpperCase())}
          />
          <TextField
            label="Destination Country:"
            required
            value={form.destinationCountry}
            onChange={(v) => updateField("destinationCountry", v)}
          />
          <TextField
            label="Remittance Type:"
            value={form.remittanceType}
            onChange={(v) => updateField("remittanceType", v)}
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
              {saving ? "Saving..." : "Save Commission"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
