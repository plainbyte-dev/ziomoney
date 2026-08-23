"use client";

import { useState } from "react";
import TextField from "./TextField";
import SelectField from "./SelectField";
import CurrencySelect from "./CurrencySelect";
import Checkbox from "./Checkbox";
import RadioPill from "./RadioPill";
import Button from "./Button";
import { useTabs } from "@/contexts/TabsContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { insertRemittancePartner } from "@/lib/partnersApi";
import {
  partnerCountrySelectOptions,
  remitterTypeOptions,
  settlementCurrencyOptions,
  type PartnerEntry,
} from "@/data/partnerData";

// Derives 3 candidate usernames from a partner's display name — userName is
// the new partner's own login/identity, so it can't just BE the partner
// name verbatim (spaces, case, and collisions with an existing partner all
// make that invalid). Each candidate is nudged past any existing collision
// by appending the next free number.
function suggestUsernames(partnerName: string, taken: Set<string>): string[] {
  const words = partnerName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (words.length === 0) return [];

  const full = words.join("");
  const firstLast = words.length > 1 ? words[0] + words[words.length - 1] : full;
  const initials = words.map((w) => w[0]).join("") || full;

  function firstFree(base: string): string {
    if (!taken.has(base)) return base;
    let n = 2;
    while (taken.has(`${base}${n}`)) n += 1;
    return `${base}${n}`;
  }

  const candidates = [firstFree(full), firstFree(firstLast), firstFree(initials)];
  // De-duplicate while preserving order (short partner names can make two
  // of the three derivations collide before the free-number nudge applies).
  return Array.from(new Set(candidates));
}

