"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useAuth } from "@/contexts/AuthContext";
import TextField from "./TextField";
import SelectField from "./SelectField";
import Button from "./Button";
import {
  emptyPartnerOfferRateInsertPayload,
  quoteTypeValues,
  type PartnerOfferRateInsertPayload,
} from "@/data/partnerOfferRateData";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  CONFIRMED: "bg-brand-green-light text-brand-green-dark",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function PartnerOfferRatesPanel() {
  const { isLive } = useDataMode();
  const { user } = useAuth();
  const {
    partnerOfferRates,
    partnerOfferRatesLoading,
    partnerOfferRateActionError,
    refreshPartnerOfferRates,
    insertOfferRate,
    confirmOfferRate,
    cancelOfferRate,
  } = useRates();

  const [form, setForm] = useState<PartnerOfferRateInsertPayload>(emptyPartnerOfferRateInsertPayload());
  const [submitting, setSubmitting] = useState(false);
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    refreshPartnerOfferRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  function updateField<K extends keyof PartnerOfferRateInsertPayload>(
    field: K,
    value: PartnerOfferRateInsertPayload[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    const ok = await insertOfferRate({ ...form, makerUser: form.makerUser || user?.name || "" });
    setSubmitting(false);
    if (ok) setForm(emptyPartnerOfferRateInsertPayload());
  }

  async function handleConfirm(uniqueId: string) {
    setActioningId(uniqueId);
    await confirmOfferRate({ uniqueId, checkerUser: user?.name || "" });
    setActioningId(null);
  }

  async function handleCancel(uniqueId: string) {
    setActioningId(uniqueId);
    await cancelOfferRate({ uniqueId, checkerUser: user?.name || "" });
    setActioningId(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-heading">Partner Offer Rates</h1>
            <p className="mt-0.5 text-sm text-muted">
              {isLive ? "Live remittance API" : "Static demo data"} — maker-checker workflow for partner-quoted
              rates.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshPartnerOfferRates}
            disabled={partnerOfferRatesLoading}
            icon={<RefreshCw size={13} className={partnerOfferRatesLoading ? "animate-spin" : undefined} />}
          >
            Refresh
          </Button>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          {partnerOfferRateActionError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {partnerOfferRateActionError}
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Unique ID</th>
                    <th className="px-4 py-3">Partner</th>
                    <th className="px-4 py-3">Send → Receive</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Maker / Checker</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {partnerOfferRates.map((entry) => (
                    <tr key={entry.id} className="border-b border-border bg-panel last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">{entry.uniqueId}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.remittancePartner}</td>
                      <td className="px-4 py-3 text-heading/80">
                        {entry.sendCurrency} → {entry.receiveCurrency}
                      </td>
                      <td className="px-4 py-3 text-heading/80">{entry.destCountry}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.rate || entry.directQuote}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            STATUS_STYLES[entry.status] ?? "bg-surface text-heading/70"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-heading/80">
                        {entry.makerUser}
                        {entry.checkerUser ? ` / ${entry.checkerUser}` : ""}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {entry.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleConfirm(entry.uniqueId)}
                              disabled={actioningId === entry.uniqueId}
                              className="rounded-lg border border-brand-green bg-brand-green-light px-3 py-1.5 text-xs font-semibold text-brand-green-dark hover:bg-brand-green/20 disabled:opacity-60"
                            >
                              Confirm
                            </button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleCancel(entry.uniqueId)}
                              disabled={actioningId === entry.uniqueId}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {partnerOfferRates.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                        No pending partner offer rates.
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
          <h2 className="text-base font-bold text-heading">Submit New Offer Rate</h2>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-3 sm:p-8">
          <TextField
            label="Remittance Partner:"
            required
            value={form.remittancePartner}
            onChange={(v) => updateField("remittancePartner", v)}
          />
          <TextField
            label="Send Currency:"
            required
            value={form.sendCurrency}
            onChange={(v) => updateField("sendCurrency", v.toUpperCase())}
          />
          <TextField
            label="Receive Currency:"
            required
            value={form.receiveCurrency}
            onChange={(v) => updateField("receiveCurrency", v.toUpperCase())}
          />
          <TextField
            label="Destination Country:"
            required
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
            value={String(form.sendCurrencyPerUsd)}
            onChange={(v) => updateField("sendCurrencyPerUsd", Number(v) || 0)}
          />
          <TextField
            label="Receive Currency per USD:"
            value={String(form.receiveCurrencyPerUsd)}
            onChange={(v) => updateField("receiveCurrencyPerUsd", Number(v) || 0)}
          />
          <TextField
            label="Direct Quote:"
            value={String(form.directQuote)}
            onChange={(v) => updateField("directQuote", Number(v) || 0)}
          />
          <TextField
            label="Maker User:"
            placeholder={user?.name ?? "Defaults to your account"}
            value={form.makerUser}
            onChange={(v) => updateField("makerUser", v)}
          />

          <div className="sm:col-span-3 mt-2 border-t border-border pt-5">
            <Button type="submit" loading={submitting}>
              {submitting ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
