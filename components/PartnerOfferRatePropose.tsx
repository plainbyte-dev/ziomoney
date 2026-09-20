"use client";

import { useEffect, useState } from "react";
import { useRates } from "@/contexts/RatesContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useAuth } from "@/contexts/AuthContext";
import TextField from "./TextField";
import SelectField from "./SelectField";
import CurrencySelect from "./CurrencySelect";
import Button from "./Button";
import {
  emptyPartnerOfferRateInsertPayload,
  quoteTypeValues,
  directQuoteFromLegs,
  type PartnerOfferRateInsertPayload,
} from "@/data/partnerOfferRateData";
import { settlementCurrencyOptions, partnerCountrySelectOptions } from "@/data/partnerData";

export default function PartnerOfferRatePropose() {
  const { user } = useAuth();
  const { insertOfferRate } = useRates();
  const { entries: partners } = usePartners();

  const [form, setForm] = useState<PartnerOfferRateInsertPayload>(emptyPartnerOfferRateInsertPayload());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);

  // Tracked as raw text, separate from form.sendCurrencyPerUsd/receiveCurrencyPerUsd/
  // directQuote (which stay numbers for the payload) — a controlled input whose
  // value is String(someNumberState) snaps back the instant you type a trailing
  // "." (String(Number("148.")) === "148"), which makes it impossible to ever
  // type a decimal at all. These hold exactly what was typed; the number field
  // is only parsed out on change, not fed back into the displayed value.
  const [sendPerUsdInput, setSendPerUsdInput] = useState("0");
  const [receivePerUsdInput, setReceivePerUsdInput] = useState("0");
  const [directQuoteInput, setDirectQuoteInput] = useState("0");

  const partnerOptions = partners.map((p) => p.partnerName);

  // The partner list loads asynchronously, so the dropdown's options aren't
  // known at form-init time — backfill once they arrive rather than leaving
  // the select visually showing an option the form state doesn't agree with.
  useEffect(() => {
    if (partnerOptions.length === 0) return;
    setForm((prev) => (prev.remittancePartner ? prev : { ...prev, remittancePartner: partnerOptions[0] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerOptions.length]);

  function updateField<K extends keyof PartnerOfferRateInsertPayload>(
    field: K,
    value: PartnerOfferRateInsertPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setLastSubmittedId(null);
    setSubmitting(true);
    // makerUser is never a form field — always the signed-in user, set here
    // at submit time.
    const record = await insertOfferRate({ ...form, makerUser: user?.name ?? "" });
    setSubmitting(false);
    if (!record) {
      setSubmitError("Could not submit the offer rate. Please try again.");
      return;
    }
    setLastSubmittedId(record.uniqueId);
    setForm(emptyPartnerOfferRateInsertPayload());
    setSendPerUsdInput("0");
    setReceivePerUsdInput("0");
    setDirectQuoteInput("0");
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Propose Offer Rate</h1>
        <p className="mt-0.5 text-sm text-muted">
          Submitted as <span className="font-medium text-heading">{user?.name ?? "you"}</span> — pending a
          different user&apos;s approval.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-3 sm:p-8">
        {partnerOptions.length > 0 ? (
          <SelectField
            label="Remittance Partner:"
            required
            options={partnerOptions}
            defaultValue={partnerOptions[0]}
            value={form.remittancePartner}
            onChange={(v) => updateField("remittancePartner", v)}
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Remittance Partner:</label>
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
        <CurrencySelect
          label="Receive Currency:"
          required
          options={settlementCurrencyOptions}
          value={form.receiveCurrency}
          onChange={(v) => updateField("receiveCurrency", v)}
        />
        <SelectField
          label="Destination Country:"
          required
          options={partnerCountrySelectOptions}
          defaultValue={partnerCountrySelectOptions[0]}
          value={form.destCountry}
          onChange={(v) => updateField("destCountry", v)}
        />
        <SelectField
          label="Quote Type:"
          options={quoteTypeValues}
          defaultValue={quoteTypeValues[0]}
          value={form.quoteType}
          onChange={(v) => updateField("quoteType", v as PartnerOfferRateInsertPayload["quoteType"])}
        />
        <TextField
          label="Send Currency per USD:"
          required
          placeholder="e.g. 148.25"
          value={sendPerUsdInput}
          onChange={(v) => {
            setSendPerUsdInput(v);
            const sendPerUsd = parseFloat(v) || 0;
            updateField("sendCurrencyPerUsd", sendPerUsd);
            const directQuote = directQuoteFromLegs(sendPerUsd, parseFloat(receivePerUsdInput) || 0);
            setDirectQuoteInput(String(directQuote));
            updateField("directQuote", directQuote);
          }}
        />
        <TextField
          label="Receive Currency per USD:"
          required
          placeholder="e.g. 83.1"
          value={receivePerUsdInput}
          onChange={(v) => {
            setReceivePerUsdInput(v);
            const receivePerUsd = parseFloat(v) || 0;
            updateField("receiveCurrencyPerUsd", receivePerUsd);
            const directQuote = directQuoteFromLegs(parseFloat(sendPerUsdInput) || 0, receivePerUsd);
            setDirectQuoteInput(String(directQuote));
            updateField("directQuote", directQuote);
          }}
        />
        <TextField label="Direct Quote:" disabled value={directQuoteInput} />
        <p className="sm:col-span-3 -mt-2 text-xs text-muted">
          Direct Quote is calculated automatically as Receive Currency per USD ÷ Send Currency per USD.
        </p>

        <div className="sm:col-span-3 mt-2 border-t border-border pt-5">
          {submitError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
          )}
          {lastSubmittedId && (
            <p className="mb-3 rounded-lg bg-brand-green-light px-3 py-2 text-sm text-brand-green-dark">
              Submitted as <span className="font-semibold">{lastSubmittedId}</span> — now pending approval.
            </p>
          )}
          <Button type="submit" loading={submitting}>
            {submitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>
      </form>
    </div>
  );
}
