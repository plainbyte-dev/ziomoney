"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useDataMode } from "@/contexts/DataModeContext";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Button from "./Button";
import {
  emptyMarginPayload,
  marginStatusValues,
  marginTypeValues,
  type MarginRecord,
  type MarginUpsertPayload,
} from "@/data/marginSetupData";
import { payoutMethodOptions } from "@/data/transferData";
import { remittanceTypeOptions } from "@/data/partnerCommissionData";

export default function MarginSetupPanel() {
  const { isLive } = useDataMode();
  const { margins, saveMargin, marginSaveError, exchangeRates, refreshExchangeRates } = useRates();
  const { entries: partners } = usePartners();

  // Exchange rates may still be empty in live mode if the agent lands here
  // without having visited the Exchange Rates tab first — same reasoning
  // as TransactionSendPanel's mount-time refresh.
  useEffect(() => {
    refreshExchangeRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  const [form, setForm] = useState<MarginUpsertPayload>(emptyMarginPayload());
  const [saving, setSaving] = useState(false);

  const isEditing = form.id !== 0;
  const targetPartnerOptions = partners.map((p) => p.partnerName);
  // A margin row binds to a payout corridor by destination currency +
  // delivery method (see lib/transferMath.ts's resolveMargin) — sourced
  // from the same live exchange-rate currency list TransactionSendPanel
  // uses, so a margin can only ever be set up for a currency that's
  // actually tradeable.
  const destinationCurrencyOptions = [...new Set(exchangeRates.map((r) => r.symbol).filter(Boolean))].sort();

  // Exchange rates load asynchronously — backfill the currency selection
  // once they arrive, same reasoning as the partner-id/sender backfills in
  // TransactionSendPanel.
  useEffect(() => {
    if (destinationCurrencyOptions.length === 0) return;
    setForm((prev) =>
      prev.marginBindString || isEditing ? prev : { ...prev, marginBindString: destinationCurrencyOptions[0] }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationCurrencyOptions.join("|")]);

  function updateField<K extends keyof MarginUpsertPayload>(field: K, value: MarginUpsertPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(entry: MarginRecord) {
    const { createdDate: _createdDate, ...payload } = entry;
    setForm(payload);
  }

  function cancelEdit() {
    setForm(emptyMarginPayload());
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const ok = await saveMargin(form);
    setSaving(false);
    if (!ok) return;
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
                    <th className="px-4 py-3">Destination Currency</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Expiry</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {margins.map((entry) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-border last:border-b-0 ${
                        form.id === entry.id ? "bg-brand-green-light/40" : "bg-panel"
                      }`}
                    >
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
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          onClick={() => startEdit(entry)}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-heading/80 hover:bg-border"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {margins.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted">
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
          <h2 className="text-base font-bold text-heading">{isEditing ? "Update Margin" : "Add Margin"}</h2>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-3 sm:p-8">
          {targetPartnerOptions.length > 0 ? (
            <SelectField
              label="Target Partner:"
              required
              options={targetPartnerOptions}
              defaultValue={targetPartnerOptions[0]}
              value={form.targetPartner}
              onChange={(v) => updateField("targetPartner", v)}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Target Partner:</label>
              <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
                No partners found — create one under Partner Info first.
              </p>
            </div>
          )}
          <SelectField
            label="Service (Delivery Method):"
            required
            options={payoutMethodOptions}
            defaultValue={payoutMethodOptions[0]}
            value={form.service}
            onChange={(v) => updateField("service", v)}
          />
          <SelectField
            label="Remittance Type:"
            required
            options={remittanceTypeOptions}
            defaultValue={remittanceTypeOptions[0]}
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
          {destinationCurrencyOptions.length > 0 ? (
            <SelectField
              label="Destination Currency:"
              required
              options={destinationCurrencyOptions}
              defaultValue={destinationCurrencyOptions[0]}
              value={form.marginBindString}
              onChange={(v) => updateField("marginBindString", v)}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Destination Currency:</label>
              <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
                No exchange rates loaded yet.
              </p>
            </div>
          )}
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
            {marginSaveError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{marginSaveError}</p>
            )}
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving}>
                {saving ? "Saving..." : isEditing ? "Update Margin" : "Save Margin"}
              </Button>
              {isEditing && (
                <Button type="button" variant="secondary" onClick={cancelEdit} icon={<X size={14} />}>
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
