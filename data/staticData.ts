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
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
  hasSubmenu?: boolean;
}

export const mainNavItems: NavItem[] = [
  { label: "Accounts Detail", icon: LayoutList, href: "/" },
  { label: "Ledger", icon: BookOpen, href: "/ledger" },
  { label: "Partners", icon: Users, href: "#" },
  { label: "Exchange Rate", icon: ArrowLeftRight, href: "#" },
  { label: "Customer Detail", icon: UserCircle, href: "#" },
];

export const secondaryNavItems: NavItem[] = [
  { label: "SMS & Email", icon: Mail, href: "#" },
  { label: "Export/Import", icon: FileUp, href: "#" },
];

export const tertiaryNavItems: NavItem[] = [
  { label: "Risk Profiling", icon: BarChart3, href: "#" },
  { label: "Payment", icon: CreditCard, href: "#" },
  { label: "Reports", icon: FileBarChart2, href: "#", hasSubmenu: true },
  { label: "Security", icon: Lock, href: "#" },
  { label: "User Management", icon: UserCog, href: "#", hasSubmenu: true },
  { label: "Utilities", icon: Wrench, href: "#" },
];

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
