import { countryCurrencyRecords } from "./countryCurrencyData";

// "ALL" plus every country in the full ISO reference table (see
// data/countryCurrencyData.ts), uppercased to match PartnerEntry.country's
// existing convention (e.g. "INDIA", "JAPAN" in partnerEntries below).
export const partnerCountryOptions = [
  "ALL",
  ...Array.from(new Set(countryCurrencyRecords.map((c) => c.countryName.toUpperCase()))).sort(),
];

// Every country in the full ISO country/currency reference table (see
// data/countryCurrencyData.ts) — not a hand-picked subset — so Partner
// Country and every other destination-country picker built on this offers
// the complete list, same reasoning as settlementCurrencyOptions below.
export const partnerCountrySelectOptions = Array.from(
  new Set(countryCurrencyRecords.map((c) => c.countryName))
).sort();

// Example-only placeholder text for the Partner Address field, illustrating
// each country's typical address format — a UI hint, never validated
// against or parsed. Falls back to a generic example for any country not
// explicitly listed (most of them, given partnerCountrySelectOptions now
// covers the full reference table above).
const EXAMPLE_ADDRESS_BY_COUNTRY: Record<string, string> = {
  India: "e.g. 12 MG Road, Bengaluru, Karnataka 560001",
  Indonesia: "e.g. Jl. Sudirman No. 45, Jakarta Selatan 12190",
  Japan: "e.g. 1-2-3 Shibuya, Shibuya-ku, Tokyo 150-0002",
  Nepal: "e.g. Durbar Marg, Kathmandu 44600",
  Australia: "e.g. 22 George Street, Sydney NSW 2000",
  "United States": "e.g. 500 Market St, San Francisco, CA 94105",
  "United Kingdom": "e.g. 10 Downing Street, London SW1A 2AA",
  Philippines: "e.g. 123 Ayala Ave, Makati, Metro Manila 1226",
  "United Arab Emirates": "e.g. Sheikh Zayed Road, Dubai",
  Canada: "e.g. 100 Queen St W, Toronto, ON M5H 2N2",
};

export function exampleAddressForCountry(country: string): string {
  return EXAMPLE_ADDRESS_BY_COUNTRY[country] ?? "e.g. Street, City, Postal Code";
}

export const partnerTypeOptions = ["Sender Agent", "Receiver Agent", "SenderReceiver Agent"];

export const restrictPaymentOptions = ["Anywhere and Own", "Anywhere", "Own Only"];

export const partnerRightsOptions = ["Sender", "Receiver", "SenderReceiver"];

export const dateFormatOptions = ["yyyy-mm-dd", "dd-mm-yyyy", "mm-dd-yyyy"];

export const partnerSettlementOptions = ["Local Currency", "USD"];

export const localTimeOptions = [
  "(GMT - 12:00) International Date Line",
  "(GMT - 05:00) Eastern Time",
  "(GMT + 00:00) Greenwich Mean Time",
  "(GMT + 05:45) Kathmandu",
  "(GMT + 05:30) New Delhi",
  "(GMT + 07:00) Jakarta",
  "(GMT + 09:00) Tokyo",
];

export const partnerLocalCurrencyOptions = ["--SELECT--", "USD", "JPY", "AUD", "INR", "GBP", "NPR"];

// Remittance API fields (insertRemittancePartner) — backend-confirmed enum for
// remitterType, sent as-is on partner registration.
export const remitterTypeOptions = ["Agent", "Payout"];

// Every currency in the full ISO country/currency reference table (see
// data/countryCurrencyData.ts) — not a hand-picked subset — so Settlement
// Currency, Transaction Currencies and every other currency picker built on
// this offers the complete list with no admin setup step.
export const settlementCurrencyOptions = Array.from(
  new Set(countryCurrencyRecords.map((c) => c.currencyCode))
).sort();

