"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";
import SelectField from "./SelectField";
import CurrencySelect, { type CurrencySelectOption } from "./CurrencySelect";
import Checkbox from "./Checkbox";
import {
  deliveryOptionValues,
  type ServiceChargeRecord,
  type ServiceChargeUpsertPayload,
} from "@/data/serviceChargeData";
import { setupTypeLabels, type SetupType } from "@/data/setupTypeData";
import { normalizedPartnerName, type PartnerEntry } from "@/data/partnerData";

export interface ServiceChargeSetupTarget {
  partnerName: string;
  setupType: SetupType;
}

export default function ServiceChargeSetupModal({
  target,
  existing,
  countrySymbolOptions,
  partners,
  saving,
  error,
  onCancel,
  onSave,
}: {
  target: ServiceChargeSetupTarget | null;
  existing: ServiceChargeRecord | undefined;
  countrySymbolOptions: CurrencySelectOption[];
  partners: PartnerEntry[];
  saving: boolean;
  error: string | null;
  onCancel: () => void;
  onSave: (payload: ServiceChargeUpsertPayload) => void;
}) {
  const [country, setCountry] = useState("");
  const [countrySymbol, setCountrySymbol] = useState("");
  const [deliveryOption, setDeliveryOption] = useState(deliveryOptionValues[0]);
  const [active, setActive] = useState(true);

  const partnerEntry = target
    ? partners.find((p) => normalizedPartnerName(p.partnerName) === normalizedPartnerName(target.partnerName))
    : undefined;

  // Re-seed the form every time a different row/scope is opened, from
  // whatever service charge already exists for that exact partner+scope
  // combination — otherwise the previous modal's edits would leak in. The
  // destination country picker (Payout Partner Wise / 3rd Party API Agent
  // wise only) defaults to the partner's first enabled destination country —
  // it's informational only here, since ServiceChargeUpsertPayload has no
  // country field of its own to save it into.
  useEffect(() => {
    if (!target) return;
    setCountry(partnerEntry?.destCountries?.[0] ?? "");
    setCountrySymbol(existing?.countrySymbol ?? "");
    setDeliveryOption(existing?.deliveryOption ?? deliveryOptionValues[0]);
    setActive(existing?.active ?? true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, existing, partnerEntry]);

  if (!target) return null;

  const appliesToAllPartners = target.setupType === "COUNTRY";
  const headerCountry = appliesToAllPartners ? partnerEntry?.country ?? "" : country;

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
              {headerCountry ? `${headerCountry} — ` : ""}
              {appliesToAllPartners ? "applies to every partner in this country" : target.partnerName}
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
          {!appliesToAllPartners && (
            <CurrencySelect
              label="Destination Country:"
              required
              options={partnerEntry?.destCountries ?? []}
              value={country}
              onChange={setCountry}
              emptyMessage={`No destination countries enabled for ${target.partnerName} — add some in Manage Partner first.`}
            />
          )}
          <CurrencySelect
            label="Country / Currency:"
            required
            options={countrySymbolOptions}
            value={countrySymbol}
            onChange={setCountrySymbol}
            emptyMessage="No currencies available."
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
            <Button type="submit" loading={saving} disabled={!countrySymbol || (!appliesToAllPartners && !country)}>
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
