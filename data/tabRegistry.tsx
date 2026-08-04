import type { ComponentType } from "react";
import type { BreadcrumbItem } from "./staticData";
import CorrespondenceReportCard from "@/components/CorrespondenceReportCard";
import CorrespondenceReportResultsPanel from "@/components/CorrespondenceReportResultsPanel";
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
import KycApprovalQueuePanel from "@/components/KycApprovalQueuePanel";
import ApprovedKycsPanel from "@/components/ApprovedKycsPanel";
import ExchangeRatesPanel from "@/components/ExchangeRatesPanel";
import ServiceChargesPanel from "@/components/ServiceChargesPanel";
import MarginSetupPanel from "@/components/MarginSetupPanel";
import CountryCurrencyPanel from "@/components/CountryCurrencyPanel";
import PartnerOfferRatesPanel from "@/components/PartnerOfferRatesPanel";
import PartnerCommissionPanel from "@/components/PartnerCommissionPanel";

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
  "correspondence-report-results": {
    title: "Report Results",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Correspondence Report", href: "#" },
      { label: "Report Results", href: "#", active: true },
    ],
    component: CorrespondenceReportResultsPanel,
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
  "kyc-approval-queue": {
    title: "KYC Approval Queue",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Customer Detail", href: "#" },
      { label: "KYC Approval Queue", href: "#", active: true },
    ],
    component: KycApprovalQueuePanel,
  },
  "kyc-approved-list": {
    title: "Approved KYCs",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Customer Detail", href: "#" },
      { label: "Approved KYCs", href: "#", active: true },
    ],
    component: ApprovedKycsPanel,
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
  "exchange-rates": {
    title: "Exchange Rates",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Exchange Rates", href: "#", active: true },
    ],
    component: ExchangeRatesPanel,
  },
  "service-charges": {
    title: "Service Charges",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Service Charges", href: "#", active: true },
    ],
    component: ServiceChargesPanel,
  },
  "margin-setup": {
    title: "Margin Setup",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Margin Setup", href: "#", active: true },
    ],
    component: MarginSetupPanel,
  },
  "country-currency": {
    title: "Country / Currency",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Country / Currency", href: "#", active: true },
    ],
    component: CountryCurrencyPanel,
  },
  "partner-offer-rates": {
    title: "Partner Offer Rates",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Partner Offer Rates", href: "#", active: true },
    ],
    component: PartnerOfferRatesPanel,
  },
  "partner-commission": {
    title: "Partner Commission",
    breadcrumb: [
      { label: "Home", href: "#" },
      { label: "Exchange Rate & Commission", href: "#" },
      { label: "Partner Commission", href: "#", active: true },
    ],
    component: PartnerCommissionPanel,
  },
};