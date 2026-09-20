"use client";

import { useEffect, useState } from "react";
import { Search, Send, X } from "lucide-react";
import Button from "./Button";
import TextField from "./TextField";
import SelectField from "./SelectField";
import CurrencySelect from "./CurrencySelect";
import { useRates } from "@/contexts/RatesContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useAuth } from "@/contexts/AuthContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { formatDate } from "@/lib/format";
import {
  emptyPartnerOfferRateInsertPayload,
  quoteTypeValues,
  directQuoteFromLegs,
  type PartnerOfferRateInsertPayload,
  type PartnerOfferRateLookupPayload,
  type PartnerOfferRateRecord,
} from "@/data/partnerOfferRateData";
import {
  commissionTypeValues,
  remittanceTypeOptions,
  emptyCommissionPayload,
  type CommissionUpsertPayload,
} from "@/data/partnerCommissionData";
import { settlementCurrencyOptions, normalizedPartnerName } from "@/data/partnerData";
import type { PayoutPartnerWiseKind } from "@/data/tabRegistry";

// obtainRemittancePartnerRates (GET latest CONFIRMED) takes one
// sendCurrency/destCountry pair at a time, not "every rate for this
// partner" — so the approved-rates table is built by looking up every
// corridor this partner is actually enabled for (txnCurrencies ×
// destCountries, the same scoping ExchangeRateSetupModal uses for 3rd Party
// API Agent wise) and keeping whichever pairs come back with a rate on file.
function wideDateRange() {
  return { fromDate: "2000-01-01", toDate: new Date().toISOString().slice(0, 10) };
}

