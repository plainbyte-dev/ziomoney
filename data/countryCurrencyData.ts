// POST /UpdateCsvfileForCountries — "Upsert a country/currency row from a
// CSV import." Despite the name, the request body is a structured JSON
// object per row (confirmed against Swagger), not a raw CSV string, and the
// response is the standard { success, message, data, errorCode, timestamp }
// envelope wrapping the saved row — not an opaque string. (An earlier build
// pass wrongly assumed a raw-string request/response; this replaces that.)
export interface CountryCurrencyUpsertPayload {
  countryName: string;
  isoAlpha2: string;
  isoAlpha3: string;
  isoNumeric: number;
  currencyCode: string;
  fjdate: string;
}

export interface CountryCurrencyRecord extends CountryCurrencyUpsertPayload {
  id: number;
}

export interface CountryCurrencyField {
  key: keyof CountryCurrencyUpsertPayload;
  label: string;
  required: boolean;
}

export interface CountryCurrencyImportRowResult {
  row: CountryCurrencyUpsertPayload;
  success: boolean;
  message: string;
}

export const countryCurrencyFields: CountryCurrencyField[] = [
  { key: "countryName", label: "Country Name", required: true },
  { key: "isoAlpha2", label: "Alpha-2", required: true },
  { key: "isoAlpha3", label: "Alpha-3", required: true },
  { key: "isoNumeric", label: "Numeric", required: false },
  { key: "currencyCode", label: "Currency Code", required: true },
  { key: "fjdate", label: "FJ Date", required: false },
];

export const countryCurrencyRecords: CountryCurrencyRecord[] = [
  { id: 1, countryName: "India", isoAlpha2: "IN", isoAlpha3: "IND", isoNumeric: 356, currencyCode: "INR", fjdate: "2026-01-01" },
  { id: 2, countryName: "Nepal", isoAlpha2: "NP", isoAlpha3: "NPL", isoNumeric: 524, currencyCode: "NPR", fjdate: "2026-01-01" },
  { id: 3, countryName: "Indonesia", isoAlpha2: "ID", isoAlpha3: "IDN", isoNumeric: 360, currencyCode: "IDR", fjdate: "2026-01-01" },
  { id: 4, countryName: "Japan", isoAlpha2: "JP", isoAlpha3: "JPN", isoNumeric: 392, currencyCode: "JPY", fjdate: "2026-01-01" },
  { id: 5, countryName: "United States", isoAlpha2: "US", isoAlpha3: "USA", isoNumeric: 840, currencyCode: "USD", fjdate: "2026-01-01" },
];
