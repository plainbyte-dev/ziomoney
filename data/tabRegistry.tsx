import type { ComponentType } from "react";
import type { BreadcrumbItem } from "./staticData";
import CorrespondenceReportCard from "@/components/CorrespondenceReportCard";
import LedgerListPanel from "@/components/LedgerListPanel";
import CreateLedgerForm from "@/components/CreateLedgerForm";
import DefineCreditLimitPanel from "@/components/DefineCreditLimitPanel";
import ReportsIndexPanel from "@/components/ReportsIndexPanel";
import StatementOfAccountPanel from "@/components/StatementOfAccountPanel";
import VoucherEntryPanel from "@/components/VoucherEntryPanel";
import VoucherApprovalPanel from "@/components/VoucherApprovalPanel";
import PartnerInfoPanel from "@/components/PartnerInfoPanel";
import CreatePartnerForm from "@/components/CreatePartnerForm";
import CorporateCustomerPanel from "@/components/CorporateCustomerPanel";
import CustomerDetailsPanel from "@/components/CustomerDetailsPanel";

export interface TabRegistryEntry {
  title: string;
  breadcrumb: BreadcrumbItem[];
  component: ComponentType;
  closable?: boolean;
}

export const tabRegistry: Record<string, TabRegistryEntry> = {
  "correspondence-report": {
    title: "Correspondence Report",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Account Detail", href: "#" },
      { label: "Correspondence Report", href: "#", active: true },
    ],
    component: CorrespondenceReportCard,
    closable: false,
  },
  "ledger-list": {
    title: "Ledger List",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Accounts Detail", href: "#" },
      { label: "Ledger List", href: "#", active: true },
    ],
    component: LedgerListPanel,
  },
  "ledger-create": {
    title: "Create New Ledger",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Ledger", href: "#" },
      { label: "Create", href: "#", active: true },
    ],
    component: CreateLedgerForm,
  },
  "voucher-entry": {
    title: "Voucher Entry",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Accounts Detail", href: "#" },
      { label: "Voucher Entry", href: "#", active: true },
    ],
    component: VoucherEntryPanel,
  },
  "voucher-approval": {
    title: "Voucher Approval",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Accounts Detail", href: "#" },
      { label: "Voucher Approval", href: "#", active: true },
    ],
    component: VoucherApprovalPanel,
  },
  "statement-of-account": {
    title: "Statement of Account",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Accounts Detail", href: "#" },
      { label: "Statement of Account", href: "#", active: true },
    ],
    component: StatementOfAccountPanel,
  },
  "reports-index": {
    title: "Reports",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Reports", href: "#", active: true },
    ],
    component: ReportsIndexPanel,
  },
  "partner-info": {
    title: "Partner Info",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Partners", href: "#" },
      { label: "Partner Info", href: "#", active: true },
    ],
    component: PartnerInfoPanel,
  },
  "partner-create": {
    title: "New Partner",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Partners", href: "#" },
      { label: "New Partner", href: "#", active: true },
    ],
    component: CreatePartnerForm,
  },
  "corporate-customer": {
    title: "Corporate Customer",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Customer Detail", href: "#" },
      { label: "Corporate Customer", href: "#", active: true },
    ],
    component: CorporateCustomerPanel,
  },
  "customer-details": {
    title: "Customer Details",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Customer Detail", href: "#" },
      { label: "Customer Details", href: "#", active: true },
    ],
    component: CustomerDetailsPanel,
  },
  "credit-limit": {
    title: "Define Credit Limit",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Reports", href: "#" },
      { label: "Define Credit Limit", href: "#", active: true },
    ],
    component: DefineCreditLimitPanel,
  },
};