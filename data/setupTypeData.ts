// Shared "setup scope" vocabulary for Service Charge and Exchange Rate setup,
// matching the three link actions on the legacy Country/Partner setup grid
// (Country Wise / Payout Partner Wise / 3rd Party API Agent wise). UI-only
// concept — neither ServiceChargeResponse nor the /UpdateRate response schema
// documents a setup-scope field; every read site is named *_MOCKONLY and
// stripped before the payload reaches the real API (see lib/rateApi.ts).
// Kept as one shared file so Service Charge and Exchange Rate setup can't
// drift into different labels for the same three scopes.
export type SetupType = "COUNTRY" | "PARTNER" | "THIRD_PARTY_AGENT";

export const setupTypeValues: SetupType[] = ["COUNTRY", "PARTNER", "THIRD_PARTY_AGENT"];

export const setupTypeLabels: Record<SetupType, string> = {
  COUNTRY: "Country Wise",
  PARTNER: "Payout Partner Wise",
  THIRD_PARTY_AGENT: "3rd Party API Agent wise",
};
