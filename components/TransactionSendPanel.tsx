"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import Button from "./Button";
import SelectField from "./SelectField";
import TextField from "./TextField";
import Checkbox from "./Checkbox";
import RadioPill from "./RadioPill";
import CurrencySelect from "./CurrencySelect";
import { useDataMode } from "@/contexts/DataModeContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useRates } from "@/contexts/RatesContext";
import { useBeneficiaries } from "@/contexts/BeneficiariesContext";
import { useKyc } from "@/contexts/KycContext";
import { insertTransfer } from "@/lib/transferApi";
import { partnerCountrySelectOptions } from "@/data/partnerData";
import { walletsForCountryMOCKONLY } from "@/data/payoutWalletOptionsData";
import {
  emptyTransferInsertPayload,
  transferPurposeOptions,
  payoutMethodOptions,
  demoTransferRecords,
  type TransferInsertPayload,
  type TransferRecord,
} from "@/data/transferData";
import {
  collectMethodOptions,
  discountOptions,
  discountPercentByOption,
  type CollectMethod,
} from "@/data/transactionSendData";
import { formatAccounting } from "@/lib/format";
import { ALLOW_CROSS_CURRENCY_CONVERSION } from "@/config/businessRules";
import {
  convertAmount,
  isCrossCurrencyCorridor,
  resolveCommissionRate,
  calculateTransfer,
  HOME_CURRENCY,
  type RateEntry,
} from "@/lib/transferMath";

type Stage = "form" | "done";

const branchNameOptions = ["Head Office"];

type YesNo = "NA" | "YES";

