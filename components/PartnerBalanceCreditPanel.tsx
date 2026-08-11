"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp } from "lucide-react";
import Button from "./Button";
import SelectField from "./SelectField";
import TextField from "./TextField";
import { usePartners } from "@/contexts/PartnersContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { addActualBalance, updateCreditLimit } from "@/lib/partnersApi";
import { formatAccounting } from "@/lib/format";

// Both actions here move real money exposure, so each requires a
// non-empty audit-note description (not just an amount) before it can be
// submitted — the description is what shows up in the partner's audit trail.
export default function PartnerBalanceCreditPanel() {
  const { entries, updateEntry } = usePartners();
  const { notify } = useNotifications();
  const { isLive } = useDataMode();

  const partnerOptions = entries.map((p) => p.partnerName);
  const [selectedPartner, setSelectedPartner] = useState("");

  useEffect(() => {
    if (partnerOptions.length === 0) return;
    setSelectedPartner((prev) => (prev ? prev : partnerOptions[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partnerOptions.length]);

  const selectedEntry = entries.find((p) => p.partnerName === selectedPartner) ?? null;

  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceNote, setBalanceNote] = useState("");
  const [balanceConfirmed, setBalanceConfirmed] = useState(false);
  const [balanceSaving, setBalanceSaving] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const [creditAmount, setCreditAmount] = useState("");
  const [creditNote, setCreditNote] = useState("");
  const [creditConfirmed, setCreditConfirmed] = useState(false);
  const [creditSaving, setCreditSaving] = useState(false);
  const [creditError, setCreditError] = useState<string | null>(null);

  async function handleAddBalance(event: React.FormEvent) {
    event.preventDefault();
    setBalanceError(null);
    if (!selectedEntry) return;
    const amount = Number(balanceAmount);
    if (!amount) {
      setBalanceError("Enter a non-zero amount.");
      return;
    }
    if (!balanceNote.trim()) {
      setBalanceError("An audit note describing this adjustment is required.");
      return;
    }
    if (!balanceConfirmed) {
      setBalanceError("Confirm this adjustment before submitting — it moves real settled funds.");
      return;
    }

    setBalanceSaving(true);
    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateEntry(selectedEntry.id, {
        balance: (selectedEntry.balance ?? 0) + amount,
        creditLimit: (selectedEntry.creditLimit ?? 0) + amount,
      });
      notify({
        title: "Balance added",
        message: `${formatAccounting(amount)} added to ${selectedEntry.partnerName}'s actual balance.`,
      });
      setBalanceSaving(false);
      setBalanceAmount("");
      setBalanceNote("");
      setBalanceConfirmed(false);
      return;
    }

    const response = await addActualBalance(selectedEntry.partnerName, amount, balanceNote);
    setBalanceSaving(false);
    if (!response.success) {
      setBalanceError(response.message || "Could not add balance. Please try again.");
      return;
    }
    updateEntry(selectedEntry.id, {
      balance: response.data?.balance ?? (selectedEntry.balance ?? 0) + amount,
      creditLimit: response.data?.accountBalance ?? (selectedEntry.creditLimit ?? 0) + amount,
    });
    notify({
      title: "Balance added",
      message: `${formatAccounting(amount)} added to ${selectedEntry.partnerName}'s actual balance.`,
    });
    setBalanceAmount("");
    setBalanceNote("");
    setBalanceConfirmed(false);
  }

  async function handleUpdateCreditLimit(event: React.FormEvent) {
    event.preventDefault();
    setCreditError(null);
    if (!selectedEntry) return;
    const amount = Number(creditAmount);
    if (!amount) {
      setCreditError("Enter a non-zero amount.");
      return;
    }
    if (!creditNote.trim()) {
      setCreditError("An audit note describing this adjustment is required.");
      return;
    }
    if (!creditConfirmed) {
      setCreditError("Confirm this adjustment before submitting — it changes how much credit this partner is trusted with.");
      return;
    }

    setCreditSaving(true);
    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      updateEntry(selectedEntry.id, { creditLimit: (selectedEntry.creditLimit ?? 0) + amount });
      notify({
        title: "Credit limit updated",
        message: `${selectedEntry.partnerName}'s credit limit extended by ${formatAccounting(amount)}.`,
      });
      setCreditSaving(false);
      setCreditAmount("");
      setCreditNote("");
      setCreditConfirmed(false);
      return;
    }

    const response = await updateCreditLimit(selectedEntry.partnerName, amount, creditNote);
    setCreditSaving(false);
    if (!response.success) {
      setCreditError(response.message || "Could not update the credit limit. Please try again.");
      return;
    }
    updateEntry(selectedEntry.id, {
      creditLimit: response.data?.accountBalance ?? (selectedEntry.creditLimit ?? 0) + amount,
    });
    notify({
      title: "Credit limit updated",
      message: `${selectedEntry.partnerName}'s credit limit extended by ${formatAccounting(amount)}.`,
    });
    setCreditAmount("");
    setCreditNote("");
    setCreditConfirmed(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Balance & Credit Adjustments</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — moves real money exposure, review before
            submitting.
          </p>
        </div>
        <div className="bg-panel p-6 sm:p-8">
          {partnerOptions.length > 0 ? (
            <div className="max-w-sm">
              <SelectField
                label="Partner:"
                required
                options={partnerOptions}
                defaultValue={partnerOptions[0]}
                value={selectedPartner}
                onChange={setSelectedPartner}
              />
            </div>
          ) : (
            <p className="rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-muted">
              No partners found — create one under Create New Partner first.
            </p>
          )}

          {selectedEntry && (
            <div className="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Actual Balance</p>
                <p className="mt-1 text-xl font-bold text-heading">{formatAccounting(selectedEntry.balance ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Credit Limit</p>
                <p className="mt-1 text-xl font-bold text-heading">{formatAccounting(selectedEntry.creditLimit ?? 0)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedEntry && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-heading">
                <Wallet size={16} className="text-brand-green" /> Add Actual Balance
              </h2>
              <p className="mt-0.5 text-xs text-muted">Records real settled money paid in — moves both balance and credit limit.</p>
            </div>
            <form onSubmit={handleAddBalance} className="flex flex-col gap-4 bg-panel p-6">
              <TextField label="Amount:" required value={balanceAmount} onChange={setBalanceAmount} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-heading/70">
                  Audit Note: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={balanceNote}
                  onChange={(event) => setBalanceNote(event.target.value)}
                  placeholder="Why is this balance being added (e.g. wire reference)?"
                  className="w-full rounded-xl border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                />
              </div>
              <label className="flex items-start gap-2 text-sm text-heading/80">
                <input
                  type="checkbox"
                  checked={balanceConfirmed}
                  onChange={() => setBalanceConfirmed((v) => !v)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue"
                />
                I confirm this amount and note are correct — this moves real settled funds.
              </label>
              {balanceError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{balanceError}</p>}
              <Button type="submit" loading={balanceSaving}>
                {balanceSaving ? "Submitting..." : "Add Balance"}
              </Button>
            </form>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border shadow-card">
            <div className="border-b border-border px-6 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-heading">
                <TrendingUp size={16} className="text-brand-blue" /> Update Credit Limit
              </h2>
              <p className="mt-0.5 text-xs text-muted">Extends how much credit this partner is trusted with — no real money involved.</p>
            </div>
            <form onSubmit={handleUpdateCreditLimit} className="flex flex-col gap-4 bg-panel p-6">
              <TextField label="Amount:" required value={creditAmount} onChange={setCreditAmount} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-heading/70">
                  Audit Note: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={creditNote}
                  onChange={(event) => setCreditNote(event.target.value)}
                  placeholder="Why is this credit limit being changed?"
                  className="w-full rounded-xl border border-border bg-panel px-3 py-2.5 text-sm text-heading focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                />
              </div>
              <label className="flex items-start gap-2 text-sm text-heading/80">
                <input
                  type="checkbox"
                  checked={creditConfirmed}
                  onChange={() => setCreditConfirmed((v) => !v)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-brand-blue focus:ring-brand-blue"
                />
                I confirm this amount and note are correct.
              </label>
              {creditError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{creditError}</p>}
              <Button type="submit" loading={creditSaving} variant="secondary">
                {creditSaving ? "Submitting..." : "Update Credit Limit"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
