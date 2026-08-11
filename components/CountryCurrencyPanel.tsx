"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useRates } from "@/contexts/RatesContext";
import { useDataMode } from "@/contexts/DataModeContext";
import Button from "./Button";
import {
  countryCurrencyFields,
  type CountryCurrencyImportRowResult,
  type CountryCurrencyUpsertPayload,
} from "@/data/countryCurrencyData";
import { loadState, saveState } from "@/lib/persist";

const MAPPING_STORAGE_KEY = "zio-country-currency-csv-mapping";
const NOT_MAPPED = "";

// Simple comma-split parser, same approach as the Exchange Rate CSV import —
// no quoted-field support, this is a small internal import tool.
function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => line.split(",").map((c) => c.trim()));
  return { headers, rows };
}

type FieldMapping = Record<string, string>; // field key -> CSV header name

export default function CountryCurrencyPanel() {
  const { isLive } = useDataMode();
  const { countryCurrencies, countryCurrencyImporting, importCountryCurrencyCsv } = useRates();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<FieldMapping>({});
  const [parseError, setParseError] = useState<string | null>(null);
  const [results, setResults] = useState<CountryCurrencyImportRowResult[] | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setResults(null);
    setParseError(null);

    file.text().then((text) => {
      const parsed = parseCsv(text);
      if (parsed.headers.length === 0) {
        setParseError("No rows found in that CSV file.");
        setFileName(null);
        setHeaders([]);
        setCsvRows([]);
        return;
      }

      setFileName(file.name);
      setHeaders(parsed.headers);
      setCsvRows(parsed.rows);

      // Re-apply the last mapping if this file's headers still contain the
      // previously mapped column names.
      const savedMapping = loadState<FieldMapping>(MAPPING_STORAGE_KEY);
      const nextMapping: FieldMapping = {};
      for (const field of countryCurrencyFields) {
        const savedHeader = savedMapping?.[field.key];
        nextMapping[field.key] = savedHeader && parsed.headers.includes(savedHeader) ? savedHeader : NOT_MAPPED;
      }
      setMapping(nextMapping);
    });
  }

  function updateMapping(fieldKey: string, header: string) {
    setMapping((prev) => {
      const next = { ...prev, [fieldKey]: header };
      saveState(MAPPING_STORAGE_KEY, next);
      return next;
    });
  }

  const requiredFieldsMapped = countryCurrencyFields
    .filter((f) => f.required)
    .every((f) => mapping[f.key]);

  function mappedRow(row: string[]): CountryCurrencyUpsertPayload {
    const get = (fieldKey: string) => {
      const header = mapping[fieldKey];
      if (!header) return "";
      const index = headers.indexOf(header);
      return index >= 0 ? row[index] ?? "" : "";
    };
    return {
      countryName: get("countryName"),
      isoAlpha2: get("isoAlpha2"),
      isoAlpha3: get("isoAlpha3"),
      isoNumeric: Number(get("isoNumeric")) || 0,
      currencyCode: get("currencyCode"),
      fjdate: get("fjdate"),
    };
  }

  async function handleConfirmImport() {
    setResults(null);
    const rows = csvRows.map(mappedRow);
    const rowResults = await importCountryCurrencyCsv(rows);
    setResults(rowResults);
    setFileName(null);
    setHeaders([]);
    setCsvRows([]);
  }

  const previewRows = csvRows.slice(0, 10).map(mappedRow);

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-bold text-heading">Import Country / Currency CSV</h2>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          {parseError && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{parseError}</p>
          )}

          <input
            type="file"
            accept=".csv,text/csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload size={13} />}
          >
            {fileName ? `Choose Different File (${fileName})` : "Choose CSV File"}
          </Button>

          {headers.length > 0 && (
            <>
              <div className="mt-6 border-t border-border pt-5">
                <p className="mb-3 text-sm font-semibold text-heading/70">
                  Map columns ({csvRows.length} row{csvRows.length === 1 ? "" : "s"} detected)
                </p>
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3">
                  {countryCurrencyFields.map((field) => (
                    <div key={field.key} className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-1 text-sm text-heading/70">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500" aria-hidden="true">
                            *
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <select
                          value={mapping[field.key] ?? NOT_MAPPED}
                          onChange={(event) => updateMapping(field.key, event.target.value)}
                          className="w-full appearance-none rounded-xl border border-border bg-panel px-3 py-2.5 pr-9 text-sm text-heading transition-colors focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
                        >
                          <option value={NOT_MAPPED}>-- Not mapped --</option>
                          {headers.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <p className="mb-3 text-sm font-semibold text-heading/70">
                  Preview (first {previewRows.length} of {csvRows.length} rows)
                </p>
                <div className="overflow-hidden rounded-xl border border-border">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead>
                        <tr className="border-b border-border bg-surface text-xs font-semibold uppercase tracking-wide text-heading/70">
                          {countryCurrencyFields.map((field) => (
                            <th key={field.key} className="px-4 py-2.5">
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, index) => (
                          <tr key={index} className="border-b border-border bg-panel last:border-b-0">
                            <td className="px-4 py-2.5 text-heading/80">{row.countryName}</td>
                            <td className="px-4 py-2.5 text-heading/80">{row.isoAlpha2}</td>
                            <td className="px-4 py-2.5 text-heading/80">{row.isoAlpha3}</td>
                            <td className="px-4 py-2.5 text-heading/80">{row.isoNumeric}</td>
                            <td className="px-4 py-2.5 text-heading/80">{row.currencyCode}</td>
                            <td className="px-4 py-2.5 text-heading/80">{row.fjdate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={handleConfirmImport}
                    disabled={!requiredFieldsMapped}
                    loading={countryCurrencyImporting}
                  >
                    {countryCurrencyImporting ? "Importing..." : `Confirm Import (${csvRows.length} rows)`}
                  </Button>
                  {!requiredFieldsMapped && (
                    <p className="mt-2 text-xs text-red-500">Map all required fields before importing.</p>
                  )}
                </div>
              </div>
            </>
          )}

          {results && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-3 text-sm font-semibold text-heading/70">
                Results: {results.filter((r) => r.success).length} imported, {results.filter((r) => !r.success).length}{" "}
                failed
              </p>
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface text-xs font-semibold uppercase tracking-wide text-heading/70">
                        <th className="px-4 py-2.5">Country</th>
                        <th className="px-4 py-2.5">Currency Code</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5">Message</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, index) => (
                        <tr key={index} className="border-b border-border bg-panel last:border-b-0">
                          <td className="px-4 py-2.5 text-heading/80">{result.row.countryName}</td>
                          <td className="px-4 py-2.5 text-heading/80">{result.row.currencyCode}</td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                result.success
                                  ? "bg-brand-green-light text-brand-green-dark"
                                  : "bg-red-50 text-red-600"
                              }`}
                            >
                              {result.success ? "Success" : "Error"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-heading/80">{result.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border shadow-card">
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-lg font-bold text-heading">Country / Currency</h1>
          <p className="mt-0.5 text-sm text-muted">
            {isLive ? "Live remittance API" : "Static demo data"} — ISO-3166 / ISO-4217 reference data.
          </p>
        </div>

        <div className="bg-panel p-6 sm:p-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-brand-green-light/50 text-xs font-semibold uppercase tracking-wide text-heading/70">
                    <th className="px-4 py-3">Country</th>
                    <th className="px-4 py-3">Alpha-2</th>
                    <th className="px-4 py-3">Alpha-3</th>
                    <th className="px-4 py-3">Numeric</th>
                    <th className="px-4 py-3">Currency Code</th>
                    <th className="px-4 py-3">FJ Date</th>
                  </tr>
                </thead>
                <tbody>
                  {countryCurrencies.map((entry) => (
                    <tr key={entry.id} className="border-b border-border bg-panel last:border-b-0">
                      <td className="px-4 py-3 font-medium text-heading">{entry.countryName}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.isoAlpha2}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.isoAlpha3}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.isoNumeric}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.currencyCode}</td>
                      <td className="px-4 py-3 text-heading/80">{entry.fjdate}</td>
                    </tr>
                  ))}

                  {countryCurrencies.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted">
                        {isLive
                          ? "The remittance API has no \"list all\" endpoint for this data — rows appear here after you import a file below."
                          : "No country/currency rows yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