type PartnerSelection = {
  partnerId: string;
  branchName: string;
  country: string;
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
  const {
    exchangeRates,
    refreshExchangeRates,
    lookupExchangeRate,
    serviceCharges,
    commissions,
    margins,
    partnerOfferRates,
  } = useRates();

  // Exchange-rate rows are the live source of which currencies (and their
  // country pairing) are actually tradeable — countryCurrencies is just the
  // full ISO reference table, not a tradeability signal. Refresh on mount so
  // destination currency resolution below doesn't silently depend on stale data.
  useEffect(() => {
    refreshExchangeRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  const agentPartners = partners.filter((p) => p.partnerType === AGENT_PARTNER_TYPE);
  const partnerIdOptions = [...new Set(agentPartners.map((p) => p.partnerId).filter(Boolean))].sort(
    comparePartnerIds
  );
  const currencyOptions = [...new Set(exchangeRates.map((r) => r.symbol).filter(Boolean))].sort();

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
  // How the sender is handing over the collected amount today. One choice
  // for the whole transaction (not per beneficiary) — the sender pays once,
  // regardless of how many beneficiaries that payment is split across.
  // UNCONFIRMED with backend: TransferInsertPayload has no field for this
  // yet, so — like Trade Restrictions above — it's recorded for this
  // session/display only and not part of the submitted payload.
  const [collectMethod, setCollectMethod] = useState<CollectMethod>(collectMethodOptions[0]);
  // Also transaction-wide. Reduces the computed Service Charge only (never
  // the transfer amount) — see discountPercentByOption in
  // data/transactionSendData.ts for the (unconfirmed, placeholder) percentages.
  const [discount, setDiscount] = useState<string>(discountOptions[0]);
  // Free-text purpose, only used when form.purpose === "Other" — the actual
  // value submitted/validated as the purpose is effectivePurpose below, not
  // form.purpose directly, so a bare "Other" is never sent as-is.
  const [customPurpose, setCustomPurpose] = useState("");
  const [senderUserName, setSenderUserName] = useState("");
  const [beneficiaryIds, setBeneficiaryIds] = useState<number[]>([]);
  // Per-beneficiary amounts, keyed by beneficiary id. Replaces the old
  // single shared `form.amount` used for every selected beneficiary, which
  // silently multiplied the debit by however many beneficiaries were
  // checked (checking 3 beneficiaries at $500 debited $1,500 with no
  // indication to the agent).
  const [amountsByBeneficiary, setAmountsByBeneficiary] = useState<Record<number, number>>({});
  // Per-beneficiary payout method (Bank/Wallet/Cash), keyed by beneficiary
  // id. Previously a single Method dropdown lived under Partner and applied
  // to every beneficiary at once — but the partner only originates the
  // transaction, it doesn't dictate how each individual beneficiary is
  // paid out, so this now travels with the beneficiary's own amount/rate
  // row instead.
  const [methodByBeneficiary, setMethodByBeneficiary] = useState<Record<number, string>>({});
  // Same idea as before bank selection was removed (the beneficiary's own
  // bank-on-file is used instead — see the "Bank on file" display below),
  // now only for the "Wallet" method — options come
  // from walletsForCountryMOCKONLY (data/payoutWalletOptionsData.ts).
  const [walletByBeneficiary, setWalletByBeneficiary] = useState<Record<number, string>>({});
  // Per-beneficiary manual override of the Customer Rate — lets the agent
  // quote a specific customer a different rate than the computed retail
  // rate (e.g. a negotiated/VIP rate). null means "use the computed rate."
  // Only ever set while that beneficiary's Edit checkbox is on, and only
  // meaningful for the two directly-quoted corridors (never the
  // foreign->foreign triangulated one, where retailRate is always null —
  // see lib/transferMath.ts). UNCONFIRMED with backend: no field on
  // TransferInsertPayload carries this; it only affects the local estimate
  // and, in demo mode, the numbers actually recorded on the demo transfer.
  const [customerRateOverrides, setCustomerRateOverrides] = useState<Record<number, number | null>>({});
  const [customerRateEditing, setCustomerRateEditing] = useState<Record<number, boolean>>({});
  // Per-beneficiary flat additional fee, on top of the resolved Service
  // Charge. Same "not part of TransferInsertPayload yet" caveat as the rate
  // override above.
  const [additionalFeeByBeneficiary, setAdditionalFeeByBeneficiary] = useState<Record<number, number>>({});
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
    setDestinationCountryByBeneficiary((prev) => {
      if (prev[id] !== undefined) return prev; // keep existing choice if re-checking
      const beneficiary = beneficiaries.find((b) => b.id === id);
      const suggested = beneficiary ? destinationForBeneficiary(beneficiary).country : "";
      return { ...prev, [id]: suggested };
    });
    setDestinationCurrencyByBeneficiary((prev) => {
      if (prev[id] !== undefined) return prev; // keep existing choice if re-checking
      const beneficiary = beneficiaries.find((b) => b.id === id);
      const suggested = beneficiary ? destinationForBeneficiary(beneficiary).currency : "";
      return { ...prev, [id]: suggested };
    });
    setSourceCurrencyByBeneficiary((prev) => {
      if (prev[id] !== undefined) return prev; // keep existing choice if re-checking
      // No shared "default source currency" anymore — each beneficiary is
      // seeded independently with the first tradeable currency, editable
      // per row from here on, same pattern as destination currency.
      return { ...prev, [id]: currencyOptions[0] ?? "" };
    });
    setMethodByBeneficiary((prev) => {
      if (prev[id] !== undefined) return prev; // keep existing choice if re-checking
      return { ...prev, [id]: payoutMethodOptions[0] };
    });
    setWalletByBeneficiary((prev) => {
      if (prev[id] !== undefined) return prev; // keep existing choice if re-checking
      const beneficiary = beneficiaries.find((b) => b.id === id);
      const country = beneficiary ? destinationForBeneficiary(beneficiary).country : "";
      const options = walletsForCountryMOCKONLY(country);
      return { ...prev, [id]: options[0] ?? "" };
    });
  }

  function updateBeneficiaryAmount(id: number, value: number) {
    setAmountsByBeneficiary((prev) => ({ ...prev, [id]: value }));
  }

  // Same reasoning as before bank selection was removed, for the "Wallet" method's options.
  function walletFor(beneficiaryId: number, country: string): string {
    const options = walletsForCountryMOCKONLY(country);
    const stored = walletByBeneficiary[beneficiaryId];
    if (stored && options.includes(stored)) return stored;
    return options[0] ?? "";
  }

  function methodFor(beneficiaryId: number): string {
    return methodByBeneficiary[beneficiaryId] ?? payoutMethodOptions[0];
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

  // Destination country is still derived from the beneficiary's country, but
  // destination currency is now chosen manually by the agent per
  // beneficiary (see destinationCurrencyByBeneficiary) rather than being
  // auto-resolved via forex/country lookup — this only supplies the initial
  // suggestion seeded when a beneficiary is first checked.
  function destinationForBeneficiary(beneficiary: { country: string }) {
    const country = partnerCountrySelectOptions.includes(beneficiary.country) ? beneficiary.country : "";
    const currencyCode = exchangeRates.find((r) => r.countryName === beneficiary.country)?.symbol ?? "";
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

  // Per-beneficiary, agent-chosen source currency. Keyed by beneficiary id,
  // seeded with the first tradeable currency in toggleBeneficiary but
  // editable via the CurrencySelect dropdown next to each beneficiary row —
  // each beneficiary is submitted as its own POST /transfers call, so a
  // different source currency per row is a real, independently-submittable
  // choice, not just a display quirk. No shared "default source currency"
  // field exists anymore — every row is independent from the start.
  const [sourceCurrencyByBeneficiary, setSourceCurrencyByBeneficiary] = useState<Record<number, string>>({});

  function sourceCurrencyFor(beneficiaryId: number): string {
    return sourceCurrencyByBeneficiary[beneficiaryId] ?? currencyOptions[0] ?? "";
  }

  // Per-beneficiary, agent-chosen destination country. Keyed by beneficiary
  // id, seeded with a suggestion (from the beneficiary's own country, when
  // it's a recognized one) in toggleBeneficiary, but editable via the
  // Destination Country field next to each beneficiary row — a beneficiary
  // whose profile country isn't resolvable, or who's being paid out in a
  // different country than they're registered under, is no longer stuck.
  const [destinationCountryByBeneficiary, setDestinationCountryByBeneficiary] = useState<Record<number, string>>({});

  function destinationCountryFor(beneficiaryId: number, beneficiary: { country: string }): string {
    return destinationCountryByBeneficiary[beneficiaryId] ?? destinationForBeneficiary(beneficiary).country;
  }

  const selectedBeneficiaries = beneficiaryIds
    .map((id) => beneficiaries.find((b) => b.id === id))
    .filter((b): b is (typeof beneficiaries)[number] => Boolean(b));

  const allDestinationsResolved =
    selectedBeneficiaries.length > 0 &&
    selectedBeneficiaries.every((b) => destinationCountryFor(b.id, b) && destinationCurrencyFor(b.id, b));

  // True if any selected beneficiary would require a foreign-to-foreign
  // conversion that isn't currently allowed (see ALLOW_CROSS_CURRENCY_CONVERSION).
  const hasBlockedCrossCurrencyCorridor = selectedBeneficiaries.some((b) => {
    const destinationCurrency = destinationCurrencyFor(b.id, b);
    return (
      !ALLOW_CROSS_CURRENCY_CONVERSION &&
      isCrossCurrencyCorridor(sourceCurrencyFor(b.id), destinationCurrency)
    );
  });

  function updateField<K extends keyof TransferInsertPayload>(field: K, value: TransferInsertPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Every currency involved that ISN'T the home currency needs its own row
  // fetched — this covers all three corridor shapes with one fetch list:
  // foreign->NPR needs the source row, NPR->foreign needs the destination
  // row(s), foreign->foreign needs both. Source currency is now per
  // beneficiary too, so every row's own choice goes into this list, not
  // just the partner's default settlement currency.
  const sourceCurrencies = selectedBeneficiaries.map((b) => sourceCurrencyFor(b.id));
  const destinationCurrencies = selectedBeneficiaries
    .map((b) => destinationCurrencyFor(b.id, b))
    .filter((c): c is string => Boolean(c));

  const currenciesToFetch = [
    ...new Set(
      [...sourceCurrencies, ...destinationCurrencies].filter(
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
    sourceCurrencies.join("|"),
    currenciesToFetch.join("|"),
  ]);

  function estimatedPayoutFor(beneficiaryId: number, destinationCurrency: string): number | null {
    const amount = amountsByBeneficiary[beneficiaryId] ?? 0;
    return convertAmount(amount, sourceCurrencyFor(beneficiaryId), destinationCurrency, estimatedRates);
  }

  // Full charge breakdown for one beneficiary's leg — same calculateTransfer
  // used at submit time (handleConfirmSubmit), so the live estimate shown
  // here never drifts from what's actually recorded once sent.
  function chargeBreakdownFor(beneficiary: { id: number; country: string }) {
    const destinationCountry = destinationCountryFor(beneficiary.id, beneficiary);
    const destinationCurrency = destinationCurrencyFor(beneficiary.id, beneficiary);
    const amount = amountsByBeneficiary[beneficiary.id] ?? 0;
    const commissionRate = resolveCommissionRate(
      sourceCurrencyFor(beneficiary.id),
      destinationCountry,
      amount,
      commissions
    );
    return calculateTransfer({
      amount,
      sourceCurrency: sourceCurrencyFor(beneficiary.id),
      destinationCurrency,
      destinationCountry,
      agentName: selectedPartner?.partnerId ?? "",
      deliveryOption: methodFor(beneficiary.id),
      commissionRate,
      rates: estimatedRates,
      partnerOfferRates,
      serviceCharges,
      margins,
    });
  }

  function additionalFeeFor(beneficiaryId: number): number {
    return additionalFeeByBeneficiary[beneficiaryId] ?? 0;
  }

  function customerRateOverrideFor(beneficiaryId: number): number | null {
    return customerRateOverrides[beneficiaryId] ?? null;
  }

  // Recomputes the receiver-side amount using a manually entered Customer
  // Rate instead of the computed retail rate — mirrors convertAmount's two
  // directly-quoted branches (never called for the foreign->foreign
  // corridor, where the Edit control is disabled below).
  function recomputeReceiverAmountWithRate(
    amount: number,
    sourceCurrency: string,
    destinationCurrency: string,
    rate: number
  ): number | null {
    if (destinationCurrency === HOME_CURRENCY) {
      const unit = estimatedRates[sourceCurrency]?.unit;
      if (!unit) return null;
      return (amount / unit) * rate;
    }
    if (sourceCurrency === HOME_CURRENCY) {
      const unit = estimatedRates[destinationCurrency]?.unit;
      if (!unit || rate <= 0) return null;
      return (amount / rate) * unit;
    }
    return null;
  }

  function toggleCustomerRateEditing(beneficiaryId: number, retailRate: number | null) {
    setCustomerRateEditing((prev) => {
      const next = !prev[beneficiaryId];
      if (!next) {
        // Turning "Edit" off reverts to the computed rate rather than
        // leaving a stale override behind that no longer has a visible
        // control to change it back.
        setCustomerRateOverrides((p) => ({ ...p, [beneficiaryId]: null }));
      } else if (retailRate !== null) {
        setCustomerRateOverrides((p) => (p[beneficiaryId] != null ? p : { ...p, [beneficiaryId]: retailRate }));
      }
      return { ...prev, [beneficiaryId]: next };
    });
  }

  // Layers Additional Fee / Discount / Customer-Rate-override on top of the
  // confirmed calculateTransfer breakdown for one beneficiary — these extra
  // numbers feed the "Transaction Detail" box below. None of them are part
  // of TransferInsertPayload yet (same status as feeAmountMOCKONLY
  // elsewhere in this app): they're local estimates until backend confirms
  // a real place to send them.
  function transactionDetailFor(beneficiary: { id: number; country: string }) {
    const breakdown = chargeBreakdownFor(beneficiary);
    const destinationCurrency = destinationCurrencyFor(beneficiary.id, beneficiary);
    const sourceCurrency = sourceCurrencyFor(beneficiary.id);
    const amount = amountsByBeneficiary[beneficiary.id] ?? 0;

    const discountPercent = discountPercentByOption[discount] ?? 0;
    const serviceChargeAfterDiscount = breakdown.fee * (1 - discountPercent / 100);
    const additionalFee = additionalFeeFor(beneficiary.id);

    const overrideRate = customerRateOverrideFor(beneficiary.id);
    const customerRate = overrideRate ?? breakdown.retailRate;
    const receiveAmount =
      overrideRate !== null && overrideRate > 0
        ? recomputeReceiverAmountWithRate(amount, sourceCurrency, destinationCurrency, overrideRate) ??
          breakdown.receiverAmount
        : breakdown.receiverAmount;

    return {
      ...breakdown,
      sourceCurrency,
      destinationCurrency,
      amount,
      discountPercent,
      serviceChargeAfterDiscount,
      additionalFee,
      customerRate,
      payoutAmountFC: breakdown.receiverAmount,
      receiveAmount,
      collectedAmount: amount + serviceChargeAfterDiscount + additionalFee,
    };
  }

  // Grouped by source currency rather than a single combined figure — each
  // beneficiary can now debit a different currency (see
  // sourceCurrencyByBeneficiary), so adding them together would silently mix
  // currencies into one meaningless number.
  const totalsToDebitByCurrency = selectedBeneficiaries.reduce<Record<string, number>>((totals, b) => {
    const amount = amountsByBeneficiary[b.id] ?? 0;
    const collectedAmount = amount > 0 ? transactionDetailFor(b).collectedAmount : amount;
    const currency = sourceCurrencyFor(b.id) || "—";
    totals[currency] = (totals[currency] ?? 0) + collectedAmount;
    return totals;
  }, {});

  // The actual purpose to validate/submit — when "Other" is selected, the
  // free-text customPurpose is what's meaningful, not the literal word
  // "Other".
  const effectivePurpose = form.purpose === "Other" ? customPurpose.trim() : form.purpose;

  const formValid =
    Boolean(senderUserName) &&
    beneficiaryIds.length > 0 &&
    selectedBeneficiaries.every((b) => (amountsByBeneficiary[b.id] ?? 0) > 0) &&
    selectedBeneficiaries.every((b) => Boolean(sourceCurrencyFor(b.id))) &&
    allDestinationsResolved &&
    !hasBlockedCrossCurrencyCorridor &&
    effectivePurpose;

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
        const destinationCountry = destinationCountryFor(beneficiary.id, beneficiary);
        const destinationCurrency = destinationCurrencyFor(beneficiary.id, beneficiary);
        const sourceCurrency = sourceCurrencyFor(beneficiary.id);
        const amount = amountsByBeneficiary[beneficiary.id] ?? 0;
        const commissionRate = resolveCommissionRate(
          sourceCurrency,
          destinationCountry,
          amount,
          commissions
        );
        // Folds Additional Fee / Discount / Customer-Rate-override into the
        // same existing fields (exchangeRate/fee/totalAmount/receiverAmount)
        // rather than adding new ones — TransferRecord already has a slot
        // for "the rate/fee/amount that actually applied," so the override
        // just changes what value lands there instead of needing new schema.
        const detail = transactionDetailFor(beneficiary);
        return {
          ...form,
          purpose: effectivePurpose,
          sourceCurrency,
          amount,
          beneficiaryId: beneficiary.id,
          destinationCountry,
          destinationCurrency,
          id: Math.floor(Math.random() * 900000 + 100000),
          referenceNumber: `REF-DEMO-${Math.floor(Math.random() * 900000 + 100000)}`,
          senderName: selectedSender?.fullName ?? selectedSender?.userName ?? "",
          receiverName: beneficiary.fullName ?? "",
          status: "INSERTED",
          provider: "demo",
          providerReference: "",
          exchangeRate: detail.customerRate ?? 0,
          fee: detail.serviceChargeAfterDiscount + detail.additionalFee,
          totalAmount: detail.collectedAmount,
          receiverAmount: detail.receiveAmount ?? 0,
          createdAt: now,
          updatedAt: now,
          rateBreakdownMOCKONLY: {
            agentName,
            retailRate: detail.customerRate,
            wholesaleRate: detail.wholesaleRate,
            fxSpread: detail.fxSpread,
            commissionRate,
            commission: detail.commission,
            marginRate: detail.marginRate,
            netEarning:
              detail.fxSpread !== null
                ? detail.serviceChargeAfterDiscount + detail.additionalFee + detail.fxSpread - detail.commission
                : null,
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
      const amount = amountsByBeneficiary[beneficiary.id] ?? 0;
      const response = await insertTransfer({
        ...form,
        purpose: effectivePurpose,
        sourceCurrency: sourceCurrencyFor(beneficiary.id),
        amount,
        beneficiaryId: beneficiary.id,
        destinationCountry: destinationCountryFor(beneficiary.id, beneficiary),
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
    setCollectMethod(collectMethodOptions[0]);
    setDiscount(discountOptions[0]);
    setCustomPurpose("");
    setBeneficiaryIds([]);
    setAmountsByBeneficiary({});
    setSourceCurrencyByBeneficiary({});
    setDestinationCountryByBeneficiary({});
    setDestinationCurrencyByBeneficiary({});
    setMethodByBeneficiary({});
    setWalletByBeneficiary({});
    setCustomerRateOverrides({});
    setCustomerRateEditing({});
    setAdditionalFeeByBeneficiary({});
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
        className="flex flex-col gap-6 bg-panel p-6 sm:p-8"
      >
        <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border pb-3">
            <h2 className="text-base font-bold text-heading">
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
          <div className="flex flex-col gap-4">
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
          </div>
        </section>

        <section className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-base font-bold text-heading border-b border-border pb-3">Partner</h2>
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
          </div>
        </section>

        <section className="grid grid-cols-1 gap-x-6 gap-y-5 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2 sm:p-6">
          <h2 className="sm:col-span-2 text-base font-bold text-heading border-b border-border pb-3">
            Transaction Details
          </h2>

          <div className="sm:col-span-2 flex flex-col gap-3 rounded-xl border border-dashed border-border bg-panel p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-sm font-semibold text-heading">Amount Collect From Remitter:</span>
              <span className="text-xs text-muted">Applies once to the whole transaction, not per beneficiary.</span>
            </div>
            <div role="radiogroup" aria-label="Amount collect from remitter" className="flex flex-wrap gap-x-6 gap-y-2">
              {collectMethodOptions.map((option) => (
                <RadioPill
                  key={option}
                  label={option}
                  checked={collectMethod === option}
                  onSelect={() => setCollectMethod(option)}
                />
              ))}
            </div>

            <div className="mt-1 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-heading/70">Max Limit:</label>
                <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-heading">
                  {selectedPartner
                    ? selectedPartner.creditLimit !== null
                      ? `${formatAccounting(selectedPartner.creditLimit)} ${selectedPartner.settlementCurrency ?? ""}`.trim()
                      : "No limit set for this partner"
                    : "Select a Partner ID first"}
                </p>
              </div>
              <SelectField
                label="Discount:"
                options={discountOptions}
                defaultValue={discountOptions[0]}
                value={discount}
                onChange={setDiscount}
              />
            </div>
            <p className="text-xs text-muted">
              Collection method and Max Limit are recorded for this session only — not yet part of the submitted
              transaction. Discount reduces the Service Charge shown per beneficiary below, not the transfer amount.
            </p>
          </div>

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
                setSourceCurrencyByBeneficiary({});
                setDestinationCountryByBeneficiary({});
                setDestinationCurrencyByBeneficiary({});
                setMethodByBeneficiary({});
                setWalletByBeneficiary({});
                setCustomerRateOverrides({});
                setCustomerRateEditing({});
                setAdditionalFeeByBeneficiary({});
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
                  const checked = beneficiaryIds.includes(b.id);
                  const destinationCountry = destinationCountryFor(b.id, b);
                  const destinationCurrency = destinationCurrencyFor(b.id, b);
                  const amount = amountsByBeneficiary[b.id] ?? 0;
                  const payout = destinationCurrency ? estimatedPayoutFor(b.id, destinationCurrency) : null;
                  const detail = checked && amount > 0 ? transactionDetailFor(b) : null;
                  const isEditingRate = customerRateEditing[b.id] ?? false;
                  const blocked =
                    checked && !ALLOW_CROSS_CURRENCY_CONVERSION &&
                    isCrossCurrencyCorridor(sourceCurrencyFor(b.id), destinationCurrency);
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
                        label={`${b.fullName}${destinationCountry ? ` · ${destinationCountry}` : ""}`}
                      />
                      {checked && (b.bankName || b.accountNumber) && (
                        <div className="ml-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-heading/80">
                          <span className="font-semibold uppercase tracking-wide text-muted">Bank on file:</span>
                          <span>
                            {b.bankName || "—"}
                            {b.accountNumber ? ` · A/C ${b.accountNumber}` : ""}
                          </span>
                        </div>
                      )}
                      {checked && (
                        <div className="flex flex-col gap-2 pl-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wide text-muted">To</span>
                            <select
                              value={destinationCountry}
                              onChange={(e) =>
                                setDestinationCountryByBeneficiary((prev) => ({ ...prev, [b.id]: e.target.value }))
                              }
                              aria-label={`Destination country for ${b.fullName}`}
                              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm font-semibold text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                            >
                              <option value="">Select country…</option>
                              {partnerCountrySelectOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>

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
                            <CurrencySelect
                              bare
                              options={currencyOptions}
                              value={sourceCurrencyFor(b.id)}
                              onChange={(v) => setSourceCurrencyByBeneficiary((prev) => ({ ...prev, [b.id]: v }))}
                              label={`Source currency for ${b.fullName}`}
                            />
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

                          <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-wide text-muted">via</span>
                            <select
                              value={methodFor(b.id)}
                              onChange={(e) =>
                                setMethodByBeneficiary((prev) => ({ ...prev, [b.id]: e.target.value }))
                              }
                              aria-label={`Payout method for ${b.fullName}`}
                              className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm font-semibold text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                            >
                              {payoutMethodOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>

                          {!destinationCountry && (
                            <span className="text-xs text-red-500">select a destination country</span>
                          )}
                          {blocked && (
                            <span className="text-xs text-red-500">
                              {sourceCurrencyFor(b.id)} → {destinationCurrency} isn&apos;t supported yet.
                            </span>
                          )}
                        </div>
                      )}
                      {checked && methodFor(b.id) === "Wallet" && (
                        <div className="ml-6 flex flex-wrap items-center gap-x-2 gap-y-1.5 rounded-lg bg-surface px-3 py-2 text-xs text-heading/80">
                          <span className="font-semibold uppercase tracking-wide text-muted">Payout wallet:</span>
                          {(() => {
                            const walletOptions = walletsForCountryMOCKONLY(destinationCountry);
                            if (walletOptions.length === 0) {
                              return (
                                <span className="text-red-500">
                                  {destinationCountry
                                    ? `No wallets listed for ${destinationCountry} yet.`
                                    : "Select a destination country to see its wallets."}
                                </span>
                              );
                            }
                            return (
                              <select
                                value={walletFor(b.id, destinationCountry)}
                                onChange={(e) =>
                                  setWalletByBeneficiary((prev) => ({ ...prev, [b.id]: e.target.value }))
                                }
                                aria-label={`Payout wallet for ${b.fullName}`}
                                className="rounded-lg border border-border bg-panel px-2.5 py-1.5 text-sm font-semibold text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                              >
                                {walletOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            );
                          })()}
                          <span className="w-full text-[10px] text-muted">
                            Sample wallet list — will be pulled from the country&apos;s payout wallet API once available.
                          </span>
                        </div>
                      )}
                      {checked && methodFor(b.id) === "Cash" && (
                        <div className="ml-6 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-surface px-3 py-2 text-xs text-heading/80">
                          <span className="font-semibold uppercase tracking-wide text-muted">Cash details:</span>
                          <span className="text-muted">Paid out as cash at pickup — no bank account needed.</span>
                        </div>
                      )}
                      {detail && (
                        <div className="ml-6 overflow-hidden rounded-lg border border-border">
                          <div className="bg-heading px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white">
                            Transaction Detail
                          </div>
                          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 bg-panel px-3 py-2.5 sm:grid-cols-2">
                            <LabeledAmount label="Transfer Amount (LC)">
                              {formatAccounting(detail.amount)} {sourceCurrencyFor(b.id)}
                            </LabeledAmount>
                            <LabeledAmount label="Payout Amount (FC)" highlight>
                              {detail.payoutAmountFC !== null ? formatAccounting(detail.payoutAmountFC) : "—"}{" "}
                              {destinationCurrency}
                            </LabeledAmount>

                            <LabeledAmount label="Service Charge">
                              {detail.discountPercent > 0 && (
                                <span className="mr-1.5 text-[11px] text-muted line-through">
                                  {formatAccounting(detail.fee)}
                                </span>
                              )}
                              {formatAccounting(detail.serviceChargeAfterDiscount)} {sourceCurrencyFor(b.id)}
                              {detail.discountPercent > 0 && (
                                <span className="ml-1.5 text-[11px] text-brand-green-dark">
                                  (-{detail.discountPercent}%)
                                </span>
                              )}
                            </LabeledAmount>

                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between gap-2">
                                <dt className="text-xs text-heading/70">Customer Rate</dt>
                                <Checkbox
                                  checked={isEditingRate}
                                  onToggle={() => toggleCustomerRateEditing(b.id, detail.retailRate)}
                                  label="Edit"
                                  className="text-[11px]"
                                />
                              </div>
                              {isEditingRate ? (
                                <input
                                  type="number"
                                  min={0}
                                  step="any"
                                  value={customerRateOverrideFor(b.id) ?? ""}
                                  onChange={(e) =>
                                    setCustomerRateOverrides((prev) => ({
                                      ...prev,
                                      [b.id]: Number(e.target.value) || 0,
                                    }))
                                  }
                                  aria-label={`Customer rate for ${b.fullName}`}
                                  className="w-full rounded-lg border border-brand-green bg-surface px-2.5 py-1.5 text-sm tabular-nums text-heading focus:outline-none focus:ring-1 focus:ring-brand-green"
                                />
                              ) : (
                                <span className="rounded-lg bg-surface px-2.5 py-1.5 text-sm tabular-nums font-medium text-heading">
                                  {detail.customerRate !== null ? formatAccounting(detail.customerRate) : "—"}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-col gap-1">
                              <label
                                htmlFor={`additional-fee-${b.id}`}
                                className="text-xs text-heading/70"
                              >
                                Additional Fee
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  id={`additional-fee-${b.id}`}
                                  type="number"
                                  min={0}
                                  value={additionalFeeFor(b.id) || ""}
                                  placeholder="0"
                                  onChange={(e) =>
                                    setAdditionalFeeByBeneficiary((prev) => ({
                                      ...prev,
                                      [b.id]: Number(e.target.value) || 0,
                                    }))
                                  }
                                  className="w-full rounded-lg border border-border bg-surface px-2.5 py-1.5 text-sm tabular-nums text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                                />
                                <span className="text-xs text-muted">{sourceCurrencyFor(b.id)}</span>
                              </div>
                            </div>

                            <LabeledAmount label="Collected Amount" bold>
                              {formatAccounting(detail.collectedAmount)} {sourceCurrencyFor(b.id)}
                            </LabeledAmount>
                            <LabeledAmount label="Receive Amount" bold highlight>
                              {detail.receiveAmount !== null ? formatAccounting(detail.receiveAmount) : "—"}{" "}
                              {destinationCurrency}
                            </LabeledAmount>
                          </div>
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
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold tabular-nums text-heading">
                      {Object.entries(totalsToDebitByCurrency).map(([currency, total], index) => (
                        <span key={currency}>
                          {index === 0 ? "Total to debit: " : "+ "}
                          {formatAccounting(total)} {currency}
                        </span>
                      ))}
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

          <SelectField
            label="Purpose:"
            required
            options={transferPurposeOptions}
            defaultValue={transferPurposeOptions[0]}
            value={form.purpose}
            onChange={(v) => {
              updateField("purpose", v);
              if (v !== "Other") setCustomPurpose("");
            }}
          />
          {form.purpose === "Other" && (
            <TextField
              label="Specify Purpose:"
              required
              placeholder="e.g. Property Purchase"
              value={customPurpose}
              onChange={setCustomPurpose}
            />
          )}
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

// One labeled value inside the per-beneficiary "Transaction Detail" box —
// `highlight` marks the FX-converted/receiver-facing fields (Payout
// Amount, Receive Amount) the way the beneficiary list's own payout badge
// above already uses brand-green for that purpose.
function LabeledAmount({
  label,
  bold,
  highlight,
  children,
}: {
  label: string;
  bold?: boolean;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs text-heading/70">{label}</dt>
      <dd
        className={`tabular-nums rounded-lg px-2.5 py-1.5 text-sm ${
          highlight ? "bg-brand-green-light text-brand-green-dark" : "bg-surface text-heading"
        } ${bold ? "font-bold" : "font-medium"}`}
      >
        {children}
      </dd>
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