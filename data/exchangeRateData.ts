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

// NPR is the app's home currency (see HOME_CURRENCY in
// components/TransactionSendPanel.tsx) — its row below is an identity
// placeholder only, never looked up directly by convertAmount, kept so the
// table lists every settlement currency for admin-facing screens.
export const exchangeRateRecords: ExchangeRateRecord[] = [
  {
    id: 1,
    symbol: "USD",
    countryName: "United States",
    currencyName: "US Dollar",
    countryIsoCode: "US",
    unit: 1,
    buying: 133.2,
    selling: 134.1,
    flag: "🇺🇸",
    priority: 1,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-08-01",
  },
  {
    id: 2,
    symbol: "AUD",
    countryName: "Australia",
    currencyName: "Australian Dollar",
    countryIsoCode: "AU",
    unit: 1,
    buying: 88.5,
    selling: 89.2,
    flag: "🇦🇺",
    priority: 2,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-08-01",
  },
  {
    id: 3,
    symbol: "GBP",
    countryName: "United Kingdom",
    currencyName: "British Pound",
    countryIsoCode: "GB",
    unit: 1,
    buying: 168.4,
    selling: 169.5,
    flag: "🇬🇧",
    priority: 3,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-08-01",
  },
  {
    id: 4,
    symbol: "CAD",
    countryName: "Canada",
    currencyName: "Canadian Dollar",
    countryIsoCode: "CA",
    unit: 1,
    buying: 96.1,
    selling: 97.0,
    flag: "🇨🇦",
    priority: 4,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-08-01",
  },
  {
    id: 5,
    symbol: "AED",
    countryName: "United Arab Emirates",
    currencyName: "UAE Dirham",
    countryIsoCode: "AE",
    unit: 1,
    buying: 36.2,
    selling: 36.8,
    flag: "🇦🇪",
    priority: 5,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-08-01",
  },
  {
    id: 6,
    symbol: "INR",
    countryName: "India",
    currencyName: "Indian Rupee",
    countryIsoCode: "IN",
    unit: 100,
    buying: 159.5,
    selling: 160.9,
    flag: "🇮🇳",
    priority: 6,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-08-01",
  },
  {
    id: 7,
    symbol: "NPR",
    countryName: "Nepal",
    currencyName: "Nepalese Rupee",
    countryIsoCode: "NP",
    unit: 100,
    buying: 100,
    selling: 100,
    flag: "🇳🇵",
    priority: 7,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-07-20",
  },
  {
    id: 8,
    symbol: "BDT",
    countryName: "Bangladesh",
    currencyName: "Bangladeshi Taka",
    countryIsoCode: "BD",
    unit: 100,
    buying: 121.3,
    selling: 122.5,
    flag: "🇧🇩",
    priority: 8,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-08-01",
  },
  {
    id: 9,
    symbol: "LKR",
    countryName: "Sri Lanka",
    currencyName: "Sri Lankan Rupee",
    countryIsoCode: "LK",
    unit: 100,
    buying: 44.8,
    selling: 45.6,
    flag: "🇱🇰",
    priority: 9,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-08-01",
  },
  {
    id: 10,
    symbol: "PKR",
    countryName: "Pakistan",
    currencyName: "Pakistani Rupee",
    countryIsoCode: "PK",
    unit: 100,
    buying: 47.9,
    selling: 48.7,
    flag: "🇵🇰",
    priority: 10,
    active: true,
    createdDate: "2026-06-01",
    updatedDate: "2026-08-01",
  },
];
