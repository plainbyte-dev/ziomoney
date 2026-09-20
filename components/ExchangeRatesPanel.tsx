"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Search, Upload } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { usePartners } from "@/contexts/PartnersContext";
import { useDataMode } from "@/contexts/DataModeContext";
import { useTabs } from "@/contexts/TabsContext";
import TextField from "./TextField";
import Checkbox from "./Checkbox";
import Button from "./Button";
import ExchangeRateSetupModal, { type ExchangeRateSetupTarget } from "./ExchangeRateSetupModal";
import { emptyExchangeRatePayload, type ExchangeRateRecord, type ExchangeRateUpsertPayload } from "@/data/exchangeRateData";
import { setupTypeLabels } from "@/data/setupTypeData";
import { dedupePartnerEntriesByName } from "@/data/partnerData";
import { payoutPartnerWiseTabKey } from "@/data/tabRegistry";

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
      // CSV import is a bulk, country-level operation — no per-partner
      // override column, so every imported row defaults to Country Wise.
      partnerNameMOCKONLY: "",
      setupTypeMOCKONLY: "COUNTRY",
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
    countryCurrencies,
  } = useRates();
  const { entries: partners } = usePartners();
  const { openTab } = useTabs();

  // One row per registered partner — the setup grid below, matching the
  // legacy Country/Partner/[3 setup links] layout. Deduplicated by name in
  // case the same partner appears more than once in Partner Info, merging
  // txnCurrencies/destCountries across duplicates rather than picking one
  // arbitrarily.
  const partnerRows = dedupePartnerEntriesByName(partners);

  const [setupTarget, setSetupTarget] = useState<ExchangeRateSetupTarget | null>(null);
  const [setupSaving, setSetupSaving] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

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

  async function handleSetupSave(payload: ExchangeRateUpsertPayload) {
    setSetupError(null);
    setSetupSaving(true);
    const ok = await saveExchangeRate(payload);
    setSetupSaving(false);
    if (!ok) {
      setSetupError("Could not save this setup. Please try again.");
      return;
    }
    setSetupTarget(null);
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
      partnerNameMOCKONLY: form.partnerNameMOCKONLY,
      setupTypeMOCKONLY: form.setupTypeMOCKONLY,
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
        <div className="border-b border-border flex items-center justify-between gap-3 px-6 py-4">
          <div>
            <h1 className="text-lg font-bold text-heading">Exchange Rate Setup</h1>
            <p className="mt-0.5 text-sm text-muted">
              Pick a scope for each partner — Country Wise applies to everyone trading that country, Payout
              Partner Wise and 3rd Party API Agent wise override it for one partner.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <input
              type="file"
              accept=".csv,text/csv"
              ref={fileInputRef}
              onChange={handleCsvFileChange}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              loading={importing}
              icon={<Upload size={13} />}
            >
              {importing ? "Importing..." : "Import CSV"}
            </Button>
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
        </div>
        {exchangeRatesError && (
          <p className="mx-6 mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{exchangeRatesError}</p>
        )}
        <div className="overflow-x-auto bg-panel p-6 sm:p-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Partner Name</th>
                  <th className="px-4 py-3">Exchange Rate Setup</th>
                </tr>
              </thead>
              <tbody>
                {partnerRows.map((partner) => (
                  <tr key={partner.id} className="border-b border-border bg-panel last:border-b-0">
                    <td className="px-4 py-3 text-heading/80">{partner.country}</td>
                    <td className="px-4 py-3 font-medium text-heading">{partner.partnerName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            openTab({ key: "exchange-rate-country-wise", title: "Country Wise Exchange Rates" })
                          }
                        >
                          {setupTypeLabels.COUNTRY}
                        </Button>

                        {partner.destCountries && partner.destCountries.length > 0 ? (
                          <>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                openTab({
                                  key: payoutPartnerWiseTabKey(partner.partnerName, "rate"),
                                  title: `Payout Partner Wise — ${partner.partnerName}`,
                                })
                              }
                            >
                              {setupTypeLabels.PARTNER}
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                setSetupTarget({ partnerName: partner.partnerName, setupType: "THIRD_PARTY_AGENT" })
                              }
                            >
                              {setupTypeLabels.THIRD_PARTY_AGENT}
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted">
                            No destination countries enabled — add some in Manage Partner.
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {partnerRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-sm text-muted">
                      No partners registered yet — add one under Partner Info first.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ExchangeRateSetupModal
        target={setupTarget}
        exchangeRates={exchangeRates}
        countryCurrencies={countryCurrencies}
        partners={partners}
        saving={setupSaving}
        error={setupError}
        onCancel={() => {
          setSetupTarget(null);
          setSetupError(null);
        }}
        onSave={handleSetupSave}
      />

      {/* <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-heading">Add / Update Rate</h2>
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
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="mb-1.5"
            onClick={handleLookup}
            disabled={!lookupSymbol.trim()}
            loading={lookupLoading}
            icon={<Search size={14} />}
          >
            {lookupLoading ? "Looking up..." : "Look up"}
          </Button>
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
            <Button type="submit" loading={saving}>
              {saving ? "Saving..." : "Save Rate"}
            </Button>
          </div>
        </form>
      </div> */}
    </div>
  );
}
