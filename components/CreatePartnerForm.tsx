"use client";

import { useState } from "react";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Checkbox from "./Checkbox";
import Button from "./Button";
import { useTabs } from "@/contexts/TabsContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useDataMode } from "@/contexts/DataModeContext";
import {
  insertRemittancePartner,
  insertRemittancePartnerTxnCurrency,
  insertRemittancePayoutPartnerConfiguration,
} from "@/lib/partnersApi";
import {
  partnerCountrySelectOptions,
  remitterTypeOptions,
  settlementCurrencyOptions,
  type PartnerEntry,
} from "@/data/partnerData";
import { emptyPayoutPartnerConfigPayload, type PayoutPartnerConfigPayload } from "@/data/payoutConfigData";

type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Partner Details",
  2: "Transaction Currencies",
  3: "Payout Configuration",
};

// Three separate API calls, in order — steps 2 and 3 need the userName
// step 1 returns, so this is a wizard rather than one form. Once a partner
// exists, Payout Configuration and Balance & Credit Adjustments are the
// re-entry points for changing this data — this screen is one-time setup.
export default function CreatePartnerForm() {
  const { openTab } = useTabs();
  const { entries, addEntry, updateEntry } = usePartners();
  const { isLive } = useDataMode();

  const [step, setStep] = useState<Step>(1);
  const [createdEntry, setCreatedEntry] = useState<PartnerEntry | null>(null);

  // Step 1 — insertRemittancePartner payload fields.
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

  // Step 2 — insertRemittancePartnerTxnCurrency, one call per currency.
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);

  // Step 3 — insertRemittancePayoutPartnerConfiguration.
  const [payoutConfig, setPayoutConfig] = useState<PayoutPartnerConfigPayload>(emptyPayoutPartnerConfigPayload());

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleStep1Submit(event: React.FormEvent) {
    event.preventDefault();
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
      setCreatedEntry(entry);
      setPayoutConfig(emptyPayoutPartnerConfigPayload(userName));
      setSaving(false);
      setStep(2);
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

    const entry: PartnerEntry = {
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
    };

    addEntry(entry);
    setCreatedEntry(entry);
    setPayoutConfig(emptyPayoutPartnerConfigPayload(entry.partnerName));
    setStep(2);
  }

  function toggleCurrency(currency: string) {
    setSelectedCurrencies((prev) =>
      prev.includes(currency) ? prev.filter((c) => c !== currency) : [...prev, currency]
    );
  }

  async function handleStep2Submit(event: React.FormEvent) {
    event.preventDefault();
    if (!createdEntry) return;
    setSaveError(null);

    if (selectedCurrencies.length === 0) {
      setSaveError("Select at least one transaction currency.");
      return;
    }

    setSaving(true);
    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateEntry(createdEntry.id, { txnCurrencies: selectedCurrencies });
      setSaving(false);
      setStep(3);
      return;
    }

    for (const currency of selectedCurrencies) {
      const response = await insertRemittancePartnerTxnCurrency(createdEntry.partnerName, currency);
      if (!response.success) {
        setSaving(false);
        setSaveError(response.message || `Could not add transaction currency ${currency}.`);
        return;
      }
    }
    updateEntry(createdEntry.id, { txnCurrencies: selectedCurrencies });
    setSaving(false);
    setStep(3);
  }

  function updatePayoutField<K extends keyof PayoutPartnerConfigPayload>(field: K, value: PayoutPartnerConfigPayload[K]) {
    setPayoutConfig((prev) => ({ ...prev, [field]: value }));
  }

  async function handleStep3Submit(event: React.FormEvent) {
    event.preventDefault();
    if (!createdEntry) return;
    setSaveError(null);
    setSaving(true);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setSaving(false);
      openTab({ key: "partner-info", title: "Partner Info" });
      return;
    }

    const response = await insertRemittancePayoutPartnerConfiguration(payoutConfig);
    setSaving(false);
    if (!response.success) {
      setSaveError(response.message || "Could not save the payout configuration.");
      return;
    }
    openTab({ key: "partner-info", title: "Partner Info" });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">New Partner</h1>
        <div className="mt-3 flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  s === step
                    ? "bg-brand-green text-white"
                    : s < step
                      ? "bg-brand-green-light text-brand-green-dark"
                      : "bg-surface text-muted"
                }`}
              >
                {s}
              </div>
              <span className={`text-xs ${s === step ? "font-semibold text-heading" : "text-muted"}`}>
                {STEP_LABELS[s]}
              </span>
              {s < 3 && <div className="mx-1 h-px w-6 bg-border" />}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="bg-panel p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <TextField label="User Name:" required value={userName} onChange={setUserName} />
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
            <SelectField
              label="Settlement Currency:"
              options={settlementCurrencyOptions}
              defaultValue={settlementCurrencyOptions[0]}
              value={settlementCurrency}
              onChange={setSettlementCurrency}
            />
            <TextField label="Email:" value={email} onChange={setEmail} />
            <div className="flex items-center gap-6 pb-2.5 sm:col-span-2">
              <Checkbox checked={acceptPartnerPin} onToggle={() => setAcceptPartnerPin((v) => !v)} label="Accept Partner PIN" />
              <Checkbox checked={apiUser} onToggle={() => setApiUser((v) => !v)} label="API User" />
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            {saveError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>}
            <Button type="submit" loading={saving}>
              {saving ? "Saving..." : "Next: Transaction Currencies"}
            </Button>
            <p className="mt-2 text-xs text-red-500">* are required fields</p>
          </div>
        </form>
      )}

      {step === 2 && createdEntry && (
        <form onSubmit={handleStep2Submit} className="bg-panel p-6 sm:p-8">
          <p className="mb-4 text-sm text-heading/70">
            Enable the currencies <span className="font-medium text-heading">{createdEntry.partnerName}</span> can
            transact in.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {settlementCurrencyOptions.map((currency) => (
              <Checkbox
                key={currency}
                checked={selectedCurrencies.includes(currency)}
                onToggle={() => toggleCurrency(currency)}
                label={currency}
              />
            ))}
          </div>
          <div className="mt-6 border-t border-border pt-5">
            {saveError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving}>
                {saving ? "Saving..." : "Next: Payout Configuration"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={saving}>
                Back
              </Button>
            </div>
          </div>
        </form>
      )}

      {step === 3 && createdEntry && (
        <form onSubmit={handleStep3Submit} className="flex flex-col gap-6 bg-panel p-6 sm:p-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-border p-4 sm:grid-cols-3">
            <Checkbox
              checked={payoutConfig.allowCash}
              onToggle={() => updatePayoutField("allowCash", !payoutConfig.allowCash)}
              label="Allow Cash Payout"
              className="sm:col-span-3"
            />
            <TextField
              label="Cash Commission Rate:"
              value={String(payoutConfig.cashPayoutCommissionRate)}
              onChange={(v) => updatePayoutField("cashPayoutCommissionRate", Number(v) || 0)}
            />
            <TextField
              label="Cash Limit:"
              value={String(payoutConfig.cashLimit)}
              onChange={(v) => updatePayoutField("cashLimit", Number(v) || 0)}
            />
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-xl border border-border p-4 sm:grid-cols-3">
            <Checkbox
              checked={payoutConfig.allowAccountCredit}
              onToggle={() => updatePayoutField("allowAccountCredit", !payoutConfig.allowAccountCredit)}
              label="Allow Account Credit Payout"
              className="sm:col-span-3"
            />
            <TextField
              label="Account Commission Rate:"
              value={String(payoutConfig.accountPayoutCommissionRate)}
              onChange={(v) => updatePayoutField("accountPayoutCommissionRate", Number(v) || 0)}
            />
            <TextField
              label="Account Limit:"
              value={String(payoutConfig.accountLimit)}
              onChange={(v) => updatePayoutField("accountLimit", Number(v) || 0)}
            />
          </div>

          <div className="border-t border-border pt-5">
            {saveError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>}
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving}>
                {saving ? "Saving..." : "Finish"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep(2)} disabled={saving}>
                Back
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
