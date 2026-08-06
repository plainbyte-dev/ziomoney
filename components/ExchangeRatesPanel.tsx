"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Search, Upload } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import TextField from "./TextField";
import Checkbox from "./Checkbox";
import { emptyExchangeRatePayload, type ExchangeRateUpsertPayload } from "@/data/exchangeRateData";

// Parses the small admin CSV import format: a header row followed by rows in
// the same column order as ExchangeRateUpsertPayload. No quoted-field
// support — this is a simple internal import, not a general CSV parser.
function parseExchangeRateCsv(text: string): ExchangeRateUpsertPayload[] {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: ExchangeRateUpsertPayload[] = [];

  for (const line of lines.slice(1)) {
    const cells = line.split(",").map((c) => c.trim());
    const get = (key: string) => cells[header.indexOf(key)] ?? "";

    const symbol = get("symbol");
    if (!symbol) continue;

    rows.push({
      symbol,
      countryName: get("countryname"),
      currencyName: get("currencyname"),
      unit: Number(get("unit")) || 0,
      buying: Number(get("buying")) || 0,
      selling: Number(get("selling")) || 0,
      flag: get("flag"),
      countryIsoCode: get("countryisocode"),
      priority: Number(get("priority")) || 0,
      active: get("active").toLowerCase() !== "false",
    });
  }

  return rows;
}

export default function ExchangeRatesPanel() {
  const { isLive } = useDataMode();
  const {
    exchangeRates,
    exchangeRatesLoading,
    exchangeRatesError,
    refreshExchangeRates,
    saveExchangeRate,
    lookupExchangeRate,
    importExchangeRatesFromCsv,
  } = useRates();

  const [form, setForm] = useState<ExchangeRateUpsertPayload>(emptyExchangeRatePayload());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [lookupSymbol, setLookupSymbol] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    refreshExchangeRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive]);

  function updateField<K extends keyof ExchangeRateUpsertPayload>(field: K, value: ExchangeRateUpsertPayload[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaveError(null);
    setSaving(true);
    const ok = await saveExchangeRate(form);
    setSaving(false);
    if (!ok) {
      setSaveError("Could not save the exchange rate. Please try again.");
      return;
    }
    setForm(emptyExchangeRatePayload());
  }

  async function handleLookup() {
    if (!lookupSymbol.trim()) return;
    setLookupError(null);
    setLookupLoading(true);
    const result = await lookupExchangeRate(lookupSymbol);
    setLookupLoading(false);
    if (!result) {
      setLookupError(`No active rate found for "${lookupSymbol.trim().toUpperCase()}".`);
      return;
    }
    setForm({
      symbol: result.symbol,
      countryName: result.countryName,
      currencyName: result.currency,
      unit: result.unit,
      buying: result.buying,
      selling: result.selling,
      flag: result.flag,
      countryIsoCode: result.currencyAcro,
      priority: form.priority,
      active: true,
    });
  }

  async function handleCsvFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const text = await file.text();
    const rows = parseExchangeRateCsv(text);
    if (rows.length === 0) {
      setSaveError("No valid rows found in that CSV file.");
      return;
    }

    setSaveError(null);
    setImporting(true);
    await importExchangeRatesFromCsv(rows);
    setImporting(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="flex items-center justify-between bg-brand-blue px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-white">Exchange Rates</h1>
            <p className="mt-0.5 text-sm text-white/80">
              {isLive ? "Live remittance API" : "Static demo data"} — active rates ordered by display priority.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv,text/csv"
              ref={fileInputRef}
              onChange={handleCsvFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-60"
            >
              <Upload size={13} />
              {importing ? "Importing..." : "Import CSV"}
            </button>
            <button
              onClick={refreshExchangeRates}
              disabled={exchangeRatesLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-60"
            >
              <RefreshCw size={13} className={exchangeRatesLoading ? "animate-spin" : undefined} />
              Refresh
            </button>
          </div>
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
                    <th className="px-4 py-3">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {exchangeRates.map((rate) => (
                    <tr key={rate.id} className="border-b border-border bg-white last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">
                        {rate.flag} {rate.symbol}
                      </td>
                      <td className="px-4 py-3 text-heading/80">{rate.countryName}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.currencyName}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.unit}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.buying}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.selling}</td>
                      <td className="px-4 py-3 text-heading/80">{rate.active ? "Yes" : "No"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-heading/80">{rate.updatedDate || "-"}</td>
                    </tr>
                  ))}

                  {exchangeRates.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                        No exchange rates yet.
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
        <div className="bg-brand-blue px-6 py-4">
          <h2 className="text-base font-bold text-white">Add / Update Rate</h2>
        </div>
        <div className="flex flex-wrap items-end gap-3 border-b border-border bg-panel px-6 pt-6 sm:px-8">
          <div className="w-full max-w-xs">
            <TextField
              label="Look up existing rate by symbol:"
              placeholder="e.g. INR"
              value={lookupSymbol}
              onChange={setLookupSymbol}
            />
          </div>
          <button
            type="button"
            onClick={handleLookup}
            disabled={lookupLoading || !lookupSymbol.trim()}
            className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-2.5 text-sm font-medium text-heading/80 hover:bg-surface disabled:opacity-60"
          >
            <Search size={14} />
            {lookupLoading ? "Looking up..." : "Look up"}
          </button>
          {lookupError && <p className="mb-1.5 text-sm text-red-600">{lookupError}</p>}
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
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-brand-green px-8 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-brand-green-dark disabled:opacity-70"
            >
              {saving ? "Saving..." : "Save Rate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
