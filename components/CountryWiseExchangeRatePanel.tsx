"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, X } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import TextField from "./TextField";
import Checkbox from "./Checkbox";
import Button from "./Button";
import { emptyExchangeRatePayload, type ExchangeRateRecord, type ExchangeRateUpsertPayload } from "@/data/exchangeRateData";

// Dedicated tab for the "Country Wise" link on the Exchange Rate Setup grid
// (ExchangeRatesPanel) — Country Wise isn't scoped to any one partner, so
// unlike Payout Partner Wise / 3rd Party API Agent wise (which open a modal
// pre-filled for that one row), this shows every country-wide rate in its
// own full table/tab.
export default function CountryWiseExchangeRatePanel() {
  const { isLive } = useDataMode();
  const { exchangeRates, exchangeRatesLoading, exchangeRatesError, refreshExchangeRates, saveExchangeRate } =
    useRates();

  const countryWiseRates = exchangeRates.filter((rate) => rate.setupTypeMOCKONLY === "COUNTRY");

  const [editingSymbol, setEditingSymbol] = useState<string | null>(null);
  const [form, setForm] = useState<ExchangeRateUpsertPayload>(emptyExchangeRatePayload());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    refreshExchangeRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  function updateField<K extends keyof ExchangeRateUpsertPayload>(field: K, value: ExchangeRateUpsertPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function startEdit(rate: ExchangeRateRecord) {
    setEditingSymbol(rate.symbol);
    setForm({
      symbol: rate.symbol,
      countryName: rate.countryName,
      currencyName: rate.currencyName,
      unit: rate.unit,
      buying: rate.buying,
      selling: rate.selling,
      flag: rate.flag,
      countryIsoCode: rate.countryIsoCode,
      priority: rate.priority,
      active: rate.active,
      partnerNameMOCKONLY: "",
      setupTypeMOCKONLY: "COUNTRY",
    });
    setSaveError(null);
  }

  function cancelEdit() {
    setEditingSymbol(null);
    setForm(emptyExchangeRatePayload());
    setSaveError(null);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaving(true);
    const ok = await saveExchangeRate({ ...form, partnerNameMOCKONLY: "", setupTypeMOCKONLY: "COUNTRY" });
    setSaving(false);
    if (!ok) {
      setSaveError("Could not save this rate. Please try again.");
      return;
    }
    cancelEdit();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-heading">Country Wise Exchange Rates</h1>
            <p className="mt-0.5 text-sm text-muted">
              {isLive ? "Live remittance API" : "Static demo data"} — rates that apply to every partner trading
              a given country, rather than one partner's own override.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshExchangeRates}
            disabled={exchangeRatesLoading}
            icon={<RefreshCw size={13} className={exchangeRatesLoading ? "animate-spin" : undefined} />}
          >
            Refresh
          </Button>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          {exchangeRatesError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{exchangeRatesError}</p>
          )}

          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Symbol</th>
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Currency</th>
                    <th className="px-4 py-3">Unit</th>
                    <th className="px-4 py-3">Buying</th>
                    <th className="px-4 py-3">Selling</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {countryWiseRates.map((rate) => (
                    <tr key={rate.id} className="border-b border-border bg-panel last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">
                        {rate.flag} {rate.symbol}
                      </td>
                      <td className="px-4 py-3 text-heading/80">{rate.countryName}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.currencyName}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.unit}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.buying}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.selling}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.active ? "Yes" : "No"}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <button
                          onClick={() => startEdit(rate)}
                          className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-heading/80 hover:bg-border"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}

                  {countryWiseRates.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                        No Country Wise rates configured yet.
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
          <h2 className="text-base font-bold text-heading">
            {editingSymbol === null ? "Add Country Wise Rate" : `Update ${editingSymbol}`}
          </h2>
        </div>
        <form onSubmit={handleSave} className="grid grid-cols-1 gap-x-6 gap-y-5 bg-panel p-6 sm:grid-cols-3 sm:p-8">
          <TextField label="Symbol:" required value={form.symbol} onChange={(v) => updateField("symbol", v)} />
          <TextField
            label="Country Name:"
            required
            value={form.countryName}
            onChange={(v) => updateField("countryName", v)}
          />
          <TextField
            label="Currency Name:"
            required
            value={form.currencyName}
            onChange={(v) => updateField("currencyName", v)}
          />
          <TextField
            label="Country ISO Code:"
            value={form.countryIsoCode}
            onChange={(v) => updateField("countryIsoCode", v)}
          />
          <TextField label="Flag (emoji):" value={form.flag} onChange={(v) => updateField("flag", v)} />
          <TextField
            label="Unit:"
            value={String(form.unit)}
            onChange={(v) => updateField("unit", Number(v) || 0)}
          />
          <TextField
            label="Buying:"
            value={String(form.buying)}
            onChange={(v) => updateField("buying", Number(v) || 0)}
          />
          <TextField
            label="Selling:"
            value={String(form.selling)}
            onChange={(v) => updateField("selling", Number(v) || 0)}
          />
          <TextField
            label="Priority:"
            value={String(form.priority)}
            onChange={(v) => updateField("priority", Number(v) || 0)}
          />
          <div className="flex items-end pb-2.5">
            <Checkbox checked={form.active} onToggle={() => updateField("active", !form.active)} label="Active" />
          </div>

          <div className="sm:col-span-3 mt-2 border-t border-border pt-5">
            {saveError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{saveError}</p>
            )}
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving} icon={editingSymbol === null ? <Plus size={15} /> : undefined}>
                {saving ? "Saving..." : editingSymbol === null ? "Add Rate" : "Update Rate"}
              </Button>
              {editingSymbol !== null && (
                <Button type="button" variant="secondary" onClick={cancelEdit} icon={<X size={15} />}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
