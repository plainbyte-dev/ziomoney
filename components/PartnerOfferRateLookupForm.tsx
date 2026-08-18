"use client";

import { useEffect, useState } from "react";
import { usePartners } from "@/contexts/PartnersContext";
import SelectField from "./SelectField";
import CurrencySelect from "./CurrencySelect";
import Button from "./Button";
import { type PartnerOfferRateLookupPayload } from "@/data/partnerOfferRateData";
import { settlementCurrencyOptions, partnerCountrySelectOptions } from "@/data/partnerData";

function emptyLookupPayload(): PartnerOfferRateLookupPayload {
  return {
    userName: "",
    sendCurrency: settlementCurrencyOptions[0],
    destCountry: partnerCountrySelectOptions[0],
    fromDate: "",
    toDate: "",
  };
}

export default function PartnerOfferRateLookupForm({
  onSubmit,
  loading,
  submitLabel,
}: {
  onSubmit: (payload: PartnerOfferRateLookupPayload) => void;
  loading: boolean;
  submitLabel: string;
}) {
  const { entries: partners } = usePartners();
  const [form, setForm] = useState<PartnerOfferRateLookupPayload>(emptyLookupPayload());

  const partnerOptions = partners.map((p) => p.partnerName);

  useEffect(() => {
    if (partnerOptions.length === 0) return;
    setForm((prev) => (prev.userName ? prev : { ...prev, userName: partnerOptions[0] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerOptions.length]);

  function updateField<K extends keyof PartnerOfferRateLookupPayload>(
    field: K,
    value: PartnerOfferRateLookupPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
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
        value={form.destCountry}
        onChange={(v) => updateField("destCountry", v)}
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-heading/70">From Date:</label>
        <input
          type="date"
          required
          value={form.fromDate}
          onChange={(event) => updateField("fromDate", event.target.value)}
          className="w-full rounded-xl border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-heading/70">To Date:</label>
        <input
          type="date"
          required
          value={form.toDate}
          onChange={(event) => updateField("toDate", event.target.value)}
          className="w-full rounded-xl border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
        />
      </div>
      <div className="flex items-end pb-2.5">
        <Button type="submit" loading={loading}>
          {loading ? "Searching..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
