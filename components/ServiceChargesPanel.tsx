"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Checkbox from "./Checkbox";
import Spinner from "./Spinner";
import { deliveryOptionValues, emptyServiceChargePayload, type ServiceChargeUpsertPayload } from "@/data/serviceChargeData";

export default function ServiceChargesPanel() {
  const { isLive } = useDataMode();
  const {
    serviceCharges,
    serviceChargesLoading,
    serviceChargesError,
    refreshServiceCharges,
    saveServiceChargeEntry,
  } = useRates();

  const [form, setForm] = useState<ServiceChargeUpsertPayload>(emptyServiceChargePayload());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    refreshServiceCharges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  function updateField<K extends keyof ServiceChargeUpsertPayload>(field: K, value: ServiceChargeUpsertPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaving(true);
    const ok = await saveServiceChargeEntry(form);
    setSaving(false);
    if (!ok) {
      setSaveError("Could not save the service charge. Please try again.");
      return;
    }
    setForm(emptyServiceChargePayload());
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-heading">Service Charges</h1>
            <p className="mt-0.5 text-sm text-muted">
              {isLive ? "Live remittance API" : "Static demo data"} — per-country/agent service-charge configuration.
            </p>
          </div>
          <button
            onClick={refreshServiceCharges}
            disabled={serviceChargesLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-panel px-3 py-1.5 text-xs font-medium text-heading/80 hover:bg-surface disabled:opacity-60"
          >
            <RefreshCw size={13} className={serviceChargesLoading ? "animate-spin" : undefined} />
            Refresh
          </button>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          {serviceChargesError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serviceChargesError}</p>
          )}

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Country Symbol</th>
                    <th className="px-4 py-3">Agent</th>
                    <th className="px-4 py-3">Delivery Option</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceCharges.map((charge) => (
                    <tr key={charge.id} className="border-b border-border bg-panel last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">{charge.countrySymbol}</td>
                      <td className="px-4 py-3 text-heading/80">{charge.agentName}</td>
                      <td className="px-4 py-3 text-heading/80">{charge.deliveryOption}</td>
                      <td className="px-4 py-3 text-heading/80">{charge.active ? "Yes" : "No"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-heading/80">{charge.updatedDate || "-"}</td>
                    </tr>
                  ))}

                  {serviceCharges.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                        No service charges configured yet.
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
          <h2 className="text-base font-bold text-heading">Save Service Charge</h2>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-2 sm:p-8">
          <TextField
            label="Country Symbol:"
            required
            value={form.countrySymbol}
            onChange={(v) => updateField("countrySymbol", v)}
          />
          <TextField
            label="Agent Name:"
            required
            value={form.agentName}
            onChange={(v) => updateField("agentName", v)}
          />
          <SelectField
            label="Delivery Option:"
            options={deliveryOptionValues}
            defaultValue={deliveryOptionValues[0]}
            value={form.deliveryOption}
            onChange={(v) => updateField("deliveryOption", v)}
          />
          <div className="flex items-end pb-2.5">
            <Checkbox checked={form.active} onToggle={() => updateField("active", !form.active)} label="Active" />
          </div>

          <div className="sm:col-span-2 mt-2 border-t border-border pt-5">
            {saveError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
            >
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Service Charge"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
