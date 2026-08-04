// Fields accepted by POST /UpdateCsvfileForCountries
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

export function emptyCountryCurrencyPayload(): CountryCurrencyUpsertPayload {
  return {
    countryName: "",
    isoAlpha2: "",
    isoAlpha3: "",
    isoNumeric: 0,
    currencyCode: "",
    fjdate: "",
  };
}

export const countryCurrencyRecords: CountryCurrencyRecord[] = [
  { id: 1, countryName: "India", isoAlpha2: "IN", isoAlpha3: "IND", isoNumeric: 356, currencyCode: "INR", fjdate: "2026-01-01" },
  { id: 2, countryName: "Nepal", isoAlpha2: "NP", isoAlpha3: "NPL", isoNumeric: 524, currencyCode: "NPR", fjdate: "2026-01-01" },
  { id: 3, countryName: "Indonesia", isoAlpha2: "ID", isoAlpha3: "IDN", isoNumeric: 360, currencyCode: "IDR", fjdate: "2026-01-01" },
  { id: 4, countryName: "Japan", isoAlpha2: "JP", isoAlpha3: "JPN", isoNumeric: 392, currencyCode: "JPY", fjdate: "2026-01-01" },
];
