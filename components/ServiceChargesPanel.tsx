"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, X } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useDataMode } from "@/contexts/DataModeContext";
import SelectField from "./SelectField";
import CurrencySelect, { type CurrencySelectOption } from "./CurrencySelect";
import Checkbox from "./Checkbox";
import Button from "./Button";
import ServiceChargeSetupModal, { type ServiceChargeSetupTarget } from "./ServiceChargeSetupModal";
import {
  deliveryOptionValues,
  emptyServiceChargePayload,
  type ServiceChargeRecord,
  type ServiceChargeUpsertPayload,
} from "@/data/serviceChargeData";
import { setupTypeLabels } from "@/data/setupTypeData";
import { dedupePartnerEntriesByName } from "@/data/partnerData";

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

  // One entry per currency code, labeled with its country so the picker shows
  // exactly what's on file in the Country/Currency reference table rather
  // than a bare code — the saved value is still just the currency code.
  const countrySymbolOptions: CurrencySelectOption[] = Array.from(
    new Map(countryCurrencies.map((c) => [c.currencyCode, c])).values()
  )
    .filter((c) => c.currencyCode)
    .map((c) => ({ value: c.currencyCode, label: `${c.countryName} — ${c.currencyCode}` }));
  const agentOptions = partners.filter((p) => p.partnerType === "Agent").map((p) => p.partnerName);

  // One row per registered partner — the setup grid below, matching the
  // legacy Country/Partner/[3 setup links] layout. Deduplicated by name in
  // case the same partner appears more than once in Partner Info, merging
  // txnCurrencies/destCountries across duplicates rather than picking one
  // arbitrarily.
  const partnerRows = dedupePartnerEntriesByName(partners);

  const [setupTarget, setSetupTarget] = useState<ServiceChargeSetupTarget | null>(null);
  const [setupSaving, setSetupSaving] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

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

  // Match the row/scope a setup link was clicked for against whatever
  // service charge already exists — matched on partner + scope, since the
  // real countrySymbol field is a currency code (INR, NPR...) rather than
  // the partner's registered country (INDIA, NEPAL...), so it can't be used
  // to join the two.
  function findExistingSetup(target: ServiceChargeSetupTarget): ServiceChargeRecord | undefined {
    return serviceCharges.find((charge) =>
      target.setupType === "COUNTRY"
        ? charge.setupTypeMOCKONLY === "COUNTRY" && !charge.agentName
        : charge.setupTypeMOCKONLY === target.setupType && charge.agentName === target.partnerName
    );
  }

  async function handleSetupSave(payload: ServiceChargeUpsertPayload) {
    setSetupError(null);
    setSetupSaving(true);
    const existing = setupTarget ? findExistingSetup(setupTarget) : undefined;
    const ok = await saveServiceChargeEntry({ ...payload, id: existing?.id ?? 0 }, !existing);
    setSetupSaving(false);
    if (!ok) {
      setSetupError("Could not save this setup. Please try again.");
      return;
    }
    setSetupTarget(null);
  }

  function startEdit(charge: ServiceChargeRecord) {
    setEditingId(charge.id);
    setForm({
      id: charge.id,
      countrySymbol: charge.countrySymbol,
      agentName: charge.agentName,
      deliveryOption: charge.deliveryOption,
      active: charge.active,
      setupTypeMOCKONLY: charge.setupTypeMOCKONLY,
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
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Service Charge Setup</h1>
          <p className="mt-0.5 text-sm text-muted">
            Pick a scope for each partner — Country Wise applies to everyone trading that country, Payout
            Partner Wise and 3rd Party API Agent wise override it for one partner.
          </p>
        </div>
        <div className="overflow-x-auto bg-panel p-6 sm:p-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Partner Name</th>
                  <th className="px-4 py-3">Service Charge Setup</th>
                </tr>
              </thead>
              <tbody>
                {partnerRows.map((partner) => (
                  <tr key={partner.id} className="border-b border-border bg-panel last:border-b-0">
                    <td className="px-4 py-3 text-heading/80">{partner.country}</td>
                    <td className="px-4 py-3 font-medium text-heading">{partner.partnerName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setSetupTarget({ partnerName: partner.partnerName, setupType: "COUNTRY" })}
                        >
                          {setupTypeLabels.COUNTRY}
                        </Button>

                        {partner.destCountries && partner.destCountries.length > 0 ? (
                          (["PARTNER", "THIRD_PARTY_AGENT"] as const).map((option) => (
                            <Button
                              key={option}
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => setSetupTarget({ partnerName: partner.partnerName, setupType: option })}
                            >
                              {setupTypeLabels[option]}
                            </Button>
                          ))
                        ) : (
                          <span className="text-xs text-muted">
                            No destination countries enabled — add some in Manage Partner.
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {partnerRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted">
                      No partners registered yet — add one under Partner Info first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ServiceChargeSetupModal
        target={setupTarget}
        existing={setupTarget ? findExistingSetup(setupTarget) : undefined}
        countrySymbolOptions={countrySymbolOptions}
        partners={partners}
        saving={setupSaving}
        error={setupError}
        onCancel={() => {
          setSetupTarget(null);
          setSetupError(null);
        }}
        onSave={handleSetupSave}
      />

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-heading">Configured Service Charges</h2>
            <p className="mt-0.5 text-sm text-muted">
              {isLive ? "Live remittance API" : "Static demo data"} — every charge saved from the setup grid
              above, or added directly below. There is no delete endpoint — deactivating a row is the only
              removal mechanism.
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
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Partner Name</th>
                    <th className="px-4 py-3">Service Charge Setup</th>
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
                      <td className="px-4 py-3 text-heading/80">
                        {charge.setupTypeMOCKONLY === "COUNTRY" ? "All partners" : charge.agentName || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            charge.setupTypeMOCKONLY === "COUNTRY"
                              ? "bg-surface text-heading/70"
                              : "bg-brand-blue-light text-brand-blue-dark"
                          }`}
                        >
                          {setupTypeLabels[charge.setupTypeMOCKONLY]}
                        </span>
                      </td>
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
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
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
              label="Partner Name:"
              required
              options={agentOptions}
              defaultValue={agentOptions[0]}
              value={form.agentName}
              onChange={(v) => updateField("agentName", v)}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Partner Name:</label>
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
