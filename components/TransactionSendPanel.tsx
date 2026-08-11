"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Send } from "lucide-react";
import Button from "./Button";
import SelectField from "./SelectField";
import TextField from "./TextField";
import { useDataMode } from "@/contexts/DataModeContext";
import { listBeneficiaries } from "@/lib/beneficiaryApi";
import { getCountryWiseExRate } from "@/lib/rateApi";
import { insertTransfer } from "@/lib/transferApi";
import { beneficiaryRecords, type Beneficiary } from "@/data/beneficiaryData";
import { partnerEntries, settlementCurrencyOptions, partnerCountrySelectOptions } from "@/data/partnerData";
import {
  emptyTransferInsertPayload,
  transferPurposeOptions,
  type TransferInsertPayload,
  type TransferRecord,
} from "@/data/transferData";
import { formatAccounting } from "@/lib/format";

type Stage = "selectPartner" | "restrictions" | "form" | "confirm" | "done";

const branchNameOptions = ["Head Office"];
const partnerNameOptions = partnerEntries.map((p) => p.partnerName);

type YesNo = "NA" | "YES";

type PartnerSelection = {
  partnerId: string;
  branchName: string;
  country: string;
  method: string;
};

type TradeRestrictions = {
  northKoreaIran: YesNo;
  governmentPermit: YesNo;
  nameLending: YesNo;
  importingGoods: YesNo;
};

