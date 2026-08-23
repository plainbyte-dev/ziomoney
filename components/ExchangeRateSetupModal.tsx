"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import TextField from "./TextField";
import Checkbox from "./Checkbox";
import type { ExchangeRateRecord, ExchangeRateUpsertPayload } from "@/data/exchangeRateData";
import { setupTypeLabels, type SetupType } from "@/data/setupTypeData";

export interface ExchangeRateSetupTarget {
  country: string;
  partnerName: string;
  setupType: SetupType;
}

const emptyRateFields = { symbol: "", currencyName: "", unit: 1, buying: 0, selling: 0, flag: "", countryIsoCode: "" };

export default function ExchangeRateSetupModal({
  target,
  existing,
  saving,
  error,
  onCancel,
  onSave,
}: {
  target: ExchangeRateSetupTarget | null;
  existing: ExchangeRateRecord | undefined;
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (payload: ExchangeRateUpsertPayload) => void;
}) {
  const [fields, setFields] = useState(emptyRateFields);
  const [active, setActive] = useState(true);

  // Re-seed every time a different row/scope is opened, from whatever rate
  // already exists for that exact country+partner+scope combination.
  useEffect(() => {
    if (!target) return;
    setFields({
      symbol: existing?.symbol ?? "",
      currencyName: existing?.currencyName ?? "",
      unit: existing?.unit ?? 1,
      buying: existing?.buying ?? 0,
      selling: existing?.selling ?? 0,
      flag: existing?.flag ?? "",
      countryIsoCode: existing?.countryIsoCode ?? "",
    });
    setActive(existing?.active ?? true);
  }, [target, existing]);

  if (!target) return null;

  const appliesToAllPartners = target.setupType === "COUNTRY";

  function updateField<K extends keyof typeof emptyRateFields>(key: K, value: (typeof emptyRateFields)[K]) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!target) return;
    onSave({
      ...fields,
      countryName: target.country,
      priority: existing?.priority ?? 0,
      active,
      partnerNameMOCKONLY: appliesToAllPartners ? "" : target.partnerName,
      setupTypeMOCKONLY: target.setupType,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-panel p-6 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-heading">{setupTypeLabels[target.setupType]}</h2>
            <p className="mt-1 text-sm text-muted">
              {target.country} — {appliesToAllPartners ? "applies to every partner in this country" : target.partnerName}
            </p>
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
          <TextField label="Symbol:" required value={fields.symbol} onChange={(v) => updateField("symbol", v)} />
          <TextField
            label="Currency Name:"
            required
            value={fields.currencyName}
            onChange={(v) => updateField("currencyName", v)}
          />
          <TextField
            label="Country ISO Code:"
            value={fields.countryIsoCode}
            onChange={(v) => updateField("countryIsoCode", v)}
          />
          <TextField label="Flag (emoji):" value={fields.flag} onChange={(v) => updateField("flag", v)} />
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
            <Button type="submit" loading={saving} disabled={!fields.symbol}>
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
