"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import Button from "./Button";
import SelectField from "./SelectField";
import TextField from "./TextField";
import Checkbox from "./Checkbox";
import CurrencySelect from "./CurrencySelect";
import { useDataMode } from "@/contexts/DataModeContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useRates } from "@/contexts/RatesContext";
import { useBeneficiaries } from "@/contexts/BeneficiariesContext";
import { useKyc } from "@/contexts/KycContext";
import { insertTransfer } from "@/lib/transferApi";
import { partnerCountrySelectOptions } from "@/data/partnerData";
import {
  emptyTransferInsertPayload,
  transferPurposeOptions,
  demoTransferRecords,
  type TransferInsertPayload,
  type TransferRecord,
} from "@/data/transferData";
import { formatAccounting } from "@/lib/format";
import { ALLOW_CROSS_CURRENCY_CONVERSION } from "@/config/businessRules";
import {
  convertAmount,
  isCrossCurrencyCorridor,
  resolveFee,
  resolveCommissionRate,
  calculateTransfer,
  HOME_CURRENCY,
  type RateEntry,
} from "@/lib/transferMath";

type Stage = "form" | "done";

const branchNameOptions = ["Head Office"];
const partnerMethodOptions = ["Bank", "Wallet", "Cash"];

type YesNo = "NA" | "YES";

type PartnerSelection = {
  partnerId: string;
  branchName: string;
  country: string;
  method: string;
};

// Only remittance partners of type "Agent" send transactions — the Partner
// ID dropdown below is scoped to those, not the full partner list (which
// also includes Sender/Receiver/SenderReceiver network partners that don't
// originate a send).
const AGENT_PARTNER_TYPE = "Agent";

type TradeRestrictions = {
  northKoreaIran: YesNo;
  governmentPermit: YesNo;
  nameLending: YesNo;
  importingGoods: YesNo;
};

function emptyPartnerSelection(): PartnerSelection {
  return {
    partnerId: "",
    branchName: branchNameOptions[0],
    country: partnerCountrySelectOptions[0],
    method: partnerMethodOptions[0],
  };
}

