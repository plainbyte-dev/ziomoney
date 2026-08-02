export const ledgerCountryOptions = [
  "Japan",
  "Australia",
  "India",
  "United States",
  "United Kingdom",
  "Nepal",
];

export const countryCurrencyMap: Record<string, string> = {
  Japan: "JPY",
  Australia: "AUD",
  India: "INR",
  "United States": "USD",
  "United Kingdom": "GBP",
  Nepal: "NPR",
};

export function getCurrencyOptions(country: string): string[] {
  const local = countryCurrencyMap[country] ?? "USD";
  return local === "USD" ? ["USD"] : [local, "USD"];
}

// Flat list of all supported currency codes, e.g. for a currency picker
// that isn't scoped to a single country's options.
export const ledgerCurrencyOptions = [
  "NPR",
  "USD",
  "JPY",
  "AUD",
  "INR",
  "GBP",
] as const;

export const PAGE_SIZE = 8;

export const ledgerAccountTypeOptions = [
  "Savings",
  "Checking",
  "Business",
  "Escrow",
];

export type LedgerEntry = {
  id: string; // Ledger ID
  closedBy: string; // Closed By
  ledgerName: string; // Ledger Name
  shortCode: string; // Ledger Short Code
  country: string; // Country
  accountType: string; // Account Type
  balance: number; // raw numeric balance, e.g. for sorting/math
  balanceDisplay: string; // formatted for display, e.g. "USD 1,234.56"
  isNegative: boolean; // true if balance < 0, used to style balanceDisplay
  currency: string; // derived from country
  description: string;
};

const closers = [
  "A. Sharma",
  "M. Tanaka",
  "J. Wilson",
  "R. Gurung",
  "S. Patel",
  "L. Brown",
];

const ledgerNamePrefixes = [
  "Operating",
  "Reserve",
  "Payroll",
  "Vendor",
  "Client Trust",
  "Capital",
  "Settlement",
  "Working Capital",
];

const descriptions = [
  "Primary account for day-to-day transactions.",
  "Reserve funds held for contingency purposes.",
  "Monthly payroll disbursement ledger.",
  "Tracks payments made to external vendors.",
  "Funds held in trust on behalf of a client.",
  "Long-term capital allocation ledger.",
  "Used for settling cross-border transactions.",
  "Working capital for ongoing operations.",
];

function formatBalance(balance: number, currency: string): string {
  const abs = Math.abs(balance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${balance < 0 ? "-" : ""}${currency} ${abs}`;
}

function buildEntries(): LedgerEntry[] {
  const entries: LedgerEntry[] = [];

  for (let i = 0; i < 24; i++) {
    const country = ledgerCountryOptions[i % ledgerCountryOptions.length];
    const currency = countryCurrencyMap[country];
    const accountType = ledgerAccountTypeOptions[i % ledgerAccountTypeOptions.length];
    const namePrefix = ledgerNamePrefixes[i % ledgerNamePrefixes.length];
    const closedBy = closers[i % closers.length];
    // Every 7th entry is negative, just to exercise the isNegative styling.
    const balance =
      Math.round((1000 + i * 372.5) * 100) / 100 * (i % 7 === 0 && i !== 0 ? -1 : 1);

    entries.push({
      id: `LGR-${String(i + 1).padStart(4, "0")}`,
      closedBy,
      ledgerName: `${namePrefix} Ledger #${i + 1}`,
      shortCode: `${100000 + i * 137}`,
      country,
      accountType,
      balance,
      balanceDisplay: formatBalance(balance, currency),
      isNegative: balance < 0,
      currency,
      description: descriptions[i % descriptions.length],
    });
  }

  return entries;
}

export const ledgerEntries: LedgerEntry[] = buildEntries();