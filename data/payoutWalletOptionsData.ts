// MOCK-ONLY placeholder — there is no confirmed "list payout wallets by
// destination country" endpoint yet. Keyed by country name (matches
// partnerCountrySelectOptions in data/partnerData.ts) so the Send
// Transaction beneficiary rows can offer a real wallet picker instead of
// free text once Wallet is chosen as the payout method.
//
// TODO(backend): replace walletsForCountryMOCKONLY's body with a real API
// call (e.g. getPayoutWalletsByCountry(country)) once that endpoint is
// confirmed. Every read site in the app is funneled through this one
// function, so that's the only place that needs to change.
const WALLETS_BY_COUNTRY_MOCKONLY: Record<string, string[]> = {
  India: ["Paytm", "PhonePe", "Google Pay", "Amazon Pay"],
  Indonesia: ["GoPay", "OVO", "DANA", "ShopeePay"],
  Japan: ["PayPay", "LINE Pay", "Rakuten Pay"],
  Nepal: ["eSewa", "Khalti", "IME Pay"],
  Australia: ["PayID", "Beem It"],
};

export function walletsForCountryMOCKONLY(country: string): string[] {
  return WALLETS_BY_COUNTRY_MOCKONLY[country] ?? [];
}
