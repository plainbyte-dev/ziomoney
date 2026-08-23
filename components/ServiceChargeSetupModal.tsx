"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import SelectField from "./SelectField";
import CurrencySelect from "./CurrencySelect";
import Checkbox from "./Checkbox";
import {
  deliveryOptionValues,
  type ServiceChargeRecord,
  type ServiceChargeUpsertPayload,
} from "@/data/serviceChargeData";
import { setupTypeLabels, type SetupType } from "@/data/setupTypeData";

export interface ServiceChargeSetupTarget {
  country: string;
  partnerName: string;
  setupType: SetupType;
}

export default function ServiceChargeSetupModal({
  target,
  existing,
  countrySymbolOptions,
  saving,
  error,
  onCancel,
  onSave,
}: {
  target: ServiceChargeSetupTarget | null;
  existing: ServiceChargeRecord | undefined;
  countrySymbolOptions: string[];
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (payload: ServiceChargeUpsertPayload) => void;
}) {
  const [countrySymbol, setCountrySymbol] = useState("");
  const [deliveryOption, setDeliveryOption] = useState(deliveryOptionValues[0]);
  const [active, setActive] = useState(true);

  // Re-seed the form every time a different row/scope is opened, from
  // whatever service charge already exists for that exact country+partner+
  // scope combination — otherwise the previous modal's edits would leak in.
  useEffect(() => {
    if (!target) return;
    setCountrySymbol(existing?.countrySymbol ?? "");
    setDeliveryOption(existing?.deliveryOption ?? deliveryOptionValues[0]);
    setActive(existing?.active ?? true);
  }, [target, existing]);

  if (!target) return null;

  const appliesToAllPartners = target.setupType === "COUNTRY";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!target) return;
    onSave({
      id: existing?.id ?? 0,
      countrySymbol,
      agentName: appliesToAllPartners ? "" : target.partnerName,
      deliveryOption,
      active,
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

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <CurrencySelect
            label="Country / Currency:"
            required
            options={countrySymbolOptions}
            value={countrySymbol}
            onChange={setCountrySymbol}
            emptyMessage="No currencies found — import one under Country / Currency first."
          />
          {!appliesToAllPartners && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Partner Name:</label>
              <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-heading">
                {target.partnerName}
              </p>
            </div>
          )}
          <SelectField
            label="Delivery Option:"
            options={deliveryOptionValues}
            defaultValue={deliveryOptionValues[0]}
            value={deliveryOption}
            onChange={setDeliveryOption}
          />
          <Checkbox checked={active} onToggle={() => setActive((prev) => !prev)} label="Active" />

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

          <div className="mt-1 flex items-center gap-3 border-t border-border pt-4">
            <Button type="submit" loading={saving} disabled={!countrySymbol}>
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
