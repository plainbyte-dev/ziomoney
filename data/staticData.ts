import {
  LayoutList,
  Users,
  ArrowLeftRight,
  UserCircle,
  Mail,
  FileUp,
  BarChart3,
  ShieldCheck,
  CreditCard,
  FileBarChart2,
  Lock,
  UserCog,
  Wrench,
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

export const mainNavItems: NavItem[] = [
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
  { label: "Exchange Rate", icon: ArrowLeftRight, href: "#" },
  {
    label: "Customer Detail",
    icon: UserCircle,
    href: "#",
    hasSubmenu: true,
    submenuTitle: "Customer Details",
    submenu: [
      { label: "Corporate Customer", tabKey: "corporate-customer" },
      { label: "Customer Details", tabKey: "customer-details" },
    ],
  },
];

export const secondaryNavItems: NavItem[] = [
  { label: "SMS & Email", icon: Mail, href: "#" },
  { label: "Export/Import", icon: FileUp, href: "#" },
];

export const tertiaryNavItems: NavItem[] = [
  { label: "Risk Profiling", icon: BarChart3, href: "#" },
  { label: "Payment", icon: CreditCard, href: "#" },
  { label: "Reports", icon: FileBarChart2, href: "#", hasSubmenu: true, tabKey: "reports-index" },
  { label: "Security", icon: Lock, href: "#" },
  { label: "User Management", icon: UserCog, href: "#", hasSubmenu: true },
  { label: "Utilities", icon: Wrench, href: "#" },
];