export type PartnerEntry = {
  id: string;
  partnerName: string;
  partnerId: string;
  country: string;
  partnerType: string;
  creditLimit: number | null;
  hasBank: boolean;
  blocked: boolean;
  // Populated once known — either from the insert/lookup response (live) or
  // left undefined for the static demo rows.
  email?: string;
  acceptPartnerPin?: boolean;
  txnCurrencies?: string[];
  // Destination countries enabled for this partner via
  // insertRemittancePartnerCountry — separate from `country` (the partner's
  // own registered country), this drives which countries can have a
  // partner-wise exchange rate / service charge set up for this partner.
  destCountries?: string[];
  description?: string;
  partnerAddress?: string;
  settlementCurrency?: string;
  apiUser?: boolean;
  // Settled balance — distinct from `creditLimit` (the virtual credit limit,
  // i.e. the API's accountBalance). addActualBalance moves both;
  // updateCreditLimit moves only the virtual one.
  balance?: number;
  registeredDate?: string;
  updatedDate?: string;
};

// Some screens need one row per partner NAME rather than one per partner
// record — e.g. the Exchange Rate / Service Charge setup grids, which key
// off partnerName the way the legacy Country/Partner/[3 setup links] layout
// did. A plain last-write-wins dedup silently drops whichever duplicate
// wasn't picked, along with anything set on it — most visibly destCountries/
// txnCurrencies added via Manage Partner on a different entry sharing the
// same name (possible with live-mode registration edge cases). This unions
// those two array fields across every entry sharing a name instead of
// picking one arbitrarily.
// Case/whitespace-insensitive key for matching the same partner across
// sources that don't normalize consistently — a name typed once at
// registration, echoed back by the live API's `userName` field, and typed
// again when adding a txn currency/destination country in Manage Partner —
// any casing or stray-whitespace difference between those would otherwise
// silently fail an exact `===` match and drop the association.
export function normalizedPartnerName(name: string): string {
  return name.trim().toLowerCase();
}

export function dedupePartnerEntriesByName(entries: PartnerEntry[]): PartnerEntry[] {
  const byName = new Map<string, PartnerEntry>();
  for (const entry of entries) {
    const key = normalizedPartnerName(entry.partnerName);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, entry);
      continue;
    }
    byName.set(key, {
      ...existing,
      txnCurrencies: Array.from(new Set([...(existing.txnCurrencies ?? []), ...(entry.txnCurrencies ?? [])])),
      destCountries: Array.from(new Set([...(existing.destCountries ?? []), ...(entry.destCountries ?? [])])),
    });
  }
  return Array.from(byName.values());
}

