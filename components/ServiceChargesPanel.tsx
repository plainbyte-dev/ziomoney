"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, X } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useDataMode } from "@/contexts/DataModeContext";
import SelectField from "./SelectField";
import CurrencySelect from "./CurrencySelect";
import Checkbox from "./Checkbox";
import Button from "./Button";
import {
  deliveryOptionValues,
  emptyServiceChargePayload,
  type ServiceChargeRecord,
  type ServiceChargeUpsertPayload,
} from "@/data/serviceChargeData";

export default function ServiceChargesPanel() {
  const { isLive } = useDataMode();
  const {
    serviceCharges,
    serviceChargesLoading,
    serviceChargesError,
    refreshServiceCharges,
    saveServiceChargeEntry,
    countryCurrencies,
  } = useRates();
  const { entries: partners } = usePartners();

  const countrySymbolOptions = Array.from(new Set(countryCurrencies.map((c) => c.currencyCode))).filter(
    Boolean
  );
  const agentOptions = partners.filter((p) => p.partnerType === "Agent").map((p) => p.partnerName);

  const [editingId, setEditingId] = useState<number | null>(null);
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

  function startEdit(charge: ServiceChargeRecord) {
    setEditingId(charge.id);
    setForm({
      id: charge.id,
      countrySymbol: charge.countrySymbol,
      agentName: charge.agentName,
      deliveryOption: charge.deliveryOption,
      active: charge.active,
    });
    setSaveError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyServiceChargePayload());
    setSaveError(null);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaving(true);
    const ok = await saveServiceChargeEntry(form, editingId === null);
    setSaving(false);
    if (!ok) {
      setSaveError("Could not save the service charge. Please try again.");
      return;
    }
    cancelEdit();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-heading">Service Charges</h1>
            <p className="mt-0.5 text-sm text-muted">
              {isLive ? "Live remittance API" : "Static demo data"} — per-country/agent delivery-option
              availability. There is no delete endpoint — deactivating a row (below) is the only removal
              mechanism.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshServiceCharges}
            disabled={serviceChargesLoading}
            icon={<RefreshCw size={13} className={serviceChargesLoading ? "animate-spin" : undefined} />}
          >
            Refresh
          </Button>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          {serviceChargesError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{serviceChargesError}</p>
          )}

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Agent</th>
                    <th className="px-4 py-3">Delivery Option</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {serviceCharges.map((charge) => (
                    <tr
                      key={charge.id}
                      className={`border-b border-border last:border-b-0 ${
                        charge.active ? "bg-panel" : "bg-panel opacity-50"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-heading">{charge.countrySymbol}</td>
                      <td className="px-4 py-3 text-heading/80">{charge.agentName}</td>
                      <td className="px-4 py-3 text-heading/80">{charge.deliveryOption}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            charge.active
                              ? "bg-brand-green-light text-brand-green-dark"
                              : "bg-surface text-muted"
                          }`}
                        >
                          {charge.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-heading/80">{charge.createdDate || "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-heading/80">{charge.updatedDate || "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          onClick={() => startEdit(charge)}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-heading/80 hover:bg-border"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {serviceCharges.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted">
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
          <h2 className="text-base font-bold text-heading">
            {editingId === null ? "Add Service Charge" : "Update Service Charge"}
          </h2>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-2 sm:p-8">
          <CurrencySelect
            label="Country:"
            required
            options={countrySymbolOptions}
            value={form.countrySymbol}
            onChange={(v) => updateField("countrySymbol", v)}
            emptyMessage="No currencies found — import one under Country / Currency first."
          />
          {agentOptions.length > 0 ? (
            <SelectField
              label="Agent:"
              required
              options={agentOptions}
              defaultValue={agentOptions[0]}
              value={form.agentName}
              onChange={(v) => updateField("agentName", v)}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Agent:</label>
              <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
                No Agent-type partners found — create one under Partner Info first.
              </p>
            </div>
          )}
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
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving} icon={editingId === null ? <Plus size={15} /> : undefined}>
                {saving ? "Saving..." : editingId === null ? "Add Service Charge" : "Update Service Charge"}
              </Button>
              {editingId !== null && (
                <Button type="button" variant="secondary" onClick={cancelEdit} icon={<X size={15} />}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