// Ascending, numeric-aware where possible (e.g. "P2" before "P10") rather
// than a plain lexicographic sort.
function comparePartnerIds(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

function emptyTradeRestrictions(): TradeRestrictions {
  return {
    northKoreaIran: "NA",
    governmentPermit: "NA",
    nameLending: "NA",
    importingGoods: "NA",
  };
}

export default function TransactionSendPanel() {
  const { isLive } = useDataMode();
  const { entries: partners } = usePartners();
  const { countryCurrencies, lookupExchangeRate, serviceCharges, commissions, margins, partnerOfferRates } =
    useRates();

  const agentPartners = partners.filter((p) => p.partnerType === AGENT_PARTNER_TYPE);
  const partnerIdOptions = [...new Set(agentPartners.map((p) => p.partnerId).filter(Boolean))].sort(
    comparePartnerIds
  );
  const currencyOptions = [...new Set(countryCurrencies.map((c) => c.currencyCode).filter(Boolean))].sort();

  const { entries: beneficiaries, entriesLoading: beneficiariesLoading } = useBeneficiaries();
  const { approvedList, listsLoading: kycListsLoading, refreshLists: refreshKycLists } = useKyc();

  // Approved KYCs populate the Sender dropdown below — fetch them on mount
  // rather than relying on the agent having already visited the KYC
  // Approved List tab this session (approvedList otherwise stays whatever
  // KycContext was last left holding, which in live mode starts empty).
  useEffect(() => {
    refreshKycLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  const [form, setForm] = useState<TransferInsertPayload>(emptyTransferInsertPayload());
  const [partnerSelection, setPartnerSelection] = useState<PartnerSelection>(emptyPartnerSelection());
  const [tradeRestrictions, setTradeRestrictions] = useState<TradeRestrictions>(emptyTradeRestrictions());
  const [senderUserName, setSenderUserName] = useState("");
  const [beneficiaryIds, setBeneficiaryIds] = useState<number[]>([]);
  // Per-beneficiary amounts, keyed by beneficiary id. Replaces the old
  // single shared `form.amount` used for every selected beneficiary, which
  // silently multiplied the debit by however many beneficiaries were
  // checked (checking 3 beneficiaries at $500 debited $1,500 with no
  // indication to the agent).
  const [amountsByBeneficiary, setAmountsByBeneficiary] = useState<Record<number, number>>({});
  const [stage, setStage] = useState<Stage>("form");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [results, setResults] = useState<TransferRecord[]>([]);

  const selectedPartner = agentPartners.find((p) => p.partnerId === partnerSelection.partnerId);

  // NOTE: KycResponse's real field is `kycStatus`, not `status`. If
  // KycContext maps the raw API response before storing it, this must read
  // whatever field name that mapping actually produces — confirm that
  // adapter exists. Reading the wrong field here silently returns an empty
  // list against live data (filter never matches) while still working
  // fine against hand-rolled demo data that happens to use `status`.
  const verifiedSenders = approvedList.filter((k) => k.status === "VERIFIED");
  const selectedSender = verifiedSenders.find((k) => k.userName === senderUserName);

  // Rates keyed by currency code (never by "NPR" — see convertAmount).
  const [estimatedRates, setEstimatedRates] = useState<Record<string, RateEntry>>({});
  const [estimating, setEstimating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Beneficiaries have no KYC status of their own (BeneficiaryResponse has
  // no such field) — they simply belong to a sender. `username` on a
  // Beneficiary is the owning API account (the logged-in agent), NOT the
  // customer/sender — that's `senderUserName`, the client-only field set
  // in BeneficiariesContext (see data/beneficiaryData.ts). The correct
  // scope is "beneficiaries belonging to the currently selected,
  // KYC-verified sender".
  const verifiedBeneficiaries = beneficiaries.filter((b) => b.senderUserName === senderUserName);

  function toggleBeneficiary(id: number) {
    setBeneficiaryIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next;
    });
    setAmountsByBeneficiary((prev) => {
      if (prev[id] !== undefined) return prev; // keep existing amount if re-checking
      return { ...prev, [id]: 0 };
    });
    setDestinationCurrencyByBeneficiary((prev) => {
      if (prev[id] !== undefined) return prev; // keep existing choice if re-checking
      const beneficiary = beneficiaries.find((b) => b.id === id);
      const suggested = beneficiary ? destinationForBeneficiary(beneficiary).currency : "";
      return { ...prev, [id]: suggested };
    });
  }

  function updateBeneficiaryAmount(id: number, value: number) {
    setAmountsByBeneficiary((prev) => ({ ...prev, [id]: value }));
  }

  // Sender list loads asynchronously — backfill the selection once it
  // arrives, same reasoning as the partner/currency backfills below.
  useEffect(() => {
    if (verifiedSenders.length === 0) return;
    setSenderUserName((prev) => prev || verifiedSenders[0].userName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifiedSenders.map((s) => s.userName).join("|")]);

  // Agent-type partner list also loads asynchronously — backfill the
  // Partner ID selection once it arrives, same reasoning as the beneficiary
  // backfill above.
  useEffect(() => {
    if (partnerIdOptions.length === 0) return;
    setPartnerSelection((prev) => ({
      ...prev,
      partnerId: prev.partnerId || partnerIdOptions[0],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerIdOptions.join("|")]);

  // Country is derived from the selected agent-partner rather than picked
  // independently — keep it in lockstep so it can never disagree with the
  // partner actually chosen above.
  useEffect(() => {
    setPartnerSelection((prev) => ({ ...prev, country: selectedPartner?.country ?? "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPartner?.country]);

  // Source currency follows the selected agent-partner's own settlement
  // currency field — not picked independently, and not tied to the
  // logged-in user's own partner record, since the Partner ID dropdown
  // above may point at a different agent-type partner.
  useEffect(() => {
    const resolved =
      selectedPartner?.settlementCurrency && currencyOptions.includes(selectedPartner.settlementCurrency)
        ? selectedPartner.settlementCurrency
        : "";
    setForm((prev) => (prev.sourceCurrency === resolved ? prev : { ...prev, sourceCurrency: resolved }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPartner?.settlementCurrency, countryCurrencies]);

  // Destination country is still derived from the beneficiary's country, but
  // destination currency is now chosen manually by the agent per
  // beneficiary (see destinationCurrencyByBeneficiary) rather than being
  // auto-resolved via forex/country lookup — this only supplies the initial
  // suggestion seeded when a beneficiary is first checked.
  function destinationForBeneficiary(beneficiary: { country: string }) {
    const country = partnerCountrySelectOptions.includes(beneficiary.country) ? beneficiary.country : "";
    const currencyCode = countryCurrencies.find((c) => c.countryName === beneficiary.country)?.currencyCode ?? "";
    const currency = currencyOptions.includes(currencyCode) ? currencyCode : "";
    return { country, currency };
  }

  // Per-beneficiary, agent-chosen destination currency. Keyed by
  // beneficiary id, seeded with a suggestion in toggleBeneficiary but
  // editable via the CurrencySelect dropdown next to each beneficiary row.
  const [destinationCurrencyByBeneficiary, setDestinationCurrencyByBeneficiary] = useState<Record<number, string>>({});

  function destinationCurrencyFor(beneficiaryId: number, beneficiary: { country: string }): string {
    return destinationCurrencyByBeneficiary[beneficiaryId] ?? destinationForBeneficiary(beneficiary).currency;
  }

  const selectedBeneficiaries = beneficiaryIds
    .map((id) => beneficiaries.find((b) => b.id === id))
    .filter((b): b is (typeof beneficiaries)[number] => Boolean(b));

  const allDestinationsResolved =
    selectedBeneficiaries.length > 0 &&
    selectedBeneficiaries.every((b) => {
      const country = destinationForBeneficiary(b).country;
      return country && destinationCurrencyFor(b.id, b);
    });

  // True if any selected beneficiary would require a foreign-to-foreign
  // conversion that isn't currently allowed (see ALLOW_CROSS_CURRENCY_CONVERSION).
  const hasBlockedCrossCurrencyCorridor = selectedBeneficiaries.some((b) => {
    const destinationCurrency = destinationCurrencyFor(b.id, b);
    return (
      !ALLOW_CROSS_CURRENCY_CONVERSION &&
      isCrossCurrencyCorridor(form.sourceCurrency, destinationCurrency)
    );
  });

  function updateField<K extends keyof TransferInsertPayload>(field: K, value: TransferInsertPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Every currency involved that ISN'T the home currency needs its own row
  // fetched — this covers all three corridor shapes with one fetch list:
  // foreign->NPR needs the source row, NPR->foreign needs the destination
  // row(s), foreign->foreign needs both.
  const destinationCurrencies = selectedBeneficiaries
    .map((b) => destinationCurrencyFor(b.id, b))
    .filter((c): c is string => Boolean(c));

  const currenciesToFetch = [
    ...new Set(
      [form.sourceCurrency, ...destinationCurrencies].filter(
        (c): c is string => Boolean(c) && c !== HOME_CURRENCY
      )
    ),
  ];

  // Debounced (~400ms) estimate — fires on amount/currency/beneficiary
  // change, fetching a rate row for each non-home currency in play.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const anyAmountEntered = Object.values(amountsByBeneficiary).some((a) => a > 0);
    if (currenciesToFetch.length === 0 || !anyAmountEntered) {
      setEstimatedRates({});
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setEstimating(true);
      const entries = await Promise.all(
        currenciesToFetch.map(async (currency) => {
          const item = await lookupExchangeRate(currency);
          return item
            ? ([currency, { unit: item.unit, buying: item.buying, selling: item.selling }] as const)
            : null;
        })
      );
      setEstimating(false);
      setEstimatedRates(
        Object.fromEntries(entries.filter((e): e is [string, RateEntry] => e !== null))
      );
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(amountsByBeneficiary),
    form.sourceCurrency,
    currenciesToFetch.join("|"),
  ]);

  function estimatedPayoutFor(beneficiaryId: number, destinationCurrency: string): number | null {
    const amount = amountsByBeneficiary[beneficiaryId] ?? 0;
    return convertAmount(amount, form.sourceCurrency, destinationCurrency, estimatedRates);
  }

  // Reads lib/transferMath.ts's resolveFee, which is itself a stub while
  // SERVICE_FEE_SOURCE_CONFIRMED is false — see config/businessRules.ts.
  // Matched by destination currency code (serviceChargeData's
  // countrySymbol is a currency code like NPR/INR, not a country name).
  function estimatedFeeFor(destinationCurrency: string): number {
    return resolveFee({
      destinationCurrency,
      agentName: selectedPartner?.partnerId ?? "",
      deliveryOption: partnerSelection.method,
      serviceCharges,
    });
  }

  const totalToDebit = selectedBeneficiaries.reduce((sum, b) => {
    const amount = amountsByBeneficiary[b.id] ?? 0;
    const fee = estimatedFeeFor(destinationCurrencyFor(b.id, b));
    return sum + amount + fee;
  }, 0);

  const formValid =
    Boolean(senderUserName) &&
    beneficiaryIds.length > 0 &&
    selectedBeneficiaries.every((b) => (amountsByBeneficiary[b.id] ?? 0) > 0) &&
    form.sourceCurrency &&
    allDestinationsResolved &&
    !hasBlockedCrossCurrencyCorridor &&
    form.purpose;

  // POST /transfers takes one beneficiaryId (and one destinationCountry/
  // destinationCurrency, and now one beneficiary-specific amount) per call
  // — selecting several beneficiaries submits one transaction per
  // beneficiary, each using its own amount and destination.
  async function handleConfirmSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const now = new Date().toISOString();
      const agentName = selectedPartner?.partnerId ?? "";
      const demoResults = selectedBeneficiaries.map((beneficiary) => {
        const destination = destinationForBeneficiary(beneficiary);
        const destinationCurrency = destinationCurrencyFor(beneficiary.id, beneficiary);
        const amount = amountsByBeneficiary[beneficiary.id] ?? 0;
        const commissionRate = resolveCommissionRate(
          form.sourceCurrency,
          destination.country,
          amount,
          commissions
        );
        const breakdown = calculateTransfer({
          amount,
          sourceCurrency: form.sourceCurrency,
          destinationCurrency,
          destinationCountry: destination.country,
          agentName,
          deliveryOption: partnerSelection.method,
          commissionRate,
          rates: estimatedRates,
          partnerOfferRates,
          serviceCharges,
          margins,
        });
        return {
          ...form,
          amount,
          beneficiaryId: beneficiary.id,
          destinationCountry: destination.country,
          destinationCurrency,
          id: Math.floor(Math.random() * 900000 + 100000),
          referenceNumber: `REF-DEMO-${Math.floor(Math.random() * 900000 + 100000)}`,
          senderName: selectedSender?.fullName ?? selectedSender?.userName ?? "",
          receiverName: beneficiary.fullName ?? "",
          status: "INSERTED",
          provider: "demo",
          providerReference: "",
          exchangeRate: breakdown.retailRate ?? 0,
          fee: breakdown.fee,
          totalAmount: amount + breakdown.fee,
          receiverAmount: breakdown.receiverAmount ?? 0,
          createdAt: now,
          updatedAt: now,
          rateBreakdownMOCKONLY: {
            agentName,
            retailRate: breakdown.retailRate,
            wholesaleRate: breakdown.wholesaleRate,
            fxSpread: breakdown.fxSpread,
            commissionRate,
            commission: breakdown.commission,
            marginRate: breakdown.marginRate,
            netEarning: breakdown.netEarning,
            computedAt: now,
          },
        };
      });
      // Newly sent demo transactions previously only ever lived in this
      // screen's own `results` state (shown on the confirmation screen) and
      // never actually reached TransfersPanel/the Transaction Rate Report —
      // unshift them into the shared array so they show up everywhere else,
      // same mutate-module-array pattern TransfersPanel's handleMarkDelivered
      // already uses.
      demoTransferRecords.unshift(...demoResults);
      setResults(demoResults);
      setSubmitting(false);
      setStage("done");
      return;
    }

    const submitted: TransferRecord[] = [];
    for (const beneficiary of selectedBeneficiaries) {
      const destination = destinationForBeneficiary(beneficiary);
      const amount = amountsByBeneficiary[beneficiary.id] ?? 0;
      const response = await insertTransfer({
        ...form,
        amount,
        beneficiaryId: beneficiary.id,
        destinationCountry: destination.country,
        destinationCurrency: destinationCurrencyFor(beneficiary.id, beneficiary),
      });
      if (!response.success || !response.data) {
        setSubmitting(false);
        setSubmitError(
          response.message || `Could not send the transaction to ${beneficiary.fullName}. Please try again.`
        );
        setResults(submitted);
        return;
      }
      submitted.push(response.data);
    }
    setSubmitting(false);
    setResults(submitted);
    setStage("done");
  }

  function startOver() {
    setForm(emptyTransferInsertPayload());
    setPartnerSelection(emptyPartnerSelection());
    setTradeRestrictions(emptyTradeRestrictions());
    setBeneficiaryIds([]);
    setAmountsByBeneficiary({});
    setDestinationCurrencyByBeneficiary({});
    setResults([]);
    setSubmitError(null);
    setEstimatedRates({});
    setStage("form");
  }

  if (stage === "done" && results.length > 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Send Transaction</h1>
        </div>
        <div className="bg-panel p-10 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-brand-green" />
          <p className="text-sm text-heading/70">
            {results.length === 1
              ? "Transaction submitted successfully."
              : `${results.length} transactions submitted successfully.`}
          </p>
          <div className="mx-auto mt-4 flex max-w-md flex-col gap-3">
            {results.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-surface px-4 py-3 text-left">
                <p className="text-sm font-semibold text-heading">{r.referenceNumber}</p>
                <p className="mt-1 text-sm text-heading/70">
                  {r.receiverName} will receive{" "}
                  <span className="font-semibold text-heading">
                    {formatAccounting(r.receiverAmount)} {r.destinationCurrency}
                  </span>
                </p>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="md" className="mt-6" onClick={startOver}>
            Send Another Transaction
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-heading">Send Transaction</h1>
          <p className="mt-0.5 text-sm text-muted">Move funds to a beneficiary on behalf of a verified customer.</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isLive ? "bg-brand-green-light text-brand-green-dark" : "bg-brand-blue-light text-brand-blue-dark"
          }`}
        >
          {isLive ? "Live" : "Demo"}
        </span>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleConfirmSubmit();
        }}
        className="flex flex-col gap-8 bg-panel p-6 sm:p-8"
      >
        <section className="flex flex-col gap-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Partner</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            {partnerIdOptions.length > 0 ? (
              <SelectField
                label="Partner ID:"
                required
                options={partnerIdOptions}
                defaultValue={partnerIdOptions[0]}
                value={partnerSelection.partnerId}
                onChange={(v) => setPartnerSelection((prev) => ({ ...prev, partnerId: v }))}
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-heading/70">Partner ID:</label>
                <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
                  No agent partners found — register one first.
                </p>
              </div>
            )}
            {selectedPartner && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-heading/70">Partner Name:</label>
                <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-heading">
                  {selectedPartner.partnerName}
                </p>
              </div>
            )}
            <SelectField
              label="Branch Name:"
              required
              options={branchNameOptions}
              defaultValue={branchNameOptions[0]}
              value={partnerSelection.branchName}
              onChange={(v) => setPartnerSelection((prev) => ({ ...prev, branchName: v }))}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Country:</label>
              <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-heading">
                {selectedPartner?.country || "—"}
              </p>
            </div>
            <SelectField
              label="Method:"
              required
              options={partnerMethodOptions}
              defaultValue={partnerMethodOptions[0]}
              value={partnerSelection.method}
              onChange={(v) => setPartnerSelection((prev) => ({ ...prev, method: v }))}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-2">
          <h2 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-muted">
            Transaction Details
          </h2>
          {verifiedSenders.length > 0 ? (
            <SelectField
              label="Sender:"
              required
              options={verifiedSenders.map((s) => s.fullName || s.userName)}
              defaultValue={verifiedSenders[0].fullName || verifiedSenders[0].userName}
              value={selectedSender?.fullName || selectedSender?.userName || ""}
              onChange={(v) => {
                const match = verifiedSenders.find((s) => (s.fullName || s.userName) === v);
                setSenderUserName(match?.userName ?? "");
                // Sender changed -> previously selected beneficiaries may
                // belong to a different sender. Clear the selection rather
                // than silently keeping beneficiaries that no longer match
                // the `username` scope.
                setBeneficiaryIds([]);
                setAmountsByBeneficiary({});
                setDestinationCurrencyByBeneficiary({});
              }}
            />
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-heading/70">Sender:</label>
              <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
                {kycListsLoading
                  ? "Loading customers..."
                  : "No KYC-verified customers found — approve one under KYC first."}
              </p>
            </div>
          )}

          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="flex items-center gap-1 text-sm text-heading/70">
              Beneficiaries and amounts:<span className="text-red-500" aria-hidden="true">*</span>
            </label>
            {verifiedBeneficiaries.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-border">
                {verifiedBeneficiaries.map((b) => {
                  const destination = destinationForBeneficiary(b);
                  const checked = beneficiaryIds.includes(b.id);
                  const destinationCurrency = destinationCurrencyFor(b.id, b);
                  const amount = amountsByBeneficiary[b.id] ?? 0;
                  const payout = destinationCurrency ? estimatedPayoutFor(b.id, destinationCurrency) : null;
                  const blocked =
                    checked && !ALLOW_CROSS_CURRENCY_CONVERSION &&
                    isCrossCurrencyCorridor(form.sourceCurrency, destinationCurrency);
                  return (
                    <div
                      key={b.id}
                      className={`flex flex-col gap-3 border-b border-border px-4 py-3 last:border-b-0 ${
                        checked ? "bg-brand-green-light/25" : "bg-panel"
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onToggle={() => toggleBeneficiary(b.id)}
                        label={`${b.fullName}${destination.country ? ` · ${destination.country}` : ""}`}
                      />
                      {checked && (
                        <div className="flex flex-col gap-2 pl-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wide text-muted">Sends</span>
                            <input
                              type="number"
                              min={0}
                              placeholder="0"
                              value={amountsByBeneficiary[b.id] || ""}
                              onChange={(e) => updateBeneficiaryAmount(b.id, Number(e.target.value) || 0)}
                              className="w-28 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm tabular-nums text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                            />
                            <span className="text-sm font-semibold text-heading">{form.sourceCurrency}</span>
                          </div>

                          <span className="text-muted" aria-hidden="true">→</span>

                          <div className="flex items-center gap-2">
                           
                            <span className="min-w-[5.5rem] rounded-lg bg-brand-green-light px-2.5 py-1.5 text-sm font-semibold tabular-nums text-brand-green-dark">
                              {amount > 0 && payout !== null ? formatAccounting(payout) : "—"}
                            </span>
                            <CurrencySelect
                              bare
                              options={currencyOptions}
                              value={destinationCurrency}
                              onChange={(v) =>
                                setDestinationCurrencyByBeneficiary((prev) => ({ ...prev, [b.id]: v }))
                              }
                              label={`Destination currency for ${b.fullName}`}
                            />
                          </div>

                          {!destination.country && (
                            <span className="text-xs text-red-500">destination country not resolvable</span>
                          )}
                          {blocked && (
                            <span className="text-xs text-red-500">
                              {form.sourceCurrency} → {destinationCurrency} isn&apos;t supported yet.
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div
                  className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-heading/10 bg-surface px-4 py-3"
                  aria-live="polite"
                >
                  <span className="text-xs text-muted">
                    {estimating
                      ? "Recalculating…"
                      : selectedBeneficiaries.length > 0
                        ? "Estimate only — confirmed once submitted."
                        : "Select a beneficiary and enter an amount to see the payout."}
                  </span>
                  {selectedBeneficiaries.length > 0 && (
                    <span className="text-sm font-bold tabular-nums text-heading">
                      Total to debit: {formatAccounting(totalToDebit)} {form.sourceCurrency}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
                {beneficiariesLoading
                  ? "Loading beneficiaries..."
                  : "No beneficiaries found for this sender — add one first."}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1 text-sm text-heading/70">
              Source Currency:<span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-heading">
              {form.sourceCurrency ||
                (selectedPartner
                  ? "Could not determine this partner's settlement currency — contact support."
                  : "Select a Partner ID to determine the settlement currency.")}
            </p>
          </div>

          <SelectField
            label="Purpose:"
            required
            options={transferPurposeOptions}
            defaultValue={transferPurposeOptions[0]}
            value={form.purpose}
            onChange={(v) => updateField("purpose", v)}
          />
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Remarks:</label>
            <textarea
              rows={3}
              value={form.remarks}
              onChange={(event) => updateField("remarks", event.target.value)}
              className="w-full rounded-xl border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-border pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Trade Restrictions and Use of Funds Declaration
            </h2>
            <span className="text-xs text-muted">Recorded for this session only — not yet part of the submitted transaction.</span>
          </div>
          {/* TODO(product): confirm whether these values map to real
              fields on POST /transfers (or a related endpoint) — they are
              currently collected but NOT included in the submitted
              payload. Either wire them in once the real field names are
              confirmed, or remove this section; leaving it interactive
              but silently discarded is misleading to whoever fills it out.
              The caption above is a stopgap so the UI itself doesn't imply
              a compliance record is being kept when it isn't — remove it
              once this is actually wired or the section is removed. */}
          <TradeRestrictionRow
            label="Non-Relevant to North Korea and Iran Restrictions:"
            value={tradeRestrictions.northKoreaIran}
            onChange={(v) => setTradeRestrictions((prev) => ({ ...prev, northKoreaIran: v }))}
          />
          <TradeRestrictionRow
            label="Government Permit Approval is not required for this transaction:"
            value={tradeRestrictions.governmentPermit}
            onChange={(v) => setTradeRestrictions((prev) => ({ ...prev, governmentPermit: v }))}
          />
          <TradeRestrictionRow
            label="Not a Name-lending transaction :"
            value={tradeRestrictions.nameLending}
            onChange={(v) => setTradeRestrictions((prev) => ({ ...prev, nameLending: v }))}
          />
          <TradeRestrictionRow
            label="Importing goods or merchandising trade transaction :"
            value={tradeRestrictions.importingGoods}
            onChange={(v) => setTradeRestrictions((prev) => ({ ...prev, importingGoods: v }))}
          />
        </section>

        {hasBlockedCrossCurrencyCorridor && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            One or more selected beneficiaries require a currency pair that isn&apos;t supported yet
            (both sides foreign, neither is {HOME_CURRENCY}). Remove that beneficiary or contact support.
          </p>
        )}

        {submitError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
        )}

        <div className="border-t border-border pt-5">
          <Button type="submit" disabled={!formValid} loading={submitting} icon={<Send size={15} />}>
            {submitting ? "Submitting..." : "Save & Send Transaction"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function TradeRestrictionRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: YesNo;
  onChange: (value: YesNo) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 sm:max-w-2xl">
      <p className="text-sm text-heading/80">{label}</p>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-heading/80">
          <input
            type="checkbox"
            checked={value === "NA"}
            onChange={() => onChange("NA")}
            className="h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue"
          />
          N/A
        </label>
        <label className="flex items-center gap-2 text-sm text-heading/80">
          <input
            type="checkbox"
            checked={value === "YES"}
            onChange={() => onChange("YES")}
            className="h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue"
          />
          Yes
        </label>
      </div>
    </div>
  );
}