export const partnerEntries: PartnerEntry[] = [
  { id: "11000132", partnerName: "TRANS CASH INTERNATIONAL", partnerId: "TCI001", country: "INDIA", partnerType: "SenderReceiver", creditLimit: 13128914, hasBank: true, blocked: false },
  { id: "11000185", partnerName: "TRANS CASH INTERNATIONAL - TCI", partnerId: "tci", country: "INDIA", partnerType: "Receiver", creditLimit: null, hasBank: true, blocked: true },
  { id: "11000437", partnerName: "KOPERASI SINEMI BERDIKARI UTAMA", partnerId: "11000437", country: "INDONESIA", partnerType: "Sender", creditLimit: 100, hasBank: false, blocked: true },
  { id: "11000460", partnerName: "株式会社岩", partnerId: "11000460", country: "JAPAN", partnerType: "Sender", creditLimit: 1000000, hasBank: false, blocked: false },
  { id: "11000282", partnerName: "A 1 PVT LTD", partnerId: "11000282", country: "JAPAN", partnerType: "Sender", creditLimit: 4, hasBank: false, blocked: false },
  { id: "11000474", partnerName: "A B CORPORATION PVT LTD", partnerId: "11000474", country: "JAPAN", partnerType: "Sender", creditLimit: 719085, hasBank: false, blocked: false },
  { id: "11000269", partnerName: "AB CORPORATION CO LTD", partnerId: "11000269", country: "JAPAN", partnerType: "Sender", creditLimit: null, hasBank: false, blocked: true },
  { id: "11000163", partnerName: "AHILYA PVT. LTD.", partnerId: "11000163", country: "JAPAN", partnerType: "Sender", creditLimit: -441728, hasBank: false, blocked: false },
  { id: "11000486", partnerName: "AISA CO. LTD", partnerId: "11000486", country: "JAPAN", partnerType: "Sender", creditLimit: 99134, hasBank: false, blocked: false },
  { id: "11000009", partnerName: "AJIMA CO. LTD", partnerId: "325006", country: "JAPAN", partnerType: "Sender", creditLimit: -53568, hasBank: false, blocked: true },
  { id: "11000314", partnerName: "AJITA CO. LTD FUKUOKA", partnerId: "11000314", country: "JAPAN", partnerType: "Sender", creditLimit: 493207, hasBank: false, blocked: false },
  { id: "11000052", partnerName: "AJITA CO. LTD OKINAWA", partnerId: "825015", country: "JAPAN", partnerType: "Sender", creditLimit: 2177.76, hasBank: false, blocked: false },
  { id: "11000017", partnerName: "ALAM DEVI RESTAURANT", partnerId: "320057", country: "JAPAN", partnerType: "Sender", creditLimit: 1049, hasBank: false, blocked: true },
  { id: "11000224", partnerName: "AMRITA PVT LTD", partnerId: "11000224", country: "JAPAN", partnerType: "Sender", creditLimit: null, hasBank: false, blocked: true },
  { id: "11000123", partnerName: "ANIRUSA CO. LTD.", partnerId: "810106", country: "JAPAN", partnerType: "Sender", creditLimit: 20, hasBank: false, blocked: true },
  { id: "11000246", partnerName: "ANTTECH PVT LTD", partnerId: "11000246", country: "JAPAN", partnerType: "Sender", creditLimit: null, hasBank: false, blocked: true },
  { id: "11000303", partnerName: "API CO LTD", partnerId: "11000303", country: "JAPAN", partnerType: "Sender", creditLimit: null, hasBank: false, blocked: false },
  { id: "11000313", partnerName: "APS INTERNATIONAL PVT LTD", partnerId: "11000313", country: "JAPAN", partnerType: "Sender", creditLimit: 1, hasBank: false, blocked: false },
  // The five rows below cover every value in remitterTypeOptions (the actual
  // confirmed enum accepted by insertRemittancePartner: Agent/Payout) — the
  // rows above predate that confirmation and use a different Sender/Receiver/
  // SenderReceiver vocabulary instead. Notably, no seed row had partnerType
  // "Agent" or "Payout" until now, which left every "Agent"-filtered dropdown
  // (Customer Details, KYC Approval, Service Charges, Transaction Send Panel)
  // with nothing to show in demo mode.
  { id: "11000501", partnerName: "REMITTERAGENT", partnerId: "remitteragent", country: "NEPAL", partnerType: "Agent", creditLimit: 850000, hasBank: true, blocked: false },
  { id: "11000502", partnerName: "SAKURA GLOBAL REMIT KK", partnerId: "11000502", country: "JAPAN", partnerType: "Agent", creditLimit: 420000, hasBank: false, blocked: false },
  { id: "11000503", partnerName: "TANAKA HIROSHI", partnerId: "11000503", country: "JAPAN", partnerType: "Payout", creditLimit: 15000, hasBank: false, blocked: false },
  { id: "11000504", partnerName: "OSAKA TRADING CORPORATION", partnerId: "11000504", country: "JAPAN", partnerType: "Payout", creditLimit: 2300000, hasBank: true, blocked: false },
  { id: "11000505", partnerName: "NAGOYA SUB REMIT SERVICES", partnerId: "11000505", country: "JAPAN", partnerType: "Payout", creditLimit: 60000, hasBank: false, blocked: false },
];
