"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useDataMode } from "@/contexts/DataModeContext";
import TextField from "./TextField";
import SelectField from "./SelectField";
import CurrencySelect from "./CurrencySelect";
import Button from "./Button";
import {
  commissionTypeValues,
  emptyCommissionPayload,
  type CommissionLookupPayload,
  type CommissionUpsertPayload,
} from "@/data/partnerCommissionData";
import { settlementCurrencyOptions, partnerCountrySelectOptions } from "@/data/partnerData";

function emptyLookupPayload(): CommissionLookupPayload {
  return {
    userName: "",
    destinationCountry: partnerCountrySelectOptions[0],
    sendCurrency: settlementCurrencyOptions[0],
  };
}

export default function PartnerCommissionPanel() {
  const { isLive } = useDataMode();
  const { commissions, commissionsLoading, commissionsError, searchCommissions, saveCommission } = useRates();
  const { entries: partners } = usePartners();

  const partnerOptions = partners.map((p) => p.partnerName);

  const [searchForm, setSearchForm] = useState<CommissionLookupPayload>(emptyLookupPayload());
  const [form, setForm] = useState<CommissionUpsertPayload>(emptyCommissionPayload());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Both forms reference the same partner dropdown, whose options load
  // asynchronously — backfill once they arrive rather than leaving a select
  // visually showing an option neither form's state agrees with.
  useEffect(() => {
    if (partnerOptions.length === 0) return;
    setSearchForm((prev) => (prev.userName ? prev : { ...prev, userName: partnerOptions[0] }));
    setForm((prev) => (prev.userName ? prev : { ...prev, userName: partnerOptions[0] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerOptions.length]);

  function updateSearchField<K extends keyof CommissionLookupPayload>(field: K, value: CommissionLookupPayload[K]) {
    setSearchForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateField<K extends keyof CommissionUpsertPayload>(field: K, value: CommissionUpsertPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    await searchCommissions(searchForm);
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
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Partner Commission</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — per-partner commission configuration.
          </p>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          <form onSubmit={handleSearch} className="mb-6 grid grid-cols-1 gap-x-6 gap-y-5 border-b border-border pb-6 sm:grid-cols-4">
            {partnerOptions.length > 0 ? (
              <SelectField
                label="Partner:"
                required
                options={partnerOptions}
                defaultValue={partnerOptions[0]}
                value={searchForm.userName}
                onChange={(v) => updateSearchField("userName", v)}
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-heading/70">Partner:</label>
                <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
                  No partners found — create one under Partner Info first.
                </p>
              </div>
            )}
            <SelectField
              label="Destination Country:"
              required
              options={partnerCountrySelectOptions}
              defaultValue={partnerCountrySelectOptions[0]}
              value={searchForm.destinationCountry}
              onChange={(v) => updateSearchField("destinationCountry", v)}
            />
            <CurrencySelect
              label="Send Currency:"
              required
              options={settlementCurrencyOptions}
              value={searchForm.sendCurrency}
              onChange={(v) => updateSearchField("sendCurrency", v)}
            />
            <div className="flex items-end pb-2.5">
              <Button type="submit" loading={commissionsLoading} icon={<Search size={14} />}>
                {commissionsLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>

          {commissionsError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{commissionsError}</p>
          )}

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
                    <tr key={entry.id} className="border-b border-border bg-panel last:border-b-0">
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
                        {isLive
                          ? "The remittance API has no \"list all\" endpoint for this data — search above, or save a commission below, to see rows here."
                          : "No partner commissions configured yet."}
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
          <h2 className="text-base font-bold text-heading">Insert / Update Commission</h2>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-3 sm:p-8">
          {partnerOptions.length > 0 ? (
            <SelectField
              label="Partner:"
              required
              options={partnerOptions}
              defaultValue={partnerOptions[0]}
              value={form.userName}
              onChange={(v) => updateField("userName", v)}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Partner:</label>
              <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
                No partners found — create one under Partner Info first.
              </p>
            </div>
          )}
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
          <CurrencySelect
            label="Send Currency:"
            required
            options={settlementCurrencyOptions}
            value={form.sendCurrency}
            onChange={(v) => updateField("sendCurrency", v)}
          />
          <SelectField
            label="Destination Country:"
            required
            options={partnerCountrySelectOptions}
            defaultValue={partnerCountrySelectOptions[0]}
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
            <Button type="submit" loading={saving}>
              {saving ? "Saving..." : "Save Commission"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
