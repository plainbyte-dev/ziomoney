"use client";

import { useEffect, useState } from "react";
import Button from "./Button";
import TextField from "./TextField";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { getPayoutPartner, requestPayoutBankUpdate } from "@/lib/partnersApi";
import { emptyPayoutBankPayload, type PayoutBankUpdatePayload } from "@/data/payoutBankData";

// Normalizes getPayoutPartner's response — the Swagger schema is ambiguous
// about array-vs-single-value shape, so this accepts either.
function normalizePayoutPartnerValues(data: unknown): string[] {
  if (Array.isArray(data)) return data.filter((v): v is string => typeof v === "string");
  if (typeof data === "string" && data) return [data];
  return [];
}

// NCHL (Nepal Clearing House) bank/branch reference data — upserted by id
// (0/omitted = insert, existing id = update). Not scoped to any remittance
// partner; there is no "list all" endpoint, so saved rows only accumulate
// here in this session, same as Partner Commission's search-and-save pattern.
export default function PayoutBanksPanel() {
  const { notify } = useNotifications();
  const { isLive } = useDataMode();

  const [payoutPartnerValues, setPayoutPartnerValues] = useState<string[]>([]);
  const [payoutPartnerLoading, setPayoutPartnerLoading] = useState(false);

  useEffect(() => {
    if (!isLive) return;
    setPayoutPartnerLoading(true);
    getPayoutPartner().then((response) => {
      setPayoutPartnerLoading(false);
      if (response.success) setPayoutPartnerValues(normalizePayoutPartnerValues(response.data));
    });
  }, [isLive]);

  const [form, setForm] = useState<PayoutBankUpdatePayload>(emptyPayoutBankPayload());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedBanks, setSavedBanks] = useState<PayoutBankUpdatePayload[]>([]);

  function updateField<K extends keyof PayoutBankUpdatePayload>(field: K, value: PayoutBankUpdatePayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);

    if (!form.payoutBank.trim() || !form.payoutBankBranch.trim()) {
      setSaveError("Bank name and branch name are required.");
      return;
    }

    setSaving(true);
    if (!isLive) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const saved = { ...form, id: form.id || Date.now() };
      setSavedBanks((prev) => [saved, ...prev.filter((b) => b.id !== saved.id)]);
      notify({ title: "Payout bank saved", message: `${saved.payoutBank} / ${saved.payoutBankBranch} was saved.` });
      setSaving(false);
      setForm(emptyPayoutBankPayload());
      return;
    }

    const response = await requestPayoutBankUpdate(form);
    setSaving(false);
    if (!response.success) {
      setSaveError(response.message || "Could not submit the bank update.");
      return;
    }
    const saved = response.data ?? form;
    setSavedBanks((prev) => [saved, ...prev.filter((b) => b.id !== saved.id)]);
    notify({ title: "Payout bank saved", message: `${saved.payoutBank} / ${saved.payoutBankBranch} was saved.` });
    setForm(emptyPayoutBankPayload());
  }

  return (
    <div className="flex flex-col gap-6">
      {isLive && (
        <div className="overflow-hidden rounded-2xl border border-border shadow-card">
          <div className="border-b border-border px-6 py-4">
            <h1 className="text-lg font-bold text-heading">Payout Partner Values</h1>
            <p className="mt-0.5 text-sm text-muted">Reference enum from the remittance API.</p>
          </div>
          <div className="flex flex-wrap gap-2 bg-panel p-6 sm:p-8">
            {payoutPartnerLoading ? (
              <p className="text-sm text-muted">Loading...</p>
            ) : payoutPartnerValues.length > 0 ? (
              payoutPartnerValues.map((value) => (
                <span key={value} className="rounded-full bg-brand-blue-light px-3 py-1 text-xs font-semibold text-brand-blue">
                  {value}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted">No values returned.</p>
            )}
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-heading">Payout Bank / Branch (NCHL Reference)</h2>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — insert or update an NCHL bank/branch code
            mapping. Leave ID blank to insert a new one.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-3 sm:p-8">
          <TextField
            label="ID (leave 0 to insert):"
            value={String(form.id)}
            onChange={(v) => updateField("id", Number(v) || 0)}
          />
          <TextField label="Payout Bank:" required value={form.payoutBank} onChange={(v) => updateField("payoutBank", v)} />
          <TextField
            label="NCHL Bank ID:"
            value={String(form.nchlBankId)}
            onChange={(v) => updateField("nchlBankId", Number(v) || 0)}
          />
          <TextField
            label="Payout Bank Branch:"
            required
            value={form.payoutBankBranch}
            onChange={(v) => updateField("payoutBankBranch", v)}
          />
          <TextField
            label="NCHL Bank Branch ID:"
            value={String(form.nchlBankBranchId)}
            onChange={(v) => updateField("nchlBankBranchId", Number(v) || 0)}
          />

          <div className="sm:col-span-3 mt-2 border-t border-border pt-5">
            {saveError && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>}
            <Button type="submit" loading={saving}>
              {saving ? "Submitting..." : "Save Bank / Branch"}
            </Button>
          </div>
        </form>

        <div className="overflow-x-auto border-t border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Payout Bank</th>
                <th className="px-4 py-3">NCHL Bank ID</th>
                <th className="px-4 py-3">Branch</th>
                <th className="px-4 py-3">NCHL Branch ID</th>
              </tr>
            </thead>
            <tbody>
              {savedBanks.map((bank) => (
                <tr key={bank.id} className="border-b border-border bg-panel last:border-b-0">
                  <td className="px-4 py-3 text-heading/80">{bank.id}</td>
                  <td className="px-4 py-3 font-medium text-heading">{bank.payoutBank}</td>
                  <td className="px-4 py-3 text-heading/80">{bank.nchlBankId}</td>
                  <td className="px-4 py-3 text-heading/80">{bank.payoutBankBranch}</td>
                  <td className="px-4 py-3 text-heading/80">{bank.nchlBankBranchId}</td>
                </tr>
              ))}
              {savedBanks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                    No bank/branch records saved this session yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
