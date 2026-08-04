import {
  LayoutList,
  Users,
  ArrowLeftRight,
  UserCircle,
  Mail,
  FileUp,
  BarChart3,
  ShieldCheck,
  FileBarChart2,
  Lock,
  UserCog,
  Wrench,
  Banknote,
  UserPlus,
  History,
  Send,
  KeyRound,
  FolderUp,
  Search,
  Activity,
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

// Each group corresponds to a distinct backend API domain (ledger/transaction
// history, remittance partner, KYC, exchange rate, ...), so the sidebar's
// structure stays legible against the API surface it drives.
export const navGroups: NavGroup[] = [
  {
    heading: "Accounts",
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
          { label: "Correspondent Report", tabKey: "correspondence-report" },
          { label: "All Summary Balance", tabKey: "all-summary-balance" },
          { label: "Create new Ledger", tabKey: "ledger-create" },
          { label: "Define Credit Limit", tabKey: "credit-limit" },
        ],
      },
    ],
  },
  {
    // "Partner info" in the API doc: Remittance Partner + Payout Partner
    heading: "Partner Info",
    items: [
      {
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
        label: "Payout Partner",
        icon: Banknote,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Payout Partner",
        submenu: [
          { label: "Payout Configuration" },
          { label: "Payout Banks" },
          { label: "Payout Partner Types" },
        ],
      },
    ],
  },
  {
    // "Customer Details and Corporate" / "KYC (sender / beneficiary)"
    heading: "Customer Details and Corporate",
    items: [
      {
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
        ],
      },
      {
        label: "Beneficiaries",
        icon: UserPlus,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Beneficiaries",
        submenu: [{ label: "My Beneficiaries" }, { label: "Add Beneficiary" }],
      },
    ],
  },
  {
    heading: "Compliance",
    items: [
      {
        label: "Compliance Rule",
        icon: ShieldCheck,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Compliance Rule",
        submenu: [{ label: "Rule List" }, { label: "Rule Values" }],
      },
    ],
  },
  {
    // "Exchange rate and service charge / commission" covers Service Charge,
    // Margin Setup, Exchange Rate, Country/Currency, Partner Offer Rate and
    // Partner Commission.
    heading: "Exchange Rate & Commission",
    items: [
      {
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
    heading: "Transaction History",
    items: [
      {
        label: "Transaction Detail History",
        icon: History,
        href: "#",
      },
    ],
  },
  {
    heading: "Payment",
    items: [
      {
        label: "Remittances",
        icon: Send,
        href: "#",
        hasSubmenu: true,
        submenuTitle: "Remittances",
        submenu: [
          { label: "My Transfers" },
          { label: "Create Transfer" },
          { label: "Unapproved Remittances" },
          { label: "Confirmed Remittances" },
          { label: "Compliance Hold Remittances" },
        ],
      },
    ],
  },
  {
    heading: "User Management and Security",
    items: [
      { label: "OTP", icon: KeyRound, href: "#" },
      { label: "Security", icon: Lock, href: "#" },
      { label: "User Management", icon: UserCog, href: "#", hasSubmenu: true },
    ],
  },
  {
    heading: "Export/Import",
    items: [
      { label: "Agent File Upload", icon: FolderUp, href: "#" },
      { label: "Export/Import", icon: FileUp, href: "#" },
    ],
  },
  {
    heading: "Utility",
    items: [
      { label: "Transaction Query", icon: Search, href: "#" },
      { label: "Healthcheck", icon: Activity, href: "#" },
      { label: "Utilities", icon: Wrench, href: "#" },
    ],
  },
  {
    heading: "Communications",
    items: [{ label: "SMS & Email", icon: Mail, href: "#" }],
  },
  {
    heading: "Operations & Admin",
    items: [
      { label: "Risk Profiling", icon: BarChart3, href: "#" },
      { label: "Reports", icon: FileBarChart2, href: "#", hasSubmenu: true, tabKey: "reports-index" },
    ],
  },
];