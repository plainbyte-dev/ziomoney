// Fields returned by GET /getAllCountries and POST /getCountryWiseExRate
export interface ExchangeRateItem {
  symbol: string;
  currency: string;
  currencyAcro: string;
  countryName: string;
  unit: number;
  buying: number;
  selling: number;
  flag: string;
}

// Fields accepted by POST /UpdateRate and POST /UpdateCsvRate
export interface ExchangeRateUpsertPayload {
  symbol: string;
  countryName: string;
  currencyName: string;
  unit: number;
  buying: number;
  selling: number;
  flag: string;
  countryIsoCode: string;
  priority: number;
  active: boolean;
}

// Response data from POST /UpdateRate and POST /UpdateCsvRate
export interface ExchangeRateRecord extends ExchangeRateUpsertPayload {
  id: number;
  createdDate: string;
  updatedDate: string;
}

export function emptyExchangeRatePayload(): ExchangeRateUpsertPayload {
  return {
    symbol: "",
    countryName: "",
    currencyName: "",
    unit: 1,
    buying: 0,
    selling: 0,
    flag: "",
    countryIsoCode: "",
    priority: 0,
    active: true,
  };
}

export const exchangeRateRecords: ExchangeRateRecord[] = [
  {
    id: 1,
    symbol: "INR",
    countryName: "India",
    currencyName: "Indian Rupee",
    countryIsoCode: "IN",
    unit: 1,
    buying: 1.78,
    selling: 1.82,
    flag: "🇮🇳",
    priority: 1,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-08-01",
  },
  {
    id: 2,
    symbol: "NPR",
    countryName: "Nepal",
    currencyName: "Nepalese Rupee",
    countryIsoCode: "NP",
    unit: 1,
    buying: 1.85,
    selling: 1.9,
    flag: "🇳🇵",
    priority: 2,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-07-20",
  },
  {
    id: 3,
    symbol: "IDR",
    countryName: "Indonesia",
    currencyName: "Indonesian Rupiah",
    countryIsoCode: "ID",
    unit: 1000,
    buying: 9.45,
    selling: 9.6,
    flag: "🇮🇩",
    priority: 3,
    active: true,
    createdDate: "2026-06-10",
    updatedDate: "2026-08-02",
  },
];
