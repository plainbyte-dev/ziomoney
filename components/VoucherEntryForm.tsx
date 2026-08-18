"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import RadioPill from "./RadioPill";
import DateInput from "./DateInput";
import CurrencySelect from "./CurrencySelect";
import Button from "./Button";
import { useRates } from "@/contexts/RatesContext";
import { formatAmount } from "@/lib/format";
import {
  voucherLedgerOptions,
  drCrOptions,
  voucherCalcModeOptions,
  applyLedgerOptions,
  type DrCr,
  type VoucherCalcMode,
  type VoucherLine,
} from "@/data/voucherEntryData";

interface VoucherEntryFormProps {
  onSave: (lines: VoucherLine[], narration: string) => void;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function VoucherEntryForm({ onSave }: VoucherEntryFormProps) {
  const { countryCurrencies } = useRates();
  const localCurrencyOptions = [...new Set(countryCurrencies.map((c) => c.currencyCode).filter(Boolean))].sort();

  const [voucherDate, setVoucherDate] = useState(todayIso());
  const [ledger, setLedger] = useState(voucherLedgerOptions[0]);
  const [drCr, setDrCr] = useState<DrCr>("DR");
  const [rowAmount, setRowAmount] = useState("");

  const [calcMode, setCalcMode] = useState<VoucherCalcMode>("Calc by USD");
  const [voucherAmount, setVoucherAmount] = useState("");
  const [localAmount, setLocalAmount] = useState("");
  const [localCurrency, setLocalCurrency] = useState("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [applyLedger, setApplyLedger] = useState(applyLedgerOptions[0]);
  const [jpyRate, setJpyRate] = useState("");
  const [narration, setNarration] = useState("");

  const [lines, setLines] = useState<VoucherLine[]>([]);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  const totalDr = lines.filter((l) => l.drCr === "DR").reduce((sum, l) => sum + l.amount, 0);
  const totalCr = lines.filter((l) => l.drCr === "CR").reduce((sum, l) => sum + l.amount, 0);

  const usingUsd = calcMode === "Calc by USD";

  function handleAdd() {
    const amount = Number(rowAmount || voucherAmount);
    if (!amount) return;

    setLines((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        ledger,
        drCr,
        amount,
        currency: usingUsd ? "USD" : localCurrency || "USD",
      },
    ]);
    setRowAmount("");
    setVoucherAmount("");
  }

  function handleRemove() {
    if (!selectedLineId) return;
    setLines((prev) => prev.filter((line) => line.id !== selectedLineId));
    setSelectedLineId(null);
  }

  function handleClear() {
    setLines([]);
    setSelectedLineId(null);
    setRowAmount("");
    setVoucherAmount("");
    setLocalAmount("");
    setExchangeRate("");
    setJpyRate("");
    setNarration("");
  }

  function handleSave() {
    if (lines.length === 0) return;
    onSave(lines, narration);
    handleClear();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border shadow-card">
      <div className="border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-heading">Voucher Entry</h1>
      </div>

      <div className="bg-panel p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Voucher Date:</label>
            <DateInput value={voucherDate} onChange={setVoucherDate} />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label className="text-sm text-heading/70">Ledger:</label>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={ledger}
              onChange={(event) => setLedger(event.target.value)}
              className="min-w-[220px] flex-1 rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              {voucherLedgerOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={drCr}
              onChange={(event) => setDrCr(event.target.value as DrCr)}
              className="rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              {drCrOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={rowAmount}
              onChange={(event) => setRowAmount(event.target.value)}
              placeholder="0.00"
              className="w-40 rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-heading placeholder:text-muted focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-6">
          {voucherCalcModeOptions.map((option) => (
            <RadioPill
              key={option}
              label={option}
              checked={calcMode === option}
              onSelect={() => setCalcMode(option)}
            />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Voucher Amount:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={voucherAmount}
                onChange={(event) => setVoucherAmount(event.target.value)}
                disabled={!usingUsd}
                className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green disabled:bg-surface disabled:text-muted"
              />
              <span className="shrink-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-muted">
                USD
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Local Currency:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={localAmount}
                onChange={(event) => setLocalAmount(event.target.value)}
                disabled={usingUsd}
                className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green disabled:bg-surface disabled:text-muted"
              />
              <CurrencySelect
                bare
                label="Local Currency"
                options={localCurrencyOptions}
                value={localCurrency}
                onChange={setLocalCurrency}
                disabled={usingUsd}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Exchange Rate:</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={exchangeRate}
                onChange={(event) => setExchangeRate(event.target.value)}
                className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
              />
              <span className="shrink-0 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-medium text-muted">
                {usingUsd ? "USD" : localCurrency || "CCY"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-heading/70">Apply Ledger:</label>
            <select
              value={applyLedger}
              onChange={(event) => setApplyLedger(event.target.value)}
              className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            >
              {applyLedgerOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button type="button" variant="secondary" size="md" onClick={handleAdd} icon={<Plus size={15} />}>
            Add
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleRemove}
            disabled={!selectedLineId}
            icon={<Trash2 size={15} />}
          >
            Remove
          </Button>
        </div>

        <div className="mt-3 min-h-[120px] overflow-x-auto rounded-xl border border-border">
          {lines.length === 0 ? (
            <p className="flex h-[120px] items-center justify-center text-sm text-muted">
              No voucher lines added yet.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                  <th className="px-4 py-2">Ledger</th>
                  <th className="px-4 py-2">DR/CR</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                  <th className="px-4 py-2">CCY</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr
                    key={line.id}
                    onClick={() => setSelectedLineId(line.id)}
                    className={`cursor-pointer border-b border-border last:border-b-0 ${
                      selectedLineId === line.id ? "bg-brand-green-light/40" : "bg-panel"
                    }`}
                  >
                    <td className="px-4 py-2 text-heading/80">{line.ledger}</td>
                    <td className="px-4 py-2 text-heading/80">{line.drCr}</td>
                    <td className="px-4 py-2 text-right text-heading/80">
                      {formatAmount(line.amount)}
                    </td>
                    <td className="px-4 py-2 text-heading/80">{line.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-heading/70">Total</label>
            <span className="text-sm text-heading/70">Dr</span>
            <input
              readOnly
              value={formatAmount(totalDr)}
              className="w-32 rounded-lg border border-border bg-surface px-3 py-2 text-right text-sm text-heading"
            />
            <span className="text-sm text-heading/70">Cr</span>
            <input
              readOnly
              value={formatAmount(totalCr)}
              className="w-32 rounded-lg border border-border bg-surface px-3 py-2 text-right text-sm text-heading"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label className="text-sm text-heading/70">JPY RATE</label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={jpyRate}
              onChange={(event) => setJpyRate(event.target.value)}
              className="w-40 rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
            <span className="text-sm italic text-red-500">
              Enter JPY USD Rate to effect JPY Ledger (Optional)
            </span>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1.5">
          <label className="text-sm text-heading/70">Narration</label>
          <textarea
            value={narration}
            onChange={(event) => setNarration(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={lines.length === 0}>
            Save
          </Button>
          <Button type="button" variant="secondary" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