function emptyPartnerSelection(): PartnerSelection {
  return {
    partnerId: partnerNameOptions[0],
    branchName: branchNameOptions[0],
    country: partnerCountrySelectOptions[0],
    method: partnerNameOptions[0],
  };
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

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(true);

  const [form, setForm] = useState<TransferInsertPayload>(emptyTransferInsertPayload());
  const [partnerSelection, setPartnerSelection] = useState<PartnerSelection>(emptyPartnerSelection());
  const [tradeRestrictions, setTradeRestrictions] = useState<TradeRestrictions>(emptyTradeRestrictions());
  const [stage, setStage] = useState<Stage>("selectPartner");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<TransferRecord | null>(null);

  // Estimated rate/payout preview — clearly NOT authoritative. The real
  // exchangeRate/fee/totalAmount/receiverAmount only come back once
  // POST /transfers actually succeeds (see `result` above).
  const [estimatedRate, setEstimatedRate] = useState<{ selling: number; unit: number } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBeneficiariesLoading(true);
    if (!isLive) {
      setBeneficiaries(beneficiaryRecords);
      setBeneficiariesLoading(false);
      return;
    }
    listBeneficiaries().then((response) => {
      setBeneficiariesLoading(false);
      if (response.success && Array.isArray(response.data)) setBeneficiaries(response.data);
    });
  }, [isLive]);

  const beneficiaryOptions = beneficiaries.map((b) => `${b.id}`);
  const beneficiaryLabel = (id: string) => beneficiaries.find((b) => String(b.id) === id)?.fullName ?? id;

  // The beneficiary list loads asynchronously, so the dropdown's options
  // aren't known at form-init time — backfill once they arrive rather than
  // leaving the select visually showing an option form.beneficiaryId
  // disagrees with (which was silently keeping the form invalid).
  useEffect(() => {
    if (beneficiaries.length === 0) return;
    setForm((prev) => (prev.beneficiaryId ? prev : { ...prev, beneficiaryId: beneficiaries[0].id }));
  }, [beneficiaries]);

  function updateField<K extends keyof TransferInsertPayload>(field: K, value: TransferInsertPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Debounced (~400ms) estimate — fires on amount/currency change.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!form.destinationCurrency || form.amount <= 0) {
      setEstimatedRate(null);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setEstimating(true);
      const response = await getCountryWiseExRate(form.destinationCurrency);
      setEstimating(false);
      if (response.success && response.data) {
        setEstimatedRate({ selling: response.data.selling, unit: response.data.unit });
      } else {
        setEstimatedRate(null);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.amount, form.destinationCurrency]);

  const estimatedPayout =
    estimatedRate && estimatedRate.selling > 0 ? (form.amount / estimatedRate.selling) * estimatedRate.unit : null;

  const formValid =
    form.beneficiaryId > 0 &&
    form.amount > 0 &&
    form.sourceCurrency &&
    form.destinationCurrency &&
    form.destinationCountry &&
    form.purpose;

  async function handleConfirmSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      const beneficiary = beneficiaries.find((b) => b.id === form.beneficiaryId);
      setResult({
        ...form,
        referenceNumber: `REF-DEMO-${Math.floor(Math.random() * 900000 + 100000)}`,
        senderName: "You",
        receiverName: beneficiary?.fullName ?? "",
        status: "INSERTED",
        provider: "demo",
        providerReference: "",
        exchangeRate: estimatedRate?.selling ?? 0,
        fee: 0,
        totalAmount: form.amount,
        receiverAmount: estimatedPayout ?? 0,
      });
      setSubmitting(false);
      setStage("done");
      return;
    }

    const response = await insertTransfer(form);
    setSubmitting(false);
    if (!response.success || !response.data) {
      setSubmitError(response.message || "Could not send the transaction. Please try again.");
      return;
    }
    setResult(response.data);
    setStage("done");
  }

  function startOver() {
    setForm(emptyTransferInsertPayload());
    setPartnerSelection(emptyPartnerSelection());
    setTradeRestrictions(emptyTradeRestrictions());
    setResult(null);
    setSubmitError(null);
    setEstimatedRate(null);
    setStage("selectPartner");
  }

  if (stage === "selectPartner") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Select Partner to Send Transaction</h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStage("restrictions");
          }}
          className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-2 sm:p-8"
        >
          <SelectField
            label="Partner ID:"
            required
            options={partnerNameOptions}
            defaultValue={partnerNameOptions[0]}
            value={partnerSelection.partnerId}
            onChange={(v) => setPartnerSelection((prev) => ({ ...prev, partnerId: v }))}
          />
          <SelectField
            label="Branch Name:"
            required
            options={branchNameOptions}
            defaultValue={branchNameOptions[0]}
            value={partnerSelection.branchName}
            onChange={(v) => setPartnerSelection((prev) => ({ ...prev, branchName: v }))}
          />
          <SelectField
            label="Country:"
            required
            options={partnerCountrySelectOptions}
            defaultValue={partnerCountrySelectOptions[0]}
            value={partnerSelection.country}
            onChange={(v) => setPartnerSelection((prev) => ({ ...prev, country: v }))}
          />
          <SelectField
            label="Method:"
            required
            options={partnerNameOptions}
            defaultValue={partnerNameOptions[0]}
            value={partnerSelection.method}
            onChange={(v) => setPartnerSelection((prev) => ({ ...prev, method: v }))}
          />
          <div className="sm:col-span-2">
            <Button type="submit" icon={<ArrowRight size={15} />}>
              Continue
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (stage === "restrictions") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">
            Trade Restrictions and Use of Funds Restrictions must be cleared prior to the client before the
            declaration.
          </h1>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setStage("form");
          }}
          className="flex flex-col gap-4 bg-panel p-6 sm:p-8"
        >
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
          <div className="pt-1">
            <Button type="submit" icon={<ArrowRight size={15} />}>
              Continue
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (stage === "done" && result) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Send Transaction</h1>
        </div>
        <div className="bg-panel p-10 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-brand-green" />
          <p className="text-sm text-heading/70">Transaction submitted successfully.</p>
          <p className="mt-2 text-2xl font-bold text-heading">{result.referenceNumber}</p>
          <p className="mt-4 text-sm text-heading/70">
            {result.receiverName} will receive{" "}
            <span className="font-semibold text-heading">
              {formatAccounting(result.receiverAmount)} {result.destinationCurrency}
            </span>
          </p>
          <Button variant="ghost" size="md" className="mt-6" onClick={startOver}>
            Send Another Transaction
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "confirm") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Confirm Transaction</h1>
          <p className="mt-0.5 text-sm text-muted">
            This moves real money — review before submitting. Values below marked "estimated" are not
            authoritative; the real rate/fee/payout are only known once this succeeds.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 bg-panel p-6 sm:grid-cols-2 sm:p-8">
          <ConfirmField label="Beneficiary" value={beneficiaryLabel(String(form.beneficiaryId))} />
          <ConfirmField label="Amount" value={`${formatAccounting(form.amount)} ${form.sourceCurrency}`} />
          <ConfirmField label="Destination" value={`${form.destinationCountry} (${form.destinationCurrency})`} />
          <ConfirmField label="Purpose" value={form.purpose} />
          <ConfirmField
            label="Estimated Payout"
            value={
              estimating
                ? "Calculating..."
                : estimatedPayout !== null
                  ? `≈ ${formatAccounting(estimatedPayout)} ${form.destinationCurrency} (estimate)`
                  : "Unavailable"
            }
          />
          <ConfirmField label="Remarks" value={form.remarks || "-"} />

          {submitError && (
            <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{submitError}</p>
          )}

          <div className="sm:col-span-2 flex items-center gap-3 border-t border-border pt-5">
            <Button onClick={handleConfirmSubmit} loading={submitting} icon={<Send size={15} />}>
              {submitting ? "Submitting..." : "Confirm & Send"}
            </Button>
            <Button variant="secondary" onClick={() => setStage("form")} disabled={submitting}>
              Back to Edit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Send Transaction</h1>
        <p className="mt-0.5 text-sm text-muted">
          {isLive ? "Live remittance API" : "Static demo data"} — POST /transfers.
        </p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          setStage("confirm");
        }}
        className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-2 sm:p-8"
      >
        {beneficiaryOptions.length > 0 ? (
          <SelectField
            label="Beneficiary:"
            required
            options={beneficiaryOptions}
            defaultValue={beneficiaryOptions[0]}
            value={String(form.beneficiaryId)}
            onChange={(v) => updateField("beneficiaryId", Number(v))}
          />
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Beneficiary:</label>
            <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
              {beneficiariesLoading ? "Loading beneficiaries..." : "No beneficiaries found — add one first."}
            </p>
          </div>
        )}
        {beneficiaryOptions.length > 0 && (
          <p className="sm:col-start-2 self-end pb-2.5 text-sm text-heading/70">
            Sending to <span className="font-medium text-heading">{beneficiaryLabel(String(form.beneficiaryId))}</span>
          </p>
        )}

        <TextField
          label="Amount:"
          required
          value={form.amount ? String(form.amount) : ""}
          onChange={(v) => updateField("amount", Number(v) || 0)}
        />
        <SelectField
          label="Source Currency:"
          required
          options={settlementCurrencyOptions}
          defaultValue={settlementCurrencyOptions[0]}
          value={form.sourceCurrency}
          onChange={(v) => updateField("sourceCurrency", v)}
        />
        <SelectField
          label="Destination Country:"
          required
          options={partnerCountrySelectOptions}
          defaultValue={partnerCountrySelectOptions[0]}
          value={form.destinationCountry}
          onChange={(v) => updateField("destinationCountry", v)}
        />
        <SelectField
          label="Destination Currency:"
          required
          options={settlementCurrencyOptions}
          defaultValue={settlementCurrencyOptions[0]}
          value={form.destinationCurrency}
          onChange={(v) => updateField("destinationCurrency", v)}
        />
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

        <div className="sm:col-span-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-heading/70">
          {estimating
            ? "Calculating estimate..."
            : estimatedPayout !== null
              ? `Estimated payout: ≈ ${formatAccounting(estimatedPayout)} ${form.destinationCurrency} — estimate only, not authoritative until submitted.`
              : "Enter an amount and destination currency to see an estimated payout."}
        </div>

        <div className="sm:col-span-2 border-t border-border pt-5">
          <Button type="submit" disabled={!formValid} icon={<ArrowRight size={15} />}>
            Review & Send
          </Button>
        </div>
      </form>
    </div>
  );
}

function ConfirmField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-medium text-heading">{value}</p>
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
