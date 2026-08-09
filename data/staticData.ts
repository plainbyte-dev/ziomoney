import {
  LayoutList,
  Users,
  ArrowLeftRight,
  UserCircle,
  ShieldCheck,
  FileBarChart2,
  Lock,
  UserCog,
  Send,
  Search,
  type LucideIcon,
} from "lucide-react";

export const loggedInUser = {
  name: "John Doe",
  role: "Admin",
  avatarUrl:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces",
  notificationCount: 3,
};

export const footerUser = {
  name: "John Sterling",
  role: "System Admin",
  avatarUrl:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=faces",
};

export interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

export const correspondenceReportBreadcrumbs: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Account Detail", href: "/" },
  { label: "Correspondence Report", href: "/", active: true },
];

export const countryOptions = ["INDIA", "Nepal", "Bangladesh", "Sri Lanka", "Pakistan"];

export const beneficiaryCountryOptions = ["Australia", "United States", "United Kingdom", "Canada", "UAE"];

export const payoutPartnerOptions = [
  "Australia - Transcash",
  "Australia - Ozforex",
  "Australia - Wise",
  "Australia - Skrill",
];

export const tnxDateOptions = ["TNX Date", "Booking Date", "Settlement Date"];

export const reportDefaults = {
  sendingCountry: "INDIA",
  beneficiaryCountry: "Australia",
  payoutPartner: "Australia - Transcash",
  beneficiaryCountry2: "Australia",
  confirmTnx: "TNX Date",
  fromDate: "2024-06-01",
  toDate: "2024-06-01",
};

export interface NavSubItem {
  label: string;
  tabKey?: string;
  href?: string;
  // Heading shown at the top of the nested flyout panel. Falls back to `label`.
  submenuTitle?: string;
  // One level of nesting — e.g. Compliance > Risk Profiling > High Risk Countries.
  submenu?: NavSubItem[];
}

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  hasSubmenu?: boolean;
  tabKey?: string;
  // Heading shown at the top of the flyout panel. Falls back to `label`.
  submenuTitle?: string;
  submenu?: NavSubItem[];
}

export interface NavGroup {
  // Section heading shown in the sidebar above this group's items.
  heading: string;
  items: NavItem[];
}

// Related API domains are folded into a handful of headings so the full nav
// fits in the sidebar's vertical space without scrolling; each top-level row
// still opens its own flyout for the domain's individual screens.
export const navGroups: NavGroup[] = [
  {
    heading: "Accounts & Rates",
    items: [
      {
        label: "Accounts Detail",
        icon: LayoutList,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Account Details",
        submenu: [
          { label: "Ledger", tabKey: "ledger-list" },
          { label: "Voucher Entry", tabKey: "voucher-entry" },
          { label: "Voucher Approval", tabKey: "voucher-approval" },
          { label: "Statement of Account", tabKey: "statement-of-account" },
          { label: "Daily Report", tabKey: "daily-report" },
          { label: "Summary Report", tabKey: "summary-report" },
          { label: "All Summary Balance", tabKey: "all-summary-balance" },
          { label: "Create new Ledger", tabKey: "ledger-create" },
        ],
      },
      {
        // Covers Service Charge, Margin Setup, Exchange Rate,
        // Country/Currency, Partner Offer Rate and Partner Commission.
        label: "Exchange Rate & Commission",
        icon: ArrowLeftRight,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Exchange Rate & Commission",
        submenu: [
          { label: "Exchange Rates", tabKey: "exchange-rates" },
          { label: "Service Charges", tabKey: "service-charges" },
          { label: "Margin Setup", tabKey: "margin-setup" },
          { label: "Country / Currency", tabKey: "country-currency" },
          { label: "Partner Offer Rates", tabKey: "partner-offer-rates" },
          { label: "Partner Commission", tabKey: "partner-commission" },
        ],
      },
    ],
  },
  {
    heading: "Partners & Customers",
    items: [
      {
        // "Partner info" in the API doc: Remittance Partner + Payout Partner
        label: "Partners",
        icon: Users,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Partners",
        submenu: [
          { label: "Partner Info", tabKey: "partner-info" },
          { label: "Create New Partner", tabKey: "partner-create" },
        ],
      },
      {
        // "Customer Details and Corporate" / "KYC (sender / beneficiary)"
        label: "Customer Detail",
        icon: UserCircle,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Customer Details",
        submenu: [
          { label: "Corporate Customer", tabKey: "corporate-customer" },
          { label: "Customer Details", tabKey: "customer-details" },
          { label: "KYC Approval Queue", tabKey: "kyc-approval-queue" },
          { label: "Approved KYCs", tabKey: "kyc-approved-list" },
          { label: "Add Beneficiary", tabKey: "beneficiaries" },
        ],
      },
    ],
  },
  {
    heading: "Compliance",
    items: [
      {
        label: "Compliance",
        icon: ShieldCheck,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Compliance",
        submenu: [
          { label: "Block List Entry" },
          { label: "Compliance Rules Setup" },
          { label: "Import OFAC" },
          { label: "OFAC/Block List Search" },
          { label: "Pep Database" },
          { label: "Receiving Transaction Rules" },
          { label: "Suspicious - Income Mismatched" },
          { label: "Suspicious Customer" },
          { label: "Suspicious Hold List" },
          { label: "Suspicious Report" },
          { label: "TXN Analysis" },
          {
            label: "Risk Profiling",
            submenuTitle: "Risk Profiling",
            submenu: [
              { label: "High Risk Countries", tabKey: "high-risk-countries" },
              { label: "High Risk Management", tabKey: "high-risk-management" },
            ],
          },
        ],
      },
    ],
  },
  {
    heading: "Payments",
    items: [
      {
        label: "Remittances",
        icon: Send,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Remittances",
        submenu: [
          { label: "Send Transaction", tabKey: "transaction-send" },
          { label: "Un-Confirmed List", tabKey: "unconfirmed-list" },
          { label: "Unpaid Transactions", tabKey: "unpaid-transactions" },
          { label: "Pending Transaction", tabKey: "pending-transaction" },
        ],
      },
      { label: "Transaction Query", icon: Search, href: "#", tabKey: "transaction-query" },
    ],
  },
  {
    heading: "Admin & Security",
    items: [
      {
        label: "Security",
        icon: Lock,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Security",
        submenu: [
          { label: "Audit Tran Log", tabKey: "audit-tran-log" },
          { label: "Days Exceeded TXN Requests", tabKey: "days-exceeded-txn-requests" },
        ],
      },
      {
        label: "User Management",
        icon: UserCog,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "User Management",
        submenu: [
          { label: "Audit User Rights - Partner", tabKey: "audit-user-rights-partner" },
          { label: "Create Head Office User", tabKey: "create-head-office-user" },
          { label: "Create Partner User", tabKey: "create-partner-user" },
          { label: "Head Office User Status", tabKey: "head-office-user-status" },
          { label: "Manage Roles", tabKey: "manage-roles" },
        ],
      },
      {
        label: "Reports",
        icon: FileBarChart2,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Reports",
        submenu: [
          { label: "Daily Report", tabKey: "daily-report" },
          { label: "Summary Report", tabKey: "summary-report" },
          { label: "Report Writer", tabKey: "report-writer" },
          { label: "Report List", tabKey: "report-list" },
        ],
      },
    ],
  },
];