// Currency codes have no "full name" field anywhere in this app's data model
// (CountryCurrencyRecord only stores the code, e.g. "INR") — this is a small
// static ISO 4217 lookup so "Currency Name" can be derived/selected from a
// code instead of typed in by hand. Falls back to the code itself for
// anything not listed, so an unrecognized code still shows something rather
// than an empty label.
const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  INR: "Indian Rupee",
  GBP: "British Pound",
  NPR: "Nepalese Rupee",
  AED: "UAE Dirham",
  CAD: "Canadian Dollar",
  BDT: "Bangladeshi Taka",
  LKR: "Sri Lankan Rupee",
  PKR: "Pakistani Rupee",
  IDR: "Indonesian Rupiah",
  EUR: "Euro",
  CNY: "Chinese Yuan",
  SGD: "Singapore Dollar",
  MYR: "Malaysian Ringgit",
  THB: "Thai Baht",
  HKD: "Hong Kong Dollar",
  KRW: "South Korean Won",
  SAR: "Saudi Riyal",
  QAR: "Qatari Riyal",
  KWD: "Kuwaiti Dinar",
  OMR: "Omani Rial",
  BHD: "Bahraini Dinar",
  PHP: "Philippine Peso",
  VND: "Vietnamese Dong",
  NZD: "New Zealand Dollar",
};

export function currencyNameFromCode(code: string): string {
  return CURRENCY_NAMES[code.trim().toUpperCase()] ?? code;
}