// POST /api/remittance/insertRemittancePartner — registers a new remittance
// partner. Exactly the confirmed request schema below, nothing more:
// userName, partnerCode, description, partnerCountry, partnerAddress,
// remitterType, settlementCurrency, acceptPartnerPin, apiUser, email.
export default function CreatePartnerUserPanel() {
  const { openTab } = useTabs();
  const { entries, addEntry } = usePartners();
  const { isLive } = useDataMode();

  // "Partner ID" here isn't a request field — insertRemittancePartner has no
  // existing-partner reference, userName IS the new partner's own identity.
  // It's a convenience: pick an existing partner from Partner Info to copy
  // its company-level details into the fields below as a starting point,
  // then edit and save as a distinct new partner.
  const NO_REFERENCE = "-- Select Partner --";
  const referenceOptions = [NO_REFERENCE, ...entries.map((p) => `${p.partnerId} — ${p.partnerName}`)];
  const referenceByLabel = new Map(entries.map((p) => [`${p.partnerId} — ${p.partnerName}`, p]));
  const [referenceLabel, setReferenceLabel] = useState(NO_REFERENCE);

  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [description, setDescription] = useState("");
  const [partnerCountry, setPartnerCountry] = useState(partnerCountrySelectOptions[0]);
  const [partnerAddress, setPartnerAddress] = useState("");
  const [remitterType, setRemitterType] = useState(remitterTypeOptions[0]);
  const [settlementCurrency, setSettlementCurrency] = useState(settlementCurrencyOptions[0]);
  const [acceptPartnerPin, setAcceptPartnerPin] = useState(false);
  const [apiUser, setApiUser] = useState(false);
  const [email, setEmail] = useState("");

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetches the selected reference partner's own details and fills every
  // company-level field with them — partnerCode included, straight from
  // that partner's record rather than typed by hand. userName/email are
  // left alone since those identify the NEW partner being created, not the
  // one being copied from.
  function handleReferenceSelect(label: string) {
    setReferenceLabel(label);
    const partner = referenceByLabel.get(label);
    if (!partner) {
      setUsernameSuggestions([]);
      return;
    }

    setPartnerCode(partner.partnerId);
    setDescription(partner.description ?? "");
    const matchedCountry = partnerCountrySelectOptions.find(
      (option) => option.toUpperCase() === partner.country.toUpperCase()
    );
    if (matchedCountry) setPartnerCountry(matchedCountry);
    setPartnerAddress(partner.partnerAddress ?? "");
    const matchedType = remitterTypeOptions.find(
      (option) => option.toLowerCase() === partner.partnerType.toLowerCase()
    );
    if (matchedType) setRemitterType(matchedType);
    if (partner.settlementCurrency) setSettlementCurrency(partner.settlementCurrency);

    const taken = new Set(entries.map((p) => p.partnerName.toLowerCase().replace(/[^a-z0-9]+/g, "")));
    const suggestions = suggestUsernames(partner.partnerName, taken);
    setUsernameSuggestions(suggestions);
    setUserName(suggestions[0] ?? "");
  }

  const canSave = userName.trim().length > 0 && partnerCode.trim().length > 0 && partnerAddress.trim().length > 0;

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!canSave) return;
    setSaveError(null);
    setSaving(true);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const entry: PartnerEntry = {
        id: String(11000000 + entries.length + 1),
        partnerName: userName,
        partnerId: partnerCode,
        country: partnerCountry.toUpperCase(),
        partnerType: remitterType,
        creditLimit: 0,
        hasBank: false,
        blocked: false,
        email,
        acceptPartnerPin,
        description,
        partnerAddress,
        settlementCurrency,
        apiUser,
        balance: 0,
        registeredDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      };
      addEntry(entry);
      setSaving(false);
      openTab({ key: "partner-info", title: "Partner Info" });
      return;
    }

    const response = await insertRemittancePartner({
      userName,
      partnerCode,
      description,
      partnerCountry,
      partnerAddress,
      remitterType,
      settlementCurrency,
      acceptPartnerPin,
      apiUser,
      email,
    });

    setSaving(false);
    if (!response.success || !response.data) {
      setSaveError(response.message || "Could not create the partner. Please try again.");
      return;
    }

    addEntry({
      id: String(response.data.id),
      partnerName: response.data.userName,
      partnerId: response.data.partnerCode,
      country: response.data.partnerCountry.toUpperCase(),
      partnerType: response.data.remitterType,
      creditLimit: response.data.accountBalance,
      hasBank: false,
      blocked: false,
      email: response.data.email,
      acceptPartnerPin: response.data.acceptPartnerPin,
      description: response.data.description,
      partnerAddress: response.data.partnerAddress,
      settlementCurrency: response.data.settlementCurrency,
      apiUser: response.data.apiUser,
      balance: response.data.balance,
      registeredDate: response.data.registeredDate,
      updatedDate: response.data.updatedDate,
    });
    openTab({ key: "partner-info", title: "Partner Info" });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Create Partner User</h1>
        <p className="mt-0.5 text-sm text-muted">
          {isLive ? "Live remittance API" : "Static demo data"} — registers a new remittance partner via POST
          /insertRemittancePartner.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-panel p-6 sm:p-8">
        <div className="mb-6 max-w-3xl rounded-xl border border-dashed border-border bg-surface p-4">
          <SelectField
            label="Partner ID: (copy details from an existing partner, optional)"
            options={referenceOptions}
            defaultValue={NO_REFERENCE}
            value={referenceLabel}
            onChange={handleReferenceSelect}
          />
          <p className="mt-1.5 text-xs text-muted">
            Picking a partner fetches its Partner Code, Description, Country, Address, Remitter Type and
            Settlement Currency into the fields below — edit anything before saving this as a new partner.
          </p>
        </div>
        <div className="grid max-w-3xl grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <TextField label="User Name:" required value={userName} onChange={setUserName} />
            {usernameSuggestions.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="text-xs text-muted">Suggested:</span>
                {usernameSuggestions.map((suggestion) => (
                  <RadioPill
                    key={suggestion}
                    label={suggestion}
                    checked={userName === suggestion}
                    onSelect={() => setUserName(suggestion)}
                  />
                ))}
              </div>
            )}
          </div>
          <TextField label="Partner Code:" required value={partnerCode} onChange={setPartnerCode} />
          <TextField label="Description:" value={description} onChange={setDescription} />
          <SelectField
            label="Partner Country:"
            options={partnerCountrySelectOptions}
            defaultValue={partnerCountrySelectOptions[0]}
            value={partnerCountry}
            onChange={setPartnerCountry}
          />
          <TextField label="Partner Address:" required value={partnerAddress} onChange={setPartnerAddress} />
          <SelectField
            label="Remitter Type:"
            options={remitterTypeOptions}
            defaultValue={remitterTypeOptions[0]}
            value={remitterType}
            onChange={setRemitterType}
          />
          <CurrencySelect
            label="Settlement Currency:"
            options={[...settlementCurrencyOptions]}
            value={settlementCurrency}
            onChange={setSettlementCurrency}
          />
          <TextField label="Email:" value={email} onChange={setEmail} />
          <div className="flex items-center gap-6 pb-2.5 sm:col-span-2">
            <Checkbox checked={acceptPartnerPin} onToggle={() => setAcceptPartnerPin((v) => !v)} label="Accept Partner PIN" />
            <Checkbox checked={apiUser} onToggle={() => setApiUser((v) => !v)} label="API User" />
          </div>
        </div>

        <div className="mt-6 max-w-3xl border-t border-border pt-5">
          {saveError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>}
          <Button type="submit" loading={saving} disabled={!canSave}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <p className="mt-2 text-xs text-red-500">* are required fields</p>
        </div>
      </form>
    </div>
  );
}
