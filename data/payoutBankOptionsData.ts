// MOCK-ONLY placeholder — there is no confirmed "list payout banks by
// destination country" endpoint yet. Keyed by country name (matches
// partnerCountrySelectOptions in data/partnerData.ts) so the Send
// Transaction beneficiary rows can offer a real bank picker instead of
// free text once Bank is chosen as the payout method.
//
// TODO(backend): replace banksForCountryMOCKONLY's body with a real API
// call (e.g. getPayoutBanksByCountry(country)) once that endpoint is
// confirmed. Every read site in the app is funneled through this one
// function, so that's the only place that needs to change.
const BANKS_BY_COUNTRY_MOCKONLY: Record<string, string[]> = {
  India: ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank"],
  Indonesia: ["Bank Mandiri", "Bank Central Asia", "Bank Negara Indonesia"],
  Japan: ["MUFG Bank", "Mizuho Bank", "Sumitomo Mitsui Banking Corporation"],
  Nepal: ["Nepal Investment Bank", "Nabil Bank", "Global IME Bank"],
  Australia: ["Commonwealth Bank", "Westpac", "ANZ", "NAB"],
};

export function banksForCountryMOCKONLY(country: string): string[] {
  return BANKS_BY_COUNTRY_MOCKONLY[country] ?? [];
}
