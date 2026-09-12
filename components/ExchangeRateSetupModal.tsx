"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import TextField from "./TextField";
import CurrencySelect from "./CurrencySelect";
import Checkbox from "./Checkbox";
import type { ExchangeRateRecord, ExchangeRateUpsertPayload } from "@/data/exchangeRateData";
import { setupTypeLabels, type SetupType } from "@/data/setupTypeData";
import type { CountryCurrencyRecord } from "@/data/countryCurrencyData";
import { normalizedPartnerName, type PartnerEntry } from "@/data/partnerData";
import { flagEmojiFromIso2 } from "@/lib/flagEmoji";
import { currencyNameFromCode } from "@/lib/currencyNames";

export interface ExchangeRateSetupTarget {
  partnerName: string;
  setupType: SetupType;
}

const emptyRateFields = { symbol: "", currencyName: "", unit: 1, buying: 0, selling: 0, flag: "", countryIsoCode: "" };

export default function ExchangeRateSetupModal({
  target,
  exchangeRates,
  countryCurrencies,
  partners,
  saving,
  error,
  onCancel,
  onSave,
}: {
  target: ExchangeRateSetupTarget | null;
  exchangeRates: ExchangeRateRecord[];
  countryCurrencies: CountryCurrencyRecord[];
  partners: PartnerEntry[];
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (payload: ExchangeRateUpsertPayload) => void;
}) {
  const [country, setCountry] = useState("");
  const [fields, setFields] = useState(emptyRateFields);
  const [active, setActive] = useState(true);

  // This modal only ever opens for a specific partner (Payout Partner Wise /
  // 3rd Party API Agent wise) — Country Wise has its own tab — so the Symbol
  // choices are scoped to whatever that partner was actually enabled for via
  // Manage Partner's Transaction Currencies, not every currency the country
  // happens to have on file. Setting up a rate for a currency the partner
  // can't even transact in wouldn't mean anything.
  const partnerEntry = target
    ? partners.find((p) => normalizedPartnerName(p.partnerName) === normalizedPartnerName(target.partnerName))
    : undefined;
  const symbolOptions = partnerEntry?.txnCurrencies ?? [];
  const countryOptions = partnerEntry?.destCountries ?? [];

  // The destination country is picked inside this form (not fixed before
  // opening it), so re-seeding has two stages: reset to the partner's first
  // enabled destination country whenever a different row/scope is opened,
  // then re-derive the form fields from whatever rate already exists for
  // that exact country+partner+scope whenever the selected country changes.
  useEffect(() => {
    if (!target) return;
    setCountry(countryOptions[0] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, partnerEntry]);

  function findExisting(selectedCountry: string): ExchangeRateRecord | undefined {
    if (!target) return undefined;
    return exchangeRates.find(
      (rate) =>
        rate.setupTypeMOCKONLY === target.setupType &&
        rate.partnerNameMOCKONLY === target.partnerName &&
        rate.countryName === selectedCountry
    );
  }

  useEffect(() => {
    if (!target || !country) return;
    const existing = findExisting(country);
    const defaultSymbol = existing?.symbol ?? symbolOptions[0] ?? "";
    const match = countryCurrencies.find((c) => c.countryName === country && c.currencyCode === defaultSymbol);
    setFields({
      symbol: defaultSymbol,
      currencyName: existing?.currencyName ?? (defaultSymbol ? currencyNameFromCode(defaultSymbol) : ""),
      unit: existing?.unit ?? 1,
      buying: existing?.buying ?? 0,
      selling: existing?.selling ?? 0,
      flag: existing?.flag ?? (match ? flagEmojiFromIso2(match.isoAlpha2) : ""),
      countryIsoCode: existing?.countryIsoCode ?? match?.isoAlpha2 ?? "",
    });
    setActive(existing?.active ?? true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, country, exchangeRates, countryCurrencies, symbolOptions.join(",")]);

  if (!target) return null;

  const matchedCurrency = countryCurrencies.find(
    (c) => c.countryName === country && c.currencyCode === fields.symbol
  );

  function updateField<K extends keyof typeof emptyRateFields>(key: K, value: (typeof emptyRateFields)[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleCurrencyChange(currencyCode: string) {
    const match = countryCurrencies.find((c) => c.countryName === country && c.currencyCode === currencyCode);
    setFields((prev) => ({
      ...prev,
      symbol: currencyCode,
      currencyName: currencyNameFromCode(currencyCode),
      countryIsoCode: match?.isoAlpha2 ?? prev.countryIsoCode,
      flag: match ? flagEmojiFromIso2(match.isoAlpha2) : prev.flag,
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!target || !country) return;
    onSave({
      ...fields,
      countryName: country,
      priority: findExisting(country)?.priority ?? 0,
      active,
      partnerNameMOCKONLY: target.partnerName,
      setupTypeMOCKONLY: target.setupType,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-panel p-6 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-heading">{setupTypeLabels[target.setupType]}</h2>
            <p className="mt-1 text-sm text-muted">{target.partnerName}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-heading"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CurrencySelect
            label="Destination Country:"
            required
            options={countryOptions}
            value={country}
            onChange={setCountry}
            emptyMessage={`No destination countries enabled for ${target.partnerName} — add some in Manage Partner first.`}
          />
          <CurrencySelect
            label="Symbol:"
            required
            options={symbolOptions}
            value={fields.symbol}
            onChange={handleCurrencyChange}
            emptyMessage={`No transaction currencies enabled for ${target.partnerName} — add some in Manage Partner first.`}
          />
          <TextField
            label="Currency Name:"
            required
            disabled
            value={fields.currencyName}
            onChange={(v) => updateField("currencyName", v)}
          />
          <TextField
            label="Country ISO Code:"
            disabled
            value={fields.countryIsoCode}
            onChange={(v) => updateField("countryIsoCode", v)}
          />
          <TextField
            label="Flag (emoji):"
            disabled
            value={fields.flag}
            onChange={(v) => updateField("flag", v)}
          />
          {fields.symbol && (
            <p className="sm:col-span-2 -mt-2 text-xs text-muted">
              {matchedCurrency
                ? `Currency name, ISO code and flag are sourced from the Country/Currency setup for ${country}.`
                : `No Country/Currency row on file for ${country} / ${fields.symbol} — ISO code and flag will stay blank until one is added there.`}
            </p>
          )}
          <TextField
            label="Unit:"
            value={String(fields.unit)}
            onChange={(v) => updateField("unit", Number(v) || 0)}
          />
          <TextField
            label="Buying:"
            value={String(fields.buying)}
            onChange={(v) => updateField("buying", Number(v) || 0)}
          />
          <TextField
            label="Selling:"
            value={String(fields.selling)}
            onChange={(v) => updateField("selling", Number(v) || 0)}
          />
          <div className="flex items-end pb-2.5">
            <Checkbox checked={active} onToggle={() => setActive((prev) => !prev)} label="Active" />
          </div>

          {error && (
            <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="sm:col-span-2 mt-1 flex items-center gap-3 border-t border-border pt-4">
            <Button type="submit" loading={saving} disabled={!country || !fields.symbol}>
              {saving ? "Saving..." : "Save Setup"}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