// Tab-page version of the Payout Partner Wise setup — opened one tab per
// partner+kind (see data/tabRegistry.tsx's payoutPartnerWiseTabKey) rather
// than a modal, so an admin can flip between several partners' views without
// losing their place. `mode` picks which section renders: "rate" (approved
// offer rates + propose, opened from Exchange Rates) or "service-charge"
// (the Commission-backed Service Charge Setup form only, opened from
// Service Charges) — never both, since each button represents a distinct
// admin intent even though they share this one partner-scoped page.
export default function PayoutPartnerOfferRatePanel({
  partnerName,
  mode,
}: {
  partnerName: string;
  mode: PayoutPartnerWiseKind;
}) {
  const { isLive } = useDataMode();
  const { user } = useAuth();
  const { entries: partners } = usePartners();
  const { lookupCurrentPartnerOfferRate, insertOfferRate, saveCommission } = useRates();

  const [rows, setRows] = useState<PartnerOfferRateRecord[]>([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [showProposeForm, setShowProposeForm] = useState(false);
  const [form, setForm] = useState<PartnerOfferRateInsertPayload>(emptyPartnerOfferRateInsertPayload());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Tracked as raw text, separate from form.sendCurrencyPerUsd/receiveCurrencyPerUsd/
  // directQuote (which stay numbers for the payload) — a controlled input whose
  // value is String(someNumberState) snaps back the instant you type a trailing
  // "." (String(Number("148.")) === "148"), which makes it impossible to ever
  // type a decimal at all. These hold exactly what was typed; the number field
  // is only parsed out on change, not fed back into the displayed value.
  const [sendPerUsdInput, setSendPerUsdInput] = useState("0");
  const [receivePerUsdInput, setReceivePerUsdInput] = useState("0");
  const [directQuoteInput, setDirectQuoteInput] = useState("0");

  // Narrows the table to one corridor/date range via obtainRemittancePartnerRates
  // directly, rather than the full sweep across every enabled corridor below —
  // useful for checking a specific window (e.g. "was this confirmed before X")
  // that the wide-open default sweep can't answer. Filtered out of the sweep
  // view entirely while active; "Clear" reverts to it.
  const [filter, setFilter] = useState<PartnerOfferRateLookupPayload>({
    userName: partnerName,
    sendCurrency: "",
    destCountry: "",
    fromDate: "",
    toDate: "",
  });
  const [filterActive, setFilterActive] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterResult, setFilterResult] = useState<PartnerOfferRateRecord | null>(null);

  // Service Charge setup (insertOrUpdateRemittancePartnerCommission) — same
  // endpoint as the standalone Partner Commission tab, but scoped to this
  // partner: userName is fixed to partnerName rather than a dropdown, since
  // we're already inside that partner's own tab.
  const [commissionForm, setCommissionForm] = useState<CommissionUpsertPayload>(emptyCommissionPayload());
  const [commissionSaving, setCommissionSaving] = useState(false);
  const [commissionError, setCommissionError] = useState<string | null>(null);
  const [commissionSavedAt, setCommissionSavedAt] = useState<string | null>(null);

  const partnerEntry = partners.find(
    (p) => normalizedPartnerName(p.partnerName) === normalizedPartnerName(partnerName)
  );
  // Kept scoped to the partner's enabled txnCurrencies — NOT used for the
  // Send Currency form fields below (those show every currency now), only
  // for bounding the approved-rate sweep to corridors actually worth
  // checking, so it doesn't fire one lookup per currency × country.
  const sendCurrencyOptions = partnerEntry?.txnCurrencies ?? [];
  const destCountryOptions = partnerEntry?.destCountries ?? [];
  const hasKnownCorridors = sendCurrencyOptions.length > 0 && destCountryOptions.length > 0;
  const hasDestCountry = destCountryOptions.length > 0;

  useEffect(() => {
    setForm({
      ...emptyPartnerOfferRateInsertPayload(),
      remittancePartner: partnerName,
      sendCurrency: settlementCurrencyOptions[0],
      destCountry: destCountryOptions[0] ?? "",
    });
    setSendPerUsdInput("0");
    setReceivePerUsdInput("0");
    setDirectQuoteInput("0");
    setFilter({
      userName: partnerName,
      sendCurrency: settlementCurrencyOptions[0],
      destCountry: destCountryOptions[0] ?? "",
      fromDate: "",
      toDate: "",
    });
    setFilterActive(false);
    setFilterResult(null);
    setCommissionForm({
      ...emptyCommissionPayload(),
      userName: partnerName,
      sendCurrency: settlementCurrencyOptions[0],
      destinationCountry: destCountryOptions[0] ?? "",
    });
    setCommissionError(null);
    setCommissionSavedAt(null);

    // Skip the approved-rate sweep entirely in service-charge mode — it's
    // not shown there, so there's no reason to fire a call per corridor.
    if (mode !== "rate" || !hasKnownCorridors) {
      setRows([]);
      return;
    }

    let cancelled = false;
    setRowsLoading(true);
    const { fromDate, toDate } = wideDateRange();
    Promise.all(
      destCountryOptions.flatMap((destCountry) =>
        sendCurrencyOptions.map((sendCurrency) =>
          lookupCurrentPartnerOfferRate({ userName: partnerName, sendCurrency, destCountry, fromDate, toDate })
        )
      )
    ).then((results) => {
      if (cancelled) return;
      setRows(results.filter((rate): rate is PartnerOfferRateRecord => rate !== null));
      setRowsLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerName, mode, sendCurrencyOptions.join(","), destCountryOptions.join(",")]);

  function updateField<K extends keyof PartnerOfferRateInsertPayload>(
    field: K,
    value: PartnerOfferRateInsertPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateFilterField<K extends keyof PartnerOfferRateLookupPayload>(
    field: K,
    value: PartnerOfferRateLookupPayload[K]
  ) {
    setFilter((prev) => ({ ...prev, [field]: value }));
  }

  async function handleFilterSearch(event: React.FormEvent) {
    event.preventDefault();
    setFilterLoading(true);
    setFilterActive(true);
    const record = await lookupCurrentPartnerOfferRate(filter);
    setFilterResult(record);
    setFilterLoading(false);
  }

  function clearFilter() {
    setFilterActive(false);
    setFilterResult(null);
  }

  function updateCommissionField<K extends keyof CommissionUpsertPayload>(
    field: K,
    value: CommissionUpsertPayload[K]
  ) {
    setCommissionForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveCommission(event: React.FormEvent) {
    event.preventDefault();
    setCommissionError(null);
    setCommissionSavedAt(null);
    setCommissionSaving(true);
    const ok = await saveCommission({ ...commissionForm, userName: partnerName });
    setCommissionSaving(false);
    if (!ok) {
      setCommissionError("Could not save the service charge. Please try again.");
      return;
    }
    setCommissionSavedAt(new Date().toISOString());
  }

  async function handlePropose(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    const record = await insertOfferRate({ ...form, remittancePartner: partnerName, makerUser: user?.name ?? "" });
    setSubmitting(false);
    if (!record) {
      setSubmitError("Could not submit the offer rate. Please try again.");
      return;
    }
    setSubmittedId(record.uniqueId);
    setShowProposeForm(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {mode === "rate" && (
      <>
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Payout Partner Wise</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — approved rates for{" "}
            <span className="font-medium text-heading">{partnerName}</span>.
          </p>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          {submittedId && (
            <p className="mb-4 rounded-lg bg-brand-green-light px-3 py-2 text-sm text-brand-green-dark">
              Submitted as <span className="font-semibold">{submittedId}</span> — now pending a different user&apos;s
              approval.
            </p>
          )}

          <form
            onSubmit={handleFilterSearch}
            className="mb-5 grid grid-cols-1 gap-x-4 gap-y-4 rounded-xl border border-border bg-surface p-4 sm:grid-cols-4"
          >
            <CurrencySelect
              label="Send Currency:"
              required
              options={settlementCurrencyOptions}
              value={filter.sendCurrency}
              onChange={(v) => updateFilterField("sendCurrency", v)}
            />
            <CurrencySelect
              label="Destination Country:"
              required
              options={destCountryOptions}
              value={filter.destCountry}
              onChange={(v) => updateFilterField("destCountry", v)}
              emptyMessage={`No destination countries enabled for ${partnerName} yet.`}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">From Date:</label>
              <input
                type="date"
                required
                value={filter.fromDate}
                onChange={(event) => updateFilterField("fromDate", event.target.value)}
                className="w-full rounded-xl border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">To Date:</label>
              <input
                type="date"
                required
                value={filter.toDate}
                onChange={(event) => updateFilterField("toDate", event.target.value)}
                className="w-full rounded-xl border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-4">
              <Button type="submit" variant="secondary" size="sm" loading={filterLoading} icon={<Search size={13} />} disabled={!hasDestCountry}>
                {filterLoading ? "Searching..." : "Search This Corridor"}
              </Button>
              {filterActive && (
                <Button type="button" variant="secondary" size="sm" onClick={clearFilter} icon={<X size={13} />}>
                  Clear — Show All
                </Button>
              )}
            </div>
          </form>

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Send / Receive</th>
                    <th className="px-4 py-3">Dest. Country</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Confirmed By</th>
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {(filterActive ? (filterResult ? [filterResult] : []) : rows).map((rate) => (
                    <tr key={rate.id} className="border-b border-border bg-panel last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">
                        {rate.sendCurrency} → {rate.receiveCurrency}
                      </td>
                      <td className="px-4 py-3 text-heading/80">{rate.destCountry}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.rate || rate.directQuote}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.checkerUser || "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-heading/80">
                        {formatDate(rate.updatedDateTime)}
                      </td>
                    </tr>
                  ))}

                  {(filterActive ? filterLoading : rowsLoading) && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                        Loading approved rates...
                      </td>
                    </tr>
                  )}

                  {!filterActive && !rowsLoading && rows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                        {hasKnownCorridors
                          ? "No approved rates yet for this partner's enabled corridors."
                          : "No transaction currencies/destination countries enabled for this partner yet — add some in Manage Partner first."}
                      </td>
                    </tr>
                  )}

                  {filterActive && !filterLoading && !filterResult && (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                        No confirmed rate found for {filter.sendCurrency} / {filter.destCountry} in that date range.
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
          <h2 className="text-base font-bold text-heading">Propose New Rate</h2>
        </div>
        <div className="bg-panel p-6 sm:p-8">
          {!showProposeForm ? (
            <Button type="button" onClick={() => setShowProposeForm(true)} icon={<Send size={15} />}>
              Propose New Rate
            </Button>
          ) : (
            <form onSubmit={handlePropose} className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-3">
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
              <CurrencySelect
                label="Destination Country:"
                required
                options={destCountryOptions}
                value={form.destCountry}
                onChange={(v) => updateField("destCountry", v)}
                emptyMessage={`No destination countries enabled for ${partnerName} — add some in Manage Partner first.`}
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
                <div className="flex items-center gap-3">
                  <Button type="submit" loading={submitting} disabled={!hasDestCountry}>
                    {submitting ? "Submitting..." : "Submit for Approval"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowProposeForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
      </>
      )}

      {mode === "service-charge" && (
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-heading">Service Charge Setup</h2>
          <p className="mt-0.5 text-sm text-muted">
            insertOrUpdateRemittancePartnerCommission for{" "}
            <span className="font-medium text-heading">{partnerName}</span>.
          </p>
        </div>
        <form
          onSubmit={handleSaveCommission}
          className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-3 sm:p-8"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Partner:</label>
            <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-heading">
              {partnerName}
            </p>
          </div>
          <TextField
            label="Rate:"
            required
            value={String(commissionForm.commissionRate)}
            onChange={(v) => updateCommissionField("commissionRate", Number(v) || 0)}
          />
          <SelectField
            label="Type:"
            options={commissionTypeValues}
            defaultValue={commissionTypeValues[0]}
            value={commissionForm.commissionType}
            onChange={(v) => updateCommissionField("commissionType", v as CommissionUpsertPayload["commissionType"])}
          />
          <TextField
            label="Service:"
            required
            value={commissionForm.service}
            onChange={(v) => updateCommissionField("service", v)}
          />
          <CurrencySelect
            label="Send Currency:"
            required
            options={settlementCurrencyOptions}
            value={commissionForm.sendCurrency}
            onChange={(v) => updateCommissionField("sendCurrency", v)}
          />
          <CurrencySelect
            label="Destination Country:"
            required
            options={destCountryOptions}
            value={commissionForm.destinationCountry}
            onChange={(v) => updateCommissionField("destinationCountry", v)}
            emptyMessage={`No destination countries enabled for ${partnerName} — add some in Manage Partner first.`}
          />
          <SelectField
            label="Remittance Type:"
            required
            options={remittanceTypeOptions}
            defaultValue={remittanceTypeOptions[0]}
            value={commissionForm.remittanceType}
            onChange={(v) => updateCommissionField("remittanceType", v)}
          />

          <div className="sm:col-span-3 mt-2 border-t border-border pt-5">
            {commissionError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{commissionError}</p>
            )}
            {commissionSavedAt && (
              <p className="mb-3 rounded-lg bg-brand-green-light px-3 py-2 text-sm text-brand-green-dark">
                Service charge saved for {partnerName}.
              </p>
            )}
            <Button type="submit" loading={commissionSaving} disabled={!hasDestCountry}>
              {commissionSaving ? "Saving..." : "Save Service Charge"}
            </Button>
          </div>
        </form>
      </div>
      )}
    </div>
  );
}
