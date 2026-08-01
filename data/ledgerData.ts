import type { BreadcrumbItem } from "./staticData";

export interface LedgerEntry {
  id: string;
  closedBy: string;
  ledgerName: string;
  country: string;
  accountType: "Expense" | "Asset" | "Liability" | "Current" | "System";
  balanceDisplay: string;
  isNegative: boolean;
  shortCode: string;
  description: string;
}

export const ledgerEntries: LedgerEntry[] = [
  { id: "11000313", closedBy: "David Chen", ledgerName: "Adjustment Account for Rate", country: "United States", accountType: "Expense", balanceDisplay: "-$2,100.00", isNegative: true, shortCode: "905311", description: "Rate adjustment clearing account" },
  { id: "11000312", closedBy: "Maria Santos", ledgerName: "Advance Received from Agents", country: "India", accountType: "Asset", balanceDisplay: "₹8,500.00", isNegative: false, shortCode: "905312", description: "Agent advance collections" },
  { id: "11000311", closedBy: "Robert Kim", ledgerName: "App Development Expenses", country: "United Kingdom", accountType: "Liability", balanceDisplay: "-$45,000.00", isNegative: true, shortCode: "905313", description: "Mobile app build costs" },
  { id: "11000310", closedBy: "Anna Johnson", ledgerName: "Marketing & Advertising", country: "Australia", accountType: "Expense", balanceDisplay: "-$2,100.00", isNegative: true, shortCode: "905314", description: "Campaign spend for Q2" },
  { id: "11000309", closedBy: "Michael Brown", ledgerName: "Office Rent & Utilities", country: "India", accountType: "Current", balanceDisplay: "₹120,000.00", isNegative: false, shortCode: "905315", description: "Monthly branch rent" },
  { id: "11000308", closedBy: "Lisa Wang", ledgerName: "Hardware & Equipment", country: "India", accountType: "System", balanceDisplay: "₹1,250,000.00", isNegative: false, shortCode: "905316", description: "Server and POS hardware" },
  { id: "11000307", closedBy: "Thomas Lee", ledgerName: "Customer Refunds", country: "United States", accountType: "Expense", balanceDisplay: "-$15,000.00", isNegative: true, shortCode: "905317", description: "Refund clearing account" },
  { id: "11000306", closedBy: "Thomas Lee", ledgerName: "Bank Charges & Fees", country: "United Kingdom", accountType: "Asset", balanceDisplay: "-$12,500.00", isNegative: true, shortCode: "905318", description: "Correspondent bank fees" },
  { id: "11000305", closedBy: "Priya Nair", ledgerName: "Staff Payroll Clearing", country: "India", accountType: "Liability", balanceDisplay: "₹640,000.00", isNegative: false, shortCode: "905319", description: "Monthly payroll suspense" },
  { id: "11000304", closedBy: "James Carter", ledgerName: "Travel & Accommodation", country: "United States", accountType: "Expense", balanceDisplay: "-$3,240.00", isNegative: true, shortCode: "905320", description: "Field agent travel costs" },
  { id: "11000303", closedBy: "Sofia Rossi", ledgerName: "Compliance & Licensing", country: "United Kingdom", accountType: "Current", balanceDisplay: "£9,800.00", isNegative: false, shortCode: "905321", description: "Regulatory license renewals" },
  { id: "11000302", closedBy: "Wei Zhang", ledgerName: "Foreign Exchange Gain", country: "Australia", accountType: "System", balanceDisplay: "A$5,592.00", isNegative: false, shortCode: "905322", description: "Net FX gain suspense" },
  { id: "11000301", closedBy: "David Chen", ledgerName: "Software Subscriptions", country: "United States", accountType: "Expense", balanceDisplay: "-$1,860.00", isNegative: true, shortCode: "905323", description: "SaaS tools and licenses" },
  { id: "11000300", closedBy: "Maria Santos", ledgerName: "Agent Commission Payable", country: "India", accountType: "Liability", balanceDisplay: "₹212,300.00", isNegative: false, shortCode: "905324", description: "Outstanding agent commissions" },
  { id: "11000299", closedBy: "Robert Kim", ledgerName: "Cash in Transit", country: "United Kingdom", accountType: "Asset", balanceDisplay: "£31,400.00", isNegative: false, shortCode: "905325", description: "Branch cash pickup account" },
  { id: "11000298", closedBy: "Anna Johnson", ledgerName: "Insurance Premiums", country: "Australia", accountType: "Expense", balanceDisplay: "-A$4,120.00", isNegative: true, shortCode: "905326", description: "Business insurance renewal" },
  { id: "11000297", closedBy: "Michael Brown", ledgerName: "Head Office Settlement", country: "India", accountType: "Current", balanceDisplay: "₹980,500.00", isNegative: false, shortCode: "905327", description: "HO settlement clearing" },
  { id: "11000296", closedBy: "Lisa Wang", ledgerName: "Legal & Professional Fees", country: "United States", accountType: "Expense", balanceDisplay: "-$6,750.00", isNegative: true, shortCode: "905328", description: "Outside counsel fees" },
  { id: "11000295", closedBy: "Thomas Lee", ledgerName: "Interest Income", country: "United Kingdom", accountType: "System", balanceDisplay: "£2,240.00", isNegative: false, shortCode: "905329", description: "Interest on float balances" },
  { id: "11000294", closedBy: "Priya Nair", ledgerName: "Discount Given to Customers", country: "India", accountType: "Expense", balanceDisplay: "-₹18,400.00", isNegative: true, shortCode: "905330", description: "Promo discount tracking" },
  { id: "11000293", closedBy: "James Carter", ledgerName: "Depreciation - Equipment", country: "United States", accountType: "Asset", balanceDisplay: "-$9,300.00", isNegative: true, shortCode: "905331", description: "Accumulated depreciation" },
  { id: "11000292", closedBy: "Sofia Rossi", ledgerName: "Settlement Partner Payable", country: "Australia", accountType: "Liability", balanceDisplay: "A$27,679.60", isNegative: false, shortCode: "905332", description: "Payable to payout partner" },
  { id: "11000291", closedBy: "Wei Zhang", ledgerName: "Petty Cash", country: "United Kingdom", accountType: "Current", balanceDisplay: "£1,120.00", isNegative: false, shortCode: "905333", description: "Branch petty cash float" },
  { id: "11000290", closedBy: "David Chen", ledgerName: "Suspense Account", country: "India", accountType: "System", balanceDisplay: "₹0.00", isNegative: false, shortCode: "905334", description: "Unreconciled entries holding" },
];

export const ledgerListBreadcrumbs: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Accounts Detail", href: "/" },
  { label: "Ledger List", href: "/ledger", active: true },
];

export const createLedgerBreadcrumbs: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Ledger", href: "/ledger" },
  { label: "Create", href: "/ledger/create", active: true },
];

export const ledgerCountryOptions = [
  "Australia",
  "India",
  "United States",
  "United Kingdom",
  "Nepal",
];

export const ledgerCurrencyOptions = ["NPR", "USD"] as const;

export const PAGE_SIZE = 8